const http=require("http"),{spawn}=require("child_process"),readline=require("readline"),path=require("path");
const temp=process.env.Q6_TEMP,exe=process.env.Q6_EXE;let child,server,buf="";const pending=new Map(),wire=[];

function send(x){child.stdin.write(JSON.stringify(x)+"\n");}

function sum(m){
  if(!m||typeof m!=="object")return m;
  const x={jsonrpc:m.jsonrpc};
  if(m.id!==undefined)x.id=m.id;
  if(m.method)x.method=m.method;
  if(m.params){
    x.params={};
    for(const k of ["sessionId","messageId","cwd"])
      if(m.params[k]!==undefined)x.params[k]=m.params[k];
    if(m.params.update)
      x.params.update={
        sessionUpdate:m.params.update.sessionUpdate,
        toolCallId:m.params.update.toolCallId,
        status:m.params.update.status
      };
  }
  if(m.result)
    x.result={
      stopReason:m.result.stopReason,
      sessionId:m.result.sessionId,
      protocolVersion:m.result.protocolVersion
    };
  if(m.error)
    x.error={code:m.error.code,message:m.error.message};
  return x;
}

function call(id,method,params,ms=15000){
  return new Promise(resolve=>{
    const timer=setTimeout(()=>{
      pending.delete(id);
      resolve(null);
    },ms);
    pending.set(id,{resolve,timer});
    send({jsonrpc:"2.0",id,method,params});
  });
}

async function main(){
  server=http.createServer((req,res)=>{
    let b="";
    req.on("data",d=>b+=d);
    req.on("close",()=>wire.push({apiRequestClosed:req.url}));
    req.on("end",()=>{
      let j={};
      try{j=JSON.parse(b)}catch{}
      wire.push({
        api:req.url,
        model:j.model,
        stream:j.stream===true,
        roles:(j.messages||[]).map(m=>m.role)
      });
      if(!req.url.endsWith("/chat/completions")){
        res.writeHead(404);
        res.end();
        return;
      }
      setTimeout(()=>{
        if(res.writableEnded)return;
        res.writeHead(200,{"content-type":"text/event-stream"});
        const c={
          id:"q6",
          object:"chat.completion.chunk",
          created:1,
          model:"q6-model",
          choices:[{
            index:0,
            delta:{role:"assistant",content:"LATE"},
            finish_reason:null
          }]
        };
        res.write("data: "+JSON.stringify(c)+"\n\ndata: [DONE]\n\n");
        res.end();
      },8000);
    });
  }).listen(0,"127.0.0.1",async()=>{
    const port=server.address().port;
    const pkg="@"+ "ai-sdk/openai-compatible";
    const cfg={
      model:"q6/q6-model",
      provider:{
        q6:{
          npm:pkg,
          name:"Q6 Local",
          options:{
            baseURL:"http"+":"+"//127.0.0.1:"+port+"/v1"
          },
          models:{
            "q6-model":{
              name:"Q6 Model",
              limit:{context:32768,output:8192}
            }
          }
        }
      }
    };
    const env={
      ...process.env,
      OPENCODE_CONFIG_CONTENT:JSON.stringify(cfg),
      OPENCODE_CONFIG_DIR:path.join(temp,"config"),
      OPENCODE_DISABLE_MODELS_FETCH:"true",
      OPENCODE_DISABLE_DEFAULT_PLUGINS:"true",
      OPENCODE_DISABLE_AUTOUPDATE:"true",
      OPENCODE_DISABLE_LSP_DOWNLOAD:"true",
      XDG_CONFIG_HOME:path.join(temp,"config"),
      XDG_DATA_HOME:path.join(temp,"data"),
      XDG_STATE_HOME:path.join(temp,"state"),
      XDG_CACHE_HOME:path.join(temp,"cache")
    };
    child=spawn(exe,["acp","--cwd",temp],{
      cwd:temp,
      env,
      windowsHide:true,
      stdio:["pipe","pipe","pipe"]
    });
    const rl=readline.createInterface({input:child.stdout});
    rl.on("line",line=>{
      let m;
      try{m=JSON.parse(line)}catch{return}
      wire.push({agent:sum(m)});
      if(m.id!==undefined&&!m.method&&pending.has(m.id)){
        const p=pending.get(m.id);
        pending.delete(m.id);
        clearTimeout(p.timer);
        p.resolve(m);
      }
    });
    child.stderr.on("data",d=>wire.push({stderr:d.toString().slice(0,500)}));

    const init=await call(0,"initialize",{
      protocolVersion:1,
      clientCapabilities:{
        fs:{readTextFile:true,writeTextFile:true},
        terminal:true
      },
      clientInfo:{
        name:"fleetsplice-q6-probe",
        version:"0.0.0"
      }
    });

    const nw=await call(1,"session/new",{
      cwd:temp,
      mcpServers:[]
    });

    const sid=nw?.result?.sessionId;

    const p=call(2,"session/prompt",{
      sessionId:sid,
      messageId:"q6-cancel-msg",
      prompt:[{type:"text",text:"Q6_CANCEL_PROBE"}]
    },12000);

    setTimeout(()=>{
      wire.push({clientSent:"session/cancel"});
      send({
        jsonrpc:"2.0",
        method:"session/cancel",
        params:{sessionId:sid}
      });
    },500);

    const result=await p;

    console.log(JSON.stringify({
      init:sum(init),
      newSession:sum(nw),
      prompt:sum(result),
      wire
    }));

    server.close();
    child.stdin.end();
    setTimeout(()=>process.exit(0),700);
  });
}

setTimeout(()=>{
  console.log(JSON.stringify({watchdog:true,wire}));
  try{child?.stdin.end()}catch{}
  try{child?.kill()}catch{}
  try{server?.close()}catch{}
  process.exit(2);
},30000);

main().catch(e=>{
  console.log(JSON.stringify({error:String(e),wire}));
  try{child?.stdin.end()}catch{}
  try{child?.kill()}catch{}
  try{server?.close()}catch{}
  process.exit(1);
});
