import Navbar from "../components/Navbar";

function Facilities() {
  return (
    <div>
      <Navbar />
      <section className="section">
        <h2>Facilities</h2>
        <p>
          Our Islamabad office includes interview facilities, candidate handling
          areas, computerized records, and trade-testing workshops for multiple
          technical categories.
        </p>

        <div className="grid">
          <span>Pipe Fitting</span>
          <span>Welding</span>
          <span>Scaffolding</span>
          <span>Plumbing</span>
          <span>Masonry</span>
          <span>Fabrication</span>
          <span>Electrical</span>
          <span>Carpentry</span>
        </div>
      </section>
    </div>
  );
}

export default Facilities;