import { useState } from "react";
import { Link,Navigate,useLocation,useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const staffRoles=["viewer","recruiter","admin","super_admin"];

export default function Login(){
  const auth=useAuth();
  const location=useLocation();
  const navigate=useNavigate();
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState("");

  if(auth.user)return <Navigate to={staffRoles.includes(auth.role)?"/admin":"/candidate/dashboard"} replace/>;
  if(!auth.configured)return <Navigate to="/account?setup=required" replace/>;

  const submit=async event=>{
    event.preventDefault();setError("");setSubmitting(true);
    const form=new FormData(event.currentTarget);
    try{
      const {error:signInError}=await auth.signIn(form.get("email").trim(),form.get("password"));
      if(signInError)throw signInError;
      navigate(location.state?.from||"/candidate/dashboard",{replace:true});
    }catch(signInError){setError(signInError.message||"Unable to sign in. Please try again.")}
    finally{setSubmitting(false)}
  };

  return <section className="account-page"><form className="account-card" onSubmit={submit}>
    <span>Secure portal</span><h1>Sign in</h1><p>Access your Trans Arabian candidate or recruitment account.</p>
    <label>Email address<input name="email" type="email" autoComplete="email" required/></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required/></label>
    {error&&<div className="form-error" role="alert">{error}</div>}
    <button className="button" disabled={submitting}>{submitting?"Signing in…":"Sign In →"}</button>
    <Link className="auth-text-link" to="/auth/forgot-password">Forgot your password?</Link>
  </form></section>;
}
