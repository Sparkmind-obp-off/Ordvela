import { Env, all, one, stmt } from './db'
import { Fault, confirm, text, id, digest, now, choice } from './core'
import { rapidCandidate, RAPID_CANDIDATES, RAPID_SOURCE_SLOTS, RapidApiAdapter, rapidSecret, rapidBounds, freePolicy, zeroCostGate } from './rapidapi'
import { requireEnabled } from './providers'
import type { IngestFunction } from './acquisition'

export async function rapidConfig(env:Env,w:string,rid:string){const r=await one(env.DB,"SELECT * FROM provider_configs WHERE id=? AND workspace_id=? AND provider='rapidapi'",rid,w);if(!r)throw new Fault('NOT_FOUND','RapidAPI configuration tidak ditemukan',404);return r}
export async function rapidRegistry(env:Env,w:string){
 const rows=await all(env.DB,"SELECT id,candidate_id,source,capability,definition,status,mode,enabled,reviewed_at,policy,policy_reviewed_at,validated_at,approved_at,revision FROM provider_configs WHERE workspace_id=? AND provider='rapidapi'",w)
 const binding=env.RAPIDAPI_KEY?await digest('rapidapi-runtime:'+env.RAPIDAPI_KEY):null
 const quotas=await all(env.DB,"SELECT candidate_id,period_end,available,reserved,observed_remaining,MAX(0,available-reserved) locally_available FROM provider_quota_budgets WHERE provider='rapidapi' AND period_end>?",now())
 return {quota_budgets:quotas,quota_scope:'Shared runtime key; external usage only known from verified policy/response headers',runtime_configured:!!env.RAPIDAPI_KEY,credential_validation:'PER_API; no universal marketplace identity endpoint assumed',free_first:true,paid_execution:'BLOCKED',candidates:RAPID_CANDIDATES,source_slots:RAPID_SOURCE_SLOTS.map(source=>({source,status:RAPID_CANDIDATES.some(c=>c.platform===source)?'CANDIDATE_NOT_APPROVED':'NO_REVIEWED_CANDIDATE'})),configs:rows.map(r=>{const {credential_binding,...policy}=JSON.parse(r.policy);return {...r,enabled:!!r.enabled,definition:JSON.parse(r.definition),policy_valid_for_runtime:!!binding&&binding===credential_binding,policy}})}
}
export async function configureRapid(env:Env,w:string,user:string,input:any){
 confirm(input.confirm);if(Object.keys(input).some(k=>!['candidate_id','confirm'].includes(k)))throw new Fault('VALIDATION','Select allowlisted candidate only; host/credential bukan parameter')
 const c=rapidCandidate(input.candidate_id),rid=`${w}:rapidapi:${c.id}`,revision=now()
 await stmt(env.DB,"INSERT OR IGNORE INTO provider_configs (id,workspace_id,provider,candidate_id,source,capability,definition,status,mode,revision) VALUES (?,?,'rapidapi',?,?,?,?,'DISCOVERED','MOCK',?)",rid,w,c.id,c.platform,c.capability,JSON.stringify(c),revision).run()
 return rapidConfig(env,w,rid)
}
export async function reviewRapid(env:Env,w:string,user:string,rid:string,input:any){
 confirm(input.confirm);confirm(input.terms_authorized);confirm(input.schema_reviewed);const r=await rapidConfig(env,w,rid)
 if(input.revision!==r.revision||r.status!=='DISCOVERED')throw new Fault('CONFLICT','Review hanya untuk current DISCOVERED revision',409)
 const update=await stmt(env.DB,"UPDATE provider_configs SET status='REVIEWED',reviewed_by=?,reviewed_at=?,revision=? WHERE id=? AND revision=? AND status='DISCOVERED'",user,now(),now(),rid,r.revision).run();if(!update.meta.changes)throw new Fault('CONFLICT','Configuration berubah',409)
 return {status:'REVIEWED',enabled:false,live_request_authorized:false}
}
export async function configureFreePolicy(env:Env,w:string,rid:string,input:any){
 confirm(input.confirm);const r=await rapidConfig(env,w,rid);if(r.status!=='REVIEWED'||input.revision!==r.revision)throw new Fault('CONFLICT','Current terms/schema review diperlukan sebelum policy configuration',409)
 const policy={...freePolicy(input.policy),credential_binding:await digest('rapidapi-runtime:'+rapidSecret(env))},qid='rapidapi:'+r.candidate_id+':'+policy.period_end
 // Runtime key is shared: the quota reservoir is global, not copied for each workspace.
 const prior=await one(env.DB,'SELECT * FROM provider_quota_budgets WHERE id=?',qid)
 if(prior&&prior.available!==policy.free_requests)throw new Fault('CONFLICT','Shared quota already declared; cannot inflate/reset reserved allowance',409)
 const result=await env.DB.batch([
  stmt(env.DB,"INSERT OR IGNORE INTO provider_quota_budgets (id,provider,candidate_id,period_end,available,updated_at) VALUES (?,'rapidapi',?,?,?,?)",qid,r.candidate_id,policy.period_end,policy.free_requests,now()),
  stmt(env.DB,"UPDATE provider_configs SET policy=?,policy_reviewed_at=?,status='CONFIGURED',mode='VALIDATION',enabled=0,validated_at=NULL,approved_at=NULL,revision=? WHERE id=? AND revision=? AND status='REVIEWED'",JSON.stringify(policy),now(),now(),rid,r.revision)
 ]);if(!result[1].meta.changes)throw new Fault('CONFLICT','Policy configuration berubah',409)
 return {status:'CONFIGURED',mode:'VALIDATION',enabled:false,policy_basis:'OWNER_ATTESTED; not marketplace/account automatically verified'}
}
export async function rapidLifecycle(env:Env,w:string,rid:string,op:string,input:any){
 confirm(input.confirm);const r=await rapidConfig(env,w,rid)
 if(input.revision!==r.revision)throw new Fault('CONFLICT','Configuration revision berubah',409)
 if(op==='approve'&&(!r.validated_at||r.status!=='VALIDATED'))throw new Fault('CONFLICT','Bounded live usable output validation diperlukan',409)
 if(op==='enable'&&(!r.approved_at||r.status!=='APPROVED'))throw new Fault('CONFLICT','Human approval diperlukan sebelum enable',409)
 if(op==='enable'&&!zeroCostGate(JSON.parse(r.policy),{max_spend:0,max_requests:1} as any).eligible)throw new Fault('PAYMENT_REQUIRED','Zero-cost policy expired/not proven',409)
 if(op==='approve')confirm(input.quality_acceptable)
 const state=op==='disable'?'DISABLED':op==='approve'?'APPROVED':'ENABLED'
 const update=await stmt(env.DB,"UPDATE provider_configs SET status=?,enabled=?,mode=?,approved_at=CASE WHEN ?='approve' THEN ? ELSE approved_at END,revision=? WHERE id=? AND revision=?",state,op==='enable'?1:0,op==='enable'?'LIVE':'DISABLED',op,now(),now(),rid,r.revision).run()
 if(!update.meta.changes)throw new Fault('CONFLICT','Configuration berubah',409)
 return {status:state,enabled:op==='enable',paid_execution:'BLOCKED'}
}
export async function rapidHealth(env:Env,w:string){
 rapidSecret(env);const row=await one(env.DB,"SELECT COUNT(*) n,MAX(validated_at) last FROM provider_configs WHERE workspace_id=? AND provider='rapidapi' AND validated_at>?",w,now()-86400000)
 if(!row?.n)throw new Fault('CONFLICT','Runtime key configured, authentication NOT_CHECKED; use an approved zero-cost per-API validation request',409)
 return {health:'HEALTHY',capability:'BOUNDED_PER_API_VALIDATION',last_validation:row.last}
}
export async function createRapidAcquisition(env:Env,w:string,user:string,request:string,input:any){
 confirm(input.confirm);confirm(input.authorize_request);rapidSecret(env)
 const b=rapidBounds(input),mode=choice(input.mode,'mode',['VALIDATION','LIVE']),r=await rapidConfig(env,w,text(input.config_id,'config_id',200))
 if(input.revision!==r.revision)throw new Fault('CONFLICT','Current configuration revision required',409)
 const key=text(input.idempotency_key,'idempotency_key',160),fingerprint=await digest(JSON.stringify({config_id:r.id,revision:r.revision,b,mode}))
 const prior=await one(env.DB,'SELECT j.id,j.status,a.request_fingerprint FROM jobs j LEFT JOIN acquisition_runs a ON a.job_id=j.id WHERE j.workspace_id=? AND j.idempotency_key=?',w,key)
 if(prior){if(prior.request_fingerprint!==fingerprint)throw new Fault('CONFLICT','Idempotency key berbeda input/job',409);return {id:prior.id,status:prior.status,idempotent:true}}
 if((mode==='VALIDATION'&&r.status!=='CONFIGURED')||(mode==='LIVE'&&(!r.enabled||r.status!=='ENABLED'||!r.validated_at||!r.approved_at)))throw new Fault('CONFLICT','Review → verified free policy → bounded validation → approve → enable diperlukan',409)
 if(JSON.parse(r.policy).credential_binding!==await digest('rapidapi-runtime:'+rapidSecret(env)))throw new Fault('CONFLICT','Runtime key changed; reverify subscription/zero-cost policy',409)
 if(!zeroCostGate(JSON.parse(r.policy),b).eligible)throw new Fault('PAYMENT_REQUIRED','Zero-cost tidak terbukti; tidak dikirim',409)
 const existing=await one(env.DB,'SELECT COUNT(*) n FROM signals WHERE workspace_id=?',w);if(existing.n+b.max_items>5000)throw new Fault('RATE_LIMIT','Workspace evidence capacity exhausted',429)
 const policy=JSON.parse(r.policy),qid='rapidapi:'+r.candidate_id+':'+policy.period_end,jid=id(),time=now()
 // A single transaction reserves shared runtime quota and creates the existing durable job.
 const results=await env.DB.batch([
  stmt(env.DB,"INSERT OR IGNORE INTO jobs (id,workspace_id,actor_id,type,input,status,max_attempts,next_run_at,idempotency_key,request_id,created_at) SELECT ?,?,?,'ACQUIRE',?,'QUEUED',3,?,?,?,? WHERE EXISTS (SELECT 1 FROM provider_quota_budgets WHERE id=? AND period_end>? AND reserved<available) AND (SELECT COUNT(*) FROM acquisition_runs WHERE workspace_id=? AND created_at>?)<2 AND (SELECT COUNT(*) FROM acquisition_runs WHERE created_at>?)<5 AND (SELECT COUNT(*) FROM acquisition_runs WHERE phase IN ('STARTING','UNKNOWN'))<2 AND (SELECT COUNT(*) FROM jobs WHERE workspace_id=? AND created_at>?)<60 AND (?='LIVE' OR NOT EXISTS (SELECT 1 FROM acquisition_runs WHERE provider_config_id=? AND mode='VALIDATION'))",jid,w,user,JSON.stringify({provider:'rapidapi',fingerprint}),time,key,request,time,qid,time,w,time-86400000,time-86400000,w,time-3600000,mode,r.id),
  stmt(env.DB,"INSERT INTO acquisition_runs (job_id,workspace_id,provider_config_id,provider,source,capability,quota_id,snapshot,bounds,request_fingerprint,mode,reserved_requests,max_spend,estimated_cost_usd,created_at) SELECT ?,?,?,'rapidapi',?,?,?,?,?,?,?,1,0,0,? WHERE EXISTS (SELECT 1 FROM jobs WHERE id=?)",jid,w,r.id,r.source,r.capability,qid,JSON.stringify({candidate_id:r.candidate_id,revision:r.revision,policy}),JSON.stringify(b),fingerprint,mode,time,jid),
  stmt(env.DB,'UPDATE provider_quota_budgets SET reserved=reserved+1,updated_at=? WHERE id=? AND EXISTS (SELECT 1 FROM acquisition_runs WHERE job_id=?)',time,qid,jid),
  stmt(env.DB,"INSERT INTO audit_events (id,workspace_id,actor_id,operation,target_id,request_id,detail,created_at) SELECT ?,?,?,'rapidapi.request-authorized',?,?,?,? WHERE EXISTS (SELECT 1 FROM acquisition_runs WHERE job_id=?)",id(),w,user,jid,request,JSON.stringify({fingerprint,mode,max_spend:0,max_requests:1,quota_basis:'global shared runtime key'}),time,jid)
 ])
 if(!results[1].meta.changes){const raced=await one(env.DB,'SELECT j.id,j.status,a.request_fingerprint FROM jobs j LEFT JOIN acquisition_runs a ON a.job_id=j.id WHERE j.workspace_id=? AND j.idempotency_key=?',w,key);if(raced){if(raced.request_fingerprint!==fingerprint)throw new Fault('CONFLICT','Idempotency key berbeda',409);return {id:raced.id,status:raced.status,idempotent:true}}throw new Fault('QUOTA_EXCEEDED','Free quota/reservation/validation/day admission gate; no paid fallback',429)}
 return {id:jid,status:'QUEUED',max_spend:0,max_requests:1,mode}
}
export async function rapidAcquisitionStep(env:Env,job:any,ingest:IngestFunction){
 const a=await one(env.DB,"SELECT * FROM acquisition_runs WHERE job_id=? AND workspace_id=? AND provider='rapidapi'",job.id,job.workspace_id)
 if(!a)throw new Fault('NOT_FOUND','Acquisition run tidak ditemukan',404)
 if(['SUCCEEDED','PARTIAL'].includes(a.phase))return JSON.parse(a.result)
 if(['STARTING','UNKNOWN'].includes(a.phase)){await stmt(env.DB,"UPDATE acquisition_runs SET phase='UNKNOWN',error_code='UNKNOWN' WHERE job_id=?",job.id).run();throw new Fault('CONFLICT','Request outcome UNKNOWN; never automatically repeat quota-consuming request',409)}
 if(a.phase==='CANCELLED')return {cancelled:true,request_sent:false}
 if(a.phase==='FAILED')throw new Fault('CONFLICT','Terminal acquisition failed; no automatic retry',409)
 const snapshot=JSON.parse(a.snapshot),b=JSON.parse(a.bounds),adapter=new RapidApiAdapter(rapidSecret(env),snapshot.candidate_id,snapshot.policy)
 let normalized
 if(a.phase==='PREPARED'){
  const r=await rapidConfig(env,job.workspace_id,a.provider_config_id)
  if(r.revision!==snapshot.revision||r.status==='DISABLED'||r.status==='DEGRADED')throw new Fault('CONFLICT','Policy/config changed or disabled; no request sent',409)
  if(snapshot.policy.credential_binding!==await digest('rapidapi-runtime:'+rapidSecret(env)))throw new Fault('CONFLICT','Runtime key changed after policy approval; no request sent',409)
  if(!adapter.estimate(b).eligible)throw new Fault('PAYMENT_REQUIRED','Zero-cost policy expired at dispatch',409)
  const provider=await one(env.DB,"SELECT status FROM providers WHERE workspace_id=? AND kind='rapidapi'",job.workspace_id)
  if(provider&&['DISABLED','NOT_CONFIGURED'].includes(provider.status))throw new Fault('CONFLICT','Workspace RapidAPI disabled/revoked; no validation request sent',409)
  if(a.mode==='LIVE')await requireEnabled(env,job.workspace_id,'rapidapi')
  const q=await one(env.DB,'SELECT * FROM provider_quota_budgets WHERE id=?',a.quota_id)
  if(!q||q.period_end<=now()||q.reserved>q.available)throw new Fault('QUOTA_EXCEEDED','Shared free quota exhausted; STOP',429)
  const start=await stmt(env.DB,"UPDATE acquisition_runs SET phase='STARTING',request_count=1 WHERE job_id=? AND phase='PREPARED'",job.id).run();if(!start.meta.changes)throw new Fault('CONFLICT','Request already claimed; no repeat',409)
  let result
  try{result=await adapter.discover(b)}catch(e){const fault=e instanceof Fault?e:new Fault('PROVIDER_ERROR','Provider error; no retry',502,false);const phase=fault.code==='TIMEOUT'?'UNKNOWN':'FAILED';await stmt(env.DB,'UPDATE acquisition_runs SET phase=?,error_code=?,completed_at=? WHERE job_id=?',phase,fault.code,phase==='UNKNOWN'?null:now(),job.id).run();throw fault}
  normalized=await adapter.normalizeOutput(result,b,a.request_fingerprint,job.id)
  const remaining=Object.entries(result.quotaMetadata).filter(([k])=>k.endsWith('-remaining')).map(([,v])=>v as number)
  await env.DB.batch([
   stmt(env.DB,"UPDATE acquisition_runs SET phase='RECEIVED',normalized_buffer=?,response_status=?,response_metadata=?,actual_cost_usd=0 WHERE job_id=?",JSON.stringify(normalized),result.response_status,JSON.stringify({quota:result.quotaMetadata,response:result.responseMetadata,cost_basis:'owner verified hard-limit zero-cost, not invoice'}),job.id),
   ...(remaining.length?[stmt(env.DB,'UPDATE provider_quota_budgets SET available=MIN(available,reserved+?),observed_remaining=?,updated_at=? WHERE id=?',Math.min(...remaining),Math.min(...remaining),now(),a.quota_id)]:[])
  ])
 }else if(a.phase==='RECEIVED')normalized=JSON.parse(a.normalized_buffer)
 else throw new Fault('CONFLICT','Acquisition phase invalid',409)
 if(normalized.rejected.length&&!normalized.records.length)throw new Fault('VALIDATION_ERROR','All retrieved records invalid; no usable evidence/live output validation',502,false)
 const result=await ingest(env,job,normalized.records),phase=normalized.rejected.length?'PARTIAL':'SUCCEEDED',outcome={...result,provider:'rapidapi',source:a.source,acquisition_status:phase,estimated_cost_usd:0,cost_basis:'OWNER_VERIFIED_ZERO_COST_NOT_INVOICE',rejected:normalized.rejected,output_validated:normalized.records.length>0}
 const receipts=[]
 for(const e of normalized.records){const s=await one(env.DB,'SELECT id FROM signals WHERE workspace_id=? AND (external_id=? OR fingerprint=?)',job.workspace_id,e.external_id,e.contentHash);if(s)receipts.push(stmt(env.DB,'INSERT OR IGNORE INTO evidence_receipts VALUES (?,?,?,?,?,?)',job.id,s.id,'rapidapi',a.source,JSON.stringify(e.metadata),now()))}
 await env.DB.batch([...receipts,
  stmt(env.DB,'UPDATE jobs SET result=? WHERE id=?',JSON.stringify(outcome),job.id),
  stmt(env.DB,'UPDATE acquisition_runs SET phase=?,result=?,normalized_buffer=NULL,completed_at=? WHERE job_id=?',phase,JSON.stringify(outcome),now(),job.id),
  stmt(env.DB,"UPDATE provider_configs SET validated_at=?,status=CASE WHEN ?='VALIDATION' THEN 'VALIDATED' ELSE status END WHERE id=? AND revision=? AND ?>0",now(),a.mode,a.provider_config_id,snapshot.revision,normalized.records.length),
  stmt(env.DB,"UPDATE providers SET health_status='HEALTHY',status=CASE WHEN enabled=1 THEN 'ENABLED' ELSE 'HEALTHY' END,validated_at=?,health_checked_at=?,error_code=NULL,error_message=NULL WHERE workspace_id=? AND kind='rapidapi' AND ?>0",now(),now(),job.workspace_id,normalized.records.length)
 ])
 return outcome
}
export async function rapidFailure(env:Env,job:any,e:Fault){
 await stmt(env.DB,"UPDATE acquisition_runs SET phase='FAILED',normalized_buffer=NULL,error_code=?,completed_at=? WHERE job_id=? AND phase IN ('PREPARED','RECEIVED')",e.code,now(),job.id).run()
 if(['QUOTA_EXCEEDED','RATE_LIMITED','PAYMENT_REQUIRED'].includes(e.code))await stmt(env.DB,"UPDATE provider_configs SET enabled=0,status='DEGRADED',mode='DISABLED' WHERE id=(SELECT provider_config_id FROM acquisition_runs WHERE job_id=?)",job.id).run()
}
export async function cancelRapid(env:Env,w:string,jid:string){const a=await one(env.DB,'SELECT phase FROM acquisition_runs WHERE job_id=? AND workspace_id=?',jid,w);if(!a)throw new Fault('NOT_FOUND','Run tidak ditemukan',404);if(a.phase!=='PREPARED')throw new Fault('CONFLICT','Only PREPARED request can be cancelled; UNKNOWN requires audit',409);await env.DB.batch([stmt(env.DB,"UPDATE acquisition_runs SET phase='CANCELLED',completed_at=? WHERE job_id=? AND phase='PREPARED'",now(),jid),stmt(env.DB,"UPDATE jobs SET status='CANCELLED',finished_at=? WHERE id=? AND status='QUEUED' AND EXISTS (SELECT 1 FROM acquisition_runs WHERE job_id=? AND phase='CANCELLED')",now(),jid,jid)]);return {cancelled_before_request:true,quota_reservation_retained:true}}
export async function rapidHistory(env:Env,w:string){return all(env.DB,'SELECT a.job_id,a.provider_config_id,a.provider,a.source,a.capability,a.request_fingerprint,a.phase,a.mode,a.request_count,a.max_spend,a.estimated_cost_usd,a.actual_cost_usd,a.response_status,a.response_metadata,a.result,a.error_code,a.created_at,a.completed_at,j.status FROM acquisition_runs a JOIN jobs j ON j.id=a.job_id WHERE a.workspace_id=? ORDER BY a.created_at DESC LIMIT 100',w)}
