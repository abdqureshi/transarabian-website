import { ok,serviceCall } from "./apiClient";
const escape=value=>`"${String(value??"").replaceAll('"','""')}"`;
export const reportsService={
  summary:async()=>serviceCall(async db=>{const results=await Promise.all([db.from("jobs").select("id,status"),db.from("candidates").select("id",{count:"exact",head:true}),db.from("applications").select("id,status,submitted_at"),db.from("interviews").select("id,status,attendance_status,scheduled_at")]);const failed=results.find(item=>item.error);if(failed)return failed;return{data:{jobs:results[0].data||[],candidateCount:results[1].count||0,applications:results[2].data||[],interviews:results[3].data||[]}}},{context:"reports.summary",fallback:"Unable to build the report."}),
  toCsv:(rows,columns)=>ok([columns.map(c=>escape(c.label)).join(","),...rows.map(row=>columns.map(c=>escape(row[c.key])).join(","))].join("\n")),
  download:(csv,name)=>{const content=csv?.success?csv.data:csv;const url=URL.createObjectURL(new Blob([content],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);return ok(true)}
};
