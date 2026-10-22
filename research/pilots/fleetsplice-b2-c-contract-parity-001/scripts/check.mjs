// SPDX-License-Identifier: MIT
// Read-only lightweight publication checks; does not execute native interfaces.
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const pilot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.resolve(pilot,'../../..');const goal='FLEETSPLICE-B2-C-CONTRACT-PARITY-PILOT-001';
const study=path.join(root,'docs/research/platform-decision',goal);
const prefixes=[path.relative(root,pilot).replaceAll('\\','/'),path.relative(root,study).replaceAll('\\','/')];
const files=[];function walk(directory){for(const entry of readdirSync(directory,{withFileTypes:true})){if(['node_modules','dist','results','.runtime'].includes(entry.name))continue;const file=path.join(directory,entry.name);if(entry.isDirectory())walk(file);else files.push(file);}}
walk(pilot);walk(study);
for(const file of files){const text=readFileSync(file,'utf8');if(file.endsWith('.json'))JSON.parse(text);
  if(/\.(ts|mjs)$/.test(file))assert(text.startsWith('// SPDX-License-Identifier: MIT'),file+' SPDX');
  assert(!/C:\\Users\\|sk-[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{30,}/.test(text),file+' privacy pattern');
  if(file.endsWith('.md'))for(const match of text.matchAll(/\]\(([^)]+)\)/g)){const target=match[1];if(/^(https?:|#)/.test(target))continue;assert(existsSync(path.resolve(path.dirname(file),target.split('#')[0])),file+' broken link '+target);}
}
const lock=JSON.parse(readFileSync(path.join(pilot,'package-lock.json'),'utf8'));let artifacts=0;
for(const [key,value] of Object.entries(lock.packages)){if(!key)continue;assert(value.resolved.startsWith('https://registry.npmjs.org/'));assert(value.integrity.startsWith('sha512-'));artifacts++;}
assert.equal(lock.packages['node_modules/@getpaseo/plugin'].version,'0.12.0');
assert.equal(lock.packages['node_modules/typescript'].version,'5.9.3');
const matrix=JSON.parse(readFileSync(path.join(study,'parity-results.json'),'utf8'));
assert.equal(matrix.native_connections,0);assert.equal(matrix.native_effects,0);assert.equal(matrix.product_route,'NOT_SELECTED');assert.equal(matrix.records.length,36);
for(const route of ['B2','C'])assert.equal(new Set(matrix.records.filter(r=>r.route===route).map(r=>r.case_id)).size,18);
for(const record of matrix.records)for(const key of ['case_id','source_commit','package_version','route','test_command','execution_scope','result','hard_gap','evidence_level','artifact_ref'])assert(key in record,key);
const status=execFileSync('git',['status','--porcelain=v1','--untracked-files=all'],{cwd:root,encoding:'utf8',windowsHide:true});
for(const line of status.trimEnd().split(/\r?\n/).filter(Boolean)){const changed=line.slice(3).replaceAll('\\','/');assert(prefixes.some(prefix=>changed.startsWith(prefix+'/')),'Out-of-scope change '+changed);}
execFileSync('git',['diff','--check'],{cwd:root,windowsHide:true,stdio:'pipe'});
console.log(JSON.stringify({result:'PASS',files:files.length,lockedArtifacts:artifacts,routeCases:36,native_connections:0,native_effects:0,checks:['JSON','relative Markdown links','original SPDX headers','registry SRI closure','case completeness','privacy patterns','Git scope','diff whitespace']}));
