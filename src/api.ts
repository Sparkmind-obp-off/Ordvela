import { Hono } from 'hono'
import { App, authenticate, owner, memberships } from './auth'
import { all,one,stmt } from './db'
import { Fault,text,choice,confirm,id,now,blueprint,TEMPLATES,outcomeTransition,digest } from './core'
import { registryStatus, manifest, generateProvider, requireEnabled } from './providers'
import { passwordHash } from './auth'
import { seal } from './adapters'
import { enqueue,runJobs } from './jobs'
export const api = new Hono<App>()
api.use('*',authenticate)
const ok=(c:any,data:any,status=200)=>c.json({data,request_id:c.get('requestId')},status)
const w=(c:any)=>c.get('workspace') as string
async function body(c:any) { return c.req.json() }
async function audit(c:any,operation:string,target:string,detail:any={}) {
  await stmt(c.env.DB,'INSERT INTO audit_events (id,workspace_id,actor_id,operation,target_id,request_id,detail,created_at) VALUES (?,?,?,?,?,?,?,?)',id(),w(c),c.get('user').id,operation,target,c.get('requestId'),JSON.stringify(detail),now()).run()
}
async function get(c:any,table:string,rid:string) {
  const row=await one(c.env.DB,`SELECT * FROM ${table} WHERE id=? AND workspace_id=?`,rid,w(c))
  if(!row) throw new Fault('NOT_FOUND','Resource tidak ditemukan',404)
  return row
}
async function job(c:any,type:string,input:any,key:string) {
  const count=await one(c.env.DB,"SELECT COUNT(*) n FROM jobs WHERE workspace_id=? AND created_at>?",w(c),now()-3600000)
  if(count.n>=60) throw new Fault('RATE_LIMIT','Batas 60 operasi per jam per workspace tercapai',429,true)
  const j=await enqueue(c.env,w(c),c.get('user').id,c.get('requestId'),type,input,key)
  c.executionCtx.waitUntil(runJobs(c.env,w(c)))
  return ok(c,j,202)
}
api.get('/me',async c=>ok(c,{user:c.get('user'),workspace_id:w(c),role:c.get('role'),workspaces:await memberships(c)}))
api.get('/workspaces',async c=>ok(c,await memberships(c)))
api.post('/workspaces/current/archive',async c=>{
  owner(c);const b=await body(c);confirm(b.confirm)
  const workspace=await one(c.env.DB,'SELECT name FROM workspaces WHERE id=? AND deleted_at IS NULL',w(c))
  if(!workspace||b.workspace_name!==workspace.name)throw new Fault('VALIDATION','Ketik nama workspace persis untuk archive')
  await c.env.DB.batch([
    stmt(c.env.DB,'UPDATE workspaces SET deleted_at=? WHERE id=? AND deleted_at IS NULL',now(),w(c)),
    stmt(c.env.DB,'INSERT INTO audit_events (id,workspace_id,actor_id,operation,target_id,request_id,detail,created_at) VALUES (?,?,?,?,?,?,?,?)',id(),w(c),c.get('user').id,'workspace.archived',w(c),c.get('requestId'),'soft archive; history retained',now()),
    stmt(c.env.DB,"UPDATE jobs SET status='CANCELLED',finished_at=? WHERE workspace_id=? AND status='QUEUED'",now(),w(c))
  ])
  return ok(c,{archived:true,history_retained:true,public_demos_revoked:true})
})
api.get('/members',async c=>ok(c,await all(c.env.DB,'SELECT u.id,u.name,u.email,m.role FROM workspace_members m JOIN users u ON u.id=m.user_id WHERE m.workspace_id=?',w(c))))
api.post('/members',async c=>{
  owner(c);const b=await body(c);confirm(b.confirm)
  const email=text(b.email,'email',254).toLowerCase(),role=choice(b.role,'role',['OPERATOR','VIEWER']),u=await one(c.env.DB,'SELECT id FROM users WHERE email=?',email)
  if(!u) throw new Fault('NOT_FOUND','Pengguna harus mendaftar terlebih dahulu',404)
  const existing=await one(c.env.DB,'SELECT role FROM workspace_members WHERE workspace_id=? AND user_id=?',w(c),u.id)
  if(existing?.role==='OWNER') throw new Fault('CONFLICT','OWNER tidak boleh diturunkan melalui endpoint ini',409)
  await stmt(c.env.DB,'INSERT INTO workspace_members (workspace_id,user_id,role) VALUES (?,?,?) ON CONFLICT(workspace_id,user_id) DO UPDATE SET role=excluded.role',w(c),u.id,role).run()
  await audit(c,'member.updated',u.id,{role});return ok(c,{user_id:u.id,role})
})
api.delete('/members/:id',async c=>{
  owner(c);const b=await body(c);confirm(b.confirm)
  const member=await one(c.env.DB,'SELECT role FROM workspace_members WHERE workspace_id=? AND user_id=?',w(c),c.req.param('id'))
  if(!member || member.role==='OWNER') throw new Fault('CONFLICT','Tidak dapat mencabut OWNER / anggota tidak ditemukan',409)
  await stmt(c.env.DB,'DELETE FROM workspace_members WHERE workspace_id=? AND user_id=?',w(c),c.req.param('id')).run()
  await audit(c,'member.revoked',c.req.param('id'));return ok(c,{revoked:true})
})
api.post('/signals/ingest',async c=>{
  const b=await body(c),provider=choice(b.provider,'provider',['hacker-news','github-issues','threads'])
  await requireEnabled(c.env,w(c),provider)
  const input={provider,query:b.query?text(b.query,'query',150):undefined,reference:b.reference?text(b.reference,'reference',500):undefined}
  if(!input.query && !input.reference) throw new Fault('VALIDATION','Query atau URL bukti diperlukan')
  if(provider==='github-issues' && !input.reference) throw new Fault('VALIDATION','URL issue diperlukan')
  if(provider==='threads' && !input.query) throw new Fault('VALIDATION','Threads memerlukan query keyword')
  const total=await one(c.env.DB,'SELECT COUNT(*) n FROM opportunities WHERE workspace_id=?',w(c))
  if(total.n>=500) throw new Fault('RATE_LIMIT','Batas V0: 500 opportunities per workspace',429)
  return job(c,'INGEST',input,text(b.idempotency_key || id(),'idempotency_key',160))
})
api.get('/sources',async c=>ok(c,await all(c.env.DB,'SELECT * FROM sources WHERE workspace_id=?',w(c))))
api.get('/signals',async c=>ok(c,await all(c.env.DB,'SELECT * FROM signals WHERE workspace_id=? ORDER BY captured_at DESC LIMIT 100',w(c))))
api.get('/opportunities',async c=>{
  const q=(c.req.query('q') || '').slice(0,150),status=c.req.query('status') || '',min=Number(c.req.query('min_score') || 0)
  if(!Number.isFinite(min)||min<0||min>100) throw new Fault('VALIDATION','min_score tidak valid')
  return ok(c,await all(c.env.DB,`SELECT o.*,s.url,s.author,s.published_at,s.captured_at,s.external_id,s.normalized_text FROM opportunities o JOIN signals s ON s.id=o.signal_id WHERE o.workspace_id=? AND o.deleted_at IS NULL AND o.opportunity_score>=? AND (?='' OR o.status=?) AND (?='' OR o.title LIKE ? OR o.problem LIKE ?) ORDER BY o.opportunity_score DESC,o.created_at DESC LIMIT 100`,w(c),min,status,status,q,`%${q}%`,`%${q}%`))
})
api.get('/opportunities/:id',async c=>{
  const op=await get(c,'opportunities',c.req.param('id'))
  return ok(c,{...op,evidence:await get(c,'signals',op.signal_id),scores:await all(c.env.DB,'SELECT * FROM opportunity_scores WHERE opportunity_id=? AND workspace_id=? ORDER BY created_at',op.id,w(c)),timeline:await all(c.env.DB,'SELECT operation,created_at,detail FROM audit_events WHERE workspace_id=? AND (target_id=? OR target_id=?) ORDER BY created_at',w(c),op.id,op.signal_id)})
})
api.post('/opportunities/:id/decision',async c=>{
  const op=await get(c,'opportunities',c.req.param('id')),b=await body(c),state=choice(b.status,'status',['REVIEWED','SELECTED','REJECTED'])
  const allowed:Record<string,string[]>={NEW:['REVIEWED','SELECTED','REJECTED'],REVIEWED:['SELECTED','REJECTED'],SELECTED:['REVIEWED','REJECTED'],REJECTED:['REVIEWED','SELECTED']}
  if(!allowed[op.status]?.includes(state)) throw new Fault('CONFLICT','Keputusan tidak valid untuk state saat ini',409)
  const r=await stmt(c.env.DB,'UPDATE opportunities SET status=?,updated_at=? WHERE id=? AND workspace_id=? AND status=?',state,now(),op.id,w(c),op.status).run()
  if(!r.meta.changes) throw new Fault('CONFLICT','State berubah; muat ulang',409)
  await audit(c,'opportunity.decision',op.id,{from:op.status,to:state});return ok(c,{id:op.id,status:state})
})
api.post('/opportunities/:id/assess',async c=>{
  const b=await body(c);confirm(b.confirm)
  const op=await get(c,'opportunities',c.req.param('id')),provider=choice(b.provider||'groq','provider',['groq'])
  await requireEnabled(c.env,w(c),provider)
  await audit(c,'intelligence.external-approved',op.id,{provider,scope:'public evidence only'})
  return job(c,'ASSESS',{opportunity_id:op.id,provider},text(b.idempotency_key||id(),'idempotency_key',160))
})
api.get('/opportunities/:id/assessments',async c=>{
  const op=await get(c,'opportunities',c.req.param('id'))
  return ok(c,await all(c.env.DB,'SELECT id,provider,model,evidence_hash,result,created_at FROM intelligence_assessments WHERE opportunity_id=? AND workspace_id=? ORDER BY created_at DESC',op.id,w(c)))
})
api.post('/account/password',async c=>{
  const b=await body(c),current=text(b.current_password,'current_password',200),next=text(b.new_password,'new_password',200,12),u=await one(c.env.DB,'SELECT password_hash FROM users WHERE id=?',c.get('user').id)
  if(await passwordHash(current,u.password_hash.split(':')[0])!==u.password_hash)throw new Fault('AUTHENTICATION','Password saat ini tidak cocok',401)
  await c.env.DB.batch([stmt(c.env.DB,'UPDATE users SET password_hash=? WHERE id=?',await passwordHash(next),c.get('user').id),stmt(c.env.DB,'DELETE FROM sessions WHERE user_id=?',c.get('user').id)])
  await audit(c,'account.password-changed',c.get('user').id);return ok(c,{changed:true,login_required:true})
})
api.get('/executions',async c=>ok(c,await all(c.env.DB,'SELECT e.*,o.title FROM executions e JOIN opportunities o ON e.opportunity_id=o.id WHERE e.workspace_id=? ORDER BY e.created_at DESC LIMIT 100',w(c))))
api.post('/executions',async c=>{
  await requireEnabled(c.env,w(c),'template-build')
  const b=await body(c),op=await get(c,'opportunities',text(b.opportunity_id,'opportunity_id',100))
  if(op.status!=='SELECTED') throw new Fault('CONFLICT','Pilih opportunity sebelum build',409)
  const t=choice(b.template,'template',TEMPLATES),title=text(b.public_title,'public_title',100),summary=text(b.public_summary,'public_summary',600),bp=blueprint(op,t,title,summary),eid=id()
  const pending=await one(c.env.DB,'SELECT COUNT(*) n FROM jobs WHERE workspace_id=? AND created_at>?',w(c),now()-3600000)
  if(pending.n>=60) throw new Fault('RATE_LIMIT','Batas operasi per jam tercapai',429,true)
  const jid=id(),time=now()
  const result=await c.env.DB.batch([
    stmt(c.env.DB,"INSERT INTO executions (id,workspace_id,opportunity_id,template,blueprint,status,created_at,updated_at) SELECT ?,?,?,?,?,'PENDING',?,? WHERE EXISTS (SELECT 1 FROM opportunities WHERE id=? AND workspace_id=? AND status='SELECTED')",eid,w(c),op.id,t,JSON.stringify(bp),time,time,op.id,w(c)),
    stmt(c.env.DB,"UPDATE opportunities SET status='EXECUTION_READY',updated_at=? WHERE id=? AND workspace_id=? AND status='SELECTED' AND EXISTS (SELECT 1 FROM executions WHERE id=?)",time,op.id,w(c),eid),
    stmt(c.env.DB,"INSERT INTO jobs (id,workspace_id,actor_id,type,input,status,next_run_at,idempotency_key,request_id,created_at) SELECT ?,?,?,'BUILD',?,'QUEUED',?,?,?,? WHERE EXISTS (SELECT 1 FROM executions WHERE id=?)",jid,w(c),c.get('user').id,JSON.stringify({execution_id:eid}),time,`build:${eid}`,c.get('requestId'),time,eid),
    stmt(c.env.DB,'INSERT INTO audit_events (id,workspace_id,actor_id,operation,target_id,request_id,detail,created_at) SELECT ?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM executions WHERE id=?)',id(),w(c),c.get('user').id,'execution.created',eid,c.get('requestId'),JSON.stringify({opportunity_id:op.id,template:t}),time,eid)
  ])
  if(!result[0].meta.changes) throw new Fault('CONFLICT','Opportunity berubah; muat ulang',409)
  c.executionCtx.waitUntil(runJobs(c.env,w(c)))
  return ok(c,{id:jid,status:'QUEUED',execution_id:eid},202)
})
api.get('/executions/:id',async c=>{
  const e=await get(c,'executions',c.req.param('id'))
  return ok(c,{...e,artifacts:await all(c.env.DB,'SELECT * FROM execution_artifacts WHERE execution_id=? AND workspace_id=?',e.id,w(c))})
})
api.post('/executions/:id/publish',async c=>{
  owner(c);const b=await body(c);confirm(b.confirm)
  await requireEnabled(c.env,w(c),'cloudflare-pages')
  const e=await get(c,'executions',c.req.param('id'))
  if(!['VALIDATED','DEPLOYED'].includes(e.status)) throw new Fault('CONFLICT','Execution belum tervalidasi',409)
  await audit(c,'deployment.approved',e.id)
  return job(c,'PUBLISH',{execution_id:e.id,revision:e.updated_at},`publish:${e.id}:${e.updated_at}`)
})
api.post('/executions/:id/unpublish',async c=>{
  owner(c);confirm((await body(c)).confirm);const e=await get(c,'executions',c.req.param('id'))
  await c.env.DB.batch([
    stmt(c.env.DB,"UPDATE executions SET status='VALIDATED',demo_token=NULL,demo_url=NULL,updated_at=? WHERE id=? AND workspace_id=?",now(),e.id,w(c)),
    stmt(c.env.DB,"UPDATE distributions SET status='APPROVAL_REQUIRED',approved_by=NULL,approved_at=NULL,updated_at=? WHERE execution_id=? AND workspace_id=? AND status='APPROVED'",now(),e.id,w(c))
  ])
  await audit(c,'deployment.revoked',e.id);return ok(c,{unpublished:true})
})
api.get('/distributions',async c=>ok(c,await all(c.env.DB,'SELECT d.*,o.title,e.demo_url,s.url AS evidence_url FROM distributions d JOIN opportunities o ON d.opportunity_id=o.id JOIN executions e ON d.execution_id=e.id JOIN signals s ON o.signal_id=s.id WHERE d.workspace_id=? ORDER BY d.created_at DESC LIMIT 100',w(c))))
api.post('/distributions',async c=>{
  await requireEnabled(c.env,w(c),'messaging')
  const b=await body(c),e=await get(c,'executions',text(b.execution_id,'execution_id',100))
  if(e.status!=='DEPLOYED') throw new Fault('CONFLICT','Publikasikan demo terlebih dahulu',409)
  const op=await get(c,'opportunities',e.opportunity_id),s=await get(c,'signals',op.signal_id),did=id(),target=text(b.target,'target context',500),demo=new URL(e.demo_url,c.req.url).href
  const message=`Halo, saya melihat kebutuhan publik ini: ${s.url}\n\nAnda menyebut: “${s.normalized_text.slice(0,280)}”\n\nSaya menyiapkan prototype kecil untuk dievaluasi: ${demo}\nIni hanya demo, belum solusi produksi atau janji hasil. Jika masih relevan, apakah Anda bersedia memberi masukan mengenai kebutuhan dan prioritasnya?`
  await stmt(c.env.DB,"INSERT INTO distributions (id,workspace_id,opportunity_id,execution_id,target,message,status,created_at,updated_at) VALUES (?,?,?,?,?,?,'APPROVAL_REQUIRED',?,?)",did,w(c),op.id,e.id,target,message,now(),now()).run()
  await audit(c,'message.generated',did,{provider:'deterministic-evidence',execution_id:e.id})
  await stmt(c.env.DB,'INSERT INTO usage_events (id,workspace_id,provider,operation,units,created_at) VALUES (?,?,?,?,?,?)',id(),w(c),'deterministic-evidence','MESSAGE',1,now()).run()
  return ok(c,{id:did,message,status:'APPROVAL_REQUIRED'},201)
})
api.patch('/distributions/:id',async c=>{
  const d=await get(c,'distributions',c.req.param('id')),b=await body(c)
  if(!['APPROVAL_REQUIRED','DRAFT','APPROVED'].includes(d.status)) throw new Fault('CONFLICT','Pesan yang telah dikontak tidak dapat diubah',409)
  const message=text(b.message,'message',4000)
  const update=await stmt(c.env.DB,"UPDATE distributions SET message=?,status='APPROVAL_REQUIRED',approved_by=NULL,approved_at=NULL,updated_at=? WHERE id=? AND workspace_id=? AND contacted_at IS NULL",message,now(),d.id,w(c)).run()
  if(!update.meta.changes) throw new Fault('CONFLICT','Contact sudah dicatat; edit ditolak',409)
  await audit(c,'message.edited',d.id);return ok(c,{status:'APPROVAL_REQUIRED'})
})
api.post('/distributions/:id/approve',async c=>{
  owner(c);confirm((await body(c)).confirm);const d=await get(c,'distributions',c.req.param('id'))
  if(d.status!=='APPROVAL_REQUIRED') throw new Fault('CONFLICT','Pesan tidak menunggu approval',409)
  const e=await get(c,'executions',d.execution_id)
  if(e.status!=='DEPLOYED') throw new Fault('CONFLICT','Demo telah ditarik',409)
  const r=await stmt(c.env.DB,"UPDATE distributions SET status='APPROVED',approved_by=?,approved_at=?,updated_at=? WHERE id=? AND workspace_id=? AND status='APPROVAL_REQUIRED' AND updated_at=?",c.get('user').id,now(),now(),d.id,w(c),d.updated_at).run()
  if(!r.meta.changes) throw new Fault('CONFLICT','Approval berubah',409)
  await audit(c,'contact.approved',d.id);return ok(c,{status:'APPROVED',mode:'MANUAL_HANDOFF'})
})
api.post('/distributions/:id/contact',async c=>{
  const d=await get(c,'distributions',c.req.param('id')),b=await body(c);confirm(b.confirm)
  if(d.status!=='APPROVED'||!d.approved_by) throw new Fault('CONFLICT','Human approval diperlukan sebelum mencatat contact',409)
  const execution=await get(c,'executions',d.execution_id)
  if(execution.status!=='DEPLOYED') throw new Fault('CONFLICT','Demo telah ditarik; contact tidak dapat dicatat',409)
  const reference=text(b.contact_reference,'contact_reference',500)
  const follow=b.next_follow_up_at?text(b.next_follow_up_at,'follow_up',30):null
  if(follow && !Number.isFinite(Date.parse(follow))) throw new Fault('VALIDATION','Tanggal follow-up tidak valid')
  const r=await stmt(c.env.DB,"UPDATE distributions SET status='CONTACTED',contacted_at=?,contact_reference=?,next_follow_up_at=?,updated_at=? WHERE id=? AND workspace_id=? AND status='APPROVED' AND updated_at=?",now(),reference,follow,now(),d.id,w(c),d.updated_at).run()
  if(!r.meta.changes) throw new Fault('CONFLICT','State contact berubah',409)
  await audit(c,'contact.recorded',d.id,{mode:'manual',reference});return ok(c,{status:'CONTACTED',external_send_performed:false})
})
api.post('/outcomes',async c=>{
  const b=await body(c),d=await get(c,'distributions',text(b.distribution_id,'distribution_id',100)),state=choice(b.state,'state',['FOLLOW_UP','REPLIED','QUALIFIED','PROPOSAL','WON','LOST'])
  outcomeTransition(d.status,state)
  const revenue=b.revenue_minor ?? 0
  if(!Number.isSafeInteger(revenue)||revenue<0||revenue>1e14||state!=='WON'&&revenue!==0) throw new Fault('VALIDATION','Revenue hanya untuk WON; gunakan integer unit minor non-negatif')
  const currency=choice(b.currency||'IDR','currency',['IDR','USD','EUR']),feedback=text(b.feedback,'feedback',2000),reason=state==='LOST'?text(b.loss_reason,'loss_reason',500):null,oid=id()
  // INSERT ... SELECT protects append-only outcome history from concurrent stale transitions.
  const r=await c.env.DB.batch([
    stmt(c.env.DB,'INSERT INTO outcomes (id,workspace_id,distribution_id,state,revenue_minor,currency,loss_reason,feedback,actor_id,created_at) SELECT ?,?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM distributions WHERE id=? AND workspace_id=? AND status=?)',oid,w(c),d.id,state,revenue,currency,reason,feedback,c.get('user').id,now(),d.id,w(c),d.status),
    stmt(c.env.DB,'UPDATE distributions SET status=?,updated_at=? WHERE id=? AND workspace_id=? AND status=?',state,now(),d.id,w(c),d.status),
    stmt(c.env.DB,'INSERT INTO audit_events (id,workspace_id,actor_id,operation,target_id,request_id,detail,created_at) SELECT ?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM outcomes WHERE id=?)',id(),w(c),c.get('user').id,'outcome.recorded',d.id,c.get('requestId'),JSON.stringify({from:d.status,to:state,revenue_minor:revenue,currency}),now(),oid)
  ])
  if(!r[0].meta.changes) throw new Fault('CONFLICT','State berubah; muat ulang',409)
  if(['WON','LOST'].includes(state)) await stmt(c.env.DB,'UPDATE opportunities SET status=?,updated_at=? WHERE id=? AND workspace_id=?',state,now(),d.opportunity_id,w(c)).run()
  return ok(c,{id:oid,state},201)
})
api.get('/outcomes',async c=>ok(c,await all(c.env.DB,'SELECT r.*,o.title FROM outcomes r JOIN distributions d ON d.id=r.distribution_id JOIN opportunities o ON o.id=d.opportunity_id WHERE r.workspace_id=? ORDER BY r.created_at DESC LIMIT 100',w(c))))
api.get('/metrics',async c=>ok(c,{
  opportunities:await one(c.env.DB,'SELECT COUNT(*) total,COALESCE(SUM(status=\'SELECTED\'),0) selected FROM opportunities WHERE workspace_id=?',w(c)),
  pipeline:await all(c.env.DB,'SELECT status,COUNT(*) total FROM distributions WHERE workspace_id=? GROUP BY status',w(c)),
  revenue:await all(c.env.DB,"SELECT currency,SUM(revenue_minor) revenue_minor FROM outcomes WHERE workspace_id=? AND state='WON' GROUP BY currency",w(c)),
  learning:await all(c.env.DB,"SELECT s.external_id,s.url,o.opportunity_score,o.intent,e.template,r.state,r.feedback,r.loss_reason,r.revenue_minor,r.currency,r.created_at FROM outcomes r JOIN distributions d ON r.distribution_id=d.id JOIN opportunities o ON o.id=d.opportunity_id JOIN signals s ON s.id=o.signal_id JOIN executions e ON e.id=d.execution_id WHERE r.workspace_id=? ORDER BY r.created_at DESC LIMIT 50",w(c))
}))
api.get('/jobs',async c=>{
  c.executionCtx.waitUntil(runJobs(c.env,w(c)))
  return ok(c,await all(c.env.DB,'SELECT id,type,status,attempts,max_attempts,error_code,error_message,result,next_run_at,created_at,finished_at FROM jobs WHERE workspace_id=? ORDER BY created_at DESC LIMIT 100',w(c)))
})
api.post('/jobs/:id/retry',async c=>{
  const j=await get(c,'jobs',c.req.param('id'))
  if(j.status!=='FAILED'||j.attempts>=j.max_attempts) throw new Fault('CONFLICT','Job tidak dapat diulang; buat operasi baru setelah memperbaiki penyebab',409)
  await stmt(c.env.DB,"UPDATE jobs SET status='QUEUED',next_run_at=?,finished_at=NULL WHERE id=? AND workspace_id=? AND status='FAILED'",now(),j.id,w(c)).run()
  await audit(c,'job.retry',j.id);c.executionCtx.waitUntil(runJobs(c.env,w(c)));return ok(c,{status:'QUEUED'})
})
api.post('/jobs/:id/cancel',async c=>{
  const j=await get(c,'jobs',c.req.param('id'))
  if(j.status!=='QUEUED') throw new Fault('CONFLICT','Hanya job QUEUED yang dapat dibatalkan dengan aman',409)
  await stmt(c.env.DB,"UPDATE jobs SET status='CANCELLED',finished_at=? WHERE id=? AND workspace_id=? AND status='QUEUED'",now(),j.id,w(c)).run()
  await audit(c,'job.cancelled',j.id);return ok(c,{status:'CANCELLED'})
})
api.get('/providers',async c=>{
  const registry=await registryStatus(c.env,w(c))
  return ok(c,{encryption_configured:!!c.env.CREDENTIAL_MASTER_KEY,registry,builtin:registry.filter(p=>!p.credential_fields.length&&p.implementation!=='PLANNED').map(p=>({kind:p.id,status:p.status,mode:p.setup})),configured:registry.filter(p=>p.configured&&p.credential_fields.length).map(p=>({id:p.resource_id,kind:p.id,status:p.status,updated_at:p.last_validation}))})
})
api.post('/providers',async c=>{
  owner(c);const b=await body(c);confirm(b.confirm)
  const m=manifest(text(b.kind,'kind',60))
  if(m.implementation==='PLANNED'||!m.credential_fields.length)throw new Fault('CONFLICT','Provider tidak menerima credential; lihat checklist dokumentasi',409)
  const supplied=b.credentials||(b.api_key?{api_key:b.api_key}:{})
  if(!supplied||typeof supplied!=='object'||Array.isArray(supplied)||Object.keys(supplied).some(k=>!m.credential_fields.includes(k)))throw new Fault('VALIDATION','Credential fields tidak sesuai manifest')
  const values=Object.fromEntries(m.credential_fields.map(f=>[f,text(supplied[f],f,4000,10)])),cipher=await seal(JSON.stringify(values),c.env.CREDENTIAL_MASTER_KEY||''),pid=`${w(c)}:${m.id}`
  const config=m.id==='groq'?{model:text(b.model||m.default_model,'model',100)}:{}
  await stmt(c.env.DB,"INSERT INTO providers (id,workspace_id,kind,status,credential_cipher,updated_at,enabled,version,config) VALUES (?,?,?,'CONFIGURED',?,?,0,?,?) ON CONFLICT(workspace_id,kind) DO UPDATE SET credential_cipher=excluded.credential_cipher,status='CONFIGURED',updated_at=excluded.updated_at,enabled=0,config=excluded.config,validated_at=NULL,health_checked_at=NULL,health_status='NOT_CHECKED',error_code=NULL,error_message=NULL",pid,w(c),m.id,cipher,now(),m.version,JSON.stringify(config)).run()
  await audit(c,'provider.rotated',pid,{kind:m.id});return ok(c,{id:pid,status:'CONFIGURED',enabled:false,raw_secret_returned:false})
})
async function providerResource(c:any,rid:string) {
  const kind=rid.includes(':')?rid.split(':').pop()!:rid,m=manifest(kind)
  if(rid!==kind&&rid!==`${w(c)}:${kind}`)throw new Fault('NOT_FOUND','Provider tidak ditemukan',404)
  if(m.implementation==='PLANNED')throw new Fault('CONFLICT','DOCUMENTATION_REQUIRED: belum ada adapter aktif',409)
  const pid=`${w(c)}:${kind}`
  let p=await one(c.env.DB,'SELECT * FROM providers WHERE id=? AND workspace_id=?',pid,w(c))
  if(!p){const publicBuiltin=!m.credential_fields.length;await stmt(c.env.DB,"INSERT OR IGNORE INTO providers (id,workspace_id,kind,status,updated_at,enabled,version) VALUES (?,?,?,?,?,?,?)",pid,w(c),kind,publicBuiltin?'ENABLED':'NOT_CONFIGURED',now(),publicBuiltin?1:0,m.version).run();p=await get(c,'providers',pid)}
  return p
}
async function providerCheck(c:any,type:string) {
  owner(c)
  const count=await one(c.env.DB,'SELECT COUNT(*) n FROM jobs WHERE workspace_id=? AND created_at>?',w(c),now()-3600000)
  if(count.n>=60)throw new Fault('RATE_LIMIT','Batas 60 operasi/jam tercapai',429,true)
  const p=await providerResource(c,c.req.param('id')),m=manifest(p.kind)
  if(m.credential_fields.length&&!p.credential_cipher)throw new Fault('CONFLICT','Required credential belum dikonfigurasi',409)
  const time=now()
  const j=await enqueue(c.env,w(c),c.get('user').id,c.get('requestId'),type,{provider_id:p.id,provider_kind:p.kind,revision:p.updated_at},`${type}:${p.id}:${time}`)
  await stmt(c.env.DB,"UPDATE providers SET status='VALIDATING',health_status='VALIDATING' WHERE id=? AND updated_at=?",p.id,p.updated_at).run()
  await audit(c,'provider.check-requested',p.id,{type});c.executionCtx.waitUntil(runJobs(c.env,w(c)));return ok(c,j,202)
}
api.post('/providers/:id/validate',c=>providerCheck(c,'PROVIDER_VALIDATE'))
api.post('/providers/:id/health',c=>providerCheck(c,'PROVIDER_HEALTH'))
api.post('/providers/:id/enable',async c=>{
  owner(c);const b=await body(c);confirm(b.confirm);const p=await providerResource(c,c.req.param('id'))
  if(p.health_status!=='HEALTHY'||!p.validated_at||p.validated_at<now()-86400000)throw new Fault('CONFLICT','Validate/health dalam 24 jam terakhir diperlukan sebelum enable',409)
  const r=await stmt(c.env.DB,"UPDATE providers SET enabled=1,status='ENABLED',updated_at=? WHERE id=? AND workspace_id=? AND health_status='HEALTHY' AND updated_at=?",now(),p.id,w(c),p.updated_at).run()
  if(!r.meta.changes)throw new Fault('CONFLICT','Configuration berubah; muat ulang',409)
  await audit(c,'provider.enabled',p.id);return ok(c,{status:'ENABLED',enabled:true})
})
api.post('/providers/:id/disable',async c=>{
  owner(c);confirm((await body(c)).confirm);const p=await providerResource(c,c.req.param('id'))
  await stmt(c.env.DB,"UPDATE providers SET enabled=0,status='DISABLED',updated_at=? WHERE id=? AND workspace_id=?",now(),p.id,w(c)).run()
  await audit(c,'provider.disabled',p.id);return ok(c,{status:'DISABLED',enabled:false})
})
api.delete('/providers/:id',async c=>{
  owner(c);confirm((await body(c)).confirm);const p=await providerResource(c,c.req.param('id'))
  await stmt(c.env.DB,"UPDATE providers SET credential_cipher=NULL,enabled=0,status='NOT_CONFIGURED',validated_at=NULL,health_checked_at=NULL,health_status='NOT_CHECKED',error_code=NULL,error_message=NULL,updated_at=? WHERE id=? AND workspace_id=?",now(),p.id,w(c)).run()
  await audit(c,'provider.revoked',p.id);return ok(c,{status:'NOT_CONFIGURED',enabled:false})
})
api.post('/provider-generator',async c=>{
  owner(c);const b=await body(c)
  if(/gsk_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|EAA[A-Za-z0-9]{40,}/.test(JSON.stringify(b)))throw new Fault('VALIDATION','Generator hanya menerima definisi; jangan masukkan nilai secret')
  const generated=await generateProvider(b),gid=id()
  await stmt(c.env.DB,'INSERT INTO provider_scaffolds (id,workspace_id,provider_id,definition,bundle,status,checksum,actor_id,created_at) VALUES (?,?,?,?,?,?,?,?,?)',gid,w(c),generated.definition.provider_id,JSON.stringify(generated.definition),JSON.stringify(generated.files),generated.status,generated.checksum,c.get('user').id,now()).run()
  await audit(c,'provider.scaffold-generated',gid,{provider:generated.definition.provider_id,status:generated.status})
  return ok(c,{id:gid,...generated},201)
})
api.get('/provider-generator',async c=>ok(c,await all(c.env.DB,'SELECT id,provider_id,status,checksum,created_at FROM provider_scaffolds WHERE workspace_id=? ORDER BY created_at DESC LIMIT 50',w(c))))
api.get('/provider-generator/:id',async c=>ok(c,await get(c,'provider_scaffolds',c.req.param('id'))))
api.get('/usage',async c=>ok(c,await all(c.env.DB,'SELECT provider,operation,SUM(units) units,COUNT(*) events FROM usage_events WHERE workspace_id=? GROUP BY provider,operation',w(c))))
api.get('/audit',async c=>ok(c,await all(c.env.DB,'SELECT a.*,u.name AS actor_name FROM audit_events a JOIN users u ON u.id=a.actor_id WHERE a.workspace_id=? ORDER BY a.created_at DESC LIMIT 100',w(c))))
api.get('/settings',async c=>ok(c,{environment:c.env.ENVIRONMENT || 'unknown',job_processing:'request-driven durable queue (poll /api/jobs)',signup_enabled:c.env.SIGNUP_ENABLED==='true',flags:await all(c.env.DB,'SELECT key,value FROM settings WHERE workspace_id=?',w(c))}))
