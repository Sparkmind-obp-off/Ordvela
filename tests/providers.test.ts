import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {Miniflare,convertV4MiniflareOptions} from 'miniflare'
import {generateProvider,REGISTRY,providerFailureState,requireEnabled,registryStatus,credential,collectFromProvider,credentialValues} from '../src/providers'
import {ThreadsSource,GroqAdapter,normalizeEvidence,validateAssessment,seal,providerJSON,FacebookSource,InstagramSource,collectionLimit,assetId,META_GRAPH_VERSION} from '../src/adapters'
import {qualifyMetaDemand,extractDemand,SCORE_VERSION,digest} from '../src/core'
import {stmt,one} from '../src/db'
import app from '../src/index'
import {enqueue,runJobs,ingest} from '../src/jobs'

test('registry identities unique and implemented adapters documented',()=>{assert.equal(new Set(REGISTRY.map(p=>p.id)).size,REGISTRY.length);for(const p of REGISTRY.filter(p=>p.implementation!=='PLANNED'))assert.ok(p.docs_url.startsWith('https://'));assert.deepEqual(REGISTRY.find(p=>p.id==='threads')!.scopes,['threads_basic','threads_keyword_search'])})
test('generator creates six bounded files, never guesses API endpoints',async()=>{const a=await generateProvider({provider_id:'example-provider',name:'Example Provider',family:'DISCOVERY',docs_url:'https://example.org/docs',auth_type:'BEARER',credential_fields:['api_key']});assert.equal(Object.keys(a.files).length,6);assert.equal(a.status,'DOCUMENTATION_REQUIRED');assert.ok(a.files['adapter.ts'].includes("throw Error('DOCUMENTATION_REQUIRED')"));assert.equal(a.checksum.length,64);assert.ok(a.files['credential-schema.json'].includes('writeOnly'));assert.equal(a.validation.no_network_execution,true)})
test('generator rejects executable name, private URLs, credentials as schema values and invalid URLs',async()=>{const base={provider_id:'example-provider',name:'Example',family:'DISCOVERY',docs_url:'https://example.org/docs'};for(const v of [{name:'x\nalert(1)'},{docs_url:'http://127.0.0.1/docs'},{docs_url:'https://u:password@example.org/docs'},{docs_url:'invalid'},{credential_fields:['API_KEY=secret']},{provider_id:'../injected'}])await assert.rejects(()=>generateProvider({...base,...v}))})
test('source normalization includes provenance hash and raw evidence',async()=>{const n=await normalizeEvidence({external_id:'fixture:1',provider:'fixture',url:'https://example.org/public',author:'author',published_at:'2026-01-01',raw_text:'Need a workflow tool',verified:true,metadata:{}});for(const f of ['source','provider','externalId','canonicalUrl','authorRef','publishedAt','retrievedAt','title','body','language','engagement','metadata','evidence','rawReference','contentHash'])assert.ok(f in n);assert.equal(n.contentHash.length,64);assert.equal(n.evidence.text,'Need a workflow tool')})
test('Threads contract uses official endpoint and normalizes only allowed source URLs',async()=>{const original=fetch;let called='';try{globalThis.fetch=async(u)=>{called=String(u);return Response.json({data:[{id:'123',text:'Need an app',permalink:'https://www.threads.com/@example/post/abc',timestamp:'2026-01-01',username:'example',media_type:'TEXT'}]})};const a=await new ThreadsSource('fixture-token').collect({query:'need'});assert.ok(called.startsWith('https://graph.threads.com/v1.0/keyword_search?'));assert.equal(a[0].external_id,'threads:123');assert.ok(a[0].metadata.scope);globalThis.fetch=async()=>Response.json({data:[{id:'123',text:'Need',permalink:'http://localhost/private',timestamp:'x'}]});await assert.rejects(()=>new ThreadsSource('fixture').collect({query:'need'}));}finally{globalThis.fetch=original}})
test('HTTP auth failure classified safely, rate and timeout state explicit',async()=>{const original=fetch;try{globalThis.fetch=async()=>Response.json({error:{message:'secret credential must not leak'}},{status:401});await assert.rejects(()=>providerJSON('https://example.org'),(e:any)=>e.code==='AUTHENTICATION'&&!e.message.includes('secret'));assert.equal(providerFailureState('AUTHENTICATION'),'AUTH_ERROR');assert.equal(providerFailureState('RATE_LIMIT'),'RATE_LIMITED');assert.equal(providerFailureState('TIMEOUT'),'UNAVAILABLE')}finally{globalThis.fetch=original}})
test('assessment requires exact source quotes and constrained template',()=>{const base={problem:'Need a board',desired_outcome:'Simpler workflow',recommended_action:'Review hypothesis',template:'workflow',evidence_quotes:['Need a tool']};assert.equal(validateAssessment(base,'Need a tool for local tasks').score_modified,false);assert.throws(()=>validateAssessment({...base,evidence_quotes:['Budget $5000']},'Need a tool'));assert.throws(()=>validateAssessment({...base,template:'run-arbitrary-code'},'Need a tool'))})
test('Groq contract validates model and rejects hallucinated response evidence',async()=>{const original=fetch;try{globalThis.fetch=async()=>Response.json({data:[{id:'model-test'}]});await new GroqAdapter().validate('fixture-key','model-test');await assert.rejects(()=>new GroqAdapter().validate('fixture-key','missing-model'));globalThis.fetch=async()=>Response.json({model:'model-test',choices:[{message:{content:JSON.stringify({problem:'Need a board',desired_outcome:'Local flow',recommended_action:'Review',template:'workflow',evidence_quotes:['Need a tool']})}}],usage:{prompt_tokens:20,completion_tokens:50}});const a=await new GroqAdapter().assess('fixture-key','model-test','Need a tool for local tasks');assert.equal(a.input_tokens,20);assert.equal(a.output_tokens,50);assert.equal(a.result.score_modified,false);globalThis.fetch=async()=>Response.json({choices:[{message:{content:'not JSON'}}]});await assert.rejects(()=>new GroqAdapter().assess('fixture','model','Need a tool'));}finally{globalThis.fetch=original}})
test('durable provider lifecycle validates/enables, rotates/revokes, isolates workspaces and blocks disabled sources',async()=>{
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',d1Databases:['DB'],compatibilityDate:'2026-03-01'}));const original=fetch;
 try{const db=await mf.getD1Database('DB') as any,env={DB:db,CREDENTIAL_MASTER_KEY:'test-master'};for(const file of ['0001_initial.sql','0002_provider_registry.sql','0003_apify_acquisition.sql'])await db.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8').replace(/\n/g,' '));await db.batch([stmt(db,'INSERT INTO users VALUES (?,?,?,?,?)','u','test@example.test','Test','hash',Date.now()),stmt(db,'INSERT INTO workspaces (id,name,created_at) VALUES (?,?,?)','w','QA',Date.now()),stmt(db,'INSERT INTO workspaces (id,name,created_at) VALUES (?,?,?)','other','Other',Date.now())]);
 const pid='w:groq',revision=Date.now();await stmt(db,"INSERT INTO providers (id,workspace_id,kind,status,credential_cipher,updated_at,config) VALUES (?,?,?,'CONFIGURED',?,?,?)",pid,'w','groq',await seal(JSON.stringify({api_key:'fixture-key'}),env.CREDENTIAL_MASTER_KEY),revision,JSON.stringify({model:'model-test'})).run();await assert.rejects(()=>requireEnabled(env,'w','groq'));globalThis.fetch=async()=>Response.json({data:[{id:'model-test'}]});const j=await enqueue(env,'w','u','r','PROVIDER_VALIDATE',{provider_id:pid,provider_kind:'groq',revision},'validate-1');await runJobs(env,'w');assert.equal((await one(db,'SELECT status FROM jobs WHERE id=?',j.id)).status,'SUCCEEDED');assert.equal((await one(db,'SELECT status FROM providers WHERE id=?',pid)).status,'HEALTHY');await stmt(db,"UPDATE providers SET enabled=1,status='ENABLED' WHERE id=?",pid).run();assert.ok(await requireEnabled(env,'w','groq'));const reg=await registryStatus(env,'w');assert.ok(!JSON.stringify(reg).includes('fixture-key'));assert.equal((await registryStatus(env,'other')).find(p=>p.id==='groq').status,'NOT_CONFIGURED');assert.equal(await credential(env,await one(db,'SELECT * FROM providers WHERE id=?',pid)),'fixture-key');
 await stmt(db,"INSERT INTO providers (id,workspace_id,kind,status,updated_at,enabled) VALUES ('w:hacker-news','w','hacker-news','DISABLED',1,0)").run();await assert.rejects(()=>requireEnabled(env,'w','hacker-news'));assert.equal((await requireEnabled(env,'w','github-issues')).enabled,1);
 await stmt(db,"UPDATE providers SET credential_cipher=NULL,enabled=0,status='NOT_CONFIGURED',updated_at=updated_at+1 WHERE id=?",pid).run();await assert.rejects(async()=>credential(env,await one(db,'SELECT * FROM providers WHERE id=?',pid)));const stale=await enqueue(env,'w','u','r','PROVIDER_VALIDATE',{provider_id:pid,provider_kind:'groq',revision},'stale');await runJobs(env,'w');assert.equal((await one(db,'SELECT status FROM jobs WHERE id=?',stale.id)).status,'FAILED');
 }finally{globalThis.fetch=original;await mf.dispose()}
})

