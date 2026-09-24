import { pageRange,serviceCall } from "./apiClient";
export const interviewsService={
  list:async({status="",from="",to="",sort="soonest",page=1,pageSize=25}={})=>serviceCall(async db=>{const range=pageRange(page,pageSize);let q=db.from("interviews").select("id,scheduled_at,scheduled_date,scheduled_time,location,interviewer,status,attendance_status,applications(reference_number,job_title,candidates(full_name))",{count:"exact"}).order("scheduled_at",{ascending:sort!=="latest"}).range(range.from,range.to);if(status)q=q.eq("attendance_status",status);if(from)q=q.gte("scheduled_at",from);if(to)q=q.lte("scheduled_at",to);return q},{context:"interviews.list",fallback:"Unable to load interviews."}),
  create:async payload=>serviceCall(db=>db.from("interviews").insert(payload).select().single(),{context:"interviews.create",fallback:"Unable to schedule the interview."}),
  update:async(id,payload)=>serviceCall(db=>db.from("interviews").update(payload).eq("id",id).select().single(),{context:"interviews.update",fallback:"Unable to update the interview."})
};
