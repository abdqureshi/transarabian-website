import { useState } from "react";
import { NavLink,Outlet,useLocation,useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { formatStatus } from "../../utils/formatters";
import { ROLES } from "../../constants/roles";

const items=[["/admin","▦","Dashboard"],["/admin/jobs","▤","Jobs"],["/admin/applications","✓","Applications"],["/admin/candidates","◉","Candidates"],["/admin/interviews","◷","Interviews"],["/admin/reports","▥","Reports"],["/admin/users","♙","Users"],["/admin/settings","⚙","Settings"]];
export default function AdminLayout(){
  const {profile,user,role,signOut}=useAuth(),location=useLocation(),navigate=useNavigate(),[open,setOpen]=useState(false);
  const visibleItems=items.filter(([to])=>!(["/admin/users","/admin/settings"].includes(to))||role===ROLES.SUPER_ADMIN);
  const crumbs=location.pathname.split("/").filter(Boolean).map(formatStatus);
  const logout=async()=>{await signOut();navigate("/admin/login",{replace:true})};
  return <div className={`ats-shell ${open?"nav-open":""}`}><aside className="ats-sidebar"><header><strong>TA</strong><div><b>Recruitment ATS</b><span>Administration</span></div><button className="ats-nav-close" onClick={()=>setOpen(false)} aria-label="Close navigation">×</button></header><nav>{visibleItems.map(([to,icon,label])=><NavLink end={to==="/admin"} to={to} key={to} onClick={()=>setOpen(false)}><i>{icon}</i>{label}</NavLink>)}</nav><footer><div><b>{profile?.full_name||user?.email}</b><span>{formatStatus(role)}</span></div><button onClick={logout}>Sign out</button></footer></aside><div className="ats-workspace"><header className="ats-topbar"><button className="ats-menu-button" onClick={()=>setOpen(true)} aria-label="Open navigation">☰</button><nav aria-label="Breadcrumb">{crumbs.map((crumb,index)=><span key={`${crumb}-${index}`}>{index?" / ":""}{crumb}</span>)}</nav><div className="ats-user-summary"><span>{profile?.full_name||user?.email}</span><b>{formatStatus(role)}</b><button onClick={logout}>Logout</button></div></header><main className="ats-main"><Outlet/></main></div>{open&&<button className="ats-nav-backdrop" onClick={()=>setOpen(false)} aria-label="Close navigation"/>}</div>;
}
