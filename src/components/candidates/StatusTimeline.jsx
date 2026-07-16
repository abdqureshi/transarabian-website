import { formatStatus } from "../../config/statuses";
export default function StatusTimeline({history=[]}){return <ol className="candidate-timeline">{history.map(item=><li key={item.id}><i></i><div><strong>{formatStatus(item.new_status||item.status)}</strong><span>{new Date(item.created_at).toLocaleString()}</span>{(item.notes||item.note)&&<p>{item.notes||item.note}</p>}</div></li>)}</ol>}
