import { supabase,isSupabaseConfigured } from "../lib/supabase";
export function requireBackend(){if(!isSupabaseConfigured||!supabase)throw new Error("Supabase is not configured.");return supabase}
export function throwIfError(result){if(result.error)throw result.error;return result.data}
