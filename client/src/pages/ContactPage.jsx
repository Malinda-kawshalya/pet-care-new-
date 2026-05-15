import { ArrowRight, Clock3, Mail, MapPin, Phone, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import api from "../services/api.js";

const contactCards = [
  {
    icon: Phone,
    title: "Call us",
    text: "+1 (555) 015-2600"
  },
  {
    icon: Mail,
    title: "Email",
    text: "hello@petcare.app"
  },
  {
    icon: MapPin,
    title: "Location",
    text: "Remote-first care platform"
  }
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      await api.post("/contact", payload);
      setSent(true);
      event.currentTarget.reset();
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Unable to send your message right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section contact-page">
      <div className="page-intro contact-layout">
        <div className="contact-copy">
          <p className="eyebrow">Contact us</p>
          <h1 className="page-title">Let's talk about your pet care workflow.</h1>
          <p className="page-subtitle">
            Whether you need onboarding help, role access support, or a walkthrough of the platform, this contact page gives you a clear next step.
          </p>
          <div className="contact-info-grid">
            {contactCards.map((item) => {
              const Icon = item.icon;
              return (
                <article className="contact-card" key={item.title}>
                  <div className="contact-icon"><Icon size={20} /></div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
          <div className="feature-chip-row">
            <span className="feature-chip"><Sparkles size={14} /> Quick response</span>
            <span className="feature-chip"><Clock3 size={14} /> Mon - Fri, 9 to 6</span>
          </div>
        </div>

        <article className="auth-form-panel contact-form-panel">
          <div className="auth-panel-head">
            <h2>Send a message</h2>
            <p>We’ll respond with the right next step for your role or service question.</p>
          </div>

          {sent && <div className="form-alert success">Thanks. Your message was sent successfully.</div>}
          {error && <div className="form-alert error">{error}</div>}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="split-fields">
              <label>
                Name
                <input required name="name" placeholder="Your name" />
              </label>
              <label>
                Email
                <input required type="email" name="email" placeholder="you@example.com" />
              </label>
            </div>
            <div className="split-fields">
              <label>
                Subject
                <input required name="subject" placeholder="What do you need help with?" />
              </label>
              <label>
                Role
                <input name="role" placeholder="Pet owner, vet, groomer, shop, admin" />
              </label>
            </div>
            <label>
              Phone
              <input name="phone" placeholder="Optional phone number" />
            </label>
            <label>
              Message
              <textarea required name="message" placeholder="Tell us a little more about your question or request." />
            </label>
            <button className="primary-button" type="submit" disabled={loading}>
              <Send size={16} /> {loading ? "Sending..." : "Send message"}
            </button>
          </form>

          <div className="auth-inline-links">
            <a className="ghost-link" href="/about">
              Learn about the platform <ArrowRight size={15} />
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}