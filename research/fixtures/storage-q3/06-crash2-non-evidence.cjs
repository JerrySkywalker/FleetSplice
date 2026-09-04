
(async()=>{
const fs=require('node:fs'); const path=require('node:path'); const {spawn}=require('node:child_process'); const s=require('node:sqlite'); const p=path.join(process.argv[1],'crash2.sqlite');
const childCode=`const {DatabaseSync}=require('node:sqlite'); const p=process.argv[1]; const d=new DatabaseSync(p,{timeout:5000}); d.exec("PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS t(id INTEGER PRIMARY KEY, v TEXT); BEGIN IMMEDIATE; INSERT INTO t(v) VALUES ('committed-before-kill'); COMMIT; BEGIN IMMEDIATE; INSERT INTO t(v) VALUES ('uncommitted-before-kill'); process.stdout.write('READY\\n'); setTimeout(()=>{},60000);`;
const c=spawn(process.execPath,['-e',childCode,p],{stdio:['ignore','pipe','ignore'],windowsHide:true});
const exited=new Promise(resolve=>c.once('close',(code,signal)=>resolve({code,signal})));
const ready=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('readiness-timeout')),10000); c.stdout.on('data',x=>{if(x.toString().includes('READY')){clearTimeout(timer);resolve(true);}}); c.once('error',e=>{clearTimeout(timer);reject(e);}); c.once('close',()=>{clearTimeout(timer);});});
let readyValue=false; let readyError=null; try{readyValue=await ready;}catch(e){readyError=e.message;}
if(readyValue)c.kill(); const exit=await exited; let check=null; if(fs.existsSync(p)){const d=new s.DatabaseSync(p,{timeout:5000}); check={rows:d.prepare('SELECT id,v FROM t ORDER BY id').all(),integrity:d.prepare('PRAGMA integrity_check').get(),journal:d.prepare('PRAGMA journal_mode').get()}; d.close();}
console.log(JSON.stringify({node:process.version,sqlite:process.versions.sqlite,path:p,ready:readyValue,readyError,childExit:exit,check,files:fs.readdirSync(process.argv[1]).filter(x=>x.startsWith('crash2')).map(x=>({name:x,size:fs.statSync(path.join(process.argv[1],x)).size}))},null,2));
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
