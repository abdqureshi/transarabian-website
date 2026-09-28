import { Link } from "react-router-dom";
import JobBadge from "./JobBadge";
import JobGallery from "./JobGallery";
import JobShare from "./JobShare";
import JobBenefits from "./JobBenefits";
import RelatedJobs from "./RelatedJobs";
import { openForApplications } from "../../data/jobRepository";

export default function JobDetails({ job, jobs }) {
  const open = openForApplications(job);
  const phone = job.applicationWhatsApp.replace(/\D/g, "").replace(/^0/, "92");
  const overview = [
    ["Country", job.country],
    ["Project", job.project],
    ["Sector", job.industry],
    ["Category", job.category],
    ["Vacancies", job.vacancies],
    ["Contract", job.contractType],
    ["Working hours", job.workingHours],
    ["Permission no.", job.permissionNumber],
    ["Posted", job.postedDate],
    ["Closing", job.closingDate || "Open until filled"],
  ].filter(([, value]) => value != null && value !== "");

  return <>
    <section className="job-detail-hero">
      <div className="job-detail-breadcrumb"><Link to="/jobs">Current Jobs</Link><span>›</span><b>{job.title}</b></div>
      <div className="job-detail-title">
        <span className="job-detail-flag">{job.flag}</span>
        <div>
          <div className="detail-badges"><JobBadge status={job.status}/>{job.featured&&<span className="featured-badge">Featured</span>}</div>
          <h1>{job.title}</h1>
          <p>{job.country}{job.project?` · ${job.project}`:""} · {job.industry}</p>
        </div>
      </div>
      <div className="detail-hero-meta">
        <div><small>Country</small><strong>{job.country}</strong></div>
        {job.project&&<div><small>Project</small><strong>{job.project}</strong></div>}
        <div><small>Sector</small><strong>{job.industry}</strong></div>
        <div><small>Salary</small><strong>{job.salary}</strong></div>
      </div>
    </section>
    <section className="section job-detail-layout">
      <article className="job-detail-content">
        <section><div className="detail-heading"><span>About the role</span><h2>Job Description</h2></div><p>{job.description}</p></section>
        {job.qualification&&<section><div className="detail-heading"><span>Education</span><h2>Qualifications</h2></div><p>{job.qualification}</p></section>}
        {job.experience&&<section><div className="detail-heading"><span>Relevant background</span><h2>Experience</h2></div><p>{job.experience}</p></section>}
        {job.certifications?.length>0&&<section><div className="detail-heading"><span>Credentials</span><h2>Certifications</h2></div><ul>{job.certifications.map(item=><li key={item}>{item}</li>)}</ul></section>}
        {job.requirements?.length>0&&<section><div className="detail-heading"><span>What you need</span><h2>Job Requirements</h2></div><ul>{job.requirements.map(item=><li key={item}>{item}</li>)}</ul></section>}
        <section><div className="detail-heading"><span>What is included</span><h2>Benefits</h2></div><JobBenefits benefits={job.benefits}/></section>
        <JobGallery job={job}/>
        <section className="application-instructions">
          <div className="detail-heading"><span>How to apply</span><h2>Application Instructions</h2></div>
          <p>{job.instructions||"Submit your application online using the form below."}</p>
          <p>Email: <a href={`mailto:${job.applicationEmail}`}>{job.applicationEmail}</a></p>
          <div>
            {open?<Link className="button" to={`/jobs/${job.slug}/apply`}>Apply Online →</Link>:<span className="button disabled">Applications Closed</span>}
            <a className="button whatsapp-button" href={`https://wa.me/${phone}?text=${encodeURIComponent(`I want to apply for ${job.title} in ${job.country}`)}`} target="_blank" rel="noreferrer">Apply by WhatsApp</a>
            <a className="button button-ghost" href={`mailto:${job.applicationEmail}?subject=Application: ${job.title}`}>Apply by Email</a>
          </div>
          <JobShare job={job}/>
        </section>
      </article>
      <aside className="job-detail-sidebar">
        <div><h3>Job Overview</h3><dl>{overview.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          {open?<Link className="button" to={`/jobs/${job.slug}/apply`}>Apply Now →</Link>:<span className="button disabled">Applications Closed</span>}
        </div>
        <p>Recruitment is managed by Trans Arabian Travel &amp; Trade, a licensed Overseas Employment Promoter.</p>
      </aside>
    </section>
    {open&&<Link className="mobile-sticky-apply" to={`/jobs/${job.slug}/apply`}>Apply Now →</Link>}
    <RelatedJobs jobs={jobs} current={job}/>
  </>;
}
