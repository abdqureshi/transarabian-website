import HeroSection from "../components/about/HeroSection";
import ExecutiveMessage from "../components/about/ExecutiveMessage";
import Timeline from "../components/about/Timeline";
import ValuesSection from "../components/about/ValuesSection";
import IndustriesSection from "../components/about/IndustriesSection";
import StatisticsSection from "../components/about/StatisticsSection";
import CTASection from "../components/about/CTASection";

const countries=[["🇸🇦","Saudi Arabia"],["🇦🇪","United Arab Emirates"],["🇶🇦","Qatar"],["🇰🇼","Kuwait"],["🇴🇲","Oman"],["🇧🇭","Bahrain"],["🇯🇴","Jordan"],["🇱🇧","Lebanon"],["🇾🇪","Yemen"],["🇲🇷","Mauritania"],["🇧🇼","Botswana"],["🇬🇩","Grenada"],["🇪🇹","Ethiopia"],["🇲🇿","Mozambique"],["🇦🇿","Azerbaijan"],["🇰🇿","Kazakhstan"],["🇺🇿","Uzbekistan"],["🇬🇶","Equatorial Guinea"]];

export default function About(){return <>
  <HeroSection/>

  <section className="section about-overview">
    <div className="about-overview-image reveal"><img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85" alt="International recruitment professionals in a corporate meeting"/><div><strong>Since 1974</strong><span>Serving international employers</span></div></div>
    <article className="reveal"><span className="about-kicker">Company overview</span><h2>Who We Are</h2><p>Trans Arabian Travel &amp; Trade is one of Pakistan&apos;s oldest and most trusted Overseas Employment Promoters. Since 1974, we have connected skilled professionals with leading employers across the Middle East, Africa, Central Asia and other international markets.</p><p>With more than five decades of experience, our organization has successfully recruited over 150,000 professionals while maintaining the highest standards of integrity, transparency and professionalism.</p><div className="overview-points"><span><b>✓</b> Government licensed</span><span><b>✓</b> Merit-based recruitment</span><span><b>✓</b> Global deployment capability</span></div></article>
  </section>

  <ExecutiveMessage name="Muhammad Zia Qureshi" designation="Director" signature="Muhammad Zia Qureshi" image="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=85">
    <p>For more than five decades, Trans Arabian has served with distinction as an independent Overseas Employment Promoter, earning the confidence of international employers and the Government of Pakistan.</p>
    <p>Our receipt of all four Outstanding Performance Awards presented by the Government of Pakistan reflects a sustained commitment to ethical recruitment, professional excellence and responsible service. To date, we have successfully deployed more than 150,000 highly skilled, skilled and semi-skilled professionals to nearly twenty countries across a broad range of industries.</p>
    <p>Our transparent, merit-based recruitment methodology has earned the trust of employers, job seekers and government authorities alike. Supported by a comprehensive candidate database and dedicated trade-testing facilities, we maintain access to qualified personnel who can be mobilized at short notice.</p>
    <p>Today, Trans Arabian is recognized as a trusted name in overseas manpower recruitment, supplying professionals across Oil &amp; Gas, Petrochemical, Construction, Healthcare, Information Technology, Utilities, Agriculture and Hospitality.</p>
    <p>Since 1974, we have proudly supported Consolidated Contractors International Company (CCC), recruiting manpower for projects in Saudi Arabia, Qatar, Kuwait, the UAE, Yemen, Lebanon, Jordan, Botswana, Mauritania, Ethiopia, Mozambique, Azerbaijan, Kazakhstan, Uzbekistan, Equatorial Guinea and numerous other international markets.</p>
  </ExecutiveMessage>

  <ExecutiveMessage reverse name="Wing Commander (R) Muhammad Zahid Qureshi" designation="Chief Executive Officer" signature="Muhammad Zahid Qureshi" image="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=85">
    <p>At Trans Arabian, we take immense pride in carrying forward a legacy founded on integrity, professionalism and trust. For more than fifty years, our organization has recruited and deployed highly trained, ethically responsible professionals for employers around the world.</p>
    <p>This enduring journey has been shaped by three generations of dedicated leadership, each committed to the same standard of excellence established in 1974.</p>
    <p>Our mission remains clear: to provide the right person for the right job through transparent, merit-based recruitment and unwavering ethical standards.</p>
    <p>We remain firmly committed to strengthening Pakistan&apos;s reputation as a reliable source of skilled manpower while creating meaningful international career opportunities for thousands of Pakistani professionals.</p>
  </ExecutiveMessage>

  <ExecutiveMessage className="leadership-divider" title="General Manager's Message" name="Abdul Rahman Qureshi" designation="General Manager" signature="Abdul Rahman Qureshi" image="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=900&q=85">
    <p>As we build upon more than five decades of excellence, our vision is not only to preserve the legacy of Trans Arabian Travel &amp; Trade but to prepare it for the future. The global workforce landscape is evolving rapidly, and so are the expectations of employers. Today, recruitment demands speed, transparency, compliance, and access to highly skilled professionals who can contribute from day one.</p>
    <p>At Trans Arabian, we are embracing this transformation by integrating modern technologies, digital recruitment systems, data-driven talent sourcing, and internationally aligned selection processes. While our values remain rooted in integrity, professionalism, and trust, our approach continues to evolve to meet the changing needs of global employers.</p>
    <p>Our commitment extends beyond recruitment. We believe Pakistan possesses one of the world&apos;s most capable and resilient workforces, and our responsibility is to connect that talent with meaningful opportunities across international markets. Through continuous improvement, strategic partnerships, and a relentless focus on quality, we aim to create lasting value for our clients, candidates, and the nation.</p>
    <p>As the next generation of leadership, I am committed to fostering innovation while upholding the principles that have earned Trans Arabian its reputation over the past 50 years. Together with our dedicated team, we will continue to raise standards, strengthen global partnerships, and ensure that every candidate we represent reflects the professionalism and excellence our organization is known for.</p>
    <p>The future of manpower is built on trust, technology, and talent—and we are proud to be leading that future.</p>
  </ExecutiveMessage>

  <Timeline/>
  <ValuesSection/>
  <IndustriesSection/>

  <section className="section global-presence">
    <header className="about-section-title reveal"><span>Worldwide deployment</span><h2>Our Global Presence</h2><p>Connecting Pakistani talent with major projects across the Middle East, Africa, Central Asia and beyond.</p></header>
    <div className="world-map reveal" aria-label="Stylized world map showing Trans Arabian international reach"><div className="continent america"></div><div className="continent europe"></div><div className="continent africa"></div><div className="continent asia"></div><div className="continent australia"></div><i className="map-point gulf"></i><i className="map-point central-asia"></i><i className="map-point south-africa"></i><i className="map-point caribbean"></i><span>Global recruitment network</span></div>
    <div className="global-country-grid">{countries.map(([flag,name])=><article className="reveal" key={name}><span>{flag}</span><strong>{name}</strong></article>)}</div><p className="many-more">And many more international destinations.</p>
  </section>

  <StatisticsSection/>
  <CTASection/>
</>}