// Contract fixtures below are synthetic; they do not claim live Meta authorization.
test('Meta limits reject NaN, fractional, negative, zero, boolean and oversized values',()=>{
 for(const v of [0,-1,26,1.5,NaN,Infinity,'oops','1.5','',null,true])assert.throws(()=>collectionLimit(v));
 assert.equal(collectionLimit('25'),25);assert.equal(collectionLimit(undefined),10);
 for(const v of ['https://evil.test','123/../me',123,null,'abc'])assert.throws(()=>assetId(v,'page_id'));
})
const fbFixture={id:'12345_98765',message:'I need a workflow tool for our team',permalink_url:'https://www.facebook.com/test/posts/98765?tracking=discard',created_time:'2026-01-01T00:00:00+0000',is_published:true};
const igFixture={id:'98765',caption:'I need an app to manage tasks',permalink:'https://www.instagram.com/p/Example_1/',timestamp:'2026-01-01T00:00:00+0000',username:'fixture',media_type:'IMAGE'};
test('Meta transport keeps token out of URL, refuses redirects and bounds records locally',async()=>{
 const original=fetch;let url='',options:RequestInit={};try{
 globalThis.fetch=async(u,i)=>{url=String(u);options=i||{};return Response.json({data:[fbFixture,{...fbFixture,id:'12345_98766'}],paging:{next:'https://evil.test/token'}})};
 const records=await new FacebookSource('fixture-token','12345').collect({limit:1});
 assert.equal(records.length,1);assert.ok(url.startsWith('https://graph.facebook.com/'+META_GRAPH_VERSION+'/12345/feed?'));assert.ok(!url.includes('fixture-token'));assert.equal(options.redirect,'manual');assert.equal(new Headers(options.headers).get('Authorization'),'Bearer fixture-token');assert.ok(!records[0].url.includes('tracking'));assert.equal(records[0].external_id,'facebook:12345_98765');
 }finally{globalThis.fetch=original}
})
test('Facebook rejects malformed evidence and filters unpublished, empty and unknown publication state',async()=>{
 const original=fetch;try{
 globalThis.fetch=async()=>Response.json({data:[fbFixture,{...fbFixture,is_published:false},{...fbFixture,is_published:undefined},{...fbFixture,message:''}]});
 assert.equal((await new FacebookSource('fixture-token','12345').collect({limit:10})).length,1);
 for(const override of [{permalink_url:'https://facebook.com.evil.test/posts/1'},{permalink_url:'https://u:password@facebook.com/posts/1'},{permalink_url:'https://facebook.com:444/posts/1'},{created_time:'not-a-date'},{id:undefined}]){
 globalThis.fetch=async()=>Response.json({data:[{...fbFixture,...override}]});await assert.rejects(()=>new FacebookSource('fixture-token','12345').collect({limit:1}));
 }
 globalThis.fetch=async()=>Response.json({data:'invalid'});await assert.rejects(()=>new FacebookSource('fixture-token','12345').collect({limit:1}));
 }finally{globalThis.fetch=original}
})
test('Instagram uses authorized media endpoint and requires official media permalink/timestamp/ID',async()=>{
 const original=fetch;let url='';try{
 globalThis.fetch=async(u)=>{url=String(u);return Response.json({data:[igFixture]})};const e=await new InstagramSource('fixture-token','12345').collect({limit:1});assert.ok(url.includes('/12345/media?'));assert.equal(e[0].metadata.login_surface,'FACEBOOK_LOGIN');assert.equal(e[0].external_id,'instagram:98765');
 for(const override of [{permalink:'https://instagram.com.evil.test/p/test/'},{permalink:'https://www.instagram.com/accounts/login/'},{timestamp:''},{id:'abc'}]){globalThis.fetch=async()=>Response.json({data:[{...igFixture,...override}]});await assert.rejects(()=>new InstagramSource('fixture-token','12345').collect({limit:1}))}
 }finally{globalThis.fetch=original}
})
test('Threads honors operator limit and never follows provider pagination',async()=>{
 const original=fetch;let url='';try{globalThis.fetch=async(u)=>{url=String(u);return Response.json({data:[],paging:{next:'https://evil.test'}})};assert.deepEqual(await new ThreadsSource('fixture-token').collect({query:'workflow',limit:2}),[]);assert.ok(url.includes('limit=2'));assert.ok(!url.includes('access_token'));}finally{globalThis.fetch=original}
})
test('Meta safe errors distinguish permissions/authentication/rate/timeout without payload leakage',async()=>{
 const original=fetch;try{for(const [status,code,expected] of [[400,10,'PERMISSION'],[400,200,'PERMISSION'],[400,190,'AUTHENTICATION'],[400,4,'RATE_LIMIT'],[429,0,'RATE_LIMIT'],[500,0,'PROVIDER']] as const){globalThis.fetch=async()=>Response.json({error:{code,message:'fixture-secret'}},{status});await assert.rejects(()=>providerJSON('https://graph.facebook.com'),(e:any)=>e.code===expected&&!e.message.includes('fixture-secret')&&e.retryable===['RATE_LIMIT','PROVIDER'].includes(expected))};globalThis.fetch=async()=>{throw new Error('fixture-secret')};await assert.rejects(()=>providerJSON('https://graph.facebook.com'),(e:any)=>e.code==='TIMEOUT'&&!e.message.includes('fixture-secret'));assert.equal(providerFailureState('PERMISSION'),'BLOCKED_PERMISSION');}finally{globalThis.fetch=original}
})

