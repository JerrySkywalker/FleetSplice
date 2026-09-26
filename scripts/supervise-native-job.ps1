param([Parameter(Mandatory=$true)][string]$Executable,[Parameter(Mandatory=$true)][string]$Endpoint,[Parameter(Mandatory=$true)][string]$Workspace)
$ErrorActionPreference='Stop'
if ([IO.Path]::GetFileName($Executable) -ine 'codex.exe' -or -not [IO.Path]::IsPathRooted($Executable) -or -not (Test-Path -LiteralPath $Executable -PathType Leaf)) { throw 'NATIVE_JOB_EXECUTABLE_INVALID' }
if (-not [IO.Path]::IsPathRooted($Endpoint) -or [IO.Path]::GetExtension($Endpoint) -ine '.sock') { throw 'NATIVE_JOB_ENDPOINT_INVALID' }
if (-not [IO.Path]::IsPathRooted($Workspace) -or -not (Test-Path -LiteralPath $Workspace -PathType Container)) { throw 'NATIVE_JOB_WORKSPACE_INVALID' }
Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
public static class FleetNativeJob {
  [StructLayout(LayoutKind.Sequential)] public struct BasicLimit {
    public long PerProcessUserTimeLimit, PerJobUserTimeLimit;
    public uint LimitFlags;
    public UIntPtr MinimumWorkingSetSize, MaximumWorkingSetSize;
    public uint ActiveProcessLimit;
    public UIntPtr Affinity;
    public uint PriorityClass, SchedulingClass;
  }
  [StructLayout(LayoutKind.Sequential)] public struct IoCounters {
    public ulong ReadOperationCount, WriteOperationCount, OtherOperationCount;
    public ulong ReadTransferCount, WriteTransferCount, OtherTransferCount;
  }
  [StructLayout(LayoutKind.Sequential)] public struct ExtendedLimit {
    public BasicLimit BasicLimitInformation;
    public IoCounters IoInfo;
    public UIntPtr ProcessMemoryLimit, JobMemoryLimit, PeakProcessMemoryUsed, PeakJobMemoryUsed;
  }
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)] public struct StartupInfo {
    public uint cb;
    public string lpReserved, lpDesktop, lpTitle;
    public uint dwX, dwY, dwXSize, dwYSize, dwXCountChars, dwYCountChars, dwFillAttribute, dwFlags;
    public ushort wShowWindow, cbReserved2;
    public IntPtr lpReserved2, hStdInput, hStdOutput, hStdError;
  }
  [StructLayout(LayoutKind.Sequential)] public struct ProcessInfo {
    public IntPtr hProcess, hThread;
    public uint dwProcessId, dwThreadId;
  }
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern IntPtr CreateJobObject(IntPtr attributes, string name);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool SetInformationJobObject(IntPtr job, int infoClass, ref ExtendedLimit info, uint length);
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern bool CreateProcess(string application, StringBuilder commandLine, IntPtr processAttributes, IntPtr threadAttributes, bool inheritHandles, uint flags, IntPtr environment, string currentDirectory, ref StartupInfo startup, out ProcessInfo process);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
  [DllImport("kernel32.dll", SetLastError=true)] static extern uint ResumeThread(IntPtr thread);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool TerminateProcess(IntPtr process, uint exitCode);
  [DllImport("kernel32.dll", SetLastError=true)] static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool CloseHandle(IntPtr handle);
  static void Check(bool ok, string code) { if (!ok) throw new Win32Exception(Marshal.GetLastWin32Error(), code); }
  public static int Run(string exe, string endpoint, string cwd) {
    IntPtr job=IntPtr.Zero;
    ProcessInfo child=new ProcessInfo();
    bool assigned=false;
    try {
      job=CreateJobObject(IntPtr.Zero,null); Check(job!=IntPtr.Zero,"CREATE_JOB_FAILED");
      ExtendedLimit limits=new ExtendedLimit(); limits.BasicLimitInformation.LimitFlags=0x00002000;
      Check(SetInformationJobObject(job,9,ref limits,(uint)Marshal.SizeOf(typeof(ExtendedLimit))),"SET_JOB_LIMIT_FAILED");
      StartupInfo startup=new StartupInfo(); startup.cb=(uint)Marshal.SizeOf(typeof(StartupInfo));
      string listener="unix://"+endpoint.Replace('\\','/');
      StringBuilder command=new StringBuilder("\""+exe+"\" app-server --listen \""+listener+"\"");
      Check(CreateProcess(exe,command,IntPtr.Zero,IntPtr.Zero,false,0x08000004,IntPtr.Zero,cwd,ref startup,out child),"CREATE_SUSPENDED_FAILED");
      Check(AssignProcessToJobObject(job,child.hProcess),"ASSIGN_JOB_FAILED"); assigned=true;
      Check(ResumeThread(child.hThread)!=0xffffffff,"RESUME_THREAD_FAILED");
      Console.WriteLine("PID="+child.dwProcessId); Console.Out.Flush();
      Task<string> input=Task.Factory.StartNew(() => Console.ReadLine());
      while (!input.IsCompleted && WaitForSingleObject(child.hProcess,100)!=0) { }
      return 0;
    } finally {
      try {
        // CreateProcess may succeed before Job assignment fails. A suspended
        // process outside the Job must be terminated through its exact handle.
        if (child.hProcess!=IntPtr.Zero && !assigned && WaitForSingleObject(child.hProcess,0)!=0) {
          Check(TerminateProcess(child.hProcess,1),"UNASSIGNED_PROCESS_TERMINATION_FAILED");
          Check(WaitForSingleObject(child.hProcess,10000)==0,"UNASSIGNED_PROCESS_EXIT_UNPROVABLE");
        }
      } finally {
        if (job!=IntPtr.Zero) CloseHandle(job);
        if (child.hProcess!=IntPtr.Zero) { WaitForSingleObject(child.hProcess,10000); CloseHandle(child.hProcess); }
        if (child.hThread!=IntPtr.Zero) CloseHandle(child.hThread);
      }
    }
  }
}
'@
exit [FleetNativeJob]::Run($Executable,$Endpoint,$Workspace)
