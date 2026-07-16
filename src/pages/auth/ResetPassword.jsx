import { useState } from "react";
import { Link,Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function ResetPassword(){
  const auth=useAuth();
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState("");
  const [complete,setComplete]=useState(false);
  if(!auth.configured)return <Navigate to="/account?setup=required" replace/>;
  if(auth.loading)return <div className="auth-loading"><LoadingSpinner label="Validating recovery link"/></div>;

  const submit=async event=>{
    event.preventDefault();setError("");
    const form=new FormData(event.currentTarget);const password=form.get("password");
    if(password!==form.get("confirmPassword")){setError("Passwords do not match.");return}
    setSubmitting(true);
    try{const {error:updateError}=await auth.updatePassword(password);if(updateError)throw updateError;setComplete(true)}
    catch(updateError){setError(updateError.message||"The recovery link is invalid or expired.")}
    finally{setSubmitting(false)}
  };

  if(!auth.session)return <section className="account-page"><article className="setup-panel"><span>Recovery link required</span><h1>This link is invalid or expired</h1><p>Request a new password reset email to continue.</p><Link className="button" to="/auth/forgot-password">Request New Link</Link></article></section>;
  return <section className="account-page"><form className="account-card" onSubmit={submit}>
    <span>Secure password update</span><h1>Choose a new password</h1><p>Use at least eight characters and avoid passwords used on other websites.</p>
    {!complete&&<><label>New password<input name="password" type="password" minLength="8" autoComplete="new-password" required/></label><label>Confirm password<input name="confirmPassword" type="password" minLength="8" autoComplete="new-password" required/></label></>}
    {error&&<div className="form-error" role="alert">{error}</div>}
    {complete?<><div className="form-success" role="status">Your password has been updated.</div><Link className="button auth-link-button" to="/candidate/dashboard">Continue to your account</Link></>:<button className="button" disabled={submitting}>{submitting?"Updating…":"Update Password →"}</button>}
  </form></section>;
}
