import { Env } from './db'
import { Fault, text, choice, now, digest } from './core'
import { NormalizedEvidence, normalizeEvidence } from './adapters'

export type AcquisitionBudget={max_requests:number;max_items:number;max_spend:number;currency:string;timeout_ms:number;query:string;date_from:string;date_to:string}
export type CostEstimate={cost_usd:number|null;eligible:boolean;reason:string}
export interface AcquisitionProvider {
 id:string
 health():Promise<{status:string;credential_configured:boolean;network_validated:boolean}>
 discover(config:AcquisitionBudget):Promise<any>
 estimate(config:AcquisitionBudget):CostEstimate
 capabilities():string[]
}
export const RAPID_CANDIDATES=[{
 id:'ytjar-yt-api-comments',name:'YT-API · YouTube comments',platform:'youtube',capability:'youtube-comments',host:'yt-api.p.rapidapi.com',endpoint:'/comments',method:'GET',profile:'yt-api-comments-v1',pricing_model:'UNKNOWN',free_quota:null,rate_limit:'UNKNOWN',response_format:'JSON; staged data[] commentId/contentText mapping',freshness:'Explicit publication time only; relative text is UNKNOWN',coverage:'One public video; one response page; no pagination',docs_url:'https://rapidapi.com/ytjar/api/yt-api',pricing_url:'https://rapidapi.com/ytjar/api/yt-api/pricing',terms_reference:'https://rapidapi.com/ytjar/api/yt-api',endpoint_verified:true,schema_status:'SYNTHETIC_CONTRACT_ONLY',authentication:'X-RapidAPI-Key / X-RapidAPI-Host',status:'DISCOVERED',enabled:false
}] as const
export const RAPID_SOURCE_SLOTS=['threads','reddit','youtube','tiktok','instagram','x','facebook','google']
export function rapidSecret(env:Env){if(!env.RAPIDAPI_KEY)throw new Fault('CONFLICT','RapidAPI runtime credential belum dikonfigurasi',409);return env.RAPIDAPI_KEY}
export function rapidCandidate(v:unknown){const c=RAPID_CANDIDATES.find(c=>c.id===v);if(!c)throw new Fault('VALIDATION','Candidate belum di-code-review/allowlist; arbitrary host/endpoint tidak diterima');return c}
export function rapidBounds(i:any):AcquisitionBudget {
 const allowed=['config_id','query','max_requests','max_items','max_spend','currency','timeout_ms','date_from','date_to','mode','confirm','authorize_request','revision','idempotency_key']
 if(!i||typeof i!=='object'||Array.isArray(i)||Object.keys(i).some(k=>!allowed.includes(k)))throw new Fault('VALIDATION','Parameter acquisition tidak diterima; bukan proxy/credential endpoint')
 if(i.max_requests!==1||i.max_spend!==0||!['IDR','USD'].includes(i.currency))throw new Fault('PAYMENT_REQUIRED','FREE-FIRST memerlukan max_requests=1 dan max_spend=0; paid execution diblokir',409)
 if(!Number.isInteger(i.max_items)||i.max_items<1||i.max_items>10||!Number.isInteger(i.timeout_ms)||i.timeout_ms<1000||i.timeout_ms>10000)throw new Fault('VALIDATION','Batas 1–10 items dan timeout 1000–10000 ms')
 const query=text(i.query,'query',150);let u:URL;try{u=new URL(query)}catch{throw new Fault('VALIDATION','Gunakan satu URL video publik YouTube')}
 if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash||u.pathname!=='/watch'||!['www.youtube.com','youtube.com'].includes(u.hostname)||!/^[A-Za-z0-9_-]{11}$/.test(u.searchParams.get('v')||'')||u.search!=='?v='+u.searchParams.get('v'))throw new Fault('VALIDATION','URL video tunggal tanpa token/endpoint bebas diperlukan')
 const today=new Date().toISOString().slice(0,10)
 for(const d of [i.date_from,i.date_to])if(typeof d!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d)throw new Fault('VALIDATION','Tanggal UTC YYYY-MM-DD diperlukan')
 if(i.date_to>today||i.date_from>i.date_to||Date.parse(i.date_to)-Date.parse(i.date_from)>30*86400000)throw new Fault('VALIDATION','Rentang 0–30 hari tanpa tanggal masa depan')
 return {query:'https://www.youtube.com/watch?v='+u.searchParams.get('v'),max_requests:1,max_items:i.max_items,max_spend:0,currency:i.currency,timeout_ms:i.timeout_ms,date_from:i.date_from,date_to:i.date_to}
}
export type FreePolicy={pricing_model:string;subscription_confirmed:boolean;hard_limit_no_overage:boolean;all_billing_dimensions_covered:boolean;free_requests:number;period_end:number;verified_at:number;reference:string;plan_name:string}
export function freePolicy(i:any):FreePolicy {
 const keys=['pricing_model','subscription_confirmed','hard_limit_no_overage','all_billing_dimensions_covered','free_requests','period_end','reference','plan_name']
 if(!i||Object.keys(i).some(k=>!keys.includes(k)))throw new Fault('VALIDATION','Policy menerima metadata plan saja')
 const pricing_model=choice(i.pricing_model,'pricing_model',['FREE','FREEMIUM','PAID','UNKNOWN'])
 if(!['FREE','FREEMIUM'].includes(pricing_model)||i.subscription_confirmed!==true||i.hard_limit_no_overage!==true||i.all_billing_dimensions_covered!==true)throw new Fault('PAYMENT_REQUIRED','Zero-cost harus mencakup seluruh billing dimensions + subscription + hard-limit tanpa overage',409)
 if(!Number.isInteger(i.free_requests)||i.free_requests<1||i.free_requests>1000||!Number.isSafeInteger(i.period_end)||i.period_end<=now()||i.period_end>now()+31*86400000)throw new Fault('VALIDATION','Quota 1–1000 dan periode aktif max 31 hari diperlukan')
 const reference=text(i.reference,'reference',500);let url:URL;try{url=new URL(reference)}catch{throw new Fault('VALIDATION','Reference pricing/dashboard RapidAPI diperlukan')}
 if(url.protocol!=='https:'||url.hostname!=='rapidapi.com'||url.username||url.password||url.search||url.hash)throw new Fault('VALIDATION','Reference RapidAPI HTTPS tanpa secret/query diperlukan')
 const plan_name=text(i.plan_name,'plan_name',80);if(!/^[\p{L}\p{N} ._-]+$/u.test(plan_name))throw new Fault('VALIDATION','Nama plan sederhana diperlukan')
 return {pricing_model,subscription_confirmed:true,hard_limit_no_overage:true,all_billing_dimensions_covered:true,free_requests:i.free_requests,period_end:i.period_end,verified_at:now(),reference,plan_name}
}
export function zeroCostGate(policy:FreePolicy,b:AcquisitionBudget):CostEstimate {
 const ok=!!policy&&['FREE','FREEMIUM'].includes(policy.pricing_model)&&policy.subscription_confirmed===true&&policy.hard_limit_no_overage===true&&policy.all_billing_dimensions_covered===true&&policy.free_requests>=b.max_requests&&policy.period_end>now()&&policy.verified_at>=now()-86400000&&b.max_spend===0
 return {cost_usd:ok?0:null,eligible:ok,reason:ok?'OWNER_VERIFIED_ZERO_COST_HARD_LIMIT; quota reservation still required':'ZERO_COST_NOT_PROVEN'}
}
export class RapidApiAdapter implements AcquisitionProvider {
 id='rapidapi'
 constructor(private key:string,private candidate_id='ytjar-yt-api-comments',private policy:FreePolicy={} as FreePolicy){rapidCandidate(candidate_id);if(!key)throw new Fault('CONFLICT','RapidAPI secret belum ada',409)}
 async health(){return {status:'CONFIGURED_NOT_LIVE_VALIDATED',credential_configured:!!this.key,network_validated:false}}
 capabilities(){return [rapidCandidate(this.candidate_id).capability,'bounded-read-only','free-first']}
 estimate(b:AcquisitionBudget){return zeroCostGate(this.policy,b)}
 async discover(b:AcquisitionBudget) {
  b=rapidBounds(b)
  if(!this.estimate(b).eligible)throw new Fault('PAYMENT_REQUIRED','Tidak ada jaminan zero-cost; request tidak dikirim',409)
  const c=rapidCandidate(this.candidate_id),videoId=new URL(b.query).searchParams.get('v')!
  let response:Response
  try{response=await fetch('https://'+c.host+c.endpoint+'?'+new URLSearchParams({id:videoId}),{method:'GET',redirect:'manual',headers:{'X-RapidAPI-Key':this.key,'X-RapidAPI-Host':c.host,'Accept':'application/json'},signal:AbortSignal.timeout(b.timeout_ms)})}catch{throw new Fault('TIMEOUT','RapidAPI timeout/transport failure; request quota may have been consumed, no retry',504,false)}
  if(response.status>=300&&response.status<400)throw new Fault('PROVIDER_ERROR','Redirect RapidAPI ditolak; no retry',502,false)
  const quotaMetadata:Record<string,number>={}
  response.headers.forEach((v,k)=>{if(/^x-(?:ratelimit|rate-limit)-[a-z0-9-]+-(?:limit|remaining|reset)$/.test(k)&&/^\d+$/.test(v)&&Number.isSafeInteger(Number(v))&&Object.keys(quotaMetadata).length<30)quotaMetadata[k]=Number(v)})
  if(!response.ok){const code=response.status===401?'AUTH_ERROR':response.status===403?'PERMISSION':response.status===402?'PAYMENT_REQUIRED':response.status===429?'RATE_LIMITED':response.status>=500?'API_UNAVAILABLE':'PROVIDER_ERROR';throw new Fault(code,`RapidAPI request ditolak (HTTP ${response.status}); no retry atau paid fallback`,502,false)}
  if(response.headers.get('x-rapidapi-mock-response')==='true')throw new Fault('PROVIDER_ERROR','Vendor mock response bukan live acquisition proof',502,false)
  if(!response.body)throw new Fault('PROVIDER_ERROR','RapidAPI response kosong',502,false)
  const reader=response.body.getReader(),chunks:Uint8Array[]=[];let length=0
  try{while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>300000){await reader.cancel();throw new Fault('PROVIDER_ERROR','RapidAPI response >300 kB ditolak',502,false)}chunks.push(value)}}catch(e){if(e instanceof Fault)throw e;throw new Fault('TIMEOUT','RapidAPI response terputus; no retry',504,false)}
  const bytes=new Uint8Array(length);let n=0;for(const x of chunks){bytes.set(x,n);n+=x.length}
  const raw=new TextDecoder().decode(bytes);if(raw.includes(this.key))throw new Fault('PROVIDER_ERROR','Secret-containing provider response ditolak',502,false)
  let data:any;try{data=JSON.parse(raw)}catch{throw new Fault('PROVIDER_ERROR','RapidAPI response bukan JSON',502,false)}
  if(!Array.isArray(data?.data))throw new Fault('VALIDATION_ERROR','Output schema mismatch; staged mapping belum tervalidasi',502,false)
  return {rows:data.data.slice(0,b.max_items),response_status:response.status,quotaMetadata,responseMetadata:{content_type:'application/json',bytes:length,pagination_followed:false,provider_items:data.data.length},retrieved_at:new Date().toISOString()}
 }
 async normalizeOutput(result:any,b:AcquisitionBudget,fingerprint:string,job_id:string) {
  const c=rapidCandidate(this.candidate_id),videoId=new URL(b.query).searchParams.get('v'),records:NormalizedEvidence[]=[],rejected:any[]=[]
  for(const [index,r] of result.rows.entries())try{
   if(JSON.stringify(r).includes(this.key))throw new Fault('VALIDATION_ERROR','Credential output ditolak',502,false)
   const cid=text(r.commentId,'commentId',120),body=text(r.contentText,'contentText',20000)
   if(!/^[A-Za-z0-9_-]+$/.test(cid)||(r.videoId&&r.videoId!==videoId))throw new Fault('VALIDATION_ERROR','Comment/video provenance tidak cocok',502,false)
   let published='';if(typeof r.publishedAt==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(r.publishedAt)&&Number.isFinite(Date.parse(r.publishedAt)))published=new Date(r.publishedAt).toISOString()
   if(published&&(published.slice(0,10)<b.date_from||published.slice(0,10)>b.date_to)){rejected.push({index,reason:'OUTSIDE_REQUESTED_DATE_RANGE'});continue}
   const url='https://www.youtube.com/watch?v='+videoId+'&lc='+cid
   const e=await normalizeEvidence({external_id:`youtube:${videoId}:${cid}`,url,author:typeof r.authorText==='string'?r.authorText.slice(0,120):'',published_at:published,raw_text:body,provider:'rapidapi',verified:false,metadata:{source:'youtube',acquisition_provider:'rapidapi',apiId:c.id,apiHost:c.host,endpoint:c.endpoint,requestFingerprint:fingerprint,retrievedAt:result.retrieved_at,responseStatus:result.response_status,responseMetadata:result.responseMetadata,quotaMetadata:result.quotaMetadata,acquisitionStatus:'RETRIEVED',pricingModel:this.policy.pricing_model,cost_usd:0,cost_basis:'OWNER_VERIFIED_HARD_LIMIT_ZERO_COST; not vendor invoice',termsReference:c.terms_reference,rawReference:`rapidapi:job:${job_id}:row:${index}`,rowIndex:index,freshness:published?'EXPLICIT_PUBLICATION_TIME':'UNKNOWN_NOT_INFERRED'}})
   records.push({...e,source:'youtube'})
  }catch(e){rejected.push({index,reason:e instanceof Fault?e.code:'MALFORMED_RECORD'})}
  return {records,rejected}
 }
}
