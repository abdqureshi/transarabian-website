import { Navigate,useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";
import RoleProtectedRoute from "./RoleProtectedRoute";

export default function ProtectedRoute({children,role,roles}){
  const auth=useAuth();
  const location=useLocation();
  if(!auth.configured)return <Navigate to="/account?setup=required" replace/>;
  if(auth.loading)return <div className="auth-loading"><LoadingSpinner label="Checking your account"/></div>;
  if(!auth.user)return <Navigate to={location.pathname.startsWith("/admin")?"/admin/login":"/account/login"} state={{from:`${location.pathname}${location.search}`}} replace/>;
  const allowed=roles||[role].filter(Boolean);
  if(allowed.length)return <RoleProtectedRoute roles={allowed}>{children}</RoleProtectedRoute>;
  return children;
}
