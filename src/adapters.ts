import { Fault, normalize, text } from './core'
export interface Evidence { external_id: string; url: string; author: string; published_at: string; raw_text: string; provider: string; verified: boolean; metadata: Record<string,unknown> }
export interface SourceAdapter { collect(input: any): Promise<Evidence[]> }
export interface ExtractionAdapter { extract(evidence: Evidence): unknown }
export interface DeploymentAdapter { publish(execution: any): Promise<string> }
export interface MessagingAdapter { mode: 'MANUAL_HANDOFF' }
export interface LLMAdapter { validate(key: string): Promise<void> }
export async function providerJSON(url: string, init: RequestInit = {}, timeout = 10000) {
  try {
    const r = await fetch(url,{...init,signal:AbortSignal.timeout(timeout)})
    if(!r.ok) throw new Fault(r.status === 429 ? 'RATE_LIMIT' : 'PROVIDER',`Provider mengembalikan HTTP ${r.status}`,502,r.status === 429 || r.status >= 500)
    return await r.json() as any
  } catch(e) { if(e instanceof Fault) throw e; throw new Fault('TIMEOUT','Provider tidak tersedia atau melewati batas waktu',504,true) }
}
export class HNSource implements SourceAdapter {
  async collect(input: any): Promise<Evidence[]> {
    if(input.reference) {
      const match = text(input.reference,'reference',300).match(/^https:\/\/news\.ycombinator\.com\/item\?id=(\d+)$/)
      if(!match) throw new Fault('VALIDATION','Gunakan URL publik Hacker News item?id=...')
      const d = await providerJSON(`https://hn.algolia.com/api/v1/items/${match[1]}`)
      if(!d.id || !d.author || (!d.text && !d.title)) throw new Fault('PROVIDER','Bukti HN tidak tersedia',502)
      return [this.evidence(d,String(d.id),true)]
    }
    const query = text(input.query,'query',150)
    const d = await providerJSON(`https://hn.algolia.com/api/v1/search_by_date?tags=ask_hn&hitsPerPage=5&query=${encodeURIComponent(query)}`)
    if(!Array.isArray(d.hits)) throw new Fault('PROVIDER','Format respons HN tidak valid',502)
    return d.hits.map((h:any)=>this.evidence(h,h.objectID,false)).filter((h:Evidence)=>h.raw_text.length>20)
  }
  evidence(d:any, eid:string, item:boolean): Evidence {
    if(!/^\d+$/.test(eid)) throw new Fault('PROVIDER','ID bukti tidak valid',502)
    const raw = [d.title || '',item ? d.text || '' : d.story_text || ''].filter(Boolean).join('\n')
    return {external_id:`hn:${eid}`,url:`https://news.ycombinator.com/item?id=${eid}`,author:String(d.author),published_at:d.created_at || '',raw_text:raw.slice(0,20000),provider:'hacker-news',verified:true,metadata:{retrieved_from:'hn.algolia.com',raw_format:'public HTML/text',evidence_type:'PUBLIC_REQUEST',normalized_preview:normalize(raw).slice(0,200)}}
  }
}
export class GitHubSource implements SourceAdapter {
  async collect(input:any):Promise<Evidence[]> {
    const m = text(input.reference,'reference',500).match(/^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/issues\/(\d+)$/)
    if(!m) throw new Fault('VALIDATION','Gunakan URL issue GitHub publik')
    const d = await providerJSON(`https://api.github.com/repos/${m[1]}/${m[2]}/issues/${m[3]}`,{headers:{'User-Agent':'ORDVELA','Accept':'application/vnd.github+json'}})
    if(!d.id || !d.title || !d.html_url || d.pull_request) throw new Fault('PROVIDER','Issue publik tidak valid',502)
    return [{external_id:`github:${m[1]}/${m[2]}:${m[3]}`,url:d.html_url,author:d.user?.login || '',published_at:d.created_at,raw_text:(d.title+'\n'+(d.body||'')).slice(0,20000),provider:'github-issues',verified:true,metadata:{state:d.state,labels:d.labels?.map((l:any)=>l.name),evidence_type:'PUBLIC_ISSUE'}}]
  }
}
export class OpenAIAdapter implements LLMAdapter {
  async validate(key:string) { const d=await providerJSON('https://api.openai.com/v1/models',{headers:{Authorization:`Bearer ${key}`}}); if(!Array.isArray(d.data)) throw new Fault('PROVIDER','Respons OpenAI tidak valid',502) }
}
export const manualMessaging: MessagingAdapter = {mode:'MANUAL_HANDOFF'}
export async function seal(secret:string, master:string) {
  if(!master) throw new Fault('CONFLICT','Master encryption key belum dikonfigurasi',409)
  const key=await crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',new TextEncoder().encode(master)),{name:'AES-GCM'},false,['encrypt','decrypt'])
  const iv=crypto.getRandomValues(new Uint8Array(12)), encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(secret))
  return JSON.stringify({iv:Array.from(iv),data:Array.from(new Uint8Array(encrypted))})
}
export async function unseal(cipher:string, master:string) {
  if(!master) throw new Fault('CONFLICT','Master encryption key belum dikonfigurasi',409)
  const key=await crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',new TextEncoder().encode(master)),{name:'AES-GCM'},false,['decrypt'])
  const v=JSON.parse(cipher)
  return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(v.iv)},key,new Uint8Array(v.data)))
}
