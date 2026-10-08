import { Env, all, one, stmt } from './db'
import { Fault, id, now, digest, text, confirm } from './core'
import { ACQUISITION_SLOTS, ApifyAdapter, apifySecret, INPUT_PROFILES, acquisitionBounds, profileInput, ActorInspection } from './apify'

export async function actorRegistry(env:Env,w:string) {
  const rows=await all(env.DB,'SELECT * FROM actor_registry WHERE workspace_id=? ORDER BY capability',w)
  return ACQUISITION_SLOTS.map(slot=>{const r=rows.find(x=>x.capability===slot.capability);return {...slot,id:r?.id||null,actor_id:r?.actor_id||null,profile:r?.profile||'metadata-only',status:r?.status||'NOT_CONFIGURED',permission_status:r?.permission_status||'REVIEW_REQUIRED',security_status:r?.security_status||'REVIEW_REQUIRED',enabled:!!r?.enabled,reviewed_at:r?.reviewed_at||null,run_validated_at:r?.run_validated_at||null,revision:r?.revision||null,metadata:r?JSON.parse(r.metadata):{}}})
}
export async function configureActor(env:Env,w:string,user:string,input:any) {
  const slot=ACQUISITION_SLOTS.find(s=>s.capability===input.capability)
  if(!slot)throw new Fault('VALIDATION','Logical capability tidak terdaftar')
  const profile=input.profile||'metadata-only',p=INPUT_PROFILES[profile]
  if(profile!=='metadata-only'&&(!p||p.source!==slot.source||p.capability!==slot.capability))throw new Fault('VALIDATION','Profil tidak cocok dengan logical capability/source')
  const snapshot=await new ApifyAdapter(apifySecret(env)).inspectActor(text(input.actor_id,'actor_id',100),profile)
  const rid=`${w}:apify:${slot.capability}`,revision=now()
  await stmt(env.DB,"INSERT INTO actor_registry (id,workspace_id,capability,source,actor_id,profile,metadata,review_hash,status,permission_status,security_status,revision) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(workspace_id,capability) DO UPDATE SET actor_id=excluded.actor_id,profile=excluded.profile,metadata=excluded.metadata,review_hash=excluded.review_hash,status=excluded.status,permission_status=excluded.permission_status,security_status=excluded.security_status,enabled=0,reviewed_by=NULL,reviewed_at=NULL,run_validated_at=NULL,revision=excluded.revision",rid,w,slot.capability,slot.source,snapshot.actor_id,profile,JSON.stringify(snapshot),snapshot.review_hash,snapshot.validation_status,snapshot.permission_status,snapshot.security_status,revision).run()
  return {id:rid,revision,status:snapshot.validation_status,enabled:false,metadata:snapshot}
}
export async function actorResource(env:Env,w:string,rid:string) {
  const r=await one(env.DB,'SELECT * FROM actor_registry WHERE id=? AND workspace_id=?',rid,w)
  if(!r)throw new Fault('NOT_FOUND','Actor configuration tidak ditemukan',404)
  return r
}
export async function reviewActor(env:Env,w:string,user:string,rid:string,input:any) {
  confirm(input.confirm);confirm(input.terms_authorized)
  const r=await actorResource(env,w,rid),m:ActorInspection=JSON.parse(r.metadata)
  if(input.review_hash!==r.review_hash||m.security_status!=='TERMS_REVIEW_REQUIRED'||m.permission_status!=='LIMITED_PERMISSIONS'||m.validation_status!=='SCHEMA_CHECKED_RUN_UNVALIDATED')throw new Fault('CONFLICT','Review/build/schema/permission belum memenuhi gate; refresh konfigurasi',409)
  const result=await stmt(env.DB,"UPDATE actor_registry SET status='REVIEWED_RUN_UNVALIDATED',reviewed_by=?,reviewed_at=?,revision=? WHERE id=? AND revision=?",user,now(),now(),rid,r.revision).run()
  if(!result.meta.changes)throw new Fault('CONFLICT','Actor configuration berubah',409)
  return {status:'REVIEWED_RUN_UNVALIDATED',enabled:false,paid_run_authorized:false}
}
export async function acquisitionHistory(env:Env,w:string) {
  return all(env.DB,'SELECT a.job_id,a.registry_id,a.capability,a.source,a.input_fingerprint,a.phase,a.run_id,a.dataset_id,a.bounds,a.reserved_usd,a.actual_usage_usd,a.usage,a.result_count,a.rejected_count,a.opportunity_count,a.validation_run,a.cancel_requested,a.started_at,a.completed_at,a.created_at,j.status,j.error_code,j.error_message,json_extract(a.snapshot,\'$.actor_id\') actor_id,json_extract(a.snapshot,\'$.actor_version\') actor_version FROM acquisition_jobs a JOIN jobs j ON j.id=a.job_id WHERE a.workspace_id=? ORDER BY a.created_at DESC LIMIT 100',w)
}
export async function createAcquisition(env:Env,w:string,user:string,request:string,input:any) {
  const allowed=['registry_id','query','max_items','max_pages','timeout_seconds','max_charge_usd','date_from','date_to','validation_run','actor_revision','confirm','authorize_spend','idempotency_key']
  if(Object.keys(input).some(k=>!allowed.includes(k)))throw new Fault('VALIDATION','Actor raw input, credentials dan arbitrary endpoints tidak diterima')
  confirm(input.confirm);confirm(input.authorize_spend)
  if(typeof input.validation_run!=='boolean')throw new Fault('VALIDATION','validation_run boolean eksplisit diperlukan')
  const r=await actorResource(env,w,text(input.registry_id,'registry_id',200)),snapshot:ActorInspection=JSON.parse(r.metadata),b=acquisitionBounds(input),actor_input=profileInput(r.profile,b)
  if(!r.reviewed_at||!r.reviewed_by||r.security_status!=='TERMS_REVIEW_REQUIRED')throw new Fault('CONFLICT','OWNER harus mereview Actor dan izin/terms sumber lebih dahulu',409)
  if(!input.validation_run&&(!r.enabled||!r.run_validated_at))throw new Fault('CONFLICT','Jalankan bounded validation berizin, inspect hasil, lalu enable Actor',409)
  if(snapshot.pricing.model!=='PAY_PER_EVENT'||b.max_charge_usd<snapshot.pricing.minimum_charge_ceiling_usd)throw new Fault('CONFLICT','Pricing/charge ceiling tidak didukung; jangan mengasumsikan zero cost',409)
  if(now()-snapshot.pricing_observed_at>86400000)throw new Fault('CONFLICT','Metadata Actor/pricing lebih dari 24 jam; inspect/review ulang',409)
  if(input.actor_revision!==r.revision)throw new Fault('CONFLICT','Actor revision berubah; inspect summary dan konfirmasi ulang',409)
  const stable={registry_id:r.id,revision:r.revision,bounds:b,actor_input,review_hash:r.review_hash,validation_run:input.validation_run}
  const fingerprint=await digest(JSON.stringify(stable)),key=text(input.idempotency_key,'idempotency_key',160)
  const prior=await one(env.DB,'SELECT j.id,a.input_fingerprint,j.status FROM jobs j JOIN acquisition_jobs a ON a.job_id=j.id WHERE j.workspace_id=? AND j.idempotency_key=?',w,key)
  if(prior){if(prior.input_fingerprint!==fingerprint)throw new Fault('CONFLICT','Idempotency key input berbeda',409);return {id:prior.id,status:prior.status,idempotent:true}}
  const operationCount=await one(env.DB,'SELECT COUNT(*) n FROM jobs WHERE workspace_id=? AND created_at>?',w,now()-3600000)
  if(operationCount.n>=60)throw new Fault('RATE_LIMIT','Batas 60 operasi/jam/workspace',429)
  const signals=await one(env.DB,'SELECT COUNT(*) n FROM signals WHERE workspace_id=?',w)
  if(signals.n+b.max_items>5000)throw new Fault('RATE_LIMIT','Evidence capacity tidak cukup',429)
  const jid=id(),time=now()
  const results=await env.DB.batch([
    stmt(env.DB,"INSERT OR IGNORE INTO jobs (id,workspace_id,actor_id,type,input,status,max_attempts,next_run_at,idempotency_key,request_id,created_at) VALUES (?,?,?,'ACQUIRE',?,'QUEUED',160,?,?,?,?)",jid,w,user,JSON.stringify({provider:'apify',fingerprint}),time,key,request,time),
    // Atomic admission/reservation: global runtime token shared by invite-only workspaces.
    stmt(env.DB,"INSERT INTO acquisition_jobs (job_id,workspace_id,registry_id,capability,source,snapshot,input_fingerprint,bounds,actor_input,reserved_usd,validation_run,request_deadline,created_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM jobs WHERE id=?) AND (SELECT COALESCE(SUM(MAX(reserved_usd,COALESCE(actual_usage_usd,0))),0) FROM acquisition_jobs WHERE created_at>?) + ?<=2 AND (SELECT COALESCE(SUM(MAX(reserved_usd,COALESCE(actual_usage_usd,0))),0) FROM acquisition_jobs WHERE workspace_id=? AND created_at>?) + ?<=1 AND (SELECT COUNT(*) FROM acquisition_jobs WHERE phase IN ('PREPARED','STARTING','RUNNING','RETRIEVING','UNKNOWN'))<2",jid,w,r.id,r.capability,r.source,JSON.stringify(snapshot),fingerprint,JSON.stringify(b),JSON.stringify(actor_input),b.max_charge_usd,input.validation_run?1:0,time+b.timeout_seconds*1000+10*60000,time,jid,time-86400000,b.max_charge_usd,w,time-86400000,b.max_charge_usd),
    stmt(env.DB,'DELETE FROM jobs WHERE id=? AND NOT EXISTS (SELECT 1 FROM acquisition_jobs WHERE job_id=?)',jid,jid),
    stmt(env.DB,"INSERT INTO audit_events (id,workspace_id,actor_id,operation,target_id,request_id,detail,created_at) SELECT ?,?,?,'acquisition.spend-approved',?,?,?,? WHERE EXISTS (SELECT 1 FROM acquisition_jobs WHERE job_id=?)",id(),w,user,jid,request,JSON.stringify({actor:r.actor_id,review_hash:r.review_hash,max_charge_usd:b.max_charge_usd,fingerprint,validation_run:input.validation_run,ceiling_scope:'Apify PPE Actor charges; platform fees may be additional'}),time,jid)
  ])
  if(!results[1].meta.changes){const raced=await one(env.DB,'SELECT j.id,j.status,a.input_fingerprint FROM jobs j LEFT JOIN acquisition_jobs a ON a.job_id=j.id WHERE j.workspace_id=? AND j.idempotency_key=?',w,key);if(raced){if(raced.input_fingerprint!==fingerprint)throw new Fault('CONFLICT','Idempotency key sudah digunakan untuk input/jenis job berbeda',409);return {id:raced.id,status:raced.status,idempotent:true}}throw new Fault('RATE_LIMIT','Acquisition reservation gate: USD 1/workspace/day, USD 2/runtime/day, max 2 active/unknown jobs',429)}
  return {id:jid,status:'QUEUED',input_fingerprint:fingerprint,reserved_usd:b.max_charge_usd}
}
export type IngestFunction=(env:Env,job:any,records:any[])=>Promise<any>
export async function acquisitionStep(env:Env,job:any,ingest:IngestFunction) {
  const a=await one(env.DB,'SELECT * FROM acquisition_jobs WHERE job_id=? AND workspace_id=?',job.id,job.workspace_id)
  if(!a)throw new Fault('NOT_FOUND','Acquisition record tidak ditemukan',404)
  if(a.phase==='CANCELLED')return {cancelled:true,external_start:!!a.run_id}
  if(a.phase==='SUCCEEDED'||a.phase==='PARTIAL')return JSON.parse((await one(env.DB,'SELECT result FROM jobs WHERE id=?',job.id)).result||'{}')
  const adapter=new ApifyAdapter(apifySecret(env)),snapshot:ActorInspection=JSON.parse(a.snapshot),b=JSON.parse(a.bounds)
  if(a.phase==='STARTING'||a.phase==='UNKNOWN')throw new Fault('CONFLICT','External start outcome UNKNOWN; inspect Apify console. Tidak auto-resubmit Actor berbayar',409)
  if(a.phase==='PREPARED'){
    const registry=await actorResource(env,job.workspace_id,a.registry_id)
    const provider=await one(env.DB,"SELECT enabled,status,validated_at FROM providers WHERE workspace_id=? AND kind='apify'",job.workspace_id)
    if(!provider?.enabled||provider.status!=='ENABLED'||provider.validated_at<now()-86400000)throw new Fault('CONFLICT','Apify workspace disabled/not healthy; no Actor start',409)
    if(registry.status==='DISABLED'||!registry.reviewed_at||registry.review_hash!==snapshot.review_hash||(!a.validation_run&&!registry.enabled))throw new Fault('CONFLICT','Actor diubah/disabled sejak approval; job tidak dijalankan',409)
    if(a.cancel_requested){await stmt(env.DB,"UPDATE acquisition_jobs SET phase='CANCELLED',completed_at=? WHERE job_id=?",now(),job.id).run();return {cancelled:true,external_start:false}}
    // Re-inspect mutable pricing and latest build before any paid POST.
    const current=await adapter.inspectActor(snapshot.actor_id,snapshot.profile)
    if(current.review_hash!==snapshot.review_hash)throw new Fault('CONFLICT','Build/schema/pricing/permission berubah; inspect dan approve ulang',409)
    const intent=await stmt(env.DB,"UPDATE acquisition_jobs SET phase='STARTING',started_at=? WHERE job_id=? AND phase='PREPARED' AND cancel_requested=0",now(),job.id).run()
    if(!intent.meta.changes)throw new Fault('CONFLICT','Start sudah diklaim/cancelled; tidak auto-resubmit',409)
    try{
      const run=await adapter.startRun(snapshot,b,JSON.parse(a.actor_input))
      if(run.build_id!==snapshot.build_id)throw new Fault('PROVIDER','Apify returned unexpected build; outcome membutuhkan review',502)
      await stmt(env.DB,"UPDATE acquisition_jobs SET phase='RUNNING',run_id=?,dataset_id=?,actual_usage_usd=?,usage=? WHERE job_id=?",run.run_id,run.dataset_id,run.actual_usage_usd,JSON.stringify(run.usage),job.id).run()
      return {deferred:true,delay_ms:5000}
    }catch{await stmt(env.DB,"UPDATE acquisition_jobs SET phase='UNKNOWN' WHERE job_id=?",job.id).run();throw new Fault('CONFLICT','External start outcome UNKNOWN; jangan ulang paid run sebelum audit Apify console',409)}
  }
  if(!a.run_id)throw new Fault('PROVIDER','Acquisition run reference hilang',502)
  if(now()>a.request_deadline){if(!a.abort_sent){await adapter.abortRun(a.run_id);await stmt(env.DB,'UPDATE acquisition_jobs SET abort_sent=1,cancel_requested=1 WHERE job_id=?',job.id).run()}throw new Fault('TIMEOUT','Acquisition monitoring deadline; abort diminta, cek status external di console',504,false)}
  const run=await adapter.getRunStatus(a.run_id)
  if(run.actor_id!==snapshot.actor_id||run.build_id!==snapshot.build_id)throw new Fault('PROVIDER','Run/Actor/build provenance mismatch',502)
  await stmt(env.DB,'UPDATE acquisition_jobs SET dataset_id=?,actual_usage_usd=?,usage=? WHERE job_id=?',run.dataset_id,run.actual_usage_usd,JSON.stringify(run.usage),job.id).run()
  if(run.actual_usage_usd!==null&&run.actual_usage_usd>b.max_charge_usd){await stmt(env.DB,"UPDATE providers SET enabled=0,status='DEGRADED',error_code='BUDGET',error_message='Observed total usage exceeded Actor ceiling; platform fees may be additional' WHERE workspace_id=? AND kind='apify'",job.workspace_id).run()}
  if(a.cancel_requested&&['READY','RUNNING','TIMING-OUT'].includes(run.status)&&!a.abort_sent){await adapter.abortRun(a.run_id);await stmt(env.DB,'UPDATE acquisition_jobs SET abort_sent=1 WHERE job_id=?',job.id).run();return {deferred:true,delay_ms:5000}}
  if(['READY','RUNNING','TIMING-OUT','ABORTING'].includes(run.status))return {deferred:true,delay_ms:5000}
  if(run.status==='ABORTED'){await stmt(env.DB,"UPDATE acquisition_jobs SET phase='CANCELLED',completed_at=? WHERE job_id=?",now(),job.id).run();return {cancelled:true,run_id:run.run_id,actual_usage_usd:run.actual_usage_usd}}
  if(run.status!=='SUCCEEDED'){await stmt(env.DB,"UPDATE acquisition_jobs SET phase='FAILED',completed_at=? WHERE job_id=?",now(),job.id).run();throw new Fault('PROVIDER','Apify Actor terminal failure: '+run.status,502,false)}
  if(!run.dataset_id){await stmt(env.DB,"UPDATE acquisition_jobs SET phase='FAILED',completed_at=? WHERE job_id=?",now(),job.id).run();throw new Fault('PROVIDER','Successful run tidak menyediakan dataset',502)}
  await stmt(env.DB,"UPDATE acquisition_jobs SET phase='RETRIEVING' WHERE job_id=?",job.id).run()
  const rows=await adapter.getDatasetItems(run.dataset_id,b.max_items),normalized=await adapter.normalizeOutput(snapshot,run,b,rows,a.input_fingerprint)
  if(rows.length&&!normalized.records.length)throw new Fault('PROVIDER','Semua dataset records gagal normalisasi; tidak mengklaim success',502)
  const result=await ingest(env,job,normalized.records)
  const links=[]
  for(const [index,e] of normalized.records.entries()){const signal=await one(env.DB,'SELECT id FROM signals WHERE workspace_id=? AND (external_id=? OR fingerprint=?)',job.workspace_id,e.external_id,(e as any).contentHash);if(signal)links.push(stmt(env.DB,'INSERT OR IGNORE INTO acquisition_signals (job_id,signal_id,row_index,captured_at) VALUES (?,?,?,?)',job.id,signal.id,e.metadata.rowIndex??index,now()))}
  const phase=normalized.rejected.length?'PARTIAL':'SUCCEEDED'
  const outcome={...result,acquisition_status:phase,run_id:run.run_id,dataset_id:run.dataset_id,actor_id:snapshot.actor_id,actor_version:snapshot.actor_version,actual_usage_usd:run.actual_usage_usd,usage:run.usage,rejected:normalized.rejected,output_validated:normalized.records.length>0,source:'youtube',provider:'apify'}
  await env.DB.batch([...links,
    stmt(env.DB,'UPDATE jobs SET result=? WHERE id=?',JSON.stringify(outcome),job.id),
    stmt(env.DB,'UPDATE acquisition_jobs SET phase=?,result_count=?,rejected_count=?,opportunity_count=?,completed_at=? WHERE job_id=?',phase,normalized.records.length,normalized.rejected.length,result.qualified_count,now(),job.id),
    stmt(env.DB,"UPDATE actor_registry SET run_validated_at=?,status=CASE WHEN enabled=1 THEN 'ENABLED' ELSE 'RUN_VALIDATED' END WHERE id=? AND review_hash=? AND ? > 0",now(),a.registry_id,snapshot.review_hash,normalized.records.length),
    stmt(env.DB,"INSERT OR IGNORE INTO usage_events (id,workspace_id,provider,operation,units,job_id,created_at) VALUES (?,?, 'apify','DATASET_ITEMS',?,?,?)",`apify-items:${job.id}`,job.workspace_id,normalized.records.length,job.id,now())
  ])
  return outcome
}
export async function acquisitionFailure(env:Env,job:any,e:Fault) {
  const row=await one(env.DB,'SELECT phase,run_id FROM acquisition_jobs WHERE job_id=?',job.id)
  // RETRIEVING means external SUCCEEDED was already confirmed. A terminal
  // local retrieval/normalization failure must not keep an active run slot forever.
  if(row&&((!row.run_id&&!['STARTING','UNKNOWN','CANCELLED'].includes(row.phase))||row.phase==='RETRIEVING'))await stmt(env.DB,"UPDATE acquisition_jobs SET phase='FAILED',completed_at=? WHERE job_id=?",now(),job.id).run()
}

