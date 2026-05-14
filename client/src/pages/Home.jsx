import { useEffect, useState } from "react";
import { ArrowRight, Clock3, PawPrint, Play, ShieldCheck, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModuleCard from "../components/ModuleCard.jsx";
import ProductCard from "../components/ProductCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import api from "../services/api.js";
import { useCart } from "../contexts/CartContext.jsx";
import { advancedFeatures, databaseTables, modules, roles } from "../data/platformData.js";
import { useAuth, useUserRole } from "../hooks/useAuth";
import { getDashboardPath } from "../utils/roleHelper";

const heroDog = "https://images.unsplash.com/photo-1633722715463-d30628519b5f?auto=format&fit=crop&w=1200&q=85";
const careImage = "https://images.unsplash.com/photo-1608848461950-0fed8e2fdf94?auto=format&fit=crop&w=1200&q=85";
const vetImage = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85";
const adoptionImage = "https://images.unsplash.com/photo-1615751072497-5f5169febe17?auto=format&fit=crop&w=1200&q=85";

const heroStats = [
  { value: "24/7", label: "Access" },
  { value: "13+", label: "Modules" },
  { value: "5", label: "Roles" }
];

const values = [
  {
    title: "Responsive by default",
    text: "Layouts fold cleanly across desktop, tablet, and mobile without losing clarity.",
    icon: Sparkles
  },
  {
    title: "Role aware",
    text: "Each user type gets the right tools, permissions, and routes for their workflow.",
    icon: ShieldCheck
  },
  {
    title: "Warm and usable",
    text: "Rounded surfaces, pet imagery, and calm spacing make the product feel friendly.",
    icon: PawPrint
  }
];

const journey = [
  {
    year: "01",
    title: "Discover",
    text: "Land on a welcoming homepage that explains the platform clearly at a glance."
  },
  {
    year: "02",
    title: "Connect",
    text: "Book appointments, browse products, and manage records from one interface."
  },
  {
    year: "03",
    title: "Care",
    text: "Stay on top of health updates, notifications, and role-based tasks every day."
  }
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { userRole } = useUserRole();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadFeaturedProducts() {
      setLoadingProducts(true);
      try {
        const { data } = await api.get('/market/products', { params: { limit: 4 } });
        if (active) {
          setFeaturedProducts(data.items || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) setLoadingProducts(false);
      }
    }

    loadFeaturedProducts();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="landing-page">
      <section className="hero-shell hero full-screen-section">
        <div className="hero-copy">
          <p className="hero-kicker">Pawsitively complete care</p>
          <h1>Your pet care platform, redesigned to feel calm, warm, and fast.</h1>
          <p className="hero-summary">
            Pet Care brings appointments, health records, adoption, marketplace shopping, messaging, and role-based tools into a single responsive workspace.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#modules">
              Explore modules <ArrowRight size={18} />
            </a>
            {isAuthenticated ? (
              <button className="secondary-button" onClick={() => navigate(getDashboardPath(userRole))} type="button">
                <Play size={16} /> Open dashboard
              </button>
            ) : (
              <a href="/login" className="secondary-button">
                <Play size={16} /> Get started
              </a>
            )}
          </div>
          <div className="hero-stats">
            {heroStats.map((item) => (
              <article className="hero-stat" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="hero-visual" aria-label="Pet Care platform preview">
          <div className="hero-canvas">
            <img className="hero-image" src={heroDog} alt="Happy dog looking upward" />
            <div className="hero-pet-bubble dog">
              <img src={vetImage} alt="Smiling pet owner with dog" />
            </div>
            <div className="hero-pet-bubble cat">
              <img src={adoptionImage} alt="Cat waiting for adoption" />
            </div>
            <div className="hero-paw-badge top"><PawPrint size={28} /></div>
            <div className="hero-paw-badge bottom"><Star size={24} /></div>
            <div className="hero-mini-card">
              <Clock3 size={18} />
              <span>
                <strong>Today at 4:30 PM</strong>
                <small>Upcoming vet check-in</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-intro story-grid">
          <div className="story-copy">
            <p className="eyebrow">About the platform</p>
            <h2>Everything your team needs, arranged into one joyful interface.</h2>
            <p>
              The redesign brings the app closer to the attached reference: a blue framed shell, a white canvas, rounded cards, and pet imagery that makes the platform feel approachable.
            </p>
            <div className="feature-chip-row">
              <span className="feature-chip">Responsive layout</span>
              <span className="feature-chip">Role-based screens</span>
              <span className="feature-chip">Soft visual language</span>
            </div>
            <div className="story-metrics">
              <article className="metric-card"><strong>24/7</strong><span>Platform access</span></article>
              <article className="metric-card"><strong>13+</strong><span>Connected modules</span></article>
              <article className="metric-card"><strong>5</strong><span>User types</span></article>
            </div>
          </div>
          <img className="story-image" src={careImage} alt="Pet health care workspace" />
        </div>
      </section>

      <section className="section">
        <SectionHeader
          eyebrow="Design values"
          title="A friendlier way to manage modern pet care"
          text="The interface emphasizes clarity, warmth, and mobile resilience without losing feature depth."
          align="center"
        />
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
      </section>

      <section className="section role-section">
        <SectionHeader
          eyebrow="Role-based access"
          title="Clear workflows for every user type"
          text="Each role keeps the tools it needs while the interface stays familiar across the whole platform."
          align="center"
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
          title="A complete product suite"
          text="Browse the connected modules that power appointments, records, shopping, messaging, matchmaking, and more."
          align="center"
        />
        <div className="module-grid">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>

      <section className="section shop-section page-muted-surface">
        <SectionHeader
          eyebrow="Marketplace"
          title="Pet shop products in a cleaner layout"
          text="Premium items, live inventory, and quick add-to-cart actions stay easy to scan on any screen."
        />
        <div className="category-pills">
          {["All", "Dog", "Cat", "Health devices", "Low stock"].map((item, index) => (
            <button key={item} className={index === 0 ? "active" : ""} type="button">
              {item}
            </button>
          ))}
        </div>
        <div className="product-grid">
          {loadingProducts && <p>Loading products...</p>}
          {!loadingProducts && featuredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAdd={(item) => addItem(item, 1)}
            />
          ))}
        </div>
      </section>

      <section className="section advanced-section page-muted-surface">
        <SectionHeader
          eyebrow="Advanced features"
          title="Modern functionality without visual clutter"
          text="Security, AI, messaging, and location services stay available behind a friendlier interface."
          align="center"
        />
        <div className="advanced-grid">
          {advancedFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title}>
                <div className="feature-icon"><Icon size={22} /></div>
                <h3>{feature.title}</h3>
                <p>{feature.detail}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section page-muted-surface">
        <SectionHeader
          eyebrow="Project readiness"
          title="Built for demos and for real use"
          text="The platform now presents itself like a polished product, not a dashboard wireframe."
          align="center"
        />
        <div className="timeline-grid">
          {journey.map((step) => (
            <article className="timeline-item" key={step.year}>
              <span className="timeline-year">Step {step.year}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section page-muted-surface">
        <SectionHeader
          eyebrow="Database design"
          title="Structured data behind the scenes"
          text="Collections remain visible so the technical depth of the platform is still easy to present."
        />
        <div className="feature-chip-row">
          {databaseTables.map((table) => (
            <span key={table} className="feature-chip">
              {table}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
