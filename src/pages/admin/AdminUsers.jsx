import { useEffect,useState } from "react";
import { adminUsersService } from "../../services/adminUsersService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function AdminUsers(){
  const [result,setResult]=useState(null);
  useEffect(()=>{adminUsersService.list({pageSize:10}).then(setResult)},[]);
  if(!result)return <LoadingSpinner label="Checking user directory"/>;
  return <><header className="ats-page-head"><div><span>Access management</span><h1>Users</h1><p>Super-admin foundation for account and role management.</p></div></header><section className="foundation-status-card"><span className={result.success?"connection-ok":"connection-error"}>{result.success?"● Database connected":"● Service unavailable"}</span><h2>{result.success?`${result.meta?.count||result.data?.length||0} accounts available`:"User directory could not be loaded"}</h2><p>{result.success?"Role changes remain protected by Supabase Row Level Security. Full user management will be added in a later phase.":result.error?.message}</p></section></>;
}