test('FIN qualification is conservative, source-grounded and does not replace scoring',()=>{
 for(const raw of ['I need a workflow tool for our team','Butuh aplikasi untuk mengatur tugas','Can anyone recommend an automation tool?']){const gate=qualifyMetaDemand(raw);assert.equal(gate.qualified,true);for(const q of gate.evidence_quotes)assert.ok(raw.toLowerCase().includes(q.toLowerCase()));assert.equal(gate.score_modified,false)}
 for(const raw of ['Beautiful day at the beach','Our product is a great app, buy now','I do not need software','We offer software for anyone looking for an app','I need lunch'])assert.equal(qualifyMetaDemand(raw).qualified,false,raw);
 assert.equal(SCORE_VERSION,'rules-v1.0');assert.equal(extractDemand('I need a workflow tool',true).total,60);
})
test('Meta encrypted credentials, source regression, demand persistence and dedup without an opportunity',async()=>{
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',d1Databases:['DB'],compatibilityDate:'2026-03-01'}));const original=fetch;
 try{
 const db=await mf.getD1Database('DB') as any,env={DB:db,CREDENTIAL_MASTER_KEY:'fixture-master'};
 for(const file of ['0001_initial.sql','0002_provider_registry.sql','0003_apify_acquisition.sql'])await db.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8').replace(/\n/g,' '));
 await db.batch([stmt(db,'INSERT INTO users VALUES (?,?,?,?,?)','u','meta-test@example.test','Test','hash',Date.now()),stmt(db,'INSERT INTO workspaces (id,name,created_at) VALUES (?,?,?)','w','Meta QA',Date.now())]);
 globalThis.fetch=async()=>Response.json({id:12345,title:'Need a workflow tool',text:'Need a tool',author:'fixture',created_at:'2026-01-01'});
 assert.equal((await collectFromProvider(env,'w',{provider:'hacker-news',reference:'https://news.ycombinator.com/item?id=12345'})).length,1);
 globalThis.fetch=async()=>Response.json({id:54321,title:'Issue request',body:'Need a tool',html_url:'https://github.com/example/repo/issues/1',user:{login:'fixture'},created_at:'2026-01-01'});
 assert.equal((await collectFromProvider(env,'w',{provider:'github-issues',reference:'https://github.com/example/repo/issues/1'})).length,1);
 const cipher=await seal(JSON.stringify({access_token:'fixture-token',page_id:'12345'}),env.CREDENTIAL_MASTER_KEY);
 await stmt(db,"INSERT INTO providers (id,workspace_id,kind,status,credential_cipher,updated_at,enabled) VALUES ('w:facebook','w','facebook','ENABLED',?,1,1)",cipher).run();
 assert.equal((await credentialValues(env,await one(db,"SELECT * FROM providers WHERE id='w:facebook'"))).page_id,'12345');assert.ok(!JSON.stringify(await registryStatus(env,'w')).includes('fixture-token'));
 globalThis.fetch=async()=>Response.json({data:[fbFixture,{...fbFixture,id:'12345_98766',message:'Our product is a great app. Buy now.'}]});
 const evidence=await collectFromProvider(env,'w',{provider:'facebook',limit:2}),job={workspace_id:'w',actor_id:'u',request_id:'r'};
 const result=await ingest(env,job,evidence);assert.equal(result.evidence_count,2);assert.equal(result.stored_count,2);assert.equal(result.qualified_count,1);assert.equal(result.unqualified_count,1);assert.equal(result.opportunity_ids.length,1);assert.equal((await one(db,'SELECT COUNT(*) n FROM signals')).n,2);assert.equal((await one(db,'SELECT COUNT(*) n FROM opportunities')).n,1);assert.equal((await one(db,'SELECT version FROM opportunity_scores')).version,SCORE_VERSION);
 const again=await ingest(env,job,evidence);assert.equal(again.duplicate_count,2);assert.equal(again.stored_count,0);assert.equal((await one(db,'SELECT COUNT(*) n FROM signals')).n,2);
 const bad=await seal(JSON.stringify({access_token:'fixture-token',page_id:'https://evil.test'}),env.CREDENTIAL_MASTER_KEY);await assert.rejects(()=>credentialValues(env,{kind:'facebook',credential_cipher:bad}));
 }finally{globalThis.fetch=original;await mf.dispose()}
})

