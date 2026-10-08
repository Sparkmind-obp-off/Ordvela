import { Env, all, one } from './db'
import { Fault, now, text } from './core'
import { zeroCostGate } from './rapidapi'
import { rapidRegistry } from './rapid-acquisition'

// Evaluation is a derived D1 view: no duplicated outcomes, scores or money ledgers.
export async function providerEvaluations(env:Env,w:string,days=30){
 if(!Number.isInteger(days)||days<1||days>90)throw new Fault('VALIDATION','Evaluation period 1–90 days')
 const end=now(),start=end-days*86400000,rapid=await all(env.DB,"SELECT a.*,j.status job_status FROM acquisition_runs a JOIN jobs j ON j.id=a.job_id WHERE a.workspace_id=? AND a.created_at>=?",w,start),apify=await all(env.DB,"SELECT a.*,j.status job_status,j.result job_result FROM acquisition_jobs a JOIN jobs j ON j.id=a.job_id WHERE a.workspace_id=? AND a.created_at>=?",w,start)
 const output=[]
 for(const provider of ['rapidapi','apify']){
  const rows=provider==='rapidapi'?rapid:apify
  for(const source of [...new Set(rows.map(r=>r.source))]){
   const group=rows.filter(r=>r.source===source)
   const receipts=provider==='rapidapi'?"SELECT x.signal_id FROM evidence_receipts x JOIN acquisition_runs a ON a.job_id=x.job_id WHERE a.workspace_id=? AND a.source=? AND a.created_at>=?":"SELECT x.signal_id FROM acquisition_signals x JOIN acquisition_jobs a ON a.job_id=x.job_id WHERE a.workspace_id=? AND a.source=? AND a.created_at>=?"
   const signals=await all(env.DB,receipts,w,source,start),ids=[...new Set(signals.map(s=>s.signal_id))]
   let opportunities:any[]=[],actions:any[]=[],revenues:any[]=[]
   if(ids.length){opportunities=await all(env.DB,`SELECT id,status FROM opportunities WHERE workspace_id=? AND signal_id IN (${receipts})`,w,w,source,start)
    actions=await all(env.DB,`SELECT d.id,d.contacted_at FROM distributions d JOIN opportunities o ON o.id=d.opportunity_id WHERE o.workspace_id=? AND o.signal_id IN (${receipts})`,w,w,source,start)
    revenues=await all(env.DB,`SELECT r.currency,SUM(r.revenue_minor) minor,COUNT(*) wins FROM outcomes r JOIN distributions d ON d.id=r.distribution_id JOIN opportunities o ON o.id=d.opportunity_id WHERE o.workspace_id=? AND o.signal_id IN (${receipts}) AND r.state='WON' GROUP BY r.currency`,w,w,source,start)
   }
   let requests=0,successful=0,failed=0,valid=0,duplicates=0,qualified=0,created=0,cost=0,unknown_cost=0,unknown_outcomes=0
   for(const r of group){const result=JSON.parse((provider==='rapidapi'?r.result:r.job_result)||'{}');requests+=provider==='rapidapi'?r.request_count:(r.run_id||r.started_at?1:0);successful+=['SUCCEEDED','PARTIAL'].includes(r.phase)?1:0;failed+=r.phase==='FAILED'?1:0;unknown_outcomes+=r.phase==='UNKNOWN'?1:0;valid+=provider==='rapidapi'?(result.evidence_count||0):r.result_count;duplicates+=result.duplicate_count||0;qualified+=provider==='rapidapi'?(result.qualified_count||0):r.opportunity_count;created+=provider==='rapidapi'?(result.qualified_count||0):r.opportunity_count;const c=provider==='rapidapi'?r.actual_cost_usd:r.actual_usage_usd;if(c===null)unknown_cost++;else cost+=c}
   const usd=revenues.find(r=>r.currency==='USD')?.minor||0
   output.push({provider,source,period_start:start,period_end:end,requests,successful_requests:successful,failed_requests:failed,unknown_outcomes,valid_evidence:valid,unique_evidence:ids.length,duplicates,qualified_demand:qualified,opportunities_created:created,assisted_opportunities:opportunities.length,approved_opportunities:opportunities.filter(o=>['SELECTED','CONTACT_READY','WON','LOST'].includes(o.status)).length,actions:actions.filter(d=>d.contacted_at).length,wins:revenues.reduce((n,r)=>n+r.wins,0),assisted_revenue:revenues,cost_usd:unknown_cost?null:cost,cost_basis:provider==='rapidapi'?'OWNER_VERIFIED_ZERO_COST_NOT_INVOICE':'OBSERVED_VENDOR_USAGE',unknown_cost_jobs:unknown_cost,qualified_per_request:requests?qualified/requests:null,opportunity_rate:requests?created/requests:null,revenue_per_cost_usd:!unknown_cost&&cost>0?(usd/100)/cost:null,roi_status:unknown_cost?'UNKNOWN_COST':cost===0?'NO_COST_DENOMINATOR':'USD_ONLY',attribution:'ASSISTED / NON_ADDITIVE across providers; shared evidence or same opportunity is not independent revenue',paid_routine_eligible:false})
  }
 }
 return {period_days:days,evaluations:output,paid_routine_eligible:false,rule:'No paid escalation; observation is not authorization; revenue currencies never mixed'}
}
export async function acquisitionRoute(env:Env,w:string,input:any){
 const capability=text(input.capability,'capability',80),max_spend=input.max_spend??0
 if(typeof max_spend!=='number'||max_spend!==0)throw new Fault('PAYMENT_REQUIRED','This router recommends FREE-FIRST only; paid authorization stays separate',409)
 const rows=await all(env.DB,'SELECT kind,enabled,status,validated_at FROM providers WHERE workspace_id=?',w),plans:any[]=[]
 for(const [provider,capabilities] of [['hacker-news',['search','public-item']],['github-issues',['public-issue']]] as const)if((capabilities as readonly string[]).includes(capability)){const p=rows.find(r=>r.kind===provider);plans.push({provider,eligible:!p||!!p.enabled,estimated_cost_usd:0,tier:'OFFICIAL_PUBLIC_FREE',reason:p&&!p.enabled?'WORKSPACE_DISABLED':'PUBLIC_SOURCE; source capability must match',execute:false})}
 const rapid=await rapidRegistry(env,w)
 for(const r of rapid.configs.filter(r=>r.capability===capability)){const gate=zeroCostGate(r.policy,{max_requests:1,max_spend:0} as any),eligible=rapid.runtime_configured&&r.policy_valid_for_runtime&&r.enabled&&r.status==='ENABLED'&&gate.eligible&&!!rows.find(p=>p.kind==='rapidapi'&&p.enabled&&p.status==='ENABLED'&&p.validated_at>=now()-86400000)&&rapid.quota_budgets.some(q=>q.candidate_id===r.candidate_id&&q.locally_available>0);plans.push({provider:'rapidapi',config_id:r.id,eligible,estimated_cost_usd:eligible?0:null,tier:'REVIEWED_FREE_TIER',reason:eligible?'FREE_COST_GATE_PASSED':'NOT_APPROVED_OR_ZERO_COST_NOT_PROVEN',execute:false})}
 const actors=await all(env.DB,'SELECT id,enabled,capability,metadata,run_validated_at FROM actor_registry WHERE workspace_id=? AND capability=?',w,capability)
 for(const r of actors)plans.push({provider:'apify',config_id:r.id,eligible:false,tier:'PAID_APPROVAL_REQUIRED',estimated_cost_usd:null,reason:'ZERO_BUDGET: separate explicit paid authorization; no automatic fallback',execute:false,actor_validated:!!r.run_validated_at})
 const evaluation=await providerEvaluations(env,w)
 for(const plan of plans){const observed=evaluation.evaluations.find(e=>e.provider===plan.provider);plan.observed=observed?{requests:observed.requests,opportunity_rate:observed.opportunity_rate,qualified_per_request:observed.qualified_per_request,revenue_per_cost_usd:observed.revenue_per_cost_usd,unknown_outcomes:observed.unknown_outcomes}:null}
 const viable=plans.filter(p=>p.eligible).sort((a,b)=>((a.tier==='OFFICIAL_PUBLIC_FREE'?0:1)-(b.tier==='OFFICIAL_PUBLIC_FREE'?0:1))||((b.observed?.qualified_per_request??0)-(a.observed?.qualified_per_request??0)))
 return {capability,max_spend:0,recommended:viable[0]||null,candidates:plans,evaluation,automatic_execution:false,paid_fallback:false,selection_basis:'Cost / capability / approved availability first; observed quality/revenue for human review, not automatic authorization'}
}
