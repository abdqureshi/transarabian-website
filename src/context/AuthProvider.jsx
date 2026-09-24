import { useCallback,useEffect,useMemo,useState } from "react";
import { isSupabaseConfigured } from "../lib/supabase";
import { authService } from "../services/authService";
import { AuthContext } from "./authContext";

export function AuthProvider({children}){
  const [session,setSession]=useState(null),[profile,setProfile]=useState(null);
  const [loading,setLoading]=useState(isSupabaseConfigured),[error,setError]=useState(null),[recoveryMode,setRecoveryMode]=useState(false);
  const loadProfile=useCallback(async user=>{if(!user){setProfile(null);return null}const result=await authService.getProfile(user.id);setProfile(result.data);setError(result.error);return result.data},[]);
  useEffect(()=>{if(!isSupabaseConfigured)return;let active=true;(async()=>{const result=await authService.getSession();if(!active)return;if(!result.success){setError(result.error);setLoading(false);return}const next=result.data?.session||null;setSession(next);await loadProfile(next?.user);if(active)setLoading(false)})();const subscription=authService.onAuthStateChange((event,next)=>{if(!active)return;if(event==="PASSWORD_RECOVERY")setRecoveryMode(true);if(event==="SIGNED_OUT"){setProfile(null);setRecoveryMode(false)}setSession(next);setLoading(true);queueMicrotask(async()=>{await loadProfile(next?.user);if(active)setLoading(false)})});return()=>{active=false;subscription.unsubscribe()}},[loadProfile]);
  const value=useMemo(()=>({configured:isSupabaseConfigured,session,user:session?.user||null,profile,role:profile?.role||null,loading,error,recoveryMode,signIn:authService.signIn,signUp:authService.signUp,signOut:authService.signOut,resetPassword:authService.resetPassword,updatePassword:authService.updatePassword,refreshSession:authService.refreshSession,refreshProfile:()=>loadProfile(session?.user)}),[session,profile,loading,error,recoveryMode,loadProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
