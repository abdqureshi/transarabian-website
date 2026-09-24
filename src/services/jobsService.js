import { cleanSearch,pageRange,serviceCall } from "./apiClient";
const columns="id,slug,title,country,city,industry,category,trade,salary_min,salary_max,salary_currency,salary_display,vacancies,experience_text,qualification,status,featured,urgent,poster_url,posted_date,created_at,closing_date";
const sorts={newest:["created_at",false],oldest:["created_at",true],salary_high:["salary_max",false],salary_low:["salary_min",true],vacancies:["vacancies",false]};
export const jobsService={
  list:async({search="",status="",country="",industry="",trade="",sort="newest",page=1,pageSize=20}={})=>serviceCall(async db=>{const range=pageRange(page,pageSize),[column,ascending]=sorts[sort]||sorts.newest;let q=db.from("jobs").select(columns,{count:"exact"}).order(column,{ascending}).range(range.from,range.to);const term=cleanSearch(search);if(term)q=q.or(`title.ilike.%${term}%,trade.ilike.%${term}%,country.ilike.%${term}%,industry.ilike.%${term}%`);if(status)q=q.eq("status",status);if(country)q=q.eq("country",country);if(industry)q=q.eq("industry",industry);if(trade)q=q.eq("trade",trade);return q},{context:"jobs.list",fallback:"Unable to load jobs."}),
  get:async id=>serviceCall(db=>db.from("jobs").select("*").eq("id",id).single(),{context:"jobs.get",fallback:"Unable to load this job."}),
  create:async payload=>serviceCall(db=>db.from("jobs").insert(payload).select().single(),{context:"jobs.create",fallback:"Unable to create the job."}),
  update:async(id,payload)=>serviceCall(db=>db.from("jobs").update(payload).eq("id",id).select().single(),{context:"jobs.update",fallback:"Unable to update the job."}),
  archive:async id=>jobsService.update(id,{status:"archived"}),
  duplicate:async id=>{const result=await jobsService.get(id);if(!result.success)return result;const job={...result.data};delete job.id;job.slug=`${job.slug}-copy-${Date.now()}`;job.title=`${job.title} (Copy)`;job.status="draft";return jobsService.create(job)}
};
