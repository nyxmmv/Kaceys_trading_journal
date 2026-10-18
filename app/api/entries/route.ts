import { database, bucket } from '@/db/store';
import { z } from 'zod';
const schema = z.object({
 id:z.string().uuid().optional(), date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>!isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s),
 kind:z.enum(['Trade','Idea']),title:z.string().trim().min(1).max(120),symbol:z.string().trim().max(30),
 side:z.enum(['Buy','Sell','Undecided']),setup:z.string().trim().max(100),outcome:z.enum(['Open','Win','Loss','Breakeven','Not taken']),
 idea:z.string().max(15000),review:z.string().max(15000),lessons:z.string().max(15000),
 rMultiple:z.number().finite().min(-100).max(100).nullable(),maeR:z.number().finite().min(-100).max(100).nullable().optional(),mfeR:z.number().finite().min(-100).max(100).nullable().optional(),
 setupGrade:z.enum(['A+','A','B','C','Not graded']),followedPlan:z.boolean(),fomo:z.boolean(),session:z.enum(['Asia','London','New York','London / New York','Not set']),
 tags:z.array(z.string().trim().min(1).max(40)).max(20),accountId:z.string().uuid().nullable(),riskAmount:z.number().finite().min(0).nullable(),netPnl:z.number().finite().nullable(),images:z.array(z.object({key:z.string(),name:z.string()})).max(5)
});
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET() { try { const data=await database().prepare('SELECT * FROM entries ORDER BY date DESC, updated_at DESC').all();return json({entries:data.results.map(r=>({...r,images:JSON.parse(String(r.images)),tags:JSON.parse(String(r.tags??'[]')),rMultiple:r.r_multiple??null,maeR:r.mae_r??null,mfeR:r.mfe_r??null,setupGrade:r.setup_grade??'Not graded',followedPlan:Boolean(r.followed_plan),fomo:Boolean(r.fomo),session:r.session??'Not set',accountId:r.account_id??null,riskAmount:r.risk_amount??null,netPnl:r.net_pnl??null}))}); }catch(e){console.error(e);return json({error:'Your journal could not load. Please try again.'},503);} }
async function save(request:Request,editing:boolean) {
 const uploaded:string[]=[];
 try {
  if (request.headers.get('origin') && new URL(request.headers.get('origin')!).host!==new URL(request.url).host) return json({error:'Invalid origin'},403);
  if(Number(request.headers.get('content-length'))>27*1024*1024)return json({error:'Upload is too large.'},413);
  const form=await request.formData();const parsed=schema.safeParse(JSON.parse(String(form.get('entry'))));
  if(!parsed.success)return json({error:'Check the title, date, and entry fields.'},400);
  const entry=parsed.data;const db=database();const id=editing?entry.id:crypto.randomUUID();if(!id)return json({error:'Missing entry'},400);
  if(entry.accountId&&!await db.prepare('SELECT id FROM accounts WHERE id=?').bind(entry.accountId).first())return json({error:'Choose an account that still exists.'},400);
  const old=editing?await db.prepare('SELECT images FROM entries WHERE id = ?').bind(id).first<{images:string}>():null;
  if(editing&&!old)return json({error:'This entry no longer exists.'},404);
  const prior=old?JSON.parse(old.images):[];if(entry.images.some(i=>!prior.some((p:{key:string})=>p.key===i.key)))return json({error:'Invalid screenshot reference.'},400);
  const files=form.getAll('files').filter((f):f is File=>typeof f!=='string'&&f.size>0);
  if(files.length+entry.images.length>5)return json({error:'Use up to 5 screenshots per entry.'},400);
  for(const f of files)if(f.size>5*1024*1024||!['image/png','image/jpeg','image/webp'].includes(f.type))return json({error:'Screenshots must be PNG, JPG, or WebP, up to 5 MB each.'},400);
  const images=[...entry.images];
  for(const f of files){const bytes=await f.arrayBuffer();const b=new Uint8Array(bytes);const valid=f.type==='image/png'?b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71:f.type==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';if(!valid)throw new Error('Invalid image');const key=id+'/'+crypto.randomUUID();await bucket().put(key,bytes,{httpMetadata:{contentType:f.type}});uploaded.push(key);images.push({key,name:f.name.slice(0,200)});}
  const values=[entry.date,entry.kind,entry.title,entry.symbol,entry.side,entry.setup,entry.outcome,entry.idea,entry.review,entry.lessons,entry.rMultiple,entry.maeR??null,entry.mfeR??null,entry.setupGrade,entry.followedPlan?1:0,entry.fomo?1:0,entry.session,JSON.stringify(entry.tags),entry.accountId,entry.riskAmount,entry.netPnl,JSON.stringify(images),new Date().toISOString(),id];
  await db.prepare(editing?'UPDATE entries SET date=?,kind=?,title=?,symbol=?,side=?,setup=?,outcome=?,idea=?,review=?,lessons=?,r_multiple=?,mae_r=?,mfe_r=?,setup_grade=?,followed_plan=?,fomo=?,session=?,tags=?,account_id=?,risk_amount=?,net_pnl=?,images=?,updated_at=? WHERE id=?':'INSERT INTO entries (date,kind,title,symbol,side,setup,outcome,idea,review,lessons,r_multiple,mae_r,mfe_r,setup_grade,followed_plan,fomo,session,tags,account_id,risk_amount,net_pnl,images,updated_at,id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(...values).run();
  for(const img of prior)if(!images.some(i=>i.key===img.key))await bucket().delete(img.key).catch(console.error);
  return json({id},editing?200:201);
 }catch(e){console.error(e);for(const key of uploaded)await bucket().delete(key).catch(console.error);return json({error:'Your entry could not be saved. Your draft is still here. Check the files and try again.'},500);}
}
export function POST(r:Request){return save(r,false)}
export function PUT(r:Request){return save(r,true)}
export async function DELETE(r:Request){try{if(r.headers.get('origin')&&new URL(r.headers.get('origin')!).host!==new URL(r.url).host)return json({error:'Invalid origin'},403);const id=new URL(r.url).searchParams.get('id');if(!id)return json({error:'Missing entry'},400);const db=database();const row=await db.prepare('SELECT images FROM entries WHERE id=?').bind(id).first<{images:string}>();if(!row)return json({error:'Entry not found'},404);await db.prepare('DELETE FROM entries WHERE id=?').bind(id).run();for(const image of JSON.parse(row.images))await bucket().delete(image.key).catch(console.error);return json({deleted:true});}catch(e){console.error(e);return json({error:'Could not delete this entry. Try again.'},500);}}
