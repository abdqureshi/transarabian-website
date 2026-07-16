import { useCallback,useEffect,useMemo,useState } from "react";
import { isSupabaseConfigured,supabase } from "../lib/supabase";
import { AuthContext } from "./authContext";

export function AuthProvider({children}){
  const [session,setSession]=useState(null);
  const [profile,setProfile]=useState(null);
  const [loading,setLoading]=useState(isSupabaseConfigured);
  const [error,setError]=useState(null);
  const [recoveryMode,setRecoveryMode]=useState(false);

  const loadProfile=useCallback(async user=>{
    if(!supabase||!user){setProfile(null);return null}
    const {data, error:profileError}=await supabase
      .from("profiles")
      .select("id,full_name,phone,role")
      .eq("id",user.id)
      .single();
    if(profileError){setProfile(null);setError(profileError);return null}
    setProfile(data);setError(null);return data;
  },[]);

  useEffect(()=>{
    if(!supabase)return;
    let active=true;
    supabase.auth.getSession().then(async({data,error:sessionError})=>{
      if(!active)return;
      if(sessionError){setError(sessionError);setLoading(false);return}
      setSession(data.session);
      await loadProfile(data.session?.user);
      if(active)setLoading(false);
    }).catch(sessionError=>{if(active){setError(sessionError);setLoading(false)}});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,next)=>{
      if(!active)return;
      if(event==="PASSWORD_RECOVERY")setRecoveryMode(true);
      if(event==="SIGNED_OUT"){setProfile(null);setRecoveryMode(false)}
      setSession(next);setLoading(true);
      queueMicrotask(async()=>{await loadProfile(next?.user);if(active)setLoading(false)});
    });
    return()=>{active=false;subscription.unsubscribe()};
  },[loadProfile]);

  const value=useMemo(()=>({
    configured:isSupabaseConfigured,
    session,
    user:session?.user||null,
    profile,
    role:profile?.role||null,
    loading,
    error,
    recoveryMode,
    signIn:(email,password)=>supabase.auth.signInWithPassword({email,password}),
    signUp:(email,password,fullName)=>supabase.auth.signUp({email,password,options:{data:{full_name:fullName}}}),
    signOut:()=>supabase.auth.signOut(),
    resetPassword:email=>supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/auth/reset-password`}),
    updatePassword:password=>supabase.auth.updateUser({password}),
    refreshSession:()=>supabase.auth.refreshSession(),
    refreshProfile:()=>loadProfile(session?.user)
  }),[session,profile,loading,error,recoveryMode,loadProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
