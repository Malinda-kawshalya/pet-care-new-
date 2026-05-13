import { LockKeyhole, MailCheck, PawPrint, ShieldCheck, UserCog } from "lucide-react";
import { roles } from "../data/platformData.js";

export default function AuthPage() {
  return (
    <section className="auth-page full-screen-section">
      <div className="auth-card">
        <div className="brand auth-brand"><span className="brand-mark"><PawPrint size={18} /></span><span>Pet Care</span></div>
        <p className="eyebrow">Account management</p>
        <h1>Create your account</h1>
        <p>Register as a pet owner, veterinarian, shop, groomer, or admin-approved provider.</p>
        <form className="auth-form">
          <label>
            Full name
            <input type="text" placeholder="Enter your name" />
          </label>
          <label>
            Email address
            <input type="email" placeholder="you@example.com" />
          </label>
          <label>
            Role
            <select defaultValue="petOwner">
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.label}</option>
              ))}
            </select>
          </label>
          <label>
            Password
            <input type="password" placeholder="Create password" />
          </label>
          <div className="auth-actions">
            <button className="primary-button" type="button">Register</button>
            <button className="ghost-button" type="button">Login</button>
          </div>
        </form>
      </div>

      <aside className="auth-side">
        <h2>Included security flows</h2>
        {[
          ["Email verification", "Verify accounts before sensitive actions", MailCheck],
          ["Forgot password", "Token-based reset and password update", LockKeyhole],
          ["Admin approval", "Providers wait for admin review", ShieldCheck],
          ["Profile management", "Update role details, phone, avatar, address", UserCog]
        ].map(([title, detail, Icon]) => (
          <article key={title}>
            <Icon size={20} />
            <div>
              <strong>{title}</strong>
              <p>{detail}</p>
            </div>
          </article>
        ))}
      </aside>
    </section>
  );
}
