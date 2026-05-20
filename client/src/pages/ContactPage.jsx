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
      <div className="contact-page-header">
        <p className="eyebrow">Contact us</p>
        <h1 className="page-title">Let's talk about your pet care workflow.</h1>
        <p className="page-subtitle">
          Whether you need onboarding help, role access support, or a walkthrough of the platform, this page keeps the next step simple.
        </p>
      </div>

      <div className="contact-layout">
        <aside className="contact-summary-panel">
          <div className="contact-summary-card">
            <div className="contact-summary-head">
              <span className="contact-summary-badge"><Sparkles size={14} /> Support</span>
              <h2>Fast, direct contact for every role</h2>
              <p>Use the details below for quick support, then send the form if you need a follow-up or a platform walkthrough.</p>
            </div>

            <div className="contact-summary-list">
              {contactCards.map((item) => {
                const Icon = item.icon;
                return (
                  <article className="contact-summary-item" key={item.title}>
                    <div className="contact-summary-icon"><Icon size={18} /></div>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="contact-summary-foot">
              <div>
                <Clock3 size={14} />
                <span>Mon - Fri, 9:00 AM - 6:00 PM</span>
              </div>
              <div>
                <Sparkles size={14} />
                <span>Typical reply within one business day</span>
              </div>
            </div>
          </div>
        </aside>

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