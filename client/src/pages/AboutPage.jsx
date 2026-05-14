import { ArrowRight, Award, HeartHandshake, ShieldCheck, Sparkles, Users, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";

const storyTimeline = [
  {
    year: "2023",
    title: "A platform shaped around real workflows",
    text: "The project was built to bring health, commerce, and service operations together in one place."
  },
  {
    year: "2024",
    title: "Roles, permissions, and care journeys",
    text: "Separate tools were added for owners, veterinarians, shops, groomers, and administrators."
  },
  {
    year: "2026",
    title: "A calmer, more polished experience",
    text: "This redesign introduces a softer visual identity inspired by the reference layout."
  }
];

const values = [
  {
    title: "Trust first",
    text: "We make security and clarity visible so people feel confident using the app every day.",
    icon: ShieldCheck
  },
  {
    title: "Built around care",
    text: "Every screen is designed to support real pet care decisions, not just generic admin tasks.",
    icon: HeartHandshake
  },
  {
    title: "Modern and warm",
    text: "Rounded cards, soft backgrounds, and expressive pet visuals keep the experience friendly.",
    icon: Sparkles
  }
];

export default function AboutPage() {
  return (
    <section className="section about-page">
      <div className="page-intro page-grid">
        <div className="story-copy">
          <p className="eyebrow">About us</p>
          <h1 className="page-title">A pet platform that feels human, not clinical.</h1>
          <p className="page-subtitle">
            Pet Care is a unified experience for bookings, records, products, adoption, and community support. The new design leans into a softer, pet-friendly visual style while keeping the app practical.
          </p>
          <div className="chip-row">
            <span className="feature-chip"><Users size={14} /> Multi-role platform</span>
            <span className="feature-chip"><Award size={14} /> Production ready</span>
            <span className="feature-chip"><PawPrint size={14} /> Pet first UX</span>
          </div>
          <Link to="/contact" className="primary-button" style={{ width: "fit-content" }}>
            Talk to the team <ArrowRight size={18} />
          </Link>
        </div>

        <img
          className="page-image"
          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=85"
          alt="Team caring for a dog"
        />
      </div>

      <div className="section">
        <div className="value-grid">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <article className="value-card" key={value.title}>
                <div className="value-icon"><Icon size={22} /></div>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="section">
        <div className="section-header section-header-center">
          <p className="eyebrow" style={{ margin: "0 auto 12px" }}>Our story</p>
          <h2>From feature-rich app to polished care experience</h2>
          <p>
            The platform already had the right features. The work now is about making those features feel cohesive, readable, and inviting on every screen.
          </p>
        </div>
        <div className="timeline-grid">
          {storyTimeline.map((item) => (
            <article className="timeline-item" key={item.year}>
              <span className="timeline-year">{item.year}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}