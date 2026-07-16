import Navbar from "../components/Navbar";

function Services() {
  return (
    <div>
      <Navbar />
      <section className="section">
        <h2>Our Services</h2>
        <div className="cards">
          <div className="card"><h3>Overseas Recruitment</h3><p>Complete manpower recruitment for global employers.</p></div>
          <div className="card"><h3>Trade Testing</h3><p>Practical tests for skilled workers and technical trades.</p></div>
          <div className="card"><h3>Visa Processing</h3><p>Medical, insurance, protector, documents, and travel support.</p></div>
        </div>
      </section>
    </div>
  );
}

export default Services;