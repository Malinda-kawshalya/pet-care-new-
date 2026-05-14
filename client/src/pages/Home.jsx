import { useEffect, useState } from "react";
import { ArrowRight, Check, MapPin, Play, ShieldCheck } from "lucide-react";
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
const petShopImage = "https://images.unsplash.com/photo-1587300411107-ec76756b9c6c?auto=format&fit=crop&w=1200&q=85";
const adoptionImage = "https://images.unsplash.com/photo-1615751072497-5f5169febe17?auto=format&fit=crop&w=1200&q=85";

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
              onAdd={(item) => addItem(item, 1)}
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
    </>
  );
}
