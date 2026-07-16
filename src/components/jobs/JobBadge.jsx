export default function JobBadge({status}){return <span className={`job-badge status-${status.toLowerCase().replaceAll(" ","-")}`}>{status}</span>}
