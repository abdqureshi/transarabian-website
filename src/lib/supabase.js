import { createClient } from "@supabase/supabase-js";
import { hasSupabaseConfig } from "./supabaseConfig";

const supabaseUrl=import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey=import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const isSupabaseConfigured=hasSupabaseConfig(supabaseUrl,supabaseAnonKey);

if(import.meta.env.DEV&&!isSupabaseConfigured){
  console.warn("Supabase is not configured. Copy .env.example to .env.local, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart Vite.");
}

// The null fallback keeps all public pages operational before backend setup.
export const supabase=isSupabaseConfigured
  ?createClient(supabaseUrl,supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
  :null;
