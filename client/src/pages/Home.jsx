import { useEffect, useState } from "react";
import { ArrowRight, Clock3, PawPrint, Play, ShieldCheck, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModuleCard from "../components/ModuleCard.jsx";
import ProductCard from "../components/ProductCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import ToastContainer from "../components/ToastContainer.jsx";
import CartModal from "../components/CartModal.jsx";
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
  const { addItem, removeItem, updateQty, clear, cart, total } = useCart();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleAddToCart = (product) => {
    addItem(product, 1);
    addToast(`✨ ${product.name} added to cart!`, 'success');
    setIsCartOpen(true);
  };

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
              onAdd={handleAddToCart}
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

<<<<<<< HEAD
      <section className="section how-it-works" style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <SectionHeader
          eyebrow="Simple workflow"
          title="How Pet Care Works"
          text="Get started in minutes with our intuitive, step-by-step process designed for all user types."
          align="center"
        />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "30px",
          marginTop: "3rem",
          maxWidth: "1000px",
          margin: "3rem auto 0"
        }}>
          {[
            {
              step: "1",
              title: "Create Account",
              description: "Sign up as a pet owner, vet, groomer, shop owner, or admin with role-specific features."
            },
            {
              step: "2",
              title: "Set Up Profile",
              description: "Add your pet details, health records, and preferences to personalize your experience."
            },
            {
              step: "3",
              title: "Explore Services",
              description: "Book appointments, shop for products, match adoptable pets, or manage health records."
            },
            {
              step: "4",
              title: "Get Support",
              description: "Use real-time notifications, community forums, and AI insights for expert guidance."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                padding: "2rem",
                borderRadius: "16px",
                background: "white",
                border: "2px solid #e2e8f0",
                textAlign: "center",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0ea5e9";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(14, 165, 233, 0.15)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "800",
                  margin: "0 auto 1rem",
                  boxShadow: "0 8px 16px rgba(14, 165, 233, 0.3)"
                }}
              >
                {item.step}
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f0f1f", margin: "0 0 0.75rem 0" }}>
                {item.title}
              </h3>
              <p style={{ color: "#64748b", lineHeight: 1.6, margin: 0, fontSize: "0.95rem" }}>
                {item.description}
              </p>
              {idx < 3 && (
                <div
                  style={{
                    position: "absolute",
                    right: "-15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "700",
                    zIndex: 1,
                    boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)"
                  }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="section stats-section" style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)",
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <SectionHeader
          eyebrow="Platform metrics"
          title="Built at Enterprise Scale"
          text="Comprehensive features and architecture designed for reliability, security, and scalability."
          align="center"
        />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px",
          marginTop: "2rem"
        }}>
          {[
            { number: "13+", label: "Integrated Modules", icon: "📦" },
            { number: "5", label: "User Roles", icon: "👥" },
            { number: "20+", label: "API Endpoints", icon: "🔌" },
            { number: "100%", label: "Responsive Design", icon: "📱" },
            { number: "24/7", label: "Real-time Features", icon: "⚡" },
            { number: "Enterprise", label: "Grade Security", icon: "🔒" }
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                padding: "2rem",
                borderRadius: "16px",
                background: "white",
                border: "1px solid #e2e8f0",
                textAlign: "center",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 20px 50px rgba(14, 165, 233, 0.12)";
                e.currentTarget.style.borderColor = "#0ea5e9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 15, 31, 0.08)";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "0.5rem" }}>{stat.icon}</div>
              <div style={{
                fontSize: "2.5rem",
                fontWeight: "900",
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "0.5rem"
              }}>
                {stat.number}
              </div>
              <p style={{ color: "#64748b", fontWeight: 700, margin: 0, fontSize: "0.95rem" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section benefits-section" style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <SectionHeader
          eyebrow="Platform advantages"
          title="Why Choose Pet Care?"
          text="Comprehensive, modern, and purpose-built for the pet care industry."
          align="center"
        />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          marginTop: "2rem"
        }}>
          {[
            {
              icon: "🏥",
              title: "Comprehensive Health Management",
              points: [
                "Complete vaccination tracking with reminders",
                "Medical record storage and retrieval",
                "Appointment scheduling with vets",
                "Health alerts and AI risk assessment"
              ]
            },
            {
              icon: "🛒",
              title: "Integrated Marketplace",
              points: [
                "Browse and purchase pet products",
                "Real-time inventory management",
                "Seller ratings and reviews",
                "Secure checkout and payment"
              ]
            },
            {
              icon: "👨‍⚖️",
              title: "Multi-Role Platform",
              points: [
                "Pet Owner - Full access to all features",
                "Veterinarian - Medical record management",
                "Pet Shop Owner - Inventory and sales",
                "Admin - Complete platform control"
              ]
            },
            {
              icon: "🤝",
              title: "Community & Social",
              points: [
                "Community forums and blogs",
                "Pet adoption matching system",
                "User messaging and notifications",
                "Real-time collaboration tools"
              ]
            },
            {
              icon: "🔐",
              title: "Security & Privacy",
              points: [
                "JWT-based authentication",
                "Role-based access control",
                "Data encryption in transit",
                "GDPR-compliant design"
              ]
            },
            {
              icon: "📊",
              title: "Analytics & Insights",
              points: [
                "Admin dashboard with metrics",
                "Appointment analytics",
                "Marketplace sales tracking",
                "User engagement reports"
              ]
            }
          ].map((benefit, idx) => (
            <article
              key={idx}
              style={{
                padding: "2rem",
                borderRadius: "16px",
                background: "white",
                border: "1px solid #e2e8f0",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 20px 50px rgba(14, 165, 233, 0.12)";
                e.currentTarget.style.borderColor = "#0ea5e9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 15, 31, 0.08)";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "1rem" }}>{benefit.icon}</div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#0f0f1f",
                marginBottom: "1rem",
                margin: "0 0 1rem 0"
              }}>
                {benefit.title}
              </h3>
              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem"
              }}>
                {benefit.points.map((point, pidx) => (
                  <li
                    key={pidx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      fontSize: "0.95rem",
                      color: "#64748b",
                      lineHeight: 1.6
                    }}
                  >
                    <span style={{
                      color: "#10b981",
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: "2px"
                    }}>
                      ✓
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section database-section" style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)",
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <div>
          <p className="eyebrow" style={{ color: "#0ea5e9", fontSize: "0.85rem", fontWeight: 700 }}>Database Design</p>
          <h2 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 800,
            color: "#0f0f1f",
            marginBottom: "1.5rem"
          }}>
            13 Collections Mapped & Ready
          </h2>
          <p style={{
            color: "#64748b",
            lineHeight: 1.75,
            fontSize: "1.05rem"
          }}>
            Our database structure follows MongoDB best practices with properly indexed collections for users, pets, health records, appointments, marketplace products, and more. Every collection is fully integrated with the backend API.
          </p>
        </div>
        <div className="table-cloud" style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginTop: "2rem"
        }}>
          {databaseTables.map((table) => (
            <span key={table} style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.75rem 1rem",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)",
              color: "#0ea5e9",
              fontSize: "0.9rem",
              fontWeight: 700,
              border: "1px solid rgba(14, 165, 233, 0.2)"
            }}>
              {table}
            </span>
          ))}
        </div>
      </section>

      <section className="testimonial-section section" style={{
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <SectionHeader 
          eyebrow="Project readiness" 
          title="Production-Ready Platform" 
          text="Every feature is visible, tested, and ready for demonstration. No placeholder content—everything is real and functional."
          align="center" 
=======
      <section className="section page-muted-surface">
        <SectionHeader
          eyebrow="Project readiness"
          title="Built for demos and for real use"
          text="The platform now presents itself like a polished product, not a dashboard wireframe."
          align="center"
>>>>>>> bcaed4d0485f5130b6f089714e87fd277340c189
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
<<<<<<< HEAD
        </nav>
        <div className="footer-word">Pet<span>Care</span></div>
      </footer>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQty={updateQty}
        removeItem={removeItem}
      />
    </>
=======
        </div>
      </section>
    </div>
>>>>>>> bcaed4d0485f5130b6f089714e87fd277340c189
  );
}
