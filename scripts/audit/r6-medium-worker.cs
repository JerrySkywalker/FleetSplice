// Fixed R6 placement experiment. No Codex, command queue, or model input.
// Only the verified Medium observer launches a fixed, hash-pinned observer script.
// Owner bootstrap compiles this file into an administrator-owned, read-only directory.
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

public static class R6MediumWorker {
    const string Root = @"V:\_fscx154-r6w";
    const string Owner = "S-1-5-21-427755835-4166587223-1687755325-1001";
    const string Profile = @"C:\Users\jerry";
    const string Exe = Root + @"\bootstrap\r6-medium-worker.exe";
    const string Scratch = Root + @"\scratch";
    const string Admin = "S-1-5-32-544";
    [StructLayout(LayoutKind.Sequential)] struct SA { public IntPtr Sid; public uint Attributes; }
    [StructLayout(LayoutKind.Sequential)] struct Luid { public uint Low; public int High; }
    [StructLayout(LayoutKind.Sequential)] struct LA { public Luid Id; public uint Attributes; }
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)] struct SI {
        public int cb; public string reserved, desktop, title;
        public uint x,y,xSize,ySize,xChars,yChars,fill,flags;
        public ushort show,reserved2; public IntPtr reservedPtr,input,output,error;
    }
    [StructLayout(LayoutKind.Sequential)] struct PI { public IntPtr process,thread; public uint pid,tid; }
    [DllImport("kernel32.dll")] static extern IntPtr GetCurrentProcess();
    [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr h);
    [DllImport("kernel32.dll", SetLastError=true)] static extern bool IsProcessInJob(IntPtr p,IntPtr j,out bool value);
    [DllImport("kernel32.dll", SetLastError=true)] static extern uint ResumeThread(IntPtr h);
    [DllImport("kernel32.dll", SetLastError=true)] static extern bool TerminateProcess(IntPtr h,uint code);
    [DllImport("advapi32.dll", SetLastError=true)] static extern bool OpenProcessToken(IntPtr p,uint access,out IntPtr t);
    [DllImport("advapi32.dll", SetLastError=true)] static extern bool GetTokenInformation(IntPtr t,int kind,IntPtr data,int length,out int needed);
    [DllImport("advapi32.dll", SetLastError=true)] static extern bool SetTokenInformation(IntPtr t,int kind,IntPtr data,int length);
    [DllImport("advapi32.dll", SetLastError=true)] static extern bool CreateRestrictedToken(IntPtr t,uint flags,uint ns,[In] SA[] s,uint np,[In] LA[] p,uint nr,IntPtr r,out IntPtr result);
    [DllImport("advapi32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern bool LookupPrivilegeName(string system,ref Luid id,StringBuilder name,ref int n);
    [DllImport("userenv.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern bool GetUserProfileDirectory(IntPtr t,StringBuilder path,ref uint size);
    [DllImport("advapi32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern bool CreateProcessAsUser(IntPtr t,string app,StringBuilder cmd,IntPtr pa,IntPtr ta,bool inherit,uint flags,IntPtr env,string cwd,ref SI si,out PI pi);
    static void Check(bool ok,string stage) { if(!ok) throw new Win32Exception(Marshal.GetLastWin32Error(),stage); }
    static IntPtr Info(IntPtr token,int kind) {
        int n; GetTokenInformation(token,kind,IntPtr.Zero,0,out n);
        if(n <= 0) throw new Win32Exception(Marshal.GetLastWin32Error(),"Token information size");
        IntPtr p=Marshal.AllocHGlobal(n);
        try { Check(GetTokenInformation(token,kind,p,n,out n),"Token information"); return p; }
        catch { Marshal.FreeHGlobal(p); throw; }
    }
    static int Number(IntPtr token,int kind) { IntPtr p=Info(token,kind); try{return Marshal.ReadInt32(p);}finally{Marshal.FreeHGlobal(p);} }
    static string TokenSid(IntPtr token,int kind) { IntPtr p=Info(token,kind); try{return new SecurityIdentifier(Marshal.ReadIntPtr(p)).Value;}finally{Marshal.FreeHGlobal(p);} }
    static LA[] Privileges(IntPtr token) {
        IntPtr p=Info(token,3);
        try { int n=Marshal.ReadInt32(p); LA[] a=new LA[n]; for(int i=0;i<n;i++)a[i]=(LA)Marshal.PtrToStructure(IntPtr.Add(p,4+i*Marshal.SizeOf(typeof(LA))),typeof(LA)); return a; }
        finally {Marshal.FreeHGlobal(p);}
    }
    static Dictionary<string,object> Facts(IntPtr token) {
        Dictionary<string,object> f=new Dictionary<string,object>();
        f["UserSID"]=TokenSid(token,1); f["SessionId"]=Number(token,12);
        f["TokenElevation"]=Number(token,20); f["IntegritySID"]=TokenSid(token,25);
        IntPtr groups=Info(token,2); uint? admin=null;
        try { int count=Marshal.ReadInt32(groups); for(int i=0;i<count;i++) {
            SA g=(SA)Marshal.PtrToStructure(IntPtr.Add(groups,IntPtr.Size+i*Marshal.SizeOf(typeof(SA))),typeof(SA));
            if(new SecurityIdentifier(g.Sid).Value==Admin)admin=g.Attributes;
        }} finally {Marshal.FreeHGlobal(groups);}
        f["AdministratorsAttributes"]=admin;
        f["AdministratorsNonEnabled"]=!admin.HasValue || (admin.Value & 4)==0;
        List<string> names=new List<string>();
        foreach(LA entry in Privileges(token)) { Luid id=entry.Id; int size=256; StringBuilder name=new StringBuilder(size); Check(LookupPrivilegeName(null,ref id,name,ref size),"Privilege name"); names.Add(name.ToString()); }
        f["PrivilegesPresent"]=names; f["SeDebugPrivilegeAbsent"]=!names.Contains("SeDebugPrivilege");
        f["SeImpersonatePrivilegeAbsent"]=!names.Contains("SeImpersonatePrivilege");
        uint len=1024; StringBuilder profile=new StringBuilder((int)len); Check(GetUserProfileDirectory(token,profile,ref len),"Profile path");
        f["ProfilePath"]=profile.ToString(); return f;
    }
    static bool Qualified(Dictionary<string,object> f,int session) {
        return (string)f["UserSID"]==Owner && (int)f["SessionId"]==session && (int)f["TokenElevation"]==0 &&
            (string)f["IntegritySID"]=="S-1-16-8192" && (bool)f["AdministratorsNonEnabled"] &&
            (bool)f["SeDebugPrivilegeAbsent"] && (bool)f["SeImpersonatePrivilegeAbsent"] &&
            String.Equals((string)f["ProfilePath"],Profile,StringComparison.OrdinalIgnoreCase);
    }
    static string Json(object o) { return new JavaScriptSerializer().Serialize(o); }
    static void Save(string name,object o) { using(FileStream s=new FileStream(Path.Combine(Scratch,name),FileMode.CreateNew,FileAccess.Write,FileShare.Read)) using(StreamWriter w=new StreamWriter(s))w.WriteLine(Json(o)); }
    static byte[] SidBytes(string sid) { SecurityIdentifier s=new SecurityIdentifier(sid); byte[] b=new byte[s.BinaryLength];s.GetBinaryForm(b,0);return b; }
    static void Bootstrap(IntPtr original,bool observer) {
        int session=observer?1:0;
        string prefix=observer?"OBSERVER-":"";
        Dictionary<string,object> before=Facts(original);
        if((string)before["UserSID"]!=Owner || (int)before["SessionId"]!=session)throw new Exception("Bootstrap requires fixed Owner SID and session");
        IntPtr admin=IntPtr.Zero,medium=IntPtr.Zero,label=IntPtr.Zero,restricted=IntPtr.Zero,environment=IntPtr.Zero;
        PI child=new PI(); bool resumed=false;
        try {
            byte[] sid=SidBytes(Admin); admin=Marshal.AllocHGlobal(sid.Length);Marshal.Copy(sid,0,admin,sid.Length);
            LA[] delete=Privileges(original);
            // LUA_TOKEN alone: DISABLE_MAX_PRIVILEGE would ignore the explicit deletion array.
            Check(CreateRestrictedToken(original,4,1,new SA[]{new SA{Sid=admin}},(uint)delete.Length,delete,0,IntPtr.Zero,out restricted),"CreateRestrictedToken LUA_TOKEN");
            byte[] il=SidBytes("S-1-16-8192");medium=Marshal.AllocHGlobal(il.Length);Marshal.Copy(il,0,medium,il.Length);
            label=Marshal.AllocHGlobal(Marshal.SizeOf(typeof(SA)));Marshal.StructureToPtr(new SA{Sid=medium,Attributes=0x20},label,false);
            Check(SetTokenInformation(restricted,25,label,Marshal.SizeOf(typeof(SA))+il.Length),"Set medium integrity");
            Dictionary<string,object> target=Facts(restricted);
            Save(prefix+"RESTRICTED-TOKEN.json",target);
            if(!Qualified(target,session))throw new Exception("BLOCKED_SECURITY_MODEL: restricted token fails mandatory gate");
            string env="SystemRoot=C:\\Windows\0WINDIR=C:\\Windows\0USERPROFILE="+Profile+"\0TEMP="+Scratch+"\0TMP="+Scratch+"\0PATH=C:\\Windows\\System32\0\0";
            environment=Marshal.StringToHGlobalUni(env);
            SI si=new SI();si.cb=Marshal.SizeOf(typeof(SI));
            // Inherit the S4U noninteractive desktop. No interactive desktop or handle inheritance.
            Check(CreateProcessAsUser(restricted,Exe,new StringBuilder("\""+Exe+"\" "+(observer?"observe":"worker")),IntPtr.Zero,IntPtr.Zero,false,0x01000000|0x00000008|0x00000400|0x00000004,environment,Scratch,ref si,out child),"Create suspended detached restricted child");
            IntPtr childToken;
            Check(OpenProcessToken(child.process,8,out childToken),"Inspect suspended child token");
            try { if(!Qualified(Facts(childToken),session))throw new Exception("Suspended child token mismatch"); } finally {CloseHandle(childToken);}
            bool inJob;Check(IsProcessInJob(child.process,IntPtr.Zero,out inJob),"Inspect suspended worker job");
            if(inJob)throw new Exception("Worker remains in Job Object");
            Save(prefix+"BOOTSTRAP.json",new { BootstrapPID=Process.GetCurrentProcess().Id, BootstrapToken=before, WorkerPID=child.pid, WorkerNotInJob=true, FixedCodeOnly=true, AgentInput=false, ModelInput=false, WorkspaceInstructions=false, McpPluginInput=false, ArbitraryCommandInput=false, ExitsAfterWorkerLaunch=true });
            if(ResumeThread(child.thread)==0xffffffff)throw new Win32Exception(Marshal.GetLastWin32Error(),"Resume worker");
            resumed=true;
        } finally {
            if(child.process!=IntPtr.Zero) {if(!resumed)Check(TerminateProcess(child.process,2),"Terminate unresumed canary");CloseHandle(child.process);}
            if(child.thread!=IntPtr.Zero)CloseHandle(child.thread);
            if(restricted!=IntPtr.Zero)CloseHandle(restricted);
            foreach(IntPtr p in new IntPtr[]{admin,medium,label,environment})if(p!=IntPtr.Zero)Marshal.FreeHGlobal(p);
        }
    }
    static void Worker(IntPtr token) {
        Dictionary<string,object> f=Facts(token);
        if(!Qualified(f,0))throw new Exception("Worker self-check failed");
        bool job;Check(IsProcessInJob(GetCurrentProcess(),IntPtr.Zero,out job),"Worker job");
        if(job)throw new Exception("Worker in job");
        f["PID"]=Process.GetCurrentProcess().Id;f["CreationUtc"]=Process.GetCurrentProcess().StartTime.ToUniversalTime().ToString("o");
        f["WorkerNotInJob"]=!job;f["EnvironmentProfileMatches"]=Environment.GetEnvironmentVariable("USERPROFILE")==Profile;
        f["TimestampUtc"]=DateTime.UtcNow.ToString("o");
        try {byte[] plain=ProtectedData.Unprotect(File.ReadAllBytes(Scratch+@"\DPAPI.bin"),Encoding.UTF8.GetBytes("FleetSplice-R6"),DataProtectionScope.CurrentUser); f["DpapiCurrentUserContinuity"]=Encoding.UTF8.GetString(plain)=="FLEETSPLICE_R6_PUBLIC_CANARY";}
        catch(Exception e){f["DpapiCurrentUserContinuity"]=false;f["DpapiErrorType"]=e.GetType().Name;}
        File.WriteAllText(Scratch+@"\WORKSPACE-WRITE.txt","R6_FIXED_WORKSPACE_WRITE");f["ScratchWorkspaceWrite"]=true;
        bool proxy=false;
        using(TcpClient c=new TcpClient()) {try{proxy=c.ConnectAsync("127.0.0.1",7890).Wait(2000)&&c.Connected;}catch{}}
        f["LoopbackProxy7890Reachable"]=proxy;
        // Fixed public, credential-free HTTPS probe. Never use ambient credentials or proxy discovery.
        try {ServicePointManager.SecurityProtocol=SecurityProtocolType.Tls12;HttpWebRequest req=(HttpWebRequest)WebRequest.Create("https://api.github.com/");req.UserAgent="FleetSplice-R6-fixed-canary";req.Timeout=8000;req.ReadWriteTimeout=8000;req.UseDefaultCredentials=false;req.AllowAutoRedirect=false;req.Proxy=proxy?new WebProxy("http://127.0.0.1:7890"):null;using(HttpWebResponse res=(HttpWebResponse)req.GetResponse())f["OutboundHttpsStatus"]=(int)res.StatusCode;}
        catch(Exception e){f["OutboundHttpsStatus"]=null;f["HttpsErrorType"]=e.GetType().Name;}
        f["QualificationCandidate"]=(bool)f["DpapiCurrentUserContinuity"]&&(bool)f["EnvironmentProfileMatches"];
        Save("WORKER.json",f);
        // Bounded long-lived placement only; no queue, shell, listener, Codex, or input polling.
        Thread.Sleep(90000);
        Save("WORKER-EXIT.json",new{PID=Process.GetCurrentProcess().Id,TimestampUtc=DateTime.UtcNow.ToString("o"),Reason="Fixed90SecondLifetimeElapsed"});
    }
    static void Observe(IntPtr token) {
        if(!Qualified(Facts(token),1))throw new Exception("Observer must be Medium non-elevated Session 1");
        // This is the only interpreter launch, solely in the already-verified Medium observer.
        ProcessStartInfo p=new ProcessStartInfo(@"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe",
            "-NoLogo -NoProfile -NonInteractive -File \""+Root+@"\bootstrap\windows-visible-window-observer.ps1"+"\" -Root \""+Scratch+@"\observation"+"\" -DurationSeconds 150");
        p.UseShellExecute=false;p.CreateNoWindow=true;p.WorkingDirectory=Scratch;
        using(Process child=Process.Start(p)) {
            Save("OBSERVER-PROCESS.json",new{PID=Process.GetCurrentProcess().Id,PowerShellPID=child.Id,Token=Facts(token)});
            if(!child.WaitForExit(170000))throw new Exception("Observer exceeded bound; preserve process evidence for cleanup");
            Save("OBSERVER-EXIT.json",new{PID=Process.GetCurrentProcess().Id,PowerShellPID=child.Id,ExitCode=child.ExitCode,TimestampUtc=DateTime.UtcNow.ToString("o")});
        }
    }
    public static int Main(string[] args) {
        if(args.Length!=1 || (args[0]!="inspect"&&args[0]!="bootstrap"&&args[0]!="worker"&&args[0]!="launch-observer"&&args[0]!="observe"))return 64;
        IntPtr token=IntPtr.Zero;
        try {
            Check(OpenProcessToken(GetCurrentProcess(),args[0]=="bootstrap"||args[0]=="launch-observer"?0xF01FFu:8u,out token),"Open own token");
            if(args[0]=="inspect") {Console.WriteLine(Json(Facts(token)));return 0;}
            if(!String.Equals(Process.GetCurrentProcess().MainModule.FileName,Exe,StringComparison.OrdinalIgnoreCase))throw new Exception("Fixed executable path mismatch");
            if(args[0]=="bootstrap"||args[0]=="launch-observer")Bootstrap(token,args[0]=="launch-observer");else if(args[0]=="observe")Observe(token);else Worker(token);
            return 0;
        } catch(Exception e) {
            if(args[0]=="inspect")Console.Error.WriteLine(e.GetType().Name);
            else try{Save(args[0]+"-ERROR.json",new{Stage=args[0],ErrorType=e.GetType().Name,Message=e.Message,TimestampUtc=DateTime.UtcNow.ToString("o")});}catch{}
            return 2;
        } finally {if(token!=IntPtr.Zero)CloseHandle(token);}
    }
}
