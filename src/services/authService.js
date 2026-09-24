import { fail,ok,publicError,requireBackend,serviceCall } from "./apiClient";

export const authService={
  signIn:async(email,password)=>serviceCall(db=>db.auth.signInWithPassword({email:email.trim().toLowerCase(),password}),{context:"auth.signIn",fallback:"The email or password is incorrect."}),
  signUp:async(email,password,fullName)=>serviceCall(db=>db.auth.signUp({email:email.trim().toLowerCase(),password,options:{data:{full_name:fullName.trim()}}}),{context:"auth.signUp",fallback:"Unable to create the account right now."}),
  signOut:async()=>serviceCall(db=>db.auth.signOut(),{context:"auth.signOut",fallback:"Unable to sign out. Please try again."}),
  getSession:async()=>serviceCall(db=>db.auth.getSession(),{context:"auth.session",fallback:"Unable to restore your session."}),
  refreshSession:async()=>serviceCall(db=>db.auth.refreshSession(),{context:"auth.refresh",fallback:"Your session could not be refreshed."}),
  resetPassword:async email=>serviceCall(db=>db.auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo:`${window.location.origin}/account/reset-password`}),{context:"auth.reset",fallback:"Unable to send a reset email right now."}),
  updatePassword:async password=>serviceCall(db=>db.auth.updateUser({password}),{context:"auth.password",fallback:"Unable to update your password."}),
  getProfile:async userId=>serviceCall(db=>db.from("profiles").select("id,full_name,email,phone,role,is_active").eq("id",userId).single(),{context:"auth.profile",fallback:"Unable to load your account profile."}),
  onAuthStateChange:callback=>{
    try{return requireBackend().auth.onAuthStateChange(callback).data.subscription}
    catch(error){if(import.meta.env.DEV)console.error("[auth.subscription]",publicError(error));return{unsubscribe(){}}}
  },
  ensureStaff:profile=>profile&&["viewer","recruiter","admin","super_admin"].includes(profile.role)?ok(profile):fail("This account is not authorized for the administration portal.","UNAUTHORIZED")
};
