import { Navigate,useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";
import { hasPermission } from "../../config/roles";

export default function RoleProtectedRoute({children,roles=[],permission}){
  const {configured,user,role,loading}=useAuth();
  const location=useLocation();
  if(!configured)return <Navigate to="/account?setup=required" replace/>;
  if(loading)return <div className="auth-loading"><LoadingSpinner label="Verifying permissions"/></div>;
  if(!user)return <Navigate to={location.pathname.startsWith("/admin")?"/admin/login":"/account/login"} state={{from:`${location.pathname}${location.search}`}} replace/>;
  const roleDenied=roles.length>0&&!roles.includes(role);
  const permissionDenied=permission&&!hasPermission(role,permission);
  if(!role||roleDenied||permissionDenied)return <Navigate to="/unauthorized" state={{from:location.pathname}} replace/>;
  return children;
}