export async function cancelAcquisition(env:Env,w:string,jid:string) {
 const a=await one(env.DB,'SELECT a.*,j.status FROM acquisition_jobs a JOIN jobs j ON j.id=a.job_id WHERE a.job_id=? AND a.workspace_id=?',jid,w)
 if(!a)throw new Fault('NOT_FOUND','Acquisition tidak ditemukan',404)
 if(['SUCCEEDED','PARTIAL','FAILED','CANCELLED'].includes(a.phase)&&a.status!=='QUEUED')throw new Fault('CONFLICT','Acquisition sudah terminal',409)
 if(a.phase==='UNKNOWN'||a.phase==='STARTING')throw new Fault('CONFLICT','Start outcome belum diketahui; inspect console sebelum cancel/resubmit',409)
 await stmt(env.DB,'UPDATE acquisition_jobs SET cancel_requested=1 WHERE job_id=?',jid).run()
 if(a.phase==='PREPARED')await env.DB.batch([stmt(env.DB,"UPDATE acquisition_jobs SET phase='CANCELLED',completed_at=? WHERE job_id=? AND phase='PREPARED'",now(),jid),stmt(env.DB,"UPDATE jobs SET status='CANCELLED',finished_at=? WHERE id=? AND status='QUEUED' AND EXISTS (SELECT 1 FROM acquisition_jobs WHERE job_id=? AND phase='CANCELLED')",now(),jid,jid)])
 else await stmt(env.DB,"UPDATE jobs SET status='QUEUED',attempts=0,next_run_at=? WHERE id=? AND status IN ('QUEUED','FAILED')",now(),jid).run()
 return {cancel_requested:true,external_abort_confirmed:false}
}
