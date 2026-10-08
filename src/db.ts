export type Env = { DB: D1Database; ENVIRONMENT?: string; SIGNUP_ENABLED?: string; CREDENTIAL_MASTER_KEY?: string }
export const stmt = (db:D1Database, sql:string, ...args:any[]) => db.prepare(sql).bind(...args)
export const one = async <T=any>(db:D1Database,sql:string,...args:any[]):Promise<T|null> => stmt(db,sql,...args).first<T>()
export const all = async (db:D1Database,sql:string,...args:any[]) => (await stmt(db,sql,...args).all()).results as any[]
