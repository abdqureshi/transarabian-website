import { useEffect,useMemo,useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { getSavedJobs } from "../../utils/jobStorage";
import { applicationsService } from "../../services/applicationsService";

export default function CandidateDashboard(){
  const {profile,user,signOut}=useAuth(),navigate=useNavigate();
  const [applicationsCount,setApplicationsCount]=useState(0),[loading,setLoading]=useState(true);
  useEffect(()=>{applicationsService.mine({pageSize:1}).then(result=>{setApplicationsCount(result.meta?.count||result.data?.length||0);setLoading(false)})},[]);
  const completion=useMemo(()=>{const fields=[profile?.full_name,profile?.email||user?.email,profile?.phone,profile?.avatar_url];return Math.round(fields.filter(Boolean).length/fields.length*100)},[profile,user]);
  const logout=async()=>{await signOut();navigate("/account/login",{replace:true})};
  return <section className="dashboard-page"><header className="dashboard-header"><div><span>Candidate account</span><h1>Welcome, {profile?.full_name||"Candidate"}</h1><p>Your secure Trans Arabian recruitment account.</p></div><button onClick={logout}>Logout</button></header><div className="candidate-foundation-grid"><article><span>Account Email</span><strong>{profile?.email||user?.email||"—"}</strong></article><article><span>Profile Completion</span><strong>{completion}%</strong><div className="profile-progress"><i style={{width:`${completion}%`}}></i></div></article><article><span>Applications</span><strong>{loading?"…":applicationsCount}</strong></article><article><span>Saved Jobs</span><strong>{getSavedJobs().length}</strong></article></div><div className="candidate-foundation-actions"><Link className="button" to="/jobs">Explore Jobs →</Link><Link className="button button-ghost" to="/saved-jobs">View Saved Jobs</Link></div></section>;
}
