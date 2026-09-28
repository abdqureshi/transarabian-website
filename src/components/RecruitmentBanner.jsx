import { Link } from "react-router-dom";

const bannerText = "NOW HIRING — SAUDI ARABIA & QATAR OIL & GAS PROJECTS • CONSTRUCTION PROJECTS • EMAIL YOUR CV: jobs@transarabian.org • APPLY NOW • HIRING NOW";

function BannerCopy({ duplicate = false }) {
  return (
    <div
      className="recruitment-banner__segment"
      role="group"
      aria-hidden={duplicate || undefined}
      aria-label={duplicate ? undefined : bannerText}
    >
      <strong className="recruitment-banner__lead">NOW HIRING</strong>
      <span> — SAUDI ARABIA &amp; QATAR OIL &amp; GAS PROJECTS • CONSTRUCTION PROJECTS • EMAIL YOUR CV: </span>
      <a href="mailto:jobs@transarabian.org" tabIndex={duplicate ? -1 : undefined}>jobs@transarabian.org</a>
      <span> • </span>
      <Link className="recruitment-banner__action" to="/jobs" tabIndex={duplicate ? -1 : undefined}>APPLY NOW</Link>
      <span> • </span>
      <Link className="recruitment-banner__action" to="/jobs" tabIndex={duplicate ? -1 : undefined}>HIRING NOW</Link>
    </div>
  );
}

export default function RecruitmentBanner() {
  return (
    <div className="recruitment-banner" role="region" aria-label="Current recruitment vacancies">
      <div className="recruitment-banner__viewport">
        <div className="recruitment-banner__track">
          <BannerCopy />
          <BannerCopy duplicate />
        </div>
      </div>
    </div>
  );
}
