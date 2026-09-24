const isPlaceholder=value=>!value||/your-project|project\.supabase|public-anon-key/i.test(value);
export function hasSupabaseConfig(url,key){if(isPlaceholder(url)||isPlaceholder(key))return false;try{return ["http:","https:"].includes(new URL(url).protocol)}catch{return false}}
