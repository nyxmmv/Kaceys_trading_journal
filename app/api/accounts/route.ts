import {database} from '@/db/store';
import {z} from 'zod';

const accountSchema=z.object({
 id:z.string().uuid().optional(),name:z.string().trim().min(1).max(80),firm:z.string().trim().max(80),
 type:z.enum(['Personal','Challenge','Funded','Demo']),currency:z.string().trim().min(3).max(4).transform(v=>v.toUpperCase()),
 accountSize:z.number().finite().min(0).nullable(),startingBalance:z.number().finite().nullable(),archived:z.boolean(),notes:z.string().max(2000)
});
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const sameOrigin=(r:Request)=>!r.headers.get('origin')||new URL(r.headers.get('origin')!).host===new URL(r.url).host;

export async function GET(){try{const data=await database().prepare('SELECT * FROM accounts ORDER BY archived ASC, name ASC').all();return json({accounts:data.results.map(r=>({id:r.id,name:r.name,firm:r.firm,type:r.type,currency:r.currency,accountSize:r.account_size??null,startingBalance:r.starting_balance??null,archived:Boolean(r.archived),notes:r.notes,createdAt:r.created_at,updatedAt:r.updated_at}))});}catch(e){console.error(e);return json({error:'Your accounts could not load. Please try again.'},503)}}
async function save(r:Request,editing:boolean){try{if(!sameOrigin(r))return json({error:'Invalid origin'},403);const parsed=accountSchema.safeParse(await r.json());if(!parsed.success)return json({error:'Check the account details.'},400);const a=parsed.data,id=editing?a.id:crypto.randomUUID();if(!id)return json({error:'Missing account'},400);const db=database(),now=new Date().toISOString();if(editing){const exists=await db.prepare('SELECT id FROM accounts WHERE id=?').bind(id).first();if(!exists)return json({error:'Account not found'},404);await db.prepare('UPDATE accounts SET name=?,firm=?,type=?,currency=?,account_size=?,starting_balance=?,archived=?,notes=?,updated_at=? WHERE id=?').bind(a.name,a.firm,a.type,a.currency,a.accountSize,a.startingBalance,a.archived?1:0,a.notes,now,id).run();}else await db.prepare('INSERT INTO accounts (id,name,firm,type,currency,account_size,starting_balance,archived,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id,a.name,a.firm,a.type,a.currency,a.accountSize,a.startingBalance,a.archived?1:0,a.notes,now,now).run();return json({id},editing?200:201);}catch(e){console.error(e);return json({error:'The account could not be saved.'},500)}}
export function POST(r:Request){return save(r,false)}
export function PUT(r:Request){return save(r,true)}
export async function DELETE(r:Request){try{if(!sameOrigin(r))return json({error:'Invalid origin'},403);const id=new URL(r.url).searchParams.get('id');if(!id)return json({error:'Missing account'},400);const db=database(),exists=await db.prepare('SELECT id FROM accounts WHERE id=?').bind(id).first();if(!exists)return json({error:'Account not found'},404);await db.batch([db.prepare('UPDATE entries SET account_id=NULL WHERE account_id=?').bind(id),db.prepare('DELETE FROM accounts WHERE id=?').bind(id)]);return json({deleted:true});}catch(e){console.error(e);return json({error:'The account could not be deleted.'},500)}}
