import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { publicError } from "./serviceErrors";

export const ok=(data=null,meta={})=>({...(data&&typeof data==="object"&&!Array.isArray(data)?data:{}),data,error:null,success:true,...(meta.count===undefined?{}:{count:meta.count}),...(Object.keys(meta).length?{meta}:{})});
export const fail=(message="We could not complete that request. Please try again.",code="REQUEST_FAILED")=>({data:null,error:{message,code},success:false});

export function requireBackend(){
  if(!isSupabaseConfigured||!supabase)throw new Error("BACKEND_NOT_CONFIGURED");
  return supabase;
}

export { publicError } from "./serviceErrors";

export async function serviceCall(operation,{fallback,context="service"}={}){
  try{
    const value=await operation(requireBackend());
    if(value?.error)throw value.error;
    return ok(value?.data??value,value?.count===undefined?{}:{count:value.count});
  }catch(error){
    if(import.meta.env.DEV)console.error(`[${context}]`,{code:error?.code,message:error?.message});
    return fail(publicError(error,fallback),error?.code||"REQUEST_FAILED");
  }
}

export const pageRange=(page=1,pageSize=25)=>{
  const safePage=Math.max(1,Number(page)||1),safeSize=Math.min(100,Math.max(1,Number(pageSize)||25));
  return{page:safePage,pageSize:safeSize,from:(safePage-1)*safeSize,to:safePage*safeSize-1};
};

export const cleanSearch=value=>String(value||"").trim().replace(/[%(),]/g,"").slice(0,100);
