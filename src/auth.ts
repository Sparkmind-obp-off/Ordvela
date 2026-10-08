import { Hono } from 'hono'
import { getCookie,setCookie,deleteCookie } from 'hono/cookie'
import { Env,one,stmt,all } from './db'
import { Fault,text,id,now,digest } from './core'
export type App = { Bindings:Env; Variables:{requestId:string; user:any; workspace:string; role:string} }
export async function passwordHash(password:string,salt?:string) {
  salt ||= id()
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits'])
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:100000},key,256)
  return salt+':'+Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('')
}
function equal(a:string,b:string) { let n=a.length^b.length; for(let i=0;i<Math.max(a.length,b.length);i++) n|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0); return n===0 }
export const auth = new Hono<App>()
async function rate(c:any) {
  const bucket=await digest(c.req.header('cf-connecting-ip') || 'local')
  const count=await one(c.env.DB,'SELECT COUNT(*) AS n FROM auth_attempts WHERE bucket=? AND created_at>?',bucket,now()-15*60000)
  if(count.n>=25) throw new Fault('RATE_LIMIT','Terlalu banyak upaya masuk. Coba dalam 15 menit.',429,true)
  await stmt(c.env.DB,'INSERT INTO auth_attempts (id,bucket,created_at) VALUES (?,?,?)',id(),bucket,now()).run()
  await stmt(c.env.DB,'DELETE FROM auth_attempts WHERE created_at<?',now()-86400000).run()
}
async function session(c:any,userId:string) {
  const token=id()+id()
  await stmt(c.env.DB,'INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)',await digest(token),userId,now()+7*86400000).run()
  setCookie(c,'ordvela_session',token,{httpOnly:true,secure:new URL(c.req.url).protocol==='https:',sameSite:'Strict',path:'/',maxAge:7*86400})
}
auth.post('/register',async c=>{
  await rate(c)
  const b=await c.req.json()
  if(c.env.SIGNUP_ENABLED!=='true' && (!c.env.REGISTRATION_TOKEN || typeof b.registration_token!=='string' || !equal(await digest(b.registration_token),await digest(c.env.REGISTRATION_TOKEN)))) throw new Fault('AUTHORIZATION','Registrasi memerlukan kode undangan operator',403)
  const email=text(b.email,'email',254).toLowerCase(),name=text(b.name,'name',100),pass=text(b.password,'password',200,12),workspace=text(b.workspace_name,'workspace',100)
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Fault('VALIDATION','Email tidak valid')
  if(await one(c.env.DB,'SELECT id FROM users WHERE email=?',email)) throw new Fault('CONFLICT','Email sudah terdaftar',409)
  const uid=id(),wid=id()
  await c.env.DB.batch([
    stmt(c.env.DB,'INSERT INTO users (id,email,name,password_hash,created_at) VALUES (?,?,?,?,?)',uid,email,name,await passwordHash(pass),now()),
    stmt(c.env.DB,'INSERT INTO workspaces (id,name,created_at) VALUES (?,?,?)',wid,workspace,now()),
    stmt(c.env.DB,"INSERT INTO workspace_members (workspace_id,user_id,role) VALUES (?,?,'OWNER')",wid,uid),
    stmt(c.env.DB,'INSERT INTO settings (workspace_id,key,value) VALUES (?,?,?)',wid,'flags',JSON.stringify({human_contact_only:true,templates_only:true,ai_generation:false})),
    stmt(c.env.DB,'INSERT INTO audit_events (id,workspace_id,actor_id,operation,target_id,request_id,detail,created_at) VALUES (?,?,?,?,?,?,?,?)',id(),wid,uid,'workspace.created',wid,c.get('requestId'),'{}',now())
  ])
  await session(c,uid)
  return c.json({data:{id:uid,email,name,workspace_id:wid},request_id:c.get('requestId')},201)
})
auth.post('/login',async c=>{
  await rate(c)
  const b=await c.req.json(),email=text(b.email,'email',254).toLowerCase(),pass=text(b.password,'password',200)
  const u=await one(c.env.DB,'SELECT * FROM users WHERE email=?',email)
  const hash=await passwordHash(pass,u?.password_hash.split(':')[0] || 'constant-dummy-salt')
  if(!u || !equal(hash,u.password_hash)) throw new Fault('AUTHENTICATION','Email atau password salah',401)
  await session(c,u.id)
  return c.json({data:{id:u.id,name:u.name,email:u.email},request_id:c.get('requestId')})
})
auth.post('/logout',async c=>{
  const token=getCookie(c,'ordvela_session')
  if(token) await stmt(c.env.DB,'DELETE FROM sessions WHERE token_hash=?',await digest(token)).run()
  deleteCookie(c,'ordvela_session',{path:'/'})
  return c.json({data:{logged_out:true},request_id:c.get('requestId')})
})
export async function authenticate(c:any,next:any) {
  const token=getCookie(c,'ordvela_session')
  const u=token ? await one(c.env.DB,'SELECT u.id,u.email,u.name FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?',await digest(token),now()) : null
  if(!u) throw new Fault('AUTHENTICATION','Silakan masuk',401)
  c.set('user',u)
  const requested=c.req.header('X-Workspace-ID')
  const member=requested ? await one(c.env.DB,'SELECT m.workspace_id,m.role FROM workspace_members m JOIN workspaces w ON w.id=m.workspace_id WHERE m.user_id=? AND m.workspace_id=? AND w.deleted_at IS NULL',u.id,requested) : await one(c.env.DB,'SELECT m.workspace_id,m.role FROM workspace_members m JOIN workspaces w ON w.id=m.workspace_id WHERE m.user_id=? AND w.deleted_at IS NULL ORDER BY w.created_at LIMIT 1',u.id)
  if(!member) throw new Fault('AUTHORIZATION','Anda bukan anggota workspace ini',403)
  c.set('workspace',member.workspace_id);c.set('role',member.role)
  if(!['GET','HEAD','OPTIONS'].includes(c.req.method) && member.role==='VIEWER') throw new Fault('AUTHORIZATION','VIEWER hanya dapat membaca',403)
  await next()
}
export function owner(c:any) { if(c.get('role')!=='OWNER') throw new Fault('AUTHORIZATION','Tindakan ini memerlukan OWNER',403) }
export async function memberships(c:any) {return all(c.env.DB,'SELECT w.id,w.name,m.role FROM workspaces w JOIN workspace_members m ON m.workspace_id=w.id WHERE m.user_id=? AND w.deleted_at IS NULL',c.get('user').id)}
