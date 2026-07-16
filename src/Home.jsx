import Navbar from "../components/Navbar";

function Home() {
  return (
    <div>
      <Navbar />

      <section className="hero">
        <h1>50 Years of Reliable Overseas Recruitment Service</h1>
        <p>
          Trans Arabian Travel & Trade is a trusted Overseas Employment Promoter
          based in Islamabad, Pakistan, serving global employers since 1974.
        </p>
        <button>Hire Manpower</button>
        <button className="secondary">Apply for Jobs</button>
      </section>

      <section className="stats">
        <div><h2>50+</h2><p>Years Experience</p></div>
        <div><h2>150,000+</h2><p>Workers Supplied</p></div>
        <div><h2>22+</h2><p>Countries Served</p></div>
        <div><h2>ISO 9001</h2><p>Certified</p></div>
      </section>
    </div>
  );
}

export default Home;