import { Link } from "react-router-dom";
export default function NotFound(){return <section className="not-found"><span>404</span><h1>Page not found</h1><p>The page you requested may have moved.</p><Link className="button" to="/">Return Home →</Link></section>}
