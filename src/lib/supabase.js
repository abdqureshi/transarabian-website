import { createClient } from "@supabase/supabase-js";

const supabaseUrl=import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey=import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const isPlaceholder=value=>!value||/your-project|project\.supabase|public-anon-key/i.test(value);

const hasValidUrl=(()=>{
  if(isPlaceholder(supabaseUrl))return false;
  try{return ["http:","https:"].includes(new URL(supabaseUrl).protocol)}
  catch{return false}
})();

export const isSupabaseConfigured=Boolean(
  hasValidUrl&&!isPlaceholder(supabaseAnonKey)
);

if(import.meta.env.DEV&&!isSupabaseConfigured){
  console.warn("Supabase is not configured. Copy .env.example to .env.local, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart Vite.");
}

// The null fallback keeps all public pages operational before backend setup.
export const supabase=isSupabaseConfigured
  ?createClient(supabaseUrl,supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
  :null;
