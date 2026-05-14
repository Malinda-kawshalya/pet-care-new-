import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";

const emptyForm = { pet: "", title: "", description: "", adoptionFee: "", location: "" };

export default function Adoption() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [pets, setPets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [busyKey, setBusyKey] = useState("");

  const load = async () => {
    const [adoptionsResp, petsResp] = await Promise.all([api.get("/adoptions"), api.get("/pets")]);
    setItems(adoptionsResp.data.items || []);
    setPets(petsResp.data.items || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    await api.post("/adoptions", form);
    setForm(emptyForm);
    load();
  };

  const requestAdoption = async (id) => {
    setBusyKey(`request-${id}`);
    setMessage("");
    await api.post(`/adoptions/${id}/requests`, { message: "I would love to adopt this pet." });
    setMessage("Adoption request sent.");
    load();
    setBusyKey("");
  };

  const contactOwner = async (id) => {
    setBusyKey(`contact-${id}`);
    setMessage("");
    await api.post(`/adoptions/${id}/contact`, { message: "Interested in the adoption listing." });
    setMessage("Owner contacted.");
    load();
    setBusyKey("");
  };

  const respondToRequest = async (postId, requestId, status) => {
    setBusyKey(`${postId}-${requestId}-${status}`);
    setMessage("");
    await api.patch(`/adoptions/${postId}/requests/respond`, { requestId, status });
    setMessage(`Request ${status}.`);
    await load();
    setBusyKey("");
  };

  const userId = user?._id || user?.id;

  const myListings = useMemo(() => {
    if (!userId) return [];
    return items.filter((item) => String(item.postedBy?._id || item.postedBy) === String(userId));
  }, [items, userId]);

  const isOwnerOfListing = (item) => String(item.postedBy?._id || item.postedBy) === String(userId);

  const renderRequests = (item) => {
    if (!isOwnerOfListing(item) || !item.requests?.length) return null;
    return (
      <div className="request-list">
        <h4>Adoption requests</h4>
        {item.requests.map((request) => (
          <div key={request._id} className="request-item">
            <div>
              <strong>{request.user?.name || "Requester"}</strong>
              <p>{request.message || "No message"}</p>
              <p>Status: {request.status}</p>
            </div>
            <div className="button-row">
              <button
                className="primary-button compact"
                type="button"
                disabled={busyKey === `${item._id}-${request._id}-approved`}
                onClick={() => respondToRequest(item._id, request._id, "approved")}
              >
                Approve
              </button>
              <button
                className="ghost-button compact"
                type="button"
                disabled={busyKey === `${item._id}-${request._id}-rejected`}
                onClick={() => respondToRequest(item._id, request._id, "rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="section">
      <div className="module-detail-hero">
        <div>
          <p className="eyebrow">Adoption</p>
          <h1>Adoption listings and requests</h1>
          <p>List pets for adoption, review requests, and contact the owner without leaving the platform.</p>
        </div>
      </div>

      <div className="grid-two content-start">
        <form className="module-card" onSubmit={submit}>
          <h2>Create listing</h2>
          <select value={form.pet} onChange={(e) => setForm({ ...form, pet: e.target.value })} required>
            <option value="">Choose pet</option>
            {pets.map((pet) => <option key={pet._id} value={pet._id}>{pet.name}</option>)}
          </select>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea placeholder="Description" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Adoption fee" type="number" value={form.adoptionFee} onChange={(e) => setForm({ ...form, adoptionFee: e.target.value })} />
          <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <button className="primary-button" type="submit">Post adoption</button>
        </form>

        <div className="stack-gap">
          {message && <div className="community-alert success">{message}</div>}
          {items.map((item) => (
            <article key={item._id} className="module-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p>{item.pet?.name} • {item.location || "No location"} • {item.status}</p>
              <div className="button-row">
                <button className="ghost-button" type="button" onClick={() => requestAdoption(item._id)} disabled={busyKey === `request-${item._id}`}>
                  Request adoption
                </button>
                <button className="secondary-button" type="button" onClick={() => contactOwner(item._id)}>Contact owner</button>
              </div>
              {renderRequests(item)}
            </article>
          ))}
        </div>
      </div>

      {myListings.length > 0 && (
        <div className="section">
          <div className="module-detail-hero">
            <div>
              <p className="eyebrow">My listings</p>
              <h2>Review and confirm adoption requests</h2>
              <p>These posts were created by you, so you can approve or reject incoming requests.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}