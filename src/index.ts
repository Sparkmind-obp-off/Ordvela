import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { bodyLimit } from 'hono/body-limit'
import { secureHeaders } from 'hono/secure-headers'
import { auth,App } from './auth'
import { api } from './api'
import { one } from './db'
import { Fault,id } from './core'
import { shell } from './shell'
const app = new Hono<App>()
app.use('*',async(c,next)=>{c.set('requestId',id());await next();c.header('X-Request-ID',c.get('requestId'));if(c.req.path.startsWith('/demo/')) c.header('Content-Security-Policy',"sandbox allow-scripts allow-downloads allow-forms; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'")})
app.use('*',secureHeaders({referrerPolicy:'no-referrer',xFrameOptions:'DENY',contentSecurityPolicy:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'","data:"],connectSrc:["'self'"],frameAncestors:["'none'"],formAction:["'self'"],baseUri:["'none'"]}}))
app.use('/api/*',async(c,next)=>{
  c.header('Cache-Control','no-store')
  if(!['GET','HEAD','OPTIONS'].includes(c.req.method)) {
    const origin=c.req.header('Origin'),actual=new URL(c.req.url).origin
    if(origin && origin!==actual) throw new Fault('AUTHORIZATION','Origin request ditolak',403)
    if(!c.req.header('Content-Type')?.startsWith('application/json')) throw new Fault('VALIDATION','Content-Type application/json diperlukan',415)
  }
  await next()
})
app.use('/api/*',bodyLimit({maxSize:32000,onError:c=>c.json({error:{code:'VALIDATION',message:'Payload terlalu besar',retryable:false},request_id:c.get('requestId')},413)}))
app.get('/api/health',async c=>{
  try { if(!c.env.DB) throw new Error('DB missing');await one(c.env.DB,'SELECT COUNT(*) n FROM workspaces');return c.json({data:{status:'ok',database:'ready',environment:c.env.ENVIRONMENT || 'unknown',jobs:'request-driven',version:'0.4.0'},request_id:c.get('requestId')}) }
  catch {return c.json({data:{status:'blocked',database:'not-configured-or-migrated',version:'0.4.0'},request_id:c.get('requestId')},503)}
})
app.route('/api/auth',auth)
app.route('/api',api)
app.get('/demo/:token',async c=>{
  const e=await one(c.env.DB,"SELECT a.content FROM executions e JOIN execution_artifacts a ON a.execution_id=e.id JOIN workspaces w ON w.id=e.workspace_id WHERE e.demo_token=? AND e.status='DEPLOYED' AND w.deleted_at IS NULL AND a.type='text/html'",c.req.param('token'))
  if(!e) return c.text('Demo tidak ditemukan atau telah ditarik',404)
  c.header('Content-Security-Policy',"sandbox allow-scripts allow-downloads allow-forms; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'")
  c.header('Cache-Control','no-store')
  c.header('X-Robots-Tag','noindex, nofollow')
  return c.html(e.content)
})
app.use('/static/*',serveStatic({root:'./public'}))
app.get('/',c=>c.html(shell))
app.notFound(c=>c.json({error:{code:'NOT_FOUND',message:'Route tidak ditemukan',retryable:false},request_id:c.get('requestId')},404))
app.onError((e,c)=>{
  const fault=e instanceof Fault?e:e instanceof SyntaxError?new Fault('VALIDATION','JSON tidak valid'):new Fault('INTERNAL','Operasi gagal; periksa health atau request ID',500)
  // Deliberately do not log payloads, raw evidence, keys, or underlying provider errors.
  console.error(JSON.stringify({request_id:c.get('requestId'),code:fault.code,operation:c.req.method+' '+new URL(c.req.url).pathname}))
  return c.json({error:{code:fault.code,message:fault.message,retryable:fault.retryable},request_id:c.get('requestId')},fault.status as any)
})
export default app
