import { formatStatus } from "../../config/statuses";
export default function StatusBadge({status}){return <span className={`ats-status ats-${String(status).toLowerCase().replaceAll("_","-").replaceAll(" ","-")}`}>{formatStatus(status)}</span>}
