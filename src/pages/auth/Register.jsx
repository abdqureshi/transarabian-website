import { useState } from "react";
import { Link,Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { landingRouteForRole } from "../../utils/permissions";

export default function Register(){
  const auth=useAuth();
  const [submitting,setSubmitting]=useState(false),[error,setError]=useState(""),[sent,setSent]=useState(false);
  if(auth.user)return <Navigate to={landingRouteForRole(auth.role)} replace/>;
  if(!auth.configured)return <Navigate to="/account?setup=required" replace/>;
  const submit=async event=>{event.preventDefault();setError("");setSubmitting(true);const form=new FormData(event.currentTarget);if(form.get("password")!==form.get("confirmPassword")){setError("Passwords do not match.");setSubmitting(false);return}const result=await auth.signUp(form.get("email"),form.get("password"),form.get("fullName"));setSubmitting(false);if(!result.success){setError(result.error.message);return}setSent(true)};
  return <section className="account-page"><form className="account-card" onSubmit={submit}><span>Candidate registration</span><h1>Create Your Account</h1><p>Registration creates a candidate account only. Administrative access is assigned securely by an existing super administrator.</p><label>Full name<input name="fullName" autoComplete="name" required disabled={sent}/></label><label>Email address<input name="email" type="email" autoComplete="email" required disabled={sent}/></label><label>Password<input name="password" type="password" minLength="8" autoComplete="new-password" required disabled={sent}/></label><label>Confirm password<input name="confirmPassword" type="password" minLength="8" autoComplete="new-password" required disabled={sent}/></label>{error&&<div className="form-error" role="alert">{error}</div>}{sent&&<div className="form-success" role="status">Your candidate account was created. Check your email to confirm it before signing in.</div>}{!sent&&<button className="button" disabled={submitting}>{submitting?"Creating account…":"Create Candidate Account →"}</button>}<Link className="auth-text-link" to="/account/login">Already registered? Sign in</Link></form></section>;
}
