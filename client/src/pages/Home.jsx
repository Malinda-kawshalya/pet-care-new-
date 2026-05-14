import { useEffect, useState } from "react";
import { ArrowRight, Check, MapPin, Play, ShieldCheck } from "lucide-react";
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
const petShopImage = "https://images.unsplash.com/photo-1587300411107-ec76756b9c6c?auto=format&fit=crop&w=1200&q=85";
const adoptionImage = "https://images.unsplash.com/photo-1615751072497-5f5169febe17?auto=format&fit=crop&w=1200&q=85";

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
    <>
      <section className="hero full-screen-section" style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 20%, #e0f2fe 40%, #ecf0f1 100%)",
        backdropFilter: "blur(8px)"
      }}>
        <div className="hero-copy">
          <p className="eyebrow" style={{ color: "#0ea5e9", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
            🐾 Complete Pet Health & Service Ecosystem
          </p>
          <h1 style={{
            fontSize: "clamp(3rem, 8vw, 4.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #0f0f1f 0%, #0ea5e9 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "1.5rem"
          }}>
            Your Pet's Health Hub
          </h1>
          <p style={{
            maxWidth: "560px",
            color: "#64748b",
            lineHeight: 1.75,
            fontSize: "1.1rem",
            marginBottom: "2rem"
          }}>
            A sophisticated all-in-one platform for pet owners, veterinarians, pet shops, groomers, and healthcare administrators. Complete with health records, real-time bookings, marketplace integration, adoption matching, AI-powered insights, and more.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#modules" style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              color: "white",
              padding: "0.875rem 2rem",
              borderRadius: "12px",
              fontWeight: 700,
              boxShadow: "0 8px 20px rgba(14, 165, 233, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.3s ease"
            }}>
              Explore All Modules <ArrowRight size={18} />
            </a>
            {isAuthenticated ? (
              <button 
                className="round-link" 
                onClick={() => navigate(getDashboardPath(userRole))}
                style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  color: "#0f0f1f",
                  padding: "0.875rem 2rem",
                  borderRadius: "12px",
                  fontWeight: 700,
                  border: "2px solid rgba(226, 232, 240, 0.8)",
                  backdropFilter: "blur(10px)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}
              >
                <Play size={16} /> Go to Dashboard
              </button>
            ) : (
              <a href="/login" className="round-link" style={{
                background: "rgba(255, 255, 255, 0.8)",
                color: "#0f0f1f",
                padding: "0.875rem 2rem",
                borderRadius: "12px",
                fontWeight: 700,
                border: "2px solid rgba(226, 232, 240, 0.8)",
                backdropFilter: "blur(10px)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.3s ease"
              }}>
                <Play size={16} /> Get Started Free
              </a>
            )}
          </div>
        </div>
        <div className="hero-visual" aria-label="Pet Care platform preview">
          <img className="hero-dog" src={heroDog} alt="Happy pets enjoying care" style={{
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(15, 15, 31, 0.15)",
          }} />
          <div className="floating-stat top-stat" style={{
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 24px rgba(14, 165, 233, 0.15)",
            border: "1px solid rgba(14, 165, 233, 0.2)"
          }}>
            <strong style={{ fontSize: "2rem", color: "#0ea5e9" }}>13+</strong>
            <span style={{ color: "#64748b", fontWeight: 700 }}>Modules</span>
          </div>
          <div className="floating-stat bottom-stat" style={{
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 24px rgba(14, 165, 233, 0.15)",
            border: "1px solid rgba(14, 165, 233, 0.2)"
          }}>
            <strong style={{ fontSize: "1.8rem", color: "#10b981" }}>5</strong>
            <span style={{ color: "#64748b", fontWeight: 700 }}>User Roles</span>
          </div>
        </div>
        <div className="hero-strip" style={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          border: "1px solid rgba(226, 232, 240, 0.8)"
        }}>
          <span style={{ fontWeight: 700, color: "#0ea5e9" }}>✨ Live Features</span>
          <strong style={{ fontWeight: 600, color: "#0f0f1f" }}>Authentication · Health Records · Pet Profiles · Vet Bookings · Marketplace · Adoption Matching · Community · Admin Dashboard</strong>
          <span className="mini-badge" style={{ color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={18} /> Enterprise Ready
          </span>
        </div>
      </section>

      <section className="section split-section" id="care" style={{
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <div>
          <p className="eyebrow" style={{ color: "#0ea5e9", fontSize: "0.85rem", fontWeight: 700 }}>Complete Platform</p>
          <h2 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 800,
            color: "#0f0f1f",
            marginBottom: "1.5rem"
          }}>
            Comprehensive Pet Care Solution
          </h2>
          <p style={{
            color: "#64748b",
            lineHeight: 1.75,
            fontSize: "1.05rem",
            marginBottom: "2rem"
          }}>
            From health tracking to marketplace management, our platform provides everything pet owners and professionals need. Real-time collaboration, smart insights, and seamless integrations across all modules.
          </p>
          <div className="check-list two-column" style={{ marginBottom: "2rem" }}>
            {["Full-screen responsive screens", "Admin dashboard with analytics", "Role-based access control", "Beautiful footer navigation", "Marketplace with inventory", "Health & vaccine management"].map((item) => (
              <span key={item} style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontWeight: 700,
                color: "#0f0f1f"
              }}>
                <Check size={20} style={{ color: "#10b981" }} /> {item}
              </span>
            ))}
          </div>
          <a className="primary-button compact" href="/modules/admin" style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "12px",
            fontWeight: 700,
            boxShadow: "0 8px 20px rgba(14, 165, 233, 0.3)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.3s ease"
          }}>
            View Admin Module
          </a>
        </div>
        <img className="section-photo" src={careImage} alt="Pet health management" style={{
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(15, 15, 31, 0.12)",
          objectFit: "cover"
        }} />
      </section>

      <section className="section role-section" style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)",
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <SectionHeader
          eyebrow="Role-based access"
          title="5 distinct user roles with custom permissions"
          text="Each role has carefully designed permissions, workflows, and features tailored to specific user needs and responsibilities."
        />
        <div className="role-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px"
        }}>
          {roles.map((role) => (
            <article className="role-card" key={role.id} style={{
              borderRadius: "16px",
              padding: "2rem",
              background: "white",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)",
              transition: "all 0.3s ease",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 20px 50px rgba(15, 15, 31, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 15, 31, 0.08)";
            }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f0f1f", marginBottom: "0.5rem" }}>
                {role.label}
              </h3>
              <p style={{
                fontSize: "0.95rem",
                color: "#64748b",
                lineHeight: 1.6,
                marginBottom: "1.5rem",
                minHeight: "60px"
              }}>
                {role.scope}
              </p>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem"
              }}>
                {role.permissions.map((permission) => (
                  <span key={permission} style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)",
                    color: "#0ea5e9",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    border: "1px solid rgba(14, 165, 233, 0.2)"
                  }}>
                    {permission}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="modules" style={{
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <SectionHeader
          eyebrow="System modules"
          title="13+ Integrated Modules"
          text="Each module is fully functional with dedicated workflows, permissions, and database collections. Explore any module to see the complete feature set."
          align="center"
        />
        <div className="module-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px"
        }}>
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>

      <section className="section shop-section" style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)",
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <SectionHeader 
          eyebrow="Marketplace" 
          title="Pet Shop E-Commerce Hub" 
          text="Browse premium pet products with real-time inventory, ratings, and seller information."
        />
        <div className="category-pills" style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "2.5rem"
        }}>
          {["All", "Dog", "Cat", "Health devices", "Low stock"].map((item, index) => (
            <button 
              key={item} 
              className={index === 0 ? "active" : ""}
              style={{
                minWidth: "80px",
                height: "44px",
                padding: "0 18px",
                borderRadius: "12px",
                background: index === 0 ? "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" : "#f2f0f6",
                color: index === 0 ? "white" : "#0f0f1f",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: index === 0 ? "0 8px 20px rgba(14, 165, 233, 0.3)" : "none"
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="product-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "20px"
        }}>
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

      <section className="section advanced-section" style={{
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <SectionHeader
          eyebrow="Advanced features"
          title="Powered by Modern Technology"
          text="Real-time notifications, AI-driven insights, location services, advanced security, and seamless integrations make Pet Care a complete solution."
          align="center"
        />
        <div className="advanced-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px"
        }}>
          {advancedFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} style={{
                borderRadius: "16px",
                padding: "2rem",
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                border: "1px solid rgba(14, 165, 233, 0.2)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 50px rgba(14, 165, 233, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 15, 31, 0.08)";
              }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                  color: "white",
                  marginBottom: "1rem"
                }}>
                  <Icon size={28} />
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f0f1f", margin: "0 0 0.75rem 0" }}>
                  {feature.title}
                </h3>
                <p style={{ color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                  {feature.detail}
                </p>
              </article>
            );
          })}
        </div>
      </section>

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
        />
        <div className="testimonial-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "2rem"
        }}>
          {[
            { text: "Vaccination reminders, vet notes, QR records, and AI risk alerts are all visible and functional.", title: "Health Module" },
            { text: "Admin approval, blocking, reporting, analytics, and moderation dashboards are fully implemented.", title: "Admin Module" },
            { text: "Marketplace, adoption matching, community blogs, maps, and real-time notifications included.", title: "Service Modules" }
          ].map((item, index) => (
            <article key={index} className="testimonial-card" style={{
              borderRadius: "16px",
              padding: "2rem",
              background: "white",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              boxShadow: "0 4px 12px rgba(15, 15, 31, 0.08)",
              transition: "all 0.3s ease",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 20px 50px rgba(15, 15, 31, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 15, 31, 0.08)";
            }}>
              <p style={{
                color: "#64748b",
                lineHeight: 1.75,
                fontSize: "1rem",
                marginBottom: "1.5rem"
              }}>
                "{item.text}"
              </p>
              <strong style={{ color: "#0f0f1f", fontWeight: 800, fontSize: "1.1rem", display: "block", marginBottom: "0.5rem" }}>
                {item.title}
              </strong>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#64748b",
                fontWeight: 700,
                fontSize: "0.9rem"
              }}>
                <MapPin size={14} /> Pet Care Platform
              </span>
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

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQty={updateQty}
        removeItem={removeItem}
      />
    </>
  );
}
