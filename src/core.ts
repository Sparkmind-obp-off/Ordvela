export class Fault extends Error {
  constructor(public code: string, message: string, public status = 400, public retryable = false) { super(message) }
}
export const id = () => crypto.randomUUID()
export const now = () => Date.now()
export const normalize = (text: string) => text.replace(/<[^>]*>/g, ' ').replace(/&amp;/g,'&').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g, ' ').trim()
export const escape = (s: string) => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
export async function digest(text: string) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))), b=>b.toString(16).padStart(2,'0')).join('') }
export function text(v: unknown, field: string, max = 2000, min = 1): string {
  if(typeof v !== 'string' || v.trim().length < min || v.length > max) throw new Fault('VALIDATION',`${field}: panjang ${min}–${max} karakter diperlukan`)
  return v.trim()
}
export function choice(v: unknown, field: string, options: string[]): string {
  if(typeof v !== 'string' || !options.includes(v)) throw new Fault('VALIDATION',`${field} tidak valid`)
  return v
}
export function confirm(v: unknown) { if(v !== true) throw new Fault('VALIDATION','Konfirmasi eksplisit diperlukan') }
export const WEIGHTS = {demand: .2, intent: .2, urgency: .15, budget: .15, fit: .1, reachability: .1, confidence: .1}
export const SCORE_VERSION = 'rules-v1.0'
export function extractDemand(raw: string, verified: boolean) {
  const t = normalize(raw)
  const need = /\b(need|looking for|recommend|help|problem|struggling|request|want|butuh|mencari|kesulitan)\b/i.test(t)
  const urgent = /\b(urgent|asap|deadline|this week|immediately|segera|mendesak)\b/i.test(t)
  const budget = t.match(/(?:\$|€|£|Rp\s*)\d[\d,.]*(?:\s*(?:k|per month|\/mo|budget))?|\b(?:paid|paying|budget|hire|willing to pay|anggaran)\b/i)?.[0] || 'Tidak disebutkan'
  const intent = /\b(hire|buy|paid|paying|budget|willing to pay|purchase)\b/i.test(t) ? 'COMMERCIAL' : need ? 'ACTIVE_REQUEST' : 'EXPLORATORY'
  const confidence = verified ? 80 : 45
  const components = { demand: need ? 90 : 25, intent: intent === 'COMMERCIAL' ? 90 : need ? 75 : 20, urgency: urgent ? 85 : 20, budget: budget === 'Tidak disebutkan' ? 0 : 75, fit: /software|tool|app|automat|workflow|dashboard|system|website|API/i.test(t) ? 85 : 35, reachability: verified ? 70 : 40, confidence }
  const total = Math.round(Object.entries(WEIGHTS).reduce((sum,[k,w])=>sum + components[k as keyof typeof components]*w,0))
  return { title: t.slice(0,110), problem: t.slice(0,1800), desired_outcome: 'Hipotesis: alur kerja lebih sederhana untuk kebutuhan di atas. Konfirmasi dengan pemilik kebutuhan.', intent, urgency: urgent ? 'HIGH' : 'UNKNOWN', budget_signal: budget, confidence, components, total, recommended_action: need ? 'Periksa bukti, konfirmasi kebutuhan, lalu pilih template demo yang relevan.' : 'Validasi apakah ini kebutuhan aktif sebelum membangun.' }
}
export const TEMPLATES = ['intake','calculator','workflow']
export function blueprint(op: any, template: string, publicTitle: string, publicSummary: string) {
  choice(template,'template',TEMPLATES)
  return { opportunity_id: op.id, problem: op.problem, target_outcome: op.desired_outcome, solution: template === 'intake' ? 'Formulir intake dan ringkasan permintaan' : template === 'calculator' ? 'Kalkulator estimasi penghematan waktu' : 'Papan alur kerja tiga tahap', features: template === 'intake' ? ['Input permintaan','Validasi','Ringkasan','Ekspor JSON'] : template === 'calculator' ? ['Input jam','Input biaya','Estimasi bulanan'] : ['Tambah tugas','Pindahkan tahap','Hapus tugas','Ekspor/impor JSON lokal'], constraints: ['Prototype saja; bukan sistem produksi pelanggan','Data demo hanya dalam sesi browser','Tidak mengirim data atau pesan eksternal'], assumptions: ['Pemilihan template dan ringkasan publik dikonfirmasi operator; belum divalidasi pelanggan'], stack: 'HTML / CSS / JavaScript', deployment_target: 'Cloudflare Pages / D1 immutable artifact', acceptance_criteria: ['HTML lengkap','Tidak mengandung bukti mentah atau kredensial','Interaksi template bekerja','Publikasi hanya setelah konfirmasi OWNER'], public_title: publicTitle, public_summary: publicSummary }
}
export function buildArtifact(bp: any) {
  const script = bp.solution.includes('intake') ? `document.querySelector('form').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));document.querySelector('pre').textContent=JSON.stringify(data,null,2);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));a.download='request.json';a.textContent='Download ringkasan';document.querySelector('#result').replaceChildren(a);};` : bp.solution.includes('Kalkulator') ? `document.querySelector('form').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);const h=Number(d.get('hours')),c=Number(d.get('cost')),p=Number(d.get('percent'));document.querySelector('output').textContent='Estimasi penghematan: '+(h*c*4*p/100).toLocaleString('id-ID')+' per bulan. Estimasi, bukan jaminan.';};` : `const list=document.querySelector('#tasks');function addTask(title,stage='To do'){const row=document.createElement('p');const label=document.createElement('span');label.textContent=title+' ';const select=document.createElement('select');['To do','Doing','Done'].forEach(s=>{const o=document.createElement('option');o.textContent=s;select.append(o)});select.value=stage;const b=document.createElement('button');b.textContent='Hapus';b.onclick=()=>row.remove();row.append(label,select,b);list.append(row);}document.querySelector('form').onsubmit=e=>{e.preventDefault();addTask(e.target.querySelector('input').value);e.target.reset();};document.querySelector('#export-tasks').onclick=()=>{const data=Array.from(list.children,r=>({title:r.querySelector('span').textContent.trim(),stage:r.querySelector('select').value}));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='workflow.json';a.click();};document.querySelector('#import-tasks').onchange=async e=>{try{const file=e.target.files[0];if(!file || file.size>100000)throw Error();const data=JSON.parse(await file.text());if(!Array.isArray(data)||data.length>200||!data.every(t=>typeof t.title==='string'&&t.title.length<=200&&['To do','Doing','Done'].includes(t.stage)))throw Error();list.replaceChildren();data.forEach(t=>addTask(t.title,t.stage));document.querySelector('#file-status').textContent='JSON dimuat secara lokal.';}catch(err){document.querySelector('#file-status').textContent='File tidak valid. Maksimal 200 tasks / 100 KB.'}};`
  const body = bp.solution.includes('intake') ? '<form><label>Nama<input name="name" required maxlength="100"></label><label>Kebutuhan<textarea name="request" required maxlength="2000"></textarea></label><button>Buat ringkasan</button></form><pre></pre><section id="result"></section>' : bp.solution.includes('Kalkulator') ? '<form><label>Jam per minggu<input name="hours" type="number" min="0" max="168" value="10" required></label><label>Biaya per jam<input name="cost" type="number" min="0" value="100000" required></label><label>Potensi efisiensi (%)<input name="percent" type="number" min="0" max="100" value="30" required></label><button>Hitung estimasi</button></form><output></output>' : '<form><label>Tugas<input name="task" required maxlength="200"></label><button>Tambah tugas</button></form><button id="export-tasks" type="button">Export JSON</button><label>Import JSON lokal<input id="import-tasks" type="file" accept="application/json"></label><p id="file-status" role="status"></p><section id="tasks"></section>'
  return `<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(bp.public_title)}</title><style>body{font:16px system-ui;max-width:760px;margin:60px auto;padding:24px;color:#142d36;background:#f6f8f7}h1{font-size:36px}label{display:block;margin:18px 0}input,textarea,select{display:block;padding:12px;width:95%;font:inherit;border:1px solid #ccd6d3;border-radius:8px}button{padding:12px 20px;border:0;border-radius:8px;background:#147761;color:white;margin:8px 8px 8px 0;cursor:pointer}pre{white-space:pre-wrap}aside{color:#62736e;font-size:13px}p select{display:inline;width:auto}</style><main><aside>ORDVELA · Interactive prototype · Data tidak disimpan atau dikirim</aside><h1>${escape(bp.public_title)}</h1><p>${escape(bp.public_summary)}</p>${body}</main><script>${script}</script></html>`
}
export function validateArtifact(html: string) {
  const checks = { complete_html: html.startsWith('<!doctype html>') && html.includes('</html>'), interactive_form: html.includes('<form>') && html.includes('onsubmit'), no_external_calls: !/fetch\(|XMLHttpRequest|https?:\/\/|src=|iframe/i.test(html), bounded_size: html.length < 30000 }
  if(!Object.values(checks).every(Boolean)) throw new Fault('VALIDATION','Validasi artifact gagal')
  return checks
}
export const OUTCOME_TRANSITIONS: Record<string,string[]> = { CONTACTED:['FOLLOW_UP','REPLIED','LOST'], FOLLOW_UP:['FOLLOW_UP','REPLIED','LOST'], REPLIED:['QUALIFIED','LOST'], QUALIFIED:['PROPOSAL','LOST'], PROPOSAL:['WON','LOST'], WON:[], LOST:[] }
export function outcomeTransition(from: string, to: string) {
  if(!OUTCOME_TRANSITIONS[from]?.includes(to)) throw new Fault('CONFLICT',`Transisi ${from} → ${to} tidak diizinkan`,409)
}
export function retryDelay(attempt: number) { return Math.min(60000, 2000 * 2 ** (attempt-1)) }
