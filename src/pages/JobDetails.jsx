import { Navigate,useParams } from "react-router-dom";import JobDetailsView from "../components/jobs/JobDetails";import useJobSeo from "../hooks/useJobSeo";import { jobBySlug,jobs } from "../data/jobRepository";
export default function JobDetails(){const {slug}=useParams();const job=jobBySlug(slug);useJobSeo(job);return job?<JobDetailsView job={job} jobs={jobs}/>:<Navigate to="/jobs" replace/>}
