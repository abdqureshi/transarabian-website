import Navbar from "../components/Navbar";

function About() {
  return (
    <div>
      <Navbar />
      <section className="section">
        <h2>Who We Are</h2>
        <p>
          Trans Arabian has supplied highly skilled, skilled, and unskilled
          manpower across the Gulf, Middle East, Central Asia, Africa, and
          beyond.
        </p>

        <div className="cards">
          <div className="card">
            <h3>Vision</h3>
            <p>To become global leaders in manpower recruitment.</p>
          </div>
          <div className="card">
            <h3>Mission</h3>
            <p>To deploy professionally efficient and morally sound workforce.</p>
          </div>
          <div className="card">
            <h3>Core Values</h3>
            <p>Reliability, Efficiency, Professionalism, Excellence.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;