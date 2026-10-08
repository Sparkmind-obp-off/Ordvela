import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Miniflare, convertV4MiniflareOptions } from 'miniflare'
import { normalize, extractDemand, WEIGHTS, blueprint, buildArtifact, validateArtifact, escape, digest, text, confirm, outcomeTransition, retryDelay, Fault } from '../src/core'
import { HNSource, GitHubSource, OpenAIAdapter, seal, unseal, providerJSON } from '../src/adapters'
import { passwordHash } from '../src/auth'
import { enqueue,runJobs,ingest } from '../src/jobs'
import { all,one,stmt } from '../src/db'

test('normalize preserves evidence meaning separately from HTML',()=>assert.equal(normalize('<p>I need  a tool &amp; help</p>'),'I need a tool & help'))
test('weights total one',()=>assert.equal(Object.values(WEIGHTS).reduce((a,b)=>a+b,0),1))
test('commercial urgent explicit demand outranks vague mentions',()=>{const strong=extractDemand('I need software this week; budget $2000, willing to pay.',true),weak=extractDemand('A software discussion',true);assert.ok(strong.total>weak.total);assert.equal(strong.intent,'COMMERCIAL');assert.equal(strong.urgency,'HIGH')})
test('missing budget is never invented',()=>{const s=extractDemand('Looking for a tool to track tasks',true);assert.equal(s.budget_signal,'Tidak disebutkan');assert.equal(s.components.budget,0);assert.equal(s.urgency,'UNKNOWN')})
test('unverified evidence confidence lower and score deterministic',()=>{const a=extractDemand('Need an app',false);assert.ok(a.confidence<extractDemand('Need an app',true).confidence);assert.deepEqual(a,extractDemand('Need an app',false))})
test('validation rejects missing fields and implicit confirmation',()=>{assert.throws(()=>text(null,'field'));assert.throws(()=>text('x','field',2,2));assert.throws(()=>confirm('true'));confirm(true)})
test('escaping blocks injected markup',()=>assert.equal(escape('<script>"&'), '&lt;script&gt;&quot;&amp;'))
test('all constrained templates validate and exclude private evidence',()=>{for(const t of ['intake','calculator','workflow']){const bp=blueprint({id:'o',problem:'SECRET_PRIVATE_SOURCE',desired_outcome:'private'},t,'Safe title','Safe summary');const html=buildArtifact(bp);assert.ok(Object.values(validateArtifact(html)).every(Boolean));assert.ok(!html.includes('SECRET_PRIVATE_SOURCE'));assert.ok(!html.includes('private'))}})
test('artifacts escape user controlled public fields',()=>{const h=buildArtifact(blueprint({id:'o'},'intake','</script><img onerror=alert(1)>','safe'));assert.ok(h.includes('&lt;img'));assert.ok(!h.includes('<img'))})
test('unsafe artifacts are rejected',()=>assert.throws(()=>validateArtifact('<script>fetch("https://example.com")</script>')))
test('commercial state machine forbids skipping approval/contact and terminal rewrites',()=>{outcomeTransition('CONTACTED','REPLIED');assert.throws(()=>outcomeTransition('APPROVAL_REQUIRED','WON'));assert.throws(()=>outcomeTransition('CONTACTED','WON'));assert.throws(()=>outcomeTransition('WON','LOST'))})
test('retry backoff is exponential and bounded',()=>{assert.equal(retryDelay(1),2000);assert.equal(retryDelay(3),8000);assert.equal(retryDelay(99),60000)})
test('credential encryption roundtrip, random nonce, wrong master rejection',async()=>{const a=await seal('secret-test','master-test'),b=await seal('secret-test','master-test');assert.notEqual(a,b);assert.ok(!a.includes('secret-test'));assert.equal(await unseal(a,'master-test'),'secret-test');await assert.rejects(()=>unseal(a,'different-master'));await assert.rejects(()=>seal('secret',''))})
test('password PBKDF2 salts and verification',async()=>{const a=await passwordHash('long-testing-password'),b=await passwordHash('long-testing-password');assert.notEqual(a,b);assert.equal(a,await passwordHash('long-testing-password',a.split(':')[0]));assert.notEqual(a,await passwordHash('wrong-password',a.split(':')[0]))})
test('hash stable',async()=>assert.equal(await digest('hello'),await digest('hello')))
test('source adapter contracts use fixed public hosts and reject SSRF',async()=>{await assert.rejects(()=>new HNSource().collect({reference:'http://127.0.0.1/secret'}));await assert.rejects(()=>new GitHubSource().collect({reference:'https://evil.test/issues/1'}))})
test('provider adapter contracts normalize failures and validate outputs',async()=>{const original=globalThis.fetch;try{globalThis.fetch=async()=>new Response('{}',{status:429});await assert.rejects(()=>providerJSON('https://example.com'),(e:any)=>e.code==='RATE_LIMIT'&&e.retryable);globalThis.fetch=async()=>{throw new Error('transport secret details')};await assert.rejects(()=>providerJSON('https://example.com'),(e:any)=>e.code==='TIMEOUT'&&!e.message.includes('secret'));globalThis.fetch=async()=>Response.json({data:[]});await new OpenAIAdapter().validate('test-key');globalThis.fetch=async()=>Response.json({wrong:[]});await assert.rejects(()=>new OpenAIAdapter().validate('test-key'));}finally{globalThis.fetch=original}})
test('D1 persistence, deduplication, idempotency, retry bounds, cancellation, stale lease',async()=>{
  const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',d1Databases:['DB'],compatibilityDate:'2026-03-01'}));
  try {
    const db=await mf.getD1Database('DB') as any,env={DB:db};
    for(const migration of ['0001_initial.sql','0002_provider_registry.sql','0003_apify_acquisition.sql','0004_acquisition_provider_configs.sql'])await db.exec(readFileSync(new URL('../migrations/'+migration,import.meta.url),'utf8').replace(/\n/g,' '));
    const time=Date.now();await db.batch([stmt(db,'INSERT INTO users VALUES (?,?,?,?,?)','u','unit@example.test','Unit','test-hash',time),stmt(db,'INSERT INTO workspaces (id,name,created_at) VALUES (?,?,?)','w','Test',time)]);
    const ev={external_id:'fixture:1',url:'https://example.test/public',author:'fixture',published_at:'2026-01-01',raw_text:'Looking for a task tool',provider:'fixture',verified:true,metadata:{fixture:true}};
    const job={workspace_id:'w',actor_id:'u',request_id:'r'};
    await ingest(env,job,[ev]);await ingest(env,job,[ev]);await ingest(env,job,[{...ev,external_id:'fixture:2'}]);
    assert.equal((await one(db,'SELECT COUNT(*) n FROM signals')).n,1);assert.equal((await one(db,'SELECT COUNT(*) n FROM opportunities')).n,1);assert.equal((await one(db,'SELECT COUNT(*) n FROM opportunity_scores')).n,1);
    const a=await enqueue(env,'w','u','r','INVALID_TYPE',{},'same');assert.equal(a.id,(await enqueue(env,'w','u','r','INVALID_TYPE',{},'same')).id);
    await runJobs(env,'w');assert.equal((await one(db,'SELECT status FROM jobs WHERE id=?',a.id)).status,'FAILED');
    const cancelled=await enqueue(env,'w','u','r','INVALID_TYPE',{},'cancel');await stmt(db,"UPDATE jobs SET status='CANCELLED' WHERE id=?",cancelled.id).run();await runJobs(env,'w');assert.equal((await one(db,'SELECT attempts FROM jobs WHERE id=?',cancelled.id)).attempts,0);
    const retry=await enqueue(env,'w','u','r','INGEST',{provider:'hacker-news',query:'need'},'retry');const original=globalThis.fetch;globalThis.fetch=async()=>new Response('{}',{status:503});try{for(let i=0;i<3;i++){await stmt(db,'UPDATE jobs SET next_run_at=0 WHERE id=?',retry.id).run();await runJobs(env,'w');const r=await one(db,'SELECT * FROM jobs WHERE id=?',retry.id);assert.equal(r.attempts,i+1);assert.equal(r.status,i<2?'QUEUED':'FAILED');}}finally{globalThis.fetch=original}
    const lease=await enqueue(env,'w','u','r','INVALID_TYPE',{},'lease');await stmt(db,"UPDATE jobs SET status='RUNNING',attempts=3,lease_until=0 WHERE id=?",lease.id).run();await runJobs(env,'w');assert.equal((await one(db,'SELECT status FROM jobs WHERE id=?',lease.id)).status,'FAILED');
    assert.ok((await all(db,'SELECT * FROM audit_events')).length>=4)
  }finally{await mf.dispose()}
})
