import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import api from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { getUploadUrl } from "../utils/media.js";

const initialFilters = {
  q: "",
  status: "",
  breed: "",
  location: "",
  minFee: "",
  maxFee: "",
  sort: "latest"
};

function normalizeStatus(status) {
  if (status === "open") return "open";
  if (status === "pendingApproval") return "pending";
  if (status === "closed") return "closed";
  return "pending";
}

function statusLabel(status) {
  if (status === "pendingApproval") return "Pending";
  return status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : "Pending";
}

export default function Adoption() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [message, setMessage] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");
  const [requestTarget, setRequestTarget] = useState(null);
  const [requestForm, setRequestForm] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    applicantAddress: "",
    homeType: "",
    experience: "",
    message: ""
  });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const navigate = useNavigate();

  const breeds = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.pet?.breed).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const locations = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.location).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filteredItems = useMemo(() => {
    const term = filters.q.trim().toLowerCase();
    const minFee = filters.minFee === "" ? null : Number(filters.minFee);
    const maxFee = filters.maxFee === "" ? null : Number(filters.maxFee);

    const result = items.filter((item) => {
      const fee = Number(item.adoptionFee || 0);
      const status = item.status || "";
      const breed = item.pet?.breed || "";
      const location = item.location || "";
      const searchable = [item.title, item.description, item.pet?.name, breed, location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (term && !searchable.includes(term)) return false;
      if (filters.status && status !== filters.status) return false;
      if (filters.breed && breed !== filters.breed) return false;
      if (filters.location && location !== filters.location) return false;
      if (minFee !== null && Number.isFinite(minFee) && fee < minFee) return false;
      if (maxFee !== null && Number.isFinite(maxFee) && fee > maxFee) return false;

      return true;
    });

    result.sort((a, b) => {
      if (filters.sort === "feeAsc") return Number(a.adoptionFee || 0) - Number(b.adoptionFee || 0);
      if (filters.sort === "feeDesc") return Number(b.adoptionFee || 0) - Number(a.adoptionFee || 0);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return result;
  }, [items, filters]);

  const load = async () => {
    setLoading(true);
    try {
      const adoptionsResp = await api.get("/adoptions");
      setItems(adoptionsResp.data.items || []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Failed to load adoption data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resolvePetImage = (item) => {
    const image = item?.pet?.images?.[0] || item?.images?.[0] || item?.photo;
    return getUploadUrl(image, "https://images.unsplash.com/photo-1615751072497-5f5169febe17?auto=format&fit=crop&w=640&q=85");
  };

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const openRequestForm = (item) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setError("");
    setMessage("");
    setRequestTarget(item);
    setRequestForm((current) => ({
      ...current,
      applicantName: current.applicantName || "",
      applicantEmail: current.applicantEmail || "",
      applicantPhone: current.applicantPhone || "",
      applicantAddress: current.applicantAddress || "",
      homeType: current.homeType || "",
      experience: current.experience || "",
      message: `I would love to adopt ${item.pet?.name || item.title}.`
    }));
  };

  const closeRequestForm = () => {
    setRequestTarget(null);
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    if (!requestTarget) return;

    setRequestSubmitting(true);
    setBusyKey(`request-${requestTarget._id}`);
    setMessage("");
    setError("");

    try {
      await api.post(`/adoptions/${requestTarget._id}/requests`, requestForm);
      setMessage("Adoption request sent.");
      closeRequestForm();
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to send adoption request.");
    } finally {
      setBusyKey("");
      setRequestSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="module-detail-hero">
        <div>
          <p className="eyebrow">Adoption</p>
          <h1>Browse pets available for adoption</h1>
          <p>Filter by status, breed, location, and adoption fee, then request in one click.</p>
        </div>
      </div>

      {message && <div className="community-alert success">{message}</div>}
      {error && <div className="community-alert error"><CircleAlert size={16} /> {error}</div>}

      <div className="product-filters-row adoption-filters-row">
        <input
          className="product-filter-search"
          placeholder="Search by title, pet, breed, or location"
          value={filters.q}
          onChange={(event) => updateFilter("q", event.target.value)}
        />
        <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="pendingApproval">Pending</option>
          <option value="closed">Closed</option>
        </select>
        <select value={filters.breed} onChange={(event) => updateFilter("breed", event.target.value)}>
          <option value="">All breeds</option>
          {breeds.map((breed) => <option key={breed} value={breed}>{breed}</option>)}
        </select>
        <select value={filters.location} onChange={(event) => updateFilter("location", event.target.value)}>
          <option value="">All locations</option>
          {locations.map((location) => <option key={location} value={location}>{location}</option>)}
        </select>
        <input
          className="product-filter-mini"
          placeholder="Min"
          value={filters.minFee}
          onChange={(event) => updateFilter("minFee", event.target.value)}
          inputMode="numeric"
        />
        <input
          className="product-filter-mini"
          placeholder="Max"
          value={filters.maxFee}
          onChange={(event) => updateFilter("maxFee", event.target.value)}
          inputMode="numeric"
        />
        <select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>
          <option value="latest">Newest</option>
          <option value="feeAsc">Fee: low to high</option>
          <option value="feeDesc">Fee: high to low</option>
        </select>
        <button type="button" className="ghost-button compact" onClick={clearFilters}>Clear filters</button>
      </div>

      {loading && <p>Loading...</p>}

      <div className="product-grid product-grid-market adoption-product-grid">
        {filteredItems.map((item) => (
          <article key={item._id} className="product-card adoption-product-card">
            <div className="product-card-image">
              <img src={resolvePetImage(item)} alt={item.pet?.name || item.title} />
            </div>

            <div className="product-card-body">
              <span className={`product-card-badge adoption-status-badge ${normalizeStatus(item.status)}`}>
                {statusLabel(item.status)}
              </span>

              <h3>{item.title}</h3>

              <div className="product-card-footer">
                <span className="product-card-price">${Number(item.adoptionFee || 0).toFixed(0)}</span>
                <span className="adoption-card-location">{item.location || "No location"}</span>
              </div>

              <div className="adoption-card-detail">
                {(item.pet?.name || "Pet")}
                {item.pet?.breed ? ` • ${item.pet.breed}` : ""}
                {item.pet?.age != null ? ` • ${item.pet.age}y` : ""}
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() => openRequestForm(item)}
                disabled={busyKey === `request-${item._id}`}
              >
                Request adoption
              </button>
            </div>
          </article>
        ))}
      </div>

      {requestTarget && (
        <div className="request-modal-backdrop" onClick={closeRequestForm} role="presentation">
          <div className="request-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="adoption-request-title">
            <div className="request-modal-header">
              <div>
                <p className="eyebrow">Adoption request</p>
                <h2 id="adoption-request-title">Tell the owner about yourself</h2>
              </div>
              <button className="ghost-button compact" type="button" onClick={closeRequestForm}>Close</button>
            </div>

            <form className="request-modal-form" onSubmit={submitRequest}>
              <div className="split-fields">
                <input
                  required
                  placeholder="Full name"
                  value={requestForm.applicantName}
                  onChange={(event) => setRequestForm({ ...requestForm, applicantName: event.target.value })}
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={requestForm.applicantEmail}
                  onChange={(event) => setRequestForm({ ...requestForm, applicantEmail: event.target.value })}
                />
              </div>
              <div className="split-fields">
                <input
                  required
                  placeholder="Phone"
                  value={requestForm.applicantPhone}
                  onChange={(event) => setRequestForm({ ...requestForm, applicantPhone: event.target.value })}
                />
                <input
                  placeholder="Home type"
                  value={requestForm.homeType}
                  onChange={(event) => setRequestForm({ ...requestForm, homeType: event.target.value })}
                />
              </div>
              <input
                placeholder="Address"
                value={requestForm.applicantAddress}
                onChange={(event) => setRequestForm({ ...requestForm, applicantAddress: event.target.value })}
              />
              <textarea
                rows={3}
                placeholder="Pet experience and why you want to adopt"
                value={requestForm.experience}
                onChange={(event) => setRequestForm({ ...requestForm, experience: event.target.value })}
              />
              <textarea
                rows={4}
                required
                placeholder="Message to the pet owner"
                value={requestForm.message}
                onChange={(event) => setRequestForm({ ...requestForm, message: event.target.value })}
              />
              <div className="request-modal-actions">
                <button className="primary-button" type="submit" disabled={requestSubmitting}>
                  {requestSubmitting ? "Sending..." : "Send request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!loading && !filteredItems.length && <p className="muted-text top-gap-16">No matching listings found.</p>}
      {!loading && !!items.length && <p className="muted-text top-gap-16">Showing {filteredItems.length} of {items.length} listings.</p>}
    </section>
  );
}