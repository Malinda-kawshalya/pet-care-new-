import { useEffect, useState } from "react";
import { ArrowRight, Clock3, PawPrint, Play, Scissors, ShieldCheck, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModuleCard from "../components/ModuleCard.jsx";
import ProductCard from "../components/ProductCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import ToastContainer from "../components/ToastContainer.jsx";
import CartModal from "../components/CartModal.jsx";
import api from "../services/api.js";
import { useCart } from "../contexts/CartContext.jsx";
import { DEFAULT_IMAGE_FALLBACK, getUploadUrl } from "../utils/media.js";
import { formatLKR } from "../utils/currency.js";
import { advancedFeatures, databaseTables, modules, roles } from "../data/platformData.js";
import { useAuth, useUserRole } from "../hooks/useAuth";
import { getDashboardPath } from "../utils/roleHelper";

const heroDog = "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=85";
const careImage = "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=85";
const vetImage = "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=900&q=85";
const adoptionImage = "https://images.unsplash.com/photo-1558944351-cd8a1e12e9f7?auto=format&fit=crop&w=900&q=85";
const groomingImage = "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=85";

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
  const [adoptionItems, setAdoptionItems] = useState([]);
  const [loadingAdoptions, setLoadingAdoptions] = useState(false);
  const [groomerServices, setGroomerServices] = useState([]);
  const [loadingGroomerServices, setLoadingGroomerServices] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleImageError = (event) => {
    if (event.currentTarget.src !== DEFAULT_IMAGE_FALLBACK) {
      event.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
    }
  };

  const resolveAdoptionImage = (post) => {
    const image = post?.pet?.images?.[0] || post?.images?.[0] || post?.photo;
    return getUploadUrl(image, adoptionImage);
  };

  const resolveServiceImage = (service) => getUploadUrl(service?.image, groomingImage);

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

    (async function loadGroomerServices() {
      setLoadingGroomerServices(true);
      try {
        const { data } = await api.get('/groomer-services', { params: { limit: 4 } });
        if (active) setGroomerServices(data.items || []);
      } catch (err) {
        // ignore homepage preview failures
      } finally {
        if (active) setLoadingGroomerServices(false);
      }
    })();

    // load recent adoption posts for homepage preview
    (async function loadAdoptions() {
      setLoadingAdoptions(true);
      try {
        const { data } = await api.get('/adoptions', { params: { limit: 4 } });
        if (active) setAdoptionItems(data.items || []);
      } catch (err) {
        // ignore
      } finally {
        if (active) setLoadingAdoptions(false);
      }
    })();
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
        </div>

        <div className="hero-visual" aria-label="Pet Care platform preview">
          <div className="hero-canvas">
            <img className="hero-image" src={heroDog} alt="Happy dog looking upward" onError={handleImageError} />
            <div className="hero-pet-bubble dog">
              <img src={vetImage} alt="Smiling pet owner with dog" onError={handleImageError} />
            </div>
            <div className="hero-pet-bubble cat">
              <img src={adoptionImage} alt="Cat waiting for adoption" onError={handleImageError} />
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

      <section className="section section-story">
        <div className="page-intro story-grid">
          <div className="story-copy">
            <p className="eyebrow">About the platform</p>
            <div className="story-intro">
              <span className="story-pill">A calmer workflow</span>
              <h2>One friendly place for care, shopping, and daily tasks.</h2>
            </div>
            <p>
              The platform keeps the important parts close together so people can move from one task to the next without feeling lost.
            </p>
            <div className="feature-chip-row">
              <span className="feature-chip">Easy to learn</span>
              <span className="feature-chip">Less screen hopping</span>
              <span className="feature-chip">Built for real routines</span>
            </div>
            <div className="story-metrics story-metrics-friendly">
              <article className="metric-card story-metric-card">
                <span className="metric-label">Always ready</span>
                <strong>24/7</strong>
                <p>Use the platform whenever care needs attention.</p>
              </article>
              <article className="metric-card story-metric-card">
                <span className="metric-label">All in one place</span>
                <strong>13+</strong>
                <p>Find modules, tools, and updates without switching apps.</p>
              </article>
              <article className="metric-card story-metric-card">
                <span className="metric-label">Built for everyone</span>
                <strong>5</strong>
                <p>Different roles stay supported with clear, simple routes.</p>
              </article>
            </div>
          </div>
          <img className="story-image" src={careImage} alt="Pet health care workspace" onError={handleImageError} />
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

      {/* <section className="section role-section">
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
      </section> */}

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

      <section className="section groomer-services-home">
        <SectionHeader
          eyebrow="Grooming services"
          title="Book care from trusted groomers"
          text="Explore active grooming services published by groomers, with pricing, duration, and service-area details."
          align="center"
        />
        <div className="home-groomer-service-grid">
          {loadingGroomerServices && <p>Loading grooming services...</p>}
          {!loadingGroomerServices && groomerServices.length === 0 && <p>No grooming services listed yet.</p>}
          {groomerServices.map((service) => (
            <article key={service._id} className="home-groomer-service-card">
              <div className="home-groomer-service-media">
                <img src={resolveServiceImage(service)} alt={service.name} onError={handleImageError} />
                <span><Scissors size={14} /> {service.category || "Grooming"}</span>
              </div>
              <div className="home-groomer-service-copy">
                <div className="home-groomer-service-topline">
                  <strong>{formatLKR(Number(service.price || 0))}</strong>
                  <span>{service.durationMinutes || 60} min</span>
                </div>
                <h3>{service.name}</h3>
                <p>{service.description || "Professional grooming service for pets."}</p>
                <div className="home-groomer-provider">
                  <span>{service.groomer?.providerProfile?.businessName || service.groomer?.name || "Groomer"}</span>
                  <small>{service.groomer?.providerProfile?.serviceArea || service.groomer?.address || "Service area available on request"}</small>
                </div>
                <a href="/appointments" className="primary-button">
                  Book service <ArrowRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section adoption-preview page-muted-surface">
        <SectionHeader
          eyebrow="Adopt"
          title="Recently listed pets"
          text="Browse the latest pets listed on the platform and reach out to their owners."
          align="center"
        />
        <div className="adoption-grid">
          {loadingAdoptions && <p>Loading pets...</p>}
          {!loadingAdoptions && adoptionItems.length === 0 && <p>No recent listings.</p>}
          <div className="home-adoption-list">
            {adoptionItems.map((post) => (
              <article key={post._id} className="home-adoption-card">
                <div className="home-adoption-image-wrap">
                  <img
                    src={resolveAdoptionImage(post)}
                    alt={post.pet?.name || post.title}
                    onError={handleImageError}
                  />
                </div>
                <div className="home-adoption-copy">
                  <div className="home-adoption-topline">
                    <span className={`home-adoption-status ${post.status || "open"}`}>{post.status || "open"}</span>
                    <span className="home-adoption-fee">{formatLKR(Number(post.adoptionFee || 0))}</span>
                  </div>
                  <h3>{post.pet?.name || post.title}</h3>
                  <p className="home-adoption-meta">{post.location || post.pet?.breed || "No location"}</p>
                  <p className="home-adoption-summary">{post.description || "View details about this pet and send an adoption request from the adoption page."}</p>
                  <div className="home-adoption-actions">
                    <a href="/adoption" className="primary-button">
                      View details
                      <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
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
              <div className="timeline-head">
                <span className="timeline-year">Step {step.year}</span>
                <span className="timeline-dot" aria-hidden="true"></span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* <section className="section page-muted-surface">
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
      </section> */}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQty={updateQty}
        removeItem={removeItem}
      />
    </div>
  );
}
