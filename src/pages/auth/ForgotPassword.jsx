import { useState } from "react";
import { Link,Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function ForgotPassword(){
  const auth=useAuth();
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState("");
  const [sent,setSent]=useState(false);
  if(!auth.configured)return <Navigate to="/account?setup=required" replace/>;

  const submit=async event=>{
    event.preventDefault();setError("");setSubmitting(true);
    const email=new FormData(event.currentTarget).get("email").trim();
    try{const {error:resetError}=await auth.resetPassword(email);if(resetError)throw resetError;setSent(true)}
    catch(resetError){setError(resetError.message||"Unable to send the reset email.")}
    finally{setSubmitting(false)}
  };

  return <section className="account-page"><form className="account-card" onSubmit={submit}>
    <span>Account recovery</span><h1>Reset your password</h1><p>Enter your account email. If it is registered, Supabase will send a secure recovery link.</p>
    <label>Email address<input name="email" type="email" autoComplete="email" required disabled={sent}/></label>
    {error&&<div className="form-error" role="alert">{error}</div>}
    {sent&&<div className="form-success" role="status">Check your inbox for the password reset link.</div>}
    {!sent&&<button className="button" disabled={submitting}>{submitting?"Sending…":"Send Reset Link →"}</button>}
    <Link className="auth-text-link" to="/account/login">Return to sign in</Link>
  </form></section>;
}
