import { fail,serviceCall } from "./apiClient";
const privateBuckets=new Set(["candidate-cvs","candidate-documents","candidate-passports","candidate-photos"]);
const safeBucket=bucket=>privateBuckets.has(bucket)?bucket:null;
export const documentsService={
  signedUrl:async(path,bucket="candidate-documents",expiresIn=300)=>{const selected=safeBucket(bucket);if(!selected||!path)return fail("The requested document is unavailable.","INVALID_DOCUMENT");return serviceCall(async db=>{const result=await db.storage.from(selected).createSignedUrl(path,Math.min(Math.max(60,expiresIn),600));return result.error?result:{data:result.data.signedUrl}},{context:"documents.signedUrl",fallback:"Unable to open this document."})},
  remove:async(path,bucket="candidate-documents")=>{const selected=safeBucket(bucket);if(!selected||!path)return fail("The requested document is unavailable.","INVALID_DOCUMENT");return serviceCall(db=>db.storage.from(selected).remove([path]),{context:"documents.remove",fallback:"Unable to remove this document."})}
};
