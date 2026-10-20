#!/usr/bin/env node
/** FleetSplice FPX: offline goal-DAG validator + source-ready reader.
 * Never launches Codex, merges PRs, approves Owner gates, touches native state.
 * Only init creates a new private local state JSON; no overwrite.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT,'docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/manifest.json');
const COMPLETE = new Set(['SOURCE_COMPLETE', 'ACCEPTED']);
const STATES = new Set(['NOT_STARTED', 'READY_SOURCE', 'ACTIVE', 'SOURCE_COMPLETE', 'ACCEPTED', 'BLOCKED_EXACT', 'READY_FOR_OWNER', 'DEFERRED']);
const HUMAN = new Set(['H0','H1','H2','H3','H4']);
const POST = { N01:'H1', UX06:'H0', G06:'H2', G07:'H3', G10:'H4' };

function parse(file) { return JSON.parse(readFileSync(file,'utf8')); }
function argValue(args, name) { const i=args.indexOf(name); return i>=0?args[i+1]:undefined; }
function checkCycle(goals) {
  const byId=new Map(goals.map(g=>[g.id,g])), visiting=new Set(),visited=new Set();
  function visit(id) {
    if(visiting.has(id))throw Error(`DAG_CYCLE: ${id}`);
    if(visited.has(id))return;
    const goal=byId.get(id);
    if(!goal)throw Error(`UNKNOWN_GOAL_DEPENDENCY: ${id}`);
    visiting.add(id);
    for(const d of goal.deps)visit(d);
    visiting.delete(id);visited.add(id);
  }
  for(const id of byId.keys())visit(id);
}
export function validateManifest(m, pathExists=existsSync,repoRoot=ROOT) {
  if(m.schema!=='fleetsplice.fpx-train.v1')throw Error('MANIFEST_SCHEMA_MISMATCH');
  if(!Array.isArray(m.goals)||!Array.isArray(m.gates))throw Error('MISSING_DAG_OR_GATES');
  const ids=new Set(), gateIds=new Set();
  for(const gate of m.gates) {
    if(!gate.id||gateIds.has(gate.id))throw Error(`DUPLICATE_GATE: ${gate.id}`);
    gateIds.add(gate.id);
  }
  for(const g of m.goals) {
    if(!g.id||ids.has(g.id))throw Error(`DUPLICATE_GOAL: ${g.id}`);
    ids.add(g.id);
    if(!Array.isArray(g.deps)||!Array.isArray(g.gates))throw Error(`INVALID_GOAL: ${g.id}`);
    for(const gate of g.gates)if(!gateIds.has(gate))throw Error(`UNKNOWN_GATE: ${g.id}/${gate}`);
    if(!g.path.startsWith('goals/fpx/')||!g.path.endsWith('.md'))throw Error(`UNSAFE_GOAL_PATH: ${g.id}`);
    if(!pathExists(path.join(repoRoot,g.path)))throw Error(`GOAL_FILE_NOT_FOUND: ${g.path}`);
  }
  checkCycle(m.goals);
  return {program_id:m.program_id,goals:ids.size,gates:gateIds.size,order:m.normative_sequence};
}
export function newState(m) {
  return {schema:'fleetsplice.fpx-local-state.v1',program_id:m.program_id,
    goals:Object.fromEntries(m.goals.map(g=>[g.id,{status:'NOT_STARTED',receipt:null,head_sha:null}])),
    gates:Object.fromEntries(m.gates.map(g=>[g.id,{status:g.status,receipt:null}])),
    enabled_optional:[],
    note:'Private local state only. Never mark Owner/gate passed without a genuine external receipt.'};
}
function sha(v) {return typeof v==='string'&&/^[a-f0-9]{40}$/i.test(v);}
function goalProof(g,row,read=parse,exists=existsSync) {
  if(!row||!COMPLETE.has(row.status)||!sha(row.head_sha)||!row.receipt||!exists(row.receipt))return false;
  try {const v=read(row.receipt);return v.GOAL_ID===g.id&&v.FINAL_HEAD===row.head_sha&&v.DISPOSITION!=='NOT_RUN';}
  catch{return false;}
}
function gateProof(id,row,read=parse,exists=existsSync) {
  if(!row||!row.receipt||!exists(row.receipt))return false;
  const wanted=HUMAN.has(id)?'PASS_OWNER_OBSERVED':id==='GATE_S'?'ADMITTED':'ACCEPTED';
  if(row.status!==wanted)return false;
  try {const v=read(row.receipt);
    return v.GATE_ID===id&&v.DISPOSITION===wanted&&sha(v.SOURCE_SHA)&&
      (!HUMAN.has(id)||(v.OWNER_EXECUTED===true&&v.OWNER_APPROVED===true));
  }catch{return false;}
}
export function planNext(m,state,read=parse,exists=existsSync) {
  if(state?.schema!=='fleetsplice.fpx-local-state.v1'||state.program_id!==m.program_id)
    throw Error('STATE_SCHEMA_OR_PROGRAM_MISMATCH');
  const byId=new Map(m.goals.map(g=>[g.id,g]));
  const done=g=>goalProof(g,state.goals?.[g.id],read,exists);
  const gate=id=>gateProof(id,state.gates?.[id],read,exists);
  const out={program_id:m.program_id,ready_source:[],active:[],done_source:[],
    waiting_for_owner_or_external_gate:[],blocked_by_dependencies:[],invalid_or_unverified_records:[],
    deferred:[],notes:['Offline source readiness only; fetch fresh PR heads before writing.',
      'A SOURCE_COMPLETE is never H0–H4/production admission. Human gates require real Owner receipts.']};
  for(const g of m.goals) {
    const row=state.goals?.[g.id]??{status:'NOT_STARTED'};
    if(!STATES.has(row.status)){out.invalid_or_unverified_records.push({goal:g.short_id,reason:'unknown_status'});continue;}
    if(COMPLETE.has(row.status)){
      if(!done(g))out.invalid_or_unverified_records.push({goal:g.short_id,reason:'missing_or_inconsistent_goal_receipt'});
      else out.done_source.push({goal:g.short_id,status:row.status,head:row.head_sha});
      const ungated=g.gates.filter(id=>!gate(id));
      if(ungated.length&&g.mode!=='LOCAL'&&g.mode!=='DEFERRED')
        out.waiting_for_owner_or_external_gate.push({goal:g.short_id,gates:ungated});
      continue;
    }
    if(g.mode==='DEFERRED'&&!(state.enabled_optional||[]).includes(g.id)){out.deferred.push(g.short_id);continue;}
    if(row.status==='ACTIVE'){out.active.push(g.short_id);continue;}
    const missing=g.deps.filter(id=>{
      const d=byId.get(id);
      if(!d||!done(d))return true;
      return ['G06','G07','G08','G09'].includes(d.short_id)&&state.goals[id]?.status!=='ACCEPTED';
    });
    if(missing.length){
      out.blocked_by_dependencies.push({goal:g.short_id,deps:missing.map(id=>byId.get(id)?.short_id??id)});
      continue;
    }
    const wait=g.gates.filter(id=>id!==POST[g.short_id]&&!gate(id));
    if(wait.length&&!g.can_run_local_source_before_gates){
      out.waiting_for_owner_or_external_gate.push({goal:g.short_id,gates:wait});continue;
    }
    out.ready_source.push({goal:g.short_id,id:g.id,note:wait.length?'SOURCE_ONLY_PENDING_GATES':'LOCAL_SCOPE_READY',pending_gates:wait});
  }
  return out;
}
function main() {
  const m=parse(MANIFEST),cmd=process.argv[2]??'verify';
  if(cmd==='verify'){console.log(JSON.stringify(validateManifest(m),null,2));return;}
  const filename=argValue(process.argv.slice(3),'--state');
  if(!filename)throw Error('USE_--state_PRIVATE_ABSOLUTE_JSON_PATH');
  if(!path.isAbsolute(filename))throw Error('STATE_PATH_MUST_BE_ABSOLUTE');
  if(cmd==='init'){
    validateManifest(m);
    if(existsSync(filename)){console.log(JSON.stringify({initialized:false,existing:true,path:filename}));return;}
    mkdirSync(path.dirname(filename),{recursive:true});
    writeFileSync(filename,JSON.stringify(newState(m),null,2)+'\n',{encoding:'utf8',flag:'wx',mode:0o600});
    console.log(JSON.stringify({initialized:true,path:filename}));return;
  }
  if(cmd==='next'){
    validateManifest(m);
    if(!existsSync(filename))throw Error('STATE_FILE_MISSING_RUN_INIT');
    console.log(JSON.stringify(planNext(m,parse(filename)),null,2));return;
  }
  throw Error(`UNKNOWN_SUBCOMMAND: ${cmd}`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main();}catch(e){console.error(`FPX_TRAIN_ERROR: ${e.message}`);process.exitCode=2;}
}
