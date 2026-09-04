
(async()=>{
const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { spawn } = require('node:child_process');
const sqlite = require('node:sqlite');
const root = process.argv[1];
const hubPath = path.join(root, 'hub.sqlite');
const crashPath = path.join(root, 'crash.sqlite');
const backupPath = path.join(root, 'hub-backup.sqlite');
const db = new sqlite.DatabaseSync(hubPath, { timeout: 5000, enableForeignKeyConstraints: true });
const timings = {};
const bytes = p => fs.existsSync(p) ? fs.statSync(p).size : 0;
const t0 = performance.now();
db.exec(`PRAGMA journal_mode=WAL;
PRAGMA synchronous=FULL;
PRAGMA wal_autocheckpoint=1000;
PRAGMA foreign_keys=ON;
CREATE TABLE events(
  event_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  lane_id TEXT NOT NULL,
  event_seq INTEGER NOT NULL,
  kind TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  search_text TEXT NOT NULL,
  payload_digest TEXT NOT NULL
) STRICT;
CREATE INDEX events_lane_seq ON events(session_id, lane_id, event_seq, event_id);
CREATE VIRTUAL TABLE event_fts USING fts5(event_id UNINDEXED, search_text, tokenize='unicode61');`);
timings.schemaMs = +(performance.now() - t0).toFixed(1);
const insertEvent = db.prepare('INSERT INTO events(event_id,session_id,lane_id,event_seq,kind,occurred_at,search_text,payload_digest) VALUES (?,?,?,?,?,?,?,?)');
const insertFts = db.prepare('INSERT INTO event_fts(event_id,search_text) VALUES (?,?)');
const n = 1000000;
const insertStart = performance.now();
db.exec('BEGIN IMMEDIATE');
for (let i = 1; i <= n; i++) {
  const session = 'session-' + (i % 100);
  const lane = 'lane-' + (i % 10);
  const kind = i % 4 === 0 ? 'tool.completed' : (i % 4 === 1 ? 'assistant.content' : (i % 4 === 2 ? 'turn.started' : 'control.receipt'));
  const text = i % 10 === 0 ? 'provider model checkpoint approval workspace' : 'tool output history workspace event';
  const id = 'evt-' + String(i).padStart(7, '0');
  insertEvent.run(id, session, lane, i, kind, 1760000000000 + i, text, 'sha256:' + String(i).padStart(64, '0'));
  insertFts.run(id, text);
  if (i % 200000 === 0) console.error('inserted=' + i);
}
db.exec('COMMIT');
timings.insert1mMs = +(performance.now() - insertStart).toFixed(1);
const count = db.prepare('SELECT count(*) AS n FROM events').get().n;
const ftsCount = db.prepare('SELECT count(*) AS n FROM event_fts').get().n;
const fileBeforeCheckpoint = {db:bytes(hubPath), wal:bytes(hubPath+'-wal'), shm:bytes(hubPath+'-shm')};
const ckStart = performance.now();
const checkpoint = db.prepare('PRAGMA wal_checkpoint(PASSIVE)').all();
timings.checkpointPassiveMs = +(performance.now() - ckStart).toFixed(1);
const fileAfterCheckpoint = {db:bytes(hubPath), wal:bytes(hubPath+'-wal'), shm:bytes(hubPath+'-shm')};
const keyStmt = db.prepare('SELECT event_id,event_seq,kind FROM events WHERE session_id=? AND lane_id=? AND (event_seq>? OR (event_seq=? AND event_id>?)) ORDER BY event_seq,event_id LIMIT 100');
const keyStart = performance.now();
let keyRows = 0; let lastSeq = -1; let lastId = '';
for (let page = 0; page < 100; page++) {
  const rows = keyStmt.all('session-0','lane-0',lastSeq,lastSeq,lastId);
  if (!rows.length) break;
  keyRows += rows.length;
  const last = rows[rows.length-1]; lastSeq = last.event_seq; lastId = last.event_id;
}
timings.keyset100x100Ms = +(performance.now() - keyStart).toFixed(1);
const offsetStmt = db.prepare('SELECT event_id,event_seq,kind FROM events WHERE session_id=? AND lane_id=? ORDER BY event_seq,event_id LIMIT 100 OFFSET 9000');
const offsetStart = performance.now();
let offsetRows = 0;
for (let i = 0; i < 100; i++) offsetRows += offsetStmt.all('session-0','lane-0').length;
timings.offset100x9000Ms = +(performance.now() - offsetStart).toFixed(1);
const ftsStart = performance.now();
const ftsRows = db.prepare("SELECT count(*) AS n FROM event_fts WHERE event_fts MATCH 'provider'").get().n;
timings.ftsCountMs = +(performance.now() - ftsStart).toFixed(1);
const migrateStart = performance.now();
db.exec("ALTER TABLE events ADD COLUMN retention_class TEXT NOT NULL DEFAULT 'standard'; PRAGMA user_version=2;");
timings.migrationAlterMs = +(performance.now() - migrateStart).toFixed(1);
let backupResult = null;
const backupStart = performance.now();
try {
  const pages = await sqlite.backup(db, backupPath, { rate: 256 });
  backupResult = {ok:true,pages};
} catch (e) { backupResult = {ok:false,error:e.message}; }
timings.backupMs = +(performance.now() - backupStart).toFixed(1);
let backupCheck = null;
if (backupResult.ok) {
  const b = new sqlite.DatabaseSync(backupPath, { readOnly:true });
  backupCheck = {count:b.prepare('SELECT count(*) AS n FROM events').get().n, integrity:b.prepare('PRAGMA integrity_check').get()};
  b.close();
}
db.close();
const closedFiles = {db:bytes(hubPath), wal:bytes(hubPath+'-wal'), shm:bytes(hubPath+'-shm')};
const childCode = `const {DatabaseSync}=require('node:sqlite'); const p=process.argv[1]; const d=new DatabaseSync(p,{timeout:5000}); d.exec("PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS t(id INTEGER PRIMARY KEY, v TEXT); BEGIN IMMEDIATE; INSERT INTO t(v) VALUES ('committed-before-kill'); COMMIT; BEGIN IMMEDIATE; INSERT INTO t(v) VALUES ('uncommitted-before-kill'); process.stdout.write('READY\\n'); setTimeout(()=>{},60000);`;
const child = spawn(process.execPath, ['-e', childCode, crashPath], {stdio:['ignore','pipe','ignore']});
let ready = false;
await new Promise((resolve,reject)=>{
  const timer = setTimeout(()=>reject(new Error('crash child readiness timeout')),10000);
  child.stdout.on('data', chunk=>{ if (chunk.toString().includes('READY')) { ready=true; clearTimeout(timer); resolve(); } });
  child.on('error', e=>{clearTimeout(timer); reject(e);});
});
if (ready) child.kill();
const childExit = await new Promise(resolve=>child.on('close', (code,signal)=>resolve({code,signal})));
const crashDb = new sqlite.DatabaseSync(crashPath, {timeout:5000});
const crashCheck = {rows:crashDb.prepare('SELECT id,v FROM t ORDER BY id').all(), integrity:crashDb.prepare('PRAGMA integrity_check').get()};
crashDb.close();
const out = {
  node: process.version,
  sqlite: process.versions.sqlite,
  platform: `${process.platform}-${process.arch}`,
  rows: {events:count,fts:ftsCount,keysetRows:keyRows,offsetRows,ftsMatches:ftsRows},
  timings,
  checkpoint,
  files: {beforeCheckpoint:fileBeforeCheckpoint,afterCheckpoint:fileAfterCheckpoint,afterClose:closedFiles,backup:bytes(backupPath)},
  backup: backupResult,
  backupCheck,
  crash: {childExit, ...crashCheck},
  tempRoot:root
};
console.log(JSON.stringify(out,null,2));
})().catch(e=>{console.error(e.stack||e); process.exitCode=1;});
