import { all, one, stmt, Env } from './db'
import { id, now, Fault, normalize, digest, extractDemand, qualifyMetaDemand, SCORE_VERSION, buildArtifact, validateArtifact, retryDelay } from './core'
import { Evidence, GroqAdapter } from './adapters'
import { collectFromProvider, requireEnabled, validateProvider, observeFailure, credential, manifest } from './providers'
export async function enqueue(env:Env, w:string, actor:string, request:string, type:string, input:any, key:string) {
  const job=id()
  await stmt(env.DB,`INSERT OR IGNORE INTO jobs (id,workspace_id,actor_id,type,input,status,next_run_at,idempotency_key,request_id,created_at) VALUES (?,?,?,?,?,'QUEUED',?,?,?,?)`,job,w,actor,type,JSON.stringify(input),now(),key,request,now()).run()
  const row=await one(env.DB,'SELECT id,status,type,input FROM jobs WHERE workspace_id=? AND idempotency_key=?',w,key)
  if(row.type!==type || row.input!==JSON.stringify(input)) throw new Fault('CONFLICT','Idempotency key sudah digunakan untuk input berbeda',409)
  return {id:row.id,status:row.status}
}
export async function ingest(env:Env, job:any, evidence:Evidence[]) {
  const created:string[]=[],details:any[]=[]
  let stored=0,duplicates=0,qualified=0,unqualified=0
  for(const e of evidence) {
    const sourceId = `${job.workspace_id}:${e.provider}`
    await stmt(env.DB,'INSERT OR IGNORE INTO sources (id,workspace_id,type,name) VALUES (?,?,?,?)',sourceId,job.workspace_id,e.provider,e.provider).run()
    const normalized=normalize(e.raw_text), fingerprint=await digest(normalized.toLowerCase())
    const prior=await one(env.DB,'SELECT s.id AS signal_id,o.id FROM signals s LEFT JOIN opportunities o ON o.signal_id=s.id WHERE s.workspace_id=? AND (s.external_id=? OR s.fingerprint=?)',job.workspace_id,e.external_id,fingerprint)
    if(prior) { duplicates++;if(prior.id)created.push(prior.id);details.push({signal_id:prior.signal_id,duplicate:true,opportunity_id:prior.id||null});continue }
    const s=id(),o=id(),score=extractDemand(e.raw_text,e.verified),time=now()
    const gate=['facebook','instagram','threads'].includes(e.provider)?qualifyMetaDemand(e.raw_text):null
    const eligible=gate?gate.qualified:true
    const writes=[
      stmt(env.DB,'INSERT OR IGNORE INTO signals (id,workspace_id,source_id,external_id,url,author,published_at,captured_at,raw_text,normalized_text,metadata,fingerprint) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',s,job.workspace_id,sourceId,e.external_id,e.url,e.author,e.published_at,time,e.raw_text,normalized,JSON.stringify({...e.metadata,...(gate?{demand_extraction:gate}:{}),normalized_contract:{source:e.provider,externalId:e.external_id,canonicalUrl:e.url,authorRef:e.author,publishedAt:e.published_at,retrievedAt:new Date(time).toISOString(),title:normalized.slice(0,200),language:'unknown',contentHash:fingerprint,rawReference:e.url}}),fingerprint),
      stmt(env.DB,`INSERT INTO opportunities (id,workspace_id,signal_id,title,problem,desired_outcome,intent,urgency,budget_signal,confidence,opportunity_score,recommended_action,status,created_at,updated_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,'NEW',?,? WHERE EXISTS (SELECT 1 FROM signals WHERE id=?) AND ?=1 AND (SELECT COUNT(*) FROM opportunities WHERE workspace_id=?)<500`,o,job.workspace_id,s,score.title,score.problem,score.desired_outcome,score.intent,score.urgency,score.budget_signal,score.confidence,score.total,score.recommended_action,time,time,s,eligible?1:0,job.workspace_id),
      stmt(env.DB,'INSERT INTO opportunity_scores (id,workspace_id,opportunity_id,version,components,total,created_at) SELECT ?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM opportunities WHERE id=?)',id(),job.workspace_id,o,SCORE_VERSION,JSON.stringify(score.components),score.total,time,o),
      stmt(env.DB,'INSERT INTO audit_events (id,workspace_id,actor_id,operation,target_id,request_id,detail,created_at) VALUES (?,?,?,?,?,?,?,?)',id(),job.workspace_id,job.actor_id,'signal.ingest',s,job.request_id,JSON.stringify({external_id:e.external_id,version:SCORE_VERSION,qualification:gate?.reason||'LEGACY_PUBLIC_SOURCE'}),time),
      stmt(env.DB,'UPDATE sources SET last_run_at=? WHERE id=?',time,sourceId)
    ]
    const result=await env.DB.batch(writes)
    const actual=await one(env.DB,'SELECT s.id AS signal_id,o.id FROM signals s LEFT JOIN opportunities o ON o.signal_id=s.id WHERE s.workspace_id=? AND (s.external_id=? OR s.fingerprint=?)',job.workspace_id,e.external_id,fingerprint)
    if(!result[0].meta.changes){duplicates++;if(actual?.id)created.push(actual.id);details.push({signal_id:actual?.signal_id||null,duplicate:true,opportunity_id:actual?.id||null});continue}
    stored++
    if(actual?.id) {created.push(actual.id);qualified++}else unqualified++
    details.push({signal_id:s,opportunity_id:actual?.id||null,qualification:gate,opportunity_created:!!actual?.id,...(eligible&&!actual?.id?{blocked_reason:'WORKSPACE_OPPORTUNITY_CAP_OR_CONCURRENT_DEDUP'}:{})})
  }
  return { opportunity_ids:[...new Set(created)], evidence_count:evidence.length,stored_count:stored,duplicate_count:duplicates,qualified_count:qualified,unqualified_count:unqualified,extractions:details }
}
async function perform(env:Env,job:any) {
  const input=JSON.parse(job.input)
  if(job.type==='INGEST') {await requireEnabled(env,job.workspace_id,'rules-v1.0');return ingest(env,job,await collectFromProvider(env,job.workspace_id,input))}
  if(job.type==='BUILD') {
    await requireEnabled(env,job.workspace_id,'template-build')
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
    await requireEnabled(env,job.workspace_id,'cloudflare-pages')
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
  if(job.type==='PROVIDER_VALIDATE'||job.type==='PROVIDER_HEALTH') {
    const p=await one(env.DB,'SELECT * FROM providers WHERE id=? AND workspace_id=?',input.provider_id,job.workspace_id)
    if(!p||p.updated_at!==input.revision)throw new Fault('CONFLICT','Provider configuration berubah; validate ulang',409)
    let result
    try{result=await validateProvider(env,job.workspace_id,p)}catch(error){const e=error instanceof Fault?error:new Fault('PROVIDER','Provider validation gagal',502);await observeFailure(env,job.workspace_id,p.kind,e,p.updated_at);throw e}
    const update=await stmt(env.DB,"UPDATE providers SET status=CASE WHEN enabled=1 THEN 'ENABLED' ELSE 'HEALTHY' END,health_status='HEALTHY',validated_at=?,health_checked_at=?,error_code=NULL,error_message=NULL WHERE id=? AND updated_at=?",now(),now(),p.id,p.updated_at).run()
    if(!update.meta.changes) throw new Fault('CONFLICT','Provider dirotasi/dicabut saat validasi',409)
    return {provider:p.kind,...result,enabled:!!p.enabled}
  }
  if(job.type==='ASSESS') {
    const p=await requireEnabled(env,job.workspace_id,input.provider),op=await one(env.DB,'SELECT o.id,s.raw_text,s.fingerprint FROM opportunities o JOIN signals s ON s.id=o.signal_id WHERE o.id=? AND o.workspace_id=?',input.opportunity_id,job.workspace_id)
    if(!op)throw new Fault('NOT_FOUND','Evidence tidak ditemukan',404)
    const prior=await one(env.DB,'SELECT id FROM intelligence_assessments WHERE job_id=?',job.id);if(prior)return {assessment_id:prior.id,provider:input.provider,idempotent:true}
    const daily=await one(env.DB,'SELECT COALESCE(SUM(COALESCE(input_tokens,0)+COALESCE(output_tokens,0)),0) tokens FROM usage_events WHERE workspace_id=? AND created_at>?',job.workspace_id,now()-86400000)
    if(daily.tokens>=50000)throw new Fault('RATE_LIMIT','Batas tercatat 50k token/hari tercapai',429,false)
    if(input.provider!=='groq')throw new Fault('CONFLICT','Provider assessment belum didukung',409)
    const model=JSON.parse(p.config||'{}').model||manifest('groq').default_model!,a=await new GroqAdapter().assess(await credential(env,p),model,normalize(op.raw_text)),aid=id()
    await env.DB.batch([
      stmt(env.DB,'INSERT OR IGNORE INTO intelligence_assessments (id,workspace_id,opportunity_id,provider,model,evidence_hash,result,job_id,created_at) VALUES (?,?,?,?,?,?,?,?,?)',aid,job.workspace_id,op.id,input.provider,a.model,op.fingerprint,JSON.stringify(a.result),job.id,now()),
      stmt(env.DB,'INSERT INTO usage_events (id,workspace_id,provider,operation,units,job_id,created_at,input_tokens,output_tokens) VALUES (?,?,?,?,?,?,?,?,?)',id(),job.workspace_id,input.provider,'ASSESS_TOKENS',a.input_tokens+a.output_tokens,job.id,now(),a.input_tokens,a.output_tokens)
    ])
    return {assessment_id:aid,provider:input.provider,model:a.model,score_modified:false}
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
        stmt(env.DB,'INSERT INTO usage_events (id,workspace_id,provider,operation,units,estimated_cost,job_id,created_at) VALUES (?,?,?,?,?,NULL,?,?)',id(),w,job.type==='INGEST'||job.type==='ASSESS'?JSON.parse(job.input).provider:['PROVIDER_VALIDATE','PROVIDER_HEALTH'].includes(job.type)?JSON.parse(job.input).provider_kind:'deterministic-template',job.type,1,job.id,now()),
        stmt(env.DB,'INSERT INTO audit_events (id,workspace_id,actor_id,operation,target_id,request_id,detail,created_at) VALUES (?,?,?,?,?,?,?,?)',id(),w,job.actor_id,`job.${job.type.toLowerCase()}`,job.id,job.request_id,JSON.stringify({status:'SUCCEEDED'}),now())
      ])
    } catch(error) {
      const e=error instanceof Fault?error:new Fault('INTERNAL','Job gagal; periksa konfigurasi dan retry',500,false)
      const input=JSON.parse(job.input)
      if((job.type==='INGEST'||job.type==='ASSESS')&&e.code!=='CONFLICT')await observeFailure(env,w,input.provider,e)
      const retry=e.retryable && job.attempts<job.max_attempts
      await env.DB.batch([
        stmt(env.DB,'UPDATE jobs SET status=?,error_code=?,error_message=?,next_run_at=?,finished_at=? WHERE id=? AND status=\'RUNNING\'',retry?'QUEUED':'FAILED',e.code,e.message,now()+retryDelay(job.attempts),retry?null:now(),job.id),
        stmt(env.DB,'INSERT INTO audit_events (id,workspace_id,actor_id,operation,target_id,request_id,detail,created_at) VALUES (?,?,?,?,?,?,?,?)',id(),w,job.actor_id,'job.failed',job.id,job.request_id,JSON.stringify({code:e.code,retrying:retry}),now())
      ])
      if(job.type==='BUILD' && !retry) await stmt(env.DB,"UPDATE executions SET status='FAILED',updated_at=? WHERE id=? AND workspace_id=?",now(),JSON.parse(job.input).execution_id,w).run()
    }
  }
}
