import { storeApplicationMetadata } from "../utils/jobStorage";
import { supabase } from "../lib/supabase";
const sanitize=value=>typeof value==="string"?value.replace(/[<>]/g,"").trim():value;
const fileFields=["cv","cnicFront","cnicBack","passport","education","experienceCertificates","technicalCertificates","photograph","drivingLicenseFile","otherDocuments"];
const fileBuckets={cv:"candidate-cvs",passport:"candidate-passports",photograph:"candidate-photos"};
const mimeExtensions={"application/pdf":"pdf","image/jpeg":"jpg","image/png":"png","image/webp":"webp","application/msword":"doc","application/vnd.openxmlformats-officedocument.wordprocessingml.document":"docx"};

async function submitToSupabase(formData,job,user){
  const candidateData={};
  for(const [key,value] of formData.entries())if(typeof value==="string"&&!fileFields.includes(key))candidateData[key]=sanitize(value);
  const candidatePayload={auth_user_id:user.id,full_name:candidateData.fullName,father_name:candidateData.fatherName,cnic:candidateData.cnic,date_of_birth:candidateData.dateOfBirth||null,gender:candidateData.gender,nationality:candidateData.nationality,phone:candidateData.phone,whatsapp:candidateData.whatsapp,email:candidateData.email,city:candidateData.city,province:candidateData.province,current_address:candidateData.address,permanent_address:candidateData.permanentAddress,passport_number:candidateData.passportNumber,passport_issue_date:candidateData.passportIssue||null,passport_expiry_date:candidateData.passportExpiry||null,passport_status:candidateData.passportStatus,country_of_issue:candidateData.countryOfIssue,highest_qualification:candidateData.qualification,technical_qualification:candidateData.technicalCertification,current_trade:candidateData.currentTrade,total_experience:Number(candidateData.totalExperience||0),gulf_experience:Number(candidateData.gulfExperience||0),saudi_experience:Number(candidateData.saudiExperience||0),certifications:(candidateData.certifications||"").split(",").map(v=>v.trim()).filter(Boolean),languages:(candidateData.languages||"").split(",").map(v=>v.trim()).filter(Boolean),driving_license:candidateData.drivingLicense,saudi_driving_license:candidateData.saudiDrivingLicense,expected_salary:candidateData.expectedSalary,current_salary:candidateData.currentSalary,availability:candidateData.availability,preferred_country:candidateData.preferredCountry,consent_at:new Date().toISOString()};
  const {data:candidate,error:candidateError}=await supabase.from("candidates").upsert(candidatePayload,{onConflict:"auth_user_id"}).select("id").single();if(candidateError)throw candidateError;
  const {data:duplicates}=await supabase.rpc("find_candidate_duplicates",{p_cnic:candidatePayload.cnic||"",p_passport:candidatePayload.passport_number||"",p_email:candidatePayload.email||"",p_phone:candidatePayload.phone||"",p_whatsapp:candidatePayload.whatsapp||"",p_name:candidatePayload.full_name,p_dob:candidatePayload.date_of_birth});const duplicateFlags=[...new Set((duplicates||[]).filter(item=>item.id!==candidate.id).flatMap(item=>item.matched_on))];if(duplicateFlags.length)await supabase.from("candidates").update({duplicate_flags:duplicateFlags}).eq("id",candidate.id);
  const {data:dbJob}=await supabase.from("jobs").select("id").eq("slug",job.slug).maybeSingle();
  const {data:application,error}=await supabase.from("applications").insert({auth_user_id:user.id,candidate_id:candidate.id,job_id:dbJob?.id||null,job_title:job.title,status:"submitted",candidate_data:candidateData}).select("id,reference_number").single();
  if(error)throw error;
  const documentRows=[];
  for(const field of fileFields){const file=formData.get(field);if(!(file instanceof File)||!file.size)continue;const extension=mimeExtensions[file.type];if(!extension)throw new Error(`${field}: unsupported file type.`);const bucket=fileBuckets[field]||"candidate-documents";const path=`${candidate.id}/${application.id}/${field}/${crypto.randomUUID()}.${extension}`;const {error:uploadError}=await supabase.storage.from(bucket).upload(path,file,{upsert:false,contentType:file.type,cacheControl:"3600"});if(uploadError)throw uploadError;documentRows.push({application_id:application.id,candidate_id:candidate.id,auth_user_id:user.id,document_type:field,storage_bucket:bucket,storage_path:path,original_filename:file.name,mime_type:file.type,file_size:file.size,uploaded_by:user.id})}
  if(documentRows.length){const {error}=await supabase.from("candidate_documents").insert(documentRows);if(error)throw error}
  return application.reference_number;
}

export async function submitApplication(form,job){
  const formData=new FormData(form);for(const [key,value] of formData.entries())if(typeof value==="string")formData.set(key,sanitize(value));formData.set("jobId",job.id);formData.set("jobTitle",job.title);formData.set("jobSlug",job.slug);
  const {data:{user}}=supabase?await supabase.auth.getUser():{data:{user:null}};let reference=`TA-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,8).toUpperCase()}`;formData.set("applicationReference",reference);const endpoint=import.meta.env.VITE_APPLICATION_ENDPOINT;let developmentMode=false;
  if(user){reference=await submitToSupabase(formData,job,user);formData.set("applicationReference",reference)}
  else if(endpoint){const response=await fetch(endpoint,{method:"POST",body:formData,headers:{Accept:"application/json"}});if(!response.ok)throw new Error("Submission failed. Please check your connection and try again.")}
  else{await new Promise(resolve=>setTimeout(resolve,900));developmentMode=true}
  const metadata={reference,jobId:job.id,jobTitle:job.title,candidateName:sanitize(formData.get("fullName")),email:sanitize(formData.get("email")),whatsapp:sanitize(formData.get("whatsapp")),submittedAt:new Date().toISOString(),status:"submitted",developmentMode};storeApplicationMetadata(metadata);sessionStorage.setItem("last-application",JSON.stringify(metadata));return metadata;
}
