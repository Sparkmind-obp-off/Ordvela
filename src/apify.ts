import { Fault, text, choice, digest, now } from './core'
import { NormalizedEvidence, normalizeEvidence } from './adapters'
import { Env } from './db'

export const ACQUISITION_SLOTS = [
  {capability:'threads-search',source:'threads'}, {capability:'reddit-search',source:'reddit'},
  {capability:'youtube-comments',source:'youtube'}, {capability:'tiktok-comments',source:'tiktok'},
  {capability:'instagram-posts',source:'instagram'}, {capability:'facebook-posts',source:'facebook'},
  {capability:'x-search',source:'x'}, {capability:'google-search',source:'google'}
] as const
export function apifyId(v:unknown):string {
  const s=text(v,'Apify resource ID',100)
  if(!/^[A-Za-z0-9_-]+(?:~[A-Za-z0-9_-]+)?$/.test(s)||/apify_api_/i.test(s))throw new Fault('VALIDATION','Resource ID Apify tidak valid; URL/credential tidak diterima')
  return s
}
export function apifySecret(env:Env) {
  if(!env.APIFY_API_TOKEN)throw new Fault('CONFLICT','Apify runtime credential belum dikonfigurasi',409)
  return env.APIFY_API_TOKEN
}
export function safeMetadata(v:unknown,max=200):string {
  if(typeof v!=='string'||v.length>max||/apify_api_|Bearer\s|EAA[A-Za-z0-9]{30}/i.test(v))throw new Fault('PROVIDER','Metadata provider tidak aman/tidak valid',502)
  return v
}
export type Bounds={query:string;max_items:number;max_pages:number;timeout_seconds:number;max_charge_usd:number;date_from:string;date_to:string}
export function acquisitionBounds(input:any):Bounds {
  const query=text(input.query,'query',150)
  if(/apify_api_|Bearer\s|\n|\r/i.test(query))throw new Fault('VALIDATION','Query tunggal tanpa credential diperlukan')
  const integer=(v:unknown,min:number,max:number,name:string)=>{const n=typeof v==='number'?v:typeof v==='string'&&/^\d+$/.test(v)?Number(v):NaN;if(!Number.isInteger(n)||n<min||n>max)throw new Fault('VALIDATION',`${name}: integer ${min}–${max}`);return n}
  const max_items=integer(input.max_items??5,1,25,'max_items'),max_pages=integer(input.max_pages??1,1,1,'max_pages'),timeout_seconds=integer(input.timeout_seconds??120,30,180,'timeout_seconds')
  const usd=typeof input.max_charge_usd==='number'?input.max_charge_usd:typeof input.max_charge_usd==='string'&&/^\d+(?:\.\d{1,2})?$/.test(input.max_charge_usd)?Number(input.max_charge_usd):NaN
  if(!Number.isFinite(usd)||usd<=0||usd>1||Math.abs(Math.round(usd*100)-usd*100)>0.000001)throw new Fault('VALIDATION','max_charge_usd: explicit USD 0.01–1.00 diperlukan')
  const today=new Date().toISOString().slice(0,10),from=input.date_from??new Date(now()-7*86400000).toISOString().slice(0,10),to=input.date_to??today
  for(const d of [from,to])if(typeof d!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d)throw new Fault('VALIDATION','Tanggal UTC YYYY-MM-DD tidak valid')
  const delta=(Date.parse(to)-Date.parse(from))/86400000
  if(delta<0||delta>30||to>today)throw new Fault('VALIDATION','Rentang tanggal 0–30 hari, tidak melebihi hari ini')
  return {query,max_items,max_pages,timeout_seconds,max_charge_usd:Math.round(usd*100)/100,date_from:from,date_to:to}
}
function youtubeVideo(value:string):string {
  let u:URL;try{u=new URL(value)}catch{throw new Fault('VALIDATION','Gunakan satu URL video YouTube publik')}
  if(u.protocol!=='https:'||u.username||u.password||u.port||!['youtube.com','www.youtube.com'].includes(u.hostname)||u.pathname!=='/watch'||!/^[A-Za-z0-9_-]{11}$/.test(u.searchParams.get('v')||''))throw new Fault('VALIDATION','Gunakan https://www.youtube.com/watch?v=VIDEO_ID; bukan channel/private endpoint')
  return 'https://www.youtube.com/watch?v='+u.searchParams.get('v')
}
// Profiles isolate source-specific contracts. Replace the Actor binding, not intelligence.
export const INPUT_PROFILES:Record<string,{source:string;capability:string;fields:string[];input:(b:Bounds)=>Record<string,unknown>;mapping:string}>={
  'youtube-comments-v1':{source:'youtube',capability:'youtube-comments',fields:['startUrls','maxComments','sortCommentsBy','oldestCommentDate'],input:b=>({startUrls:[{url:youtubeVideo(b.query)}],maxComments:b.max_items,sortCommentsBy:'NEWEST_FIRST',oldestCommentDate:b.date_from}),mapping:'cid → youtube:videoId:cid; comment → raw_text; author; explicit ISO publication if present, otherwise UNKNOWN'}
}
export function profileInput(profile:string,b:Bounds) {
  const p=INPUT_PROFILES[profile];if(!p)throw new Fault('CONFLICT','Profil input/output belum diimplementasikan untuk capability ini',409)
  return p.input(b)
}
export type ActorInspection={actor_id:string;actor_name:string;title:string;build_id:string;actor_version:string;profile:string;schema_summary:any;schema_hash:string;review_hash:string;pricing:any;pricing_observed_at:number;permission_status:string;security_status:string;validation_status:string;terms_reference:string;output_mapping:string}
export function estimateActorCharge(a:ActorInspection,maxItems:number):number|null {
 if(a.profile!=='youtube-comments-v1'||a.pricing.model!=='PAY_PER_EVENT')return null
 const events=a.pricing.events||{},values=Object.values(events) as any[]
 if(!values.length)return null
 let total=0
 for(const event of values){const prices=[event.price_usd,...Object.values(event.tiers||{})].filter((v:any)=>typeof v==='number'&&Number.isFinite(v)&&v>=0) as number[];if(!prices.length)return null;total+=Math.max(...prices)*(event.one_time?1:maxItems)}
 return Math.round(total*1000000)/1000000 // provider metadata estimate, excludes platform charges
}
export class ApifyAdapter {
  constructor(private token:string){if(!token)throw new Fault('CONFLICT','Apify runtime credential belum dikonfigurasi',409)}
  private async request(path:string,method='GET',body?:unknown,maxBytes=1000000) {
    try {
      const response=await fetch('https://api.apify.com/v2/'+path,{method,redirect:'manual',headers:{Authorization:`Bearer ${this.token}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(10000),...(body!==undefined?{body:JSON.stringify(body)}:{})})
      if(response.status>=300&&response.status<400)throw new Fault('PROVIDER','Redirect Apify ditolak',502)
      if(!response.ok){const status=response.status,code=status===401?'AUTHENTICATION':status===403?'PERMISSION':status===429?'RATE_LIMIT':status===404?'VALIDATION':'PROVIDER';throw new Fault(code,`Apify menolak request (HTTP ${status}); periksa akses/resource/quota`,502,status===429||status>=500)}
      if(!response.body)throw new Fault('PROVIDER','Respons Apify kosong',502)
      const reader=response.body.getReader(),chunks:Uint8Array[]=[];let length=0
      while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>maxBytes){await reader.cancel();throw new Fault('PROVIDER','Respons Apify melebihi batas aman',502)}chunks.push(value)}
      const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
      let data:any;try{data=JSON.parse(new TextDecoder().decode(bytes))}catch{throw new Fault('PROVIDER','Respons Apify bukan JSON valid',502)}
      return data
    }catch(e){if(e instanceof Fault)throw e;throw new Fault('TIMEOUT','Apify tidak tersedia atau batas waktu terlewati',504,true)}
  }
  async validateConfiguration(){const d=await this.request('users/me');if(!d.data?.id)throw new Fault('AUTHENTICATION','Apify identity validation gagal',502);return {health:'HEALTHY',capability:'credential-read-only',actor_execution_validated:false}}
  async discoverActor(query:string){if(/apify_api_|Bearer\s/i.test(query))throw new Fault('VALIDATION','Discovery menerima keyword, bukan credential');const d=await this.request('store?'+new URLSearchParams({search:text(query,'search',80),limit:'5'}));if(!Array.isArray(d.data?.items))throw new Fault('PROVIDER','Apify Store response tidak valid',502);return d.data.items.slice(0,5).map((a:any)=>({actor_id:apifyId(a.id),actor_name:safeMetadata(a.username)+'~'+safeMetadata(a.name),title:safeMetadata(a.title||a.name),status:'DISCOVERED_NOT_VALIDATED',pricing_model:a.currentPricingInfo?.pricingModel||'UNKNOWN'}))}
  async inspectActor(actor:string,profile:string):Promise<ActorInspection> {
    const p=INPUT_PROFILES[profile];if(profile!=='metadata-only'&&!p)throw new Fault('VALIDATION','Profil adapter tidak dikenal')
    const a=(await this.request('acts/'+apifyId(actor))).data
    if(!a?.id||!a.isPublic||a.isDeprecated)throw new Fault('PERMISSION','Hanya Actor publik aktif dapat direview',502)
    const buildId=apifyId(a.taggedBuilds?.latest?.buildId),b=(await this.request('actor-builds/'+buildId)).data
    if(b?.status!=='SUCCEEDED'||b.actId!==a.id)throw new Fault('PROVIDER','Build Actor belum sukses/tidak cocok',502)
    let schema:any;try{schema=typeof b.inputSchema==='string'?JSON.parse(b.inputSchema):b.inputSchema}catch{throw new Fault('PROVIDER','Input schema Actor tidak valid',502)}
    if(schema?.type!=='object'||!schema.properties)throw new Fault('PROVIDER','Actor tidak menyediakan input schema object',502)
    const schema_summary={required:(schema.required||[]).map((k:string)=>safeMetadata(k,80)),fields:Object.fromEntries(Object.entries(schema.properties).slice(0,120).map(([k,v]:[string,any])=>[safeMetadata(k,80),{type:safeMetadata(v.type||'unknown',30)}]))}
    const schema_hash=await digest(JSON.stringify(schema))
    const active=(a.pricingInfos||[]).filter((v:any)=>!v.startedAt||Date.parse(v.startedAt)<=now()).sort((x:any,y:any)=>Date.parse(y.startedAt||'1970-01-01')-Date.parse(x.startedAt||'1970-01-01'))[0]
    const events=active?.pricingPerEvent?.actorChargeEvents||{}
    const pricing={model:active?.pricingModel||'UNKNOWN',minimum_charge_ceiling_usd:active?.minimalMaxTotalChargeUsd??0,started_at:active?.startedAt||null,events:Object.fromEntries(Object.entries(events).slice(0,30).map(([k,v]:[string,any])=>[safeMetadata(k,80),{one_time:v.isOneTimeEvent===true,price_usd:typeof v.eventPriceUsd==='number'?v.eventPriceUsd:null,tiers:Object.fromEntries(Object.entries(v.eventTieredPricingUsd||{}).map(([tier,e]:[string,any])=>[safeMetadata(tier,30),typeof e.tieredEventPriceUsd==='number'?e.tieredEventPriceUsd:null]))}]))}
    const readme=typeof b.readme==='string'?b.readme:''
    const concern=/bypass(?:es|ing)?[\s\S]{0,100}(?:limit|restriction|captcha|control)|(?:stolen|session) cookies/i.test(readme)
    const permission=a.actorPermissionLevel==='LIMITED_PERMISSIONS'?'LIMITED_PERMISSIONS':'REVIEW_REQUIRED'
    const supported=!!p&&p.fields.every(f=>f in schema.properties)&&schema.properties.startUrls?.type==='array'&&schema.properties.maxComments?.type==='integer'&&schema.properties.sortCommentsBy?.enum?.includes('NEWEST_FIRST')&&schema.properties.oldestCommentDate?.type==='string'&&(b.actorDefinition?.minMemoryMbytes??256)<=256&&(schema.required||[]).every((f:string)=>p.fields.includes(f))
    const security=concern?'BLOCKED_COMPLIANCE':permission!=='LIMITED_PERMISSIONS'?'BLOCKED_PERMISSIONS':'TERMS_REVIEW_REQUIRED'
    const actor_version=safeMetadata(b.buildNumber,50)
    const review_hash=await digest(JSON.stringify({actor:a.id,build:buildId,schema_hash,pricing,permission,security,profile}))
    return {actor_id:apifyId(a.id),actor_name:safeMetadata(a.username)+'~'+safeMetadata(a.name),title:safeMetadata(a.title||a.name),build_id:buildId,actor_version,profile,schema_summary,schema_hash,review_hash,pricing,pricing_observed_at:now(),permission_status:permission,security_status:security,validation_status:supported&&security==='TERMS_REVIEW_REQUIRED'&&pricing.model==='PAY_PER_EVENT'?'SCHEMA_CHECKED_RUN_UNVALIDATED':'DOCUMENTATION_REQUIRED',terms_reference:'https://apify.com/'+encodeURIComponent(a.username)+'/'+encodeURIComponent(a.name),output_mapping:p?.mapping||'MAPPING_NOT_IMPLEMENTED'}
  }
  async startRun(a:ActorInspection,b:Bounds,input:Record<string,unknown>) {
    if(a.pricing.model!=='PAY_PER_EVENT'||b.max_charge_usd<a.pricing.minimum_charge_ceiling_usd)throw new Fault('CONFLICT','Actor pricing tidak mendukung charge ceiling ini',409)
    const params=new URLSearchParams({build:a.actor_version,timeout:String(b.timeout_seconds),memory:'256',maxTotalChargeUsd:String(b.max_charge_usd),waitForFinish:'0',restartOnError:'false',forcePermissionLevel:'LIMITED_PERMISSIONS'})
    const d=await this.request('acts/'+apifyId(a.actor_id)+'/runs?'+params,'POST',input)
    if(!d.data?.id||d.data.actId!==a.actor_id)throw new Fault('PROVIDER','Actor start response tidak dapat diverifikasi; jangan ulang otomatis',502)
    return this.safeRun(d.data)
  }
  private safeRun(r:any){return {run_id:apifyId(r.id),actor_id:apifyId(r.actId),build_id:r.buildId?apifyId(r.buildId):null,status:choice(r.status,'Apify status',['READY','RUNNING','SUCCEEDED','FAILED','TIMING-OUT','TIMED-OUT','ABORTING','ABORTED']),dataset_id:r.defaultDatasetId?apifyId(r.defaultDatasetId):null,started_at:r.startedAt||null,finished_at:r.finishedAt||null,actual_usage_usd:typeof r.usageTotalUsd==='number'&&Number.isFinite(r.usageTotalUsd)&&r.usageTotalUsd>=0?r.usageTotalUsd:null,usage:Object.fromEntries(Object.entries(r.usage||{}).filter(([k,v])=>/^[A-Z_]+$/.test(k)&&typeof v==='number'&&Number.isFinite(v)).slice(0,30))}}
  async getRunStatus(run:string){const d=await this.request('actor-runs/'+apifyId(run));if(!d.data)throw new Fault('PROVIDER','Run response tidak valid',502);return this.safeRun(d.data)}
  async abortRun(run:string){await this.request('actor-runs/'+apifyId(run)+'/abort','POST');return {abort_requested:true}}
  async getDatasetItems(dataset:string,limit:number){const d=await this.request('datasets/'+apifyId(dataset)+'/items?'+new URLSearchParams({format:'json',clean:'true',limit:String(limit),offset:'0',fields:'cid,comment,author,videoId,publishedAt,publishedTime,timestamp,voteCount'}),'GET',undefined,300000);if(!Array.isArray(d))throw new Fault('PROVIDER','Dataset response bukan array',502);return d.slice(0,limit)}
  async normalizeOutput(a:ActorInspection,run:any,b:Bounds,rows:any[],fingerprint:string) {
    const records:NormalizedEvidence[]=[],rejected:{index:number;reason:string}[]=[]
    for(const [index,r] of rows.entries()){
      try{
        if(JSON.stringify(r).includes(this.token))throw new Fault('PROVIDER','Credential-containing output ditolak',502)
        if(a.profile!=='youtube-comments-v1')throw new Fault('CONFLICT','Output mapping belum tersedia',409)
        const videoId=text(r.videoId,'videoId',11,11),cid=text(r.cid,'cid',120),body=text(r.comment,'comment',20000)
        if(!/^[A-Za-z0-9_-]{11}$/.test(videoId)||!/^[A-Za-z0-9_-]+$/.test(cid)||youtubeVideo(b.query)!=='https://www.youtube.com/watch?v='+videoId)throw new Fault('PROVIDER','Dataset provenance video/ID tidak cocok',502)
        const explicit=r.publishedAt||r.publishedTime||r.timestamp;let published=''
        if(typeof explicit==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(explicit)&&Number.isFinite(Date.parse(explicit)))published=new Date(explicit).toISOString()
        if(published&&(published.slice(0,10)<b.date_from||published.slice(0,10)>b.date_to)){rejected.push({index,reason:'OUTSIDE_REQUESTED_DATE_RANGE'});continue}
        const url='https://www.youtube.com/watch?v='+videoId+'&lc='+cid
        const normalized=await normalizeEvidence({external_id:`youtube:${videoId}:${cid}`,url,author:typeof r.author==='string'?r.author.slice(0,120):'',published_at:published,raw_text:body,provider:'apify',verified:false,metadata:{source:'youtube',acquisition_provider:'apify',actorId:a.actor_id,actorVersion:a.actor_version,buildId:a.build_id,runId:run.run_id,datasetId:run.dataset_id,inputFingerprint:fingerprint,estimatedCost:estimateActorCharge(a,b.max_items),actualUsage:run.actual_usage_usd,termsReference:a.terms_reference,acquisitionStatus:run.status,freshness:published?'EXPLICIT_PUBLICATION_TIME':'UNKNOWN_NOT_INFERRED',retrievedAt:new Date().toISOString(),rawReference:`apify:dataset:${run.dataset_id}:row:${index}`,rowIndex:index,engagement:{voteCount:typeof r.voteCount==='number'?r.voteCount:null}}})
        records.push({...normalized,source:'youtube'})
      }catch(e){rejected.push({index,reason:e instanceof Fault?e.code:'MALFORMED_RECORD'})}
    }
    return {records,rejected}
  }
}