test('redirect responses fail closed without reading or following a credentialed Location',async()=>{
 const original=fetch;let calls=0;try{globalThis.fetch=async()=>{calls++;return new Response(null,{status:302,headers:{Location:'https://evil.test/secret'}})};await assert.rejects(()=>new FacebookSource('fixture-token','12345').collect({limit:1}),(e:any)=>e.code==='PROVIDER'&&!e.retryable&&!e.message.includes('evil.test'));assert.equal(calls,1)}finally{globalThis.fetch=original}
})
test('Meta API golden path: encrypted configure, validate, enable, feed without query, extraction, rotation',async()=>{
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',d1Databases:['DB'],compatibilityDate:'2026-03-01'}));const original=fetch;
 try{
 const db=await mf.getD1Database('DB') as any,env={DB:db,CREDENTIAL_MASTER_KEY:'fixture-master'},pending:Promise<unknown>[]=[];
 for(const file of ['0001_initial.sql','0002_provider_registry.sql','0003_apify_acquisition.sql'])await db.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8').replace(/\n/g,' '));
 const token='fixture-session';await db.batch([stmt(db,'INSERT INTO users VALUES (?,?,?,?,?)','u','api-meta@example.test','Test','hash',Date.now()),stmt(db,'INSERT INTO workspaces (id,name,created_at) VALUES (?,?,?)','w','QA',Date.now()),stmt(db,"INSERT INTO workspace_members VALUES ('w','u','OWNER')"),stmt(db,'INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)',await digest(token),'u',Date.now()+60000)]);
 const ctx={waitUntil(p:Promise<unknown>){pending.push(p)},passThroughOnException(){}};
 const req=async(path:string,body?:any,status=200,method?:string)=>{const response=await app.request('https://ordvela.test/api'+path,{method:method|| (body?'POST':'GET'),headers:{Cookie:'ordvela_session='+token,'Content-Type':'application/json','X-Workspace-ID':'w'},...(body?{body:JSON.stringify(body)}:{})},env,ctx as any);assert.equal(response.status,status,path);const data=await response.json() as any;await Promise.all(pending.splice(0));return data.data};
 globalThis.fetch=async()=>Response.json({data:[fbFixture,{...fbFixture,id:'12345_99999',message:'Nice day using our app.'}]});
 await req('/providers',{kind:'facebook',credentials:{access_token:'fixture-token',page_id:'12345'},confirm:true});
 await req('/providers/facebook/enable',{confirm:true},409);
 await req('/providers/facebook/validate',{},202);await req('/providers/facebook/enable',{confirm:true});
 for(const body of [{provider:'facebook',query:'software'},{provider:'facebook',reference:'https://evil.test'},{provider:'facebook',endpoint:'https://evil.test'},{provider:'facebook',access_token:'fixture-token'},{provider:'facebook',limit:26}])await req('/signals/ingest',body,400);
 const job=await req('/signals/ingest',{provider:'facebook',limit:2,idempotency_key:'meta-api-test'},202),row=await one(db,'SELECT * FROM jobs WHERE id=?',job.id),result=JSON.parse(row.result);
 assert.equal(row.status,'SUCCEEDED');assert.equal(result.evidence_count,2);assert.equal(result.qualified_count,1);assert.equal(result.unqualified_count,1);assert.equal((await req('/signals')).length,2);assert.equal((await req('/opportunities')).length,1);
 const registry=await req('/providers');assert.ok(!JSON.stringify(registry).includes('fixture-token'));
 await req('/providers',{kind:'facebook',credentials:{access_token:'fixture-rotated-token',page_id:'12345'},confirm:true});await req('/signals/ingest',{provider:'facebook',limit:1},409);
 await req('/providers/facebook',{confirm:true},200,'DELETE');assert.equal((await one(db,"SELECT credential_cipher FROM providers WHERE id='w:facebook'")).credential_cipher,null);
 }finally{globalThis.fetch=original;await mf.dispose()}
})
