import { Link,useLocation } from "react-router-dom";

export default function Unauthorized(){
  const location=useLocation();
  return <section className="account-page"><article className="setup-panel"><span>Access restricted</span><h1>You do not have permission to view this page</h1><p>Your account is signed in, but its assigned role cannot access {location.state?.from||"this resource"}.</p><Link className="button" to="/">Return Home</Link></article></section>;
}
