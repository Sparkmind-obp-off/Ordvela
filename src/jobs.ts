import { all, one, stmt, Env } from './db'
import { id, now, Fault, normalize, digest, extractDemand, SCORE_VERSION, buildArtifact, validateArtifact, retryDelay } from './core'
import { HNSource, GitHubSource, OpenAIAdapter, unseal, Evidence } from './adapters'
export async function enqueue(env:Env, w:string, actor:string, request:string, type:string, input:any, key:string) {
  const job=id()
  await stmt(env.DB,`INSERT OR IGNORE INTO jobs (id,workspace_id,actor_id,type,input,status,next_run_at,idempotency_key,request_id,created_at) VALUES (?,?,?,?,?,'QUEUED',?,?,?,?)`,job,w,actor,type,JSON.stringify(input),now(),key,request,now()).run()
  const row=await one(env.DB,'SELECT id,status,type,input FROM jobs WHERE workspace_id=? AND idempotency_key=?',w,key)
  if(row.type!==type || row.input!==JSON.stringify(input)) throw new Fault('CONFLICT','Idempotency key sudah digunakan untuk input berbeda',409)
  return {id:row.id,status:row.status}
}
export async function ingest(env:Env, job:any, evidence:Evidence[]) {
  const created:string[]=[]
  for(const e of evidence) {
    const sourceId = `${job.workspace_id}:${e.provider}`
    await stmt(env.DB,'INSERT OR IGNORE INTO sources (id,workspace_id,type,name) VALUES (?,?,?,?)',sourceId,job.workspace_id,e.provider,e.provider).run()
    const normalized=normalize(e.raw_text), fingerprint=await digest(normalized.toLowerCase())
    const prior=await one(env.DB,'SELECT o.id FROM signals s JOIN opportunities o ON o.signal_id=s.id WHERE s.workspace_id=? AND (s.external_id=? OR s.fingerprint=?)',job.workspace_id,e.external_id,fingerprint)
    if(prior) { created.push(prior.id); continue }
    const s=id(),o=id(),score=extractDemand(e.raw_text,e.verified),time=now()
    const writes=[
      stmt(env.DB,'INSERT OR IGNORE INTO signals (id,workspace_id,source_id,external_id,url,author,published_at,captured_at,raw_text,normalized_text,metadata,fingerprint) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',s,job.workspace_id,sourceId,e.external_id,e.url,e.author,e.published_at,time,e.raw_text,normalized,JSON.stringify(e.metadata),fingerprint),
      stmt(env.DB,`INSERT INTO opportunities (id,workspace_id,signal_id,title,problem,desired_outcome,intent,urgency,budget_signal,confidence,opportunity_score,recommended_action,status,created_at,updated_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,'NEW',?,? WHERE EXISTS (SELECT 1 FROM signals WHERE id=?)`,o,job.workspace_id,s,score.title,score.problem,score.desired_outcome,score.intent,score.urgency,score.budget_signal,score.confidence,score.total,score.recommended_action,time,time,s),
      stmt(env.DB,'INSERT INTO opportunity_scores (id,workspace_id,opportunity_id,version,components,total,created_at) SELECT ?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM opportunities WHERE id=?)',id(),job.workspace_id,o,SCORE_VERSION,JSON.stringify(score.components),score.total,time,o),
      stmt(env.DB,'INSERT INTO audit_events (id,workspace_id,actor_id,operation,target_id,request_id,detail,created_at) VALUES (?,?,?,?,?,?,?,?)',id(),job.workspace_id,job.actor_id,'signal.ingest',s,job.request_id,JSON.stringify({external_id:e.external_id,version:SCORE_VERSION}),time),
      stmt(env.DB,'UPDATE sources SET last_run_at=? WHERE id=?',time,sourceId)
    ]
    await env.DB.batch(writes)
    const actual=await one(env.DB,'SELECT o.id FROM opportunities o JOIN signals s ON o.signal_id=s.id WHERE s.workspace_id=? AND (s.external_id=? OR s.fingerprint=?)',job.workspace_id,e.external_id,fingerprint)
    if(actual) created.push(actual.id)
  }
  return { opportunity_ids:created, evidence_count:evidence.length }
}
async function perform(env:Env,job:any) {
  const input=JSON.parse(job.input)
  if(job.type==='INGEST') return ingest(env,job,await (input.provider==='hacker-news'?new HNSource():new GitHubSource()).collect(input))
  if(job.type==='BUILD') {
    const e=await one(env.DB,'SELECT * FROM executions WHERE id=? AND workspace_id=?',input.execution_id,job.workspace_id)
    if(!e) throw new Fault('NOT_FOUND','Execution tidak ditemukan',404)
    const html=buildArtifact(JSON.parse(e.blueprint)),validation=validateArtifact(html),checksum=await digest(html)
    await env.DB.batch([
      stmt(env.DB,'INSERT OR IGNORE INTO execution_artifacts (id,workspace_id,execution_id,type,content,checksum,created_at) VALUES (?,?,?,?,?,?,?)',id(),job.workspace_id,e.id,'text/html',html,checksum,now()),
      stmt(env.DB,"UPDATE executions SET status='VALIDATED',validation=?,updated_at=? WHERE id=? AND workspace_id=?",JSON.stringify(validation),now(),e.id,job.workspace_id)
    ])
    return {execution_id:e.id,validation,checksum}
  }
  if(job.type==='PUBLISH') {
    const e=await one(env.DB,'SELECT * FROM executions WHERE id=? AND workspace_id=?',input.execution_id,job.workspace_id)
    if(!e || !['VALIDATED','DEPLOYED'].includes(e.status)) throw new Fault('CONFLICT','Artifact belum tervalidasi',409)
    if(e.status==='DEPLOYED') return {demo_url:e.demo_url,method:'immutable-artifact-route'}
    if(e.updated_at!==input.revision) throw new Fault('CONFLICT','Approval publication telah kedaluwarsa',409)
    const artifact=await one(env.DB,'SELECT * FROM execution_artifacts WHERE execution_id=? AND workspace_id=?',e.id,job.workspace_id)
    if(!artifact) throw new Fault('NOT_FOUND','Artifact tidak ditemukan',404)
    validateArtifact(artifact.content)
    const token=e.demo_token || id()+id(), path=`/demo/${token}`
    const published=await env.DB.batch([
      stmt(env.DB,"UPDATE executions SET status='DEPLOYED',demo_token=?,demo_url=?,updated_at=? WHERE id=? AND workspace_id=? AND status='VALIDATED' AND updated_at=?",token,path,now(),e.id,job.workspace_id,input.revision),
      stmt(env.DB,"UPDATE opportunities SET status='CONTACT_READY',updated_at=? WHERE id=? AND workspace_id=? AND status NOT IN ('WON','LOST') AND EXISTS (SELECT 1 FROM executions WHERE id=? AND demo_token=?)",now(),e.opportunity_id,job.workspace_id,e.id,token)
    ])
    if(!published[0].meta.changes) throw new Fault('CONFLICT','Publication berubah; approval ulang diperlukan',409)
    return {demo_url:path,method:'immutable-artifact-route'}
  }
  if(job.type==='PROVIDER_VALIDATE') {
    const p=await one(env.DB,'SELECT * FROM providers WHERE id=? AND workspace_id=?',input.provider_id,job.workspace_id)
    if(!p || !p.credential_cipher) throw new Fault('CONFLICT','Provider credential tidak tersedia',409)
    try { await new OpenAIAdapter().validate(await unseal(p.credential_cipher,env.CREDENTIAL_MASTER_KEY || '')) }
    catch(e) { await stmt(env.DB,"UPDATE providers SET status='INVALID' WHERE id=? AND updated_at=?",p.id,p.updated_at).run(); throw e }
    const update=await stmt(env.DB,"UPDATE providers SET status='VALIDATED' WHERE id=? AND updated_at=? AND credential_cipher IS NOT NULL",p.id,p.updated_at).run()
    if(!update.meta.changes) throw new Fault('CONFLICT','Provider telah dirotasi atau dicabut saat validasi',409)
    return {provider:p.kind,status:'VALIDATED',generation_enabled:false}
  }
  throw new Fault('VALIDATION','Jenis job tidak didukung')
}
export async function runJobs(env:Env,w:string) {
  const time=now()
  await stmt(env.DB,`UPDATE jobs SET status=CASE WHEN attempts>=max_attempts THEN 'FAILED' ELSE 'QUEUED' END,next_run_at=?,error_code='TIMEOUT',error_message='Lease job kedaluwarsa' WHERE workspace_id=? AND status='RUNNING' AND lease_until<?`,time,w,time).run()
  const jobs=await all(env.DB,"SELECT * FROM jobs WHERE workspace_id=? AND status='QUEUED' AND next_run_at<=? ORDER BY created_at LIMIT 2",w,time)
  for(const job of jobs) {
    const claim=await stmt(env.DB,"UPDATE jobs SET status='RUNNING',attempts=attempts+1,lease_until=? WHERE id=? AND status='QUEUED' AND attempts<max_attempts",now()+90000,job.id).run()
    if(!claim.meta.changes) continue
    job.attempts++
    try {
      const result=await perform(env,job)
      await env.DB.batch([
        stmt(env.DB,"UPDATE jobs SET status='SUCCEEDED',result=?,finished_at=?,error_code=NULL,error_message=NULL WHERE id=? AND status='RUNNING'",JSON.stringify(result),now(),job.id),
        stmt(env.DB,'INSERT INTO usage_events (id,workspace_id,provider,operation,units,estimated_cost,job_id,created_at) VALUES (?,?,?,?,?,NULL,?,?)',id(),w,job.type==='INGEST'?JSON.parse(job.input).provider:job.type==='PROVIDER_VALIDATE'?'openai':'deterministic-template',job.type,1,job.id,now()),
        stmt(env.DB,'INSERT INTO audit_events (id,workspace_id,actor_id,operation,target_id,request_id,detail,created_at) VALUES (?,?,?,?,?,?,?,?)',id(),w,job.actor_id,`job.${job.type.toLowerCase()}`,job.id,job.request_id,JSON.stringify({status:'SUCCEEDED'}),now())
      ])
    } catch(error) {
      const e=error instanceof Fault?error:new Fault('INTERNAL','Job gagal; periksa konfigurasi dan retry',500,false)
      const retry=e.retryable && job.attempts<job.max_attempts
      await env.DB.batch([
        stmt(env.DB,'UPDATE jobs SET status=?,error_code=?,error_message=?,next_run_at=?,finished_at=? WHERE id=? AND status=\'RUNNING\'',retry?'QUEUED':'FAILED',e.code,e.message,now()+retryDelay(job.attempts),retry?null:now(),job.id),
        stmt(env.DB,'INSERT INTO audit_events (id,workspace_id,actor_id,operation,target_id,request_id,detail,created_at) VALUES (?,?,?,?,?,?,?,?)',id(),w,job.actor_id,'job.failed',job.id,job.request_id,JSON.stringify({code:e.code,retrying:retry}),now())
      ])
      if(job.type==='BUILD' && !retry) await stmt(env.DB,"UPDATE executions SET status='FAILED',updated_at=? WHERE id=? AND workspace_id=?",now(),JSON.parse(job.input).execution_id,w).run()
    }
  }
}
