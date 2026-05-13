import { ArrowRight, Check, MapPin, Play, ShieldCheck, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModuleCard from "../components/ModuleCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { advancedFeatures, databaseTables, modules, products, roles } from "../data/platformData.js";
import { useAuth, useUserRole } from "../hooks/useAuth";
import { getDashboardPath } from "../utils/roleHelper";

const heroDog = "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=85";
const careImage = "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=1200&q=85";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { userRole } = useUserRole();
  const navigate = useNavigate();

  return (
    <>
      <section className="hero full-screen-section">
        <div className="hero-copy">
          <p className="eyebrow">Smart Pet Health Management and Service Platform</p>
          <h1>Pet Care</h1>
          <p>
            A complete production-style MERN website for pet owners, veterinarians,
            pet shops, groomers, and admins with health records, bookings, marketplace,
            adoption, matching, maps, AI, notifications, and role-based access.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#modules">
              View full system <ArrowRight size={18} />
            </a>
            {isAuthenticated ? (
              <button 
                className="round-link" 
                onClick={() => navigate(getDashboardPath(userRole))}
              >
                <Play size={16} /> Go to Dashboard
              </button>
            ) : (
              <a href="/login" className="round-link">
                <Play size={16} /> Get Started
              </a>
            )}
          </div>
        </div>
        <div className="hero-visual" aria-label="Pet Care platform preview">
          <img className="hero-dog" src={heroDog} alt="Golden retriever smiling" />
          <div className="floating-stat top-stat">
            <strong>13</strong>
            <span>collections covered</span>
          </div>
          <div className="floating-stat bottom-stat">
            <strong>5 roles</strong>
            <span>role-based access</span>
          </div>
        </div>
        <div className="hero-strip">
          <span>Live modules</span>
          <strong>Authentication, pets, health, bookings, shop, matching, adoption, community, admin, AI, maps, security.</strong>
          <span className="mini-badge"><ShieldCheck size={18} /> Admin ready</span>
        </div>
      </section>

      <section className="section split-section" id="care">
        <div>
          <p className="eyebrow">Complete platform</p>
          <h2>Every proposal feature is represented in the website flow</h2>
          <p>
            The frontend now presents real product areas instead of only a landing
            page: users can review module functions, role permissions, database
            tables, admin workflows, provider approvals, and advanced AI features.
          </p>
          <div className="check-list two-column">
            {["Full-screen responsive screens", "Admin dashboard", "Role access matrix", "Footer and site links", "Marketplace controls", "Health and vaccine workflows"].map((item) => (
              <span key={item}><Check size={17} /> {item}</span>
            ))}
          </div>
          <a className="primary-button compact" href="/modules/admin">Review admin module</a>
        </div>
        <img className="section-photo" src={careImage} alt="Dog receiving care from owner" />
      </section>

      <section className="section role-section">
        <SectionHeader
          eyebrow="Role-based access"
          title="Separate permissions for every user type"
          text="The presentation shows which functions belong to pet owners, vets, pet shops, groomers, and admins."
        />
        <div className="role-grid">
          {roles.map((role) => (
            <article className="role-card" key={role.id}>
              <h3>{role.label}</h3>
              <p>{role.scope}</p>
              <div>
                {role.permissions.map((permission) => (
                  <span key={permission}>{permission}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="modules">
        <SectionHeader
          eyebrow="System modules"
          title="All core system functions"
          text="Each module page includes the required functions, workflows, actions, collection mapping, and permission notes."
          align="center"
        />
        <div className="module-grid">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>

      <section className="section shop-section">
        <SectionHeader eyebrow="Marketplace" title="E-commerce screen with seller and inventory details" />
        <div className="category-pills">
          {["All", "Dog", "Cat", "Health devices", "Low stock"].map((item, index) => (
            <button key={item} className={index === 0 ? "active" : ""}>{item}</button>
          ))}
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article key={product.name} className="product-card">
              <img src={product.image} alt={product.name} />
              <div>
                <p>{product.category}</p>
                <h3>{product.name}</h3>
                <span>{product.price}</span>
              </div>
              <small><Star size={14} fill="currentColor" /> {product.rating}</small>
              <em>{product.stock}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="section advanced-section">
        <SectionHeader
          eyebrow="Advanced features"
          title="Extra innovations for a stronger final project"
          text="These are visible in the website and can be connected to backend services as the project grows."
        />
        <div className="advanced-grid">
          {advancedFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title}>
                <Icon size={22} />
                <h3>{feature.title}</h3>
                <p>{feature.detail}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section database-section">
        <div>
          <p className="eyebrow">Database design</p>
          <h2>Collections already mapped for MERN development</h2>
          <p>
            The UI follows the same collection names used by the backend routes,
            making the project easier to present and extend.
          </p>
        </div>
        <div className="table-cloud">
          {databaseTables.map((table) => (
            <span key={table}>{table}</span>
          ))}
        </div>
      </section>

      <section className="testimonial-section section">
        <SectionHeader eyebrow="Project readiness" title="A complete presentation-ready product surface" align="center" />
        <div className="testimonial-grid">
          {[
            "Vaccination reminders, vet notes, QR records, and AI risk alerts are all visible.",
            "Admin approval, blocking, reporting, analytics, and moderation are covered.",
            "Marketplace, adoption, pet matching, blogs, maps, and notifications are included."
          ].map((text, index) => (
            <article key={text} className="testimonial-card">
              <p>{text}</p>
              <strong>{["Health module", "Admin module", "Service modules"][index]}</strong>
              <span><MapPin size={14} /> Pet Care platform</span>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div>
          <div className="brand footer-brand"><span className="brand-mark"><Check size={18} /></span><span>Pet Care</span></div>
          <p>Smart Pet Health Management and Service Platform</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          {["Dashboard", "Admin", "Marketplace", "Health", "Adoption", "Security"].map((item) => (
            <a key={item} href={item === "Dashboard" ? "/dashboard" : `/modules/${item.toLowerCase()}`}>{item}</a>
          ))}
        </nav>
        <div className="footer-word">Pet<span>Care</span></div>
      </footer>
    </>
  );
}
