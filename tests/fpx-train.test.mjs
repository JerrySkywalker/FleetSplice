import assert from 'node:assert/strict';
import test from 'node:test';
import { newState, planNext, validateManifest } from '../scripts/fpx-train.mjs';

const mockExists=()=>true;
const g=(short_id,deps=[],mode='LOCAL',gates=[],before=true)=>({
 id:'FLEETSPLICE-FPX-'+short_id+'-001',short_id,
 path:'goals/fpx/FLEETSPLICE-FPX-'+short_id+'-001.md',
 deps:deps.map(x=>'FLEETSPLICE-FPX-'+x+'-001'),
 mode,gates,can_run_local_source_before_gates:before
});
const gates=[{id:'H0',status:'OWNER_ACTION_REQUIRED'},{id:'H2',status:'OWNER_ACTION_REQUIRED'},
 {id:'GATE_S',status:'NOT_ADMITTED'},{id:'G06_ACCEPTED',status:'NOT_ACCEPTED'}];
const manifest={schema:'fleetsplice.fpx-train.v1',program_id:'fixture',
 goals:[g('S00'),g('UX00',['S00']),g('G06',['UX00'],'SOURCE_THEN_GATE',['H0','GATE_S','H2']),g('G07',['G06'],'GATED',['H2','G06_ACCEPTED'],false)],
 gates,authorizations:{}};
test('manifest validates and rejects cyclic dependency',()=>{
 assert.equal(validateManifest(manifest,mockExists).goals,4);
 const cyc=structuredClone(manifest);cyc.goals[0].deps=[cyc.goals[3].id];
 assert.throws(()=>validateManifest(cyc,mockExists),/DAG_CYCLE/);
});
test('only S00 initially ready and no live Gate claimed',()=>{
 const plan=planNext(manifest,newState(manifest));
 assert.deepEqual(plan.ready_source.map(x=>x.goal),['S00']);
});
test('G06 source complete does not qualify G07 without live admission',()=>{
 const s=newState(manifest),proofs=new Map(),head='a'.repeat(40);
 for(const id of ['S00','UX00','G06']){
  const x=manifest.goals.find(g=>g.short_id===id),receipt='/'+id+'.json';
  s.goals[x.id]={status:'SOURCE_COMPLETE',receipt,head_sha:head};
  proofs.set(receipt,{GOAL_ID:x.id,FINAL_HEAD:head,DISPOSITION:'SOURCE_COMPLETE'});
 }
 const p=planNext(manifest,s,f=>proofs.get(f),f=>proofs.has(f));
 assert.ok(p.done_source.some(x=>x.goal==='G06'));
 assert.ok(p.blocked_by_dependencies.some(x=>x.goal==='G07'));
 assert.ok(p.waiting_for_owner_or_external_gate.some(x=>x.goal==='G06'));
});
test('human gate state text without actual receipt is not authority',()=>{
 const s=newState(manifest);s.gates.H0.status='PASS_OWNER_OBSERVED';
 const p=planNext(manifest,s);
 assert.deepEqual(p.ready_source.map(x=>x.goal),['S00']);
});
