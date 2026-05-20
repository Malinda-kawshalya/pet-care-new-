import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { getUploadUrl } from "../utils/media.js";
import DashboardSidebar from "../components/DashboardSidebar.jsx";

const emptyForm = { pet: "", title: "", description: "", adoptionFee: "", location: "" };
const emptyPetForm = {
  name: "",
  species: "dog",
  breed: "",
  age: "",
  gender: "unknown",
  vaccinationStatus: "unknown",
  medicalHistory: "",
  images: []
};

export default function AdoptionForm({ embedded = false }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [pets, setPets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [createPetForListing, setCreatePetForListing] = useState(false);
  const [petForm, setPetForm] = useState(emptyPetForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");

  const load = async () => {
    try {
      const [adoptionsResp, petsResp] = await Promise.all([api.get("/adoptions"), api.get("/pets")]);
      const petItems = petsResp.data.items || [];
      setItems(adoptionsResp.data.items || []);
      setPets(petItems);
      if (!petItems.length) {
        setCreatePetForListing(true);
      }
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Failed to load adoption data.");
    }
  };

  useEffect(() => { load(); }, []);

  const uploadPetImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    setError("");

    try {
      setUploadingImage(true);
      const response = await api.post("/uploads", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const path = response.data.file?.path || response.data.file?.filename;
      if (path) {
        setPetForm((current) => ({ ...current, images: [...current.images, path] }));
      }
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const removePetImage = (index) => {
    setPetForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index)
    }));
  };

  const createPetFromForm = async () => {
    if (!petForm.name.trim()) {
      throw new Error("Pet name is required when creating a new pet.");
    }

    const payload = {
      ...petForm,
      name: petForm.name.trim(),
      breed: petForm.breed.trim(),
      medicalHistory: petForm.medicalHistory.trim(),
      age: petForm.age === "" ? undefined : Number(petForm.age)
    };

    const { data } = await api.post("/pets", payload);
    return data.item;
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      let petId = form.pet;

      if (createPetForListing) {
        const createdPet = await createPetFromForm();
        petId = createdPet?._id;
      }

      if (!petId) {
        throw new Error("Please select or create a pet for this listing.");
      }

      const payload = {
        ...form,
        pet: petId,
        adoptionFee: form.adoptionFee === "" ? 0 : Number(form.adoptionFee)
      };

      if (editingId) {
        await api.put(`/adoptions/${editingId}`, payload);
      } else {
        await api.post("/adoptions", payload);
      }

      setForm(emptyForm);
      setEditingId("");
      setPetForm(emptyPetForm);
      setCreatePetForListing(false);
      setMessage(editingId ? "Adoption listing updated." : "Adoption listing created and submitted for review.");
      await load();
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || "Failed to save adoption listing.");
    }
  };

  const userId = user?._id || user?.id;

  const myListings = useMemo(() => {
    if (!userId) return [];
    return items.filter((item) => String(item.postedBy?._id || item.postedBy) === String(userId));
  }, [items, userId]);

  const isOwnerOfListing = (item) => String(item.postedBy?._id || item.postedBy) === String(userId);

  const statusLabel = (status) => {
    const labels = {
      open: "Open",
      pendingApproval: "Pending approval",
      adopted: "Adopted",
      closed: "Closed",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected"
    };
    return labels[status] || status || "Unknown";
  };

  const statusTone = (status) => {
    if (status === "open" || status === "approved") return "open";
    if (status === "pendingApproval" || status === "pending") return "pending";
    return "closed";
  };

  const requestSummary = (item) => {
    const requests = item.requests || [];
    return {
      total: requests.length,
      pending: requests.filter((request) => request.status === "pending").length,
      approved: requests.filter((request) => request.status === "approved").length,
      rejected: requests.filter((request) => request.status === "rejected").length
    };
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setCreatePetForListing(false);
    setForm({
      pet: item.pet?._id || item.pet || "",
      title: item.title || "",
      description: item.description || "",
      adoptionFee: item.adoptionFee ?? "",
      location: item.location || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId("");
    setForm(emptyForm);
    setCreatePetForListing(!pets.length);
  };

  const deleteListing = async (item) => {
    if (!window.confirm(`Delete adoption post "${item.title}"?`)) return;
    setBusyKey(`delete-${item._id}`);
    setError("");

    try {
      await api.delete(`/adoptions/${item._id}`);
      setMessage("Adoption listing deleted.");
      if (editingId === item._id) cancelEdit();
      await load();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Failed to delete adoption listing.");
    } finally {
      setBusyKey("");
    }
  };

  const respondToRequest = async (itemId, requestId, status) => {
    const action = status === "approved" ? "approve" : "decline";
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;

    const busyId = `${itemId}-${requestId}-${status}`;
    setBusyKey(busyId);
    setError("");

    try {
      await api.patch(`/adoptions/${itemId}/requests/respond`, { requestId, status });
      setMessage(`Request ${action}d.`);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Failed to ${action} request.`);
    } finally {
      setBusyKey("");
    }
  };

  const renderRequests = (item) => {
    if (!isOwnerOfListing(item)) return null;
    if (!item.requests?.length) {
      return (
        <div className="request-list">
          <h4>Requester details</h4>
          <p className="adoption-muted-note">No adoption requests yet.</p>
        </div>
      );
    }

    return (
      <div className="request-list">
        <h4>Requester details</h4>
        {item.requests.map((request) => (
          <div key={request._id} className="request-item">
            <div className="request-item-body">
              <div className="request-item-header">
                <strong>{request.applicantName || request.user?.name || "Requester"}</strong>
                <span className={`adoption-status-badge ${statusTone(request.status)}`}>
                  {statusLabel(request.status)}
                </span>
              </div>
              <div className="request-detail-grid">
                <span>Email</span>
                <strong>{request.applicantEmail || request.user?.email || "No email provided"}</strong>
                <span>Phone</span>
                <strong>{request.applicantPhone || request.user?.phone || "No phone provided"}</strong>
                <span>Address</span>
                <strong>{request.applicantAddress || request.user?.address || "No address provided"}</strong>
                <span>Home type</span>
                <strong>{request.homeType || "Not provided"}</strong>
                <span>Experience</span>
                <strong>{request.experience || "Not provided"}</strong>
              </div>
              <p><strong>Message:</strong> {request.message || "No message"}</p>
              <div className="request-item-actions">
                <button
                  type="button"
                  className="primary-button compact"
                  onClick={() => respondToRequest(item._id, request._id, "approved")}
                  disabled={busyKey === `${item._id}-${request._id}-approved` || request.status !== "pending"}
                >
                  Approve request
                </button>
                <button
                  type="button"
                  className="ghost-button compact"
                  onClick={() => respondToRequest(item._id, request._id, "rejected")}
                  disabled={busyKey === `${item._id}-${request._id}-rejected` || request.status !== "pending"}
                >
                  Decline request
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const content = (
      <div className={embedded ? "admin-main-modern" : "dashboard-container"}>
        <div className="module-detail-hero">
          <div>
            <p className="eyebrow">Adoption form</p>
            <h1>{editingId ? "Edit adoption listing" : "Create adoption listings"}</h1>
            <p>Publish a pet for adoption from your dashboard and review any requests on your own listings.</p>
          </div>
        </div>

        {message && <div className="community-alert success">{message}</div>}
        {error && <div className="community-alert error">{error}</div>}

        <div className="adoption-layout">
          <div className="adoption-form-wrap">
            <form className="module-card adoption-form-card" onSubmit={submit}>
              <div className="adoption-form-head">
                <h2>{editingId ? "Update listing" : "Create listing"}</h2>
                <p>Post a pet with clear details so adopters can decide quickly.</p>
              </div>

              {!editingId && <label className="adoption-check-toggle">
                <input
                  type="checkbox"
                  checked={createPetForListing}
                  onChange={(event) => setCreatePetForListing(event.target.checked)}
                />
                Create a new pet for this listing
              </label>}

              {!createPetForListing && (
                <select value={form.pet} onChange={(e) => setForm({ ...form, pet: e.target.value })} required>
                  <option value="">Choose pet</option>
                  {pets.map((pet) => <option key={pet._id} value={pet._id}>{pet.name}</option>)}
                </select>
              )}

              {createPetForListing && (
                <div className="stack-gap adoption-pet-details">
                  <h3>Pet details</h3>
                  <input
                    placeholder="Pet name"
                    value={petForm.name}
                    onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                    required
                  />
                  <div className="split-fields">
                    <select value={petForm.species} onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}>
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="bird">Bird</option>
                      <option value="fish">Fish</option>
                      <option value="rabbit">Rabbit</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      placeholder="Breed"
                      value={petForm.breed}
                      onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                    />
                  </div>
                  <div className="split-fields">
                    <input
                      type="number"
                      min="0"
                      placeholder="Age"
                      value={petForm.age}
                      onChange={(e) => setPetForm({ ...petForm, age: e.target.value })}
                    />
                    <select value={petForm.gender} onChange={(e) => setPetForm({ ...petForm, gender: e.target.value })}>
                      <option value="unknown">Unknown</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <select
                    value={petForm.vaccinationStatus}
                    onChange={(e) => setPetForm({ ...petForm, vaccinationStatus: e.target.value })}
                  >
                    <option value="unknown">Vaccination unknown</option>
                    <option value="upToDate">Up to date</option>
                    <option value="dueSoon">Due soon</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <textarea
                    placeholder="Medical notes"
                    rows="3"
                    value={petForm.medicalHistory}
                    onChange={(e) => setPetForm({ ...petForm, medicalHistory: e.target.value })}
                  />
                  <input type="file" accept="image/*" onChange={uploadPetImage} disabled={uploadingImage} />
                  <div className="adoption-image-preview-grid">
                    {petForm.images.map((image, index) => (
                      <div key={`${image}-${index}`} className="adoption-image-preview">
                        <img src={getUploadUrl(image)} alt="Pet" />
                        <button
                          type="button"
                          className="ghost-button compact adoption-image-remove"
                          onClick={() => removePetImage(index)}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <textarea placeholder="Description" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <input placeholder="Adoption fee" type="number" value={form.adoptionFee} onChange={(e) => setForm({ ...form, adoptionFee: e.target.value })} />
              <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <div className="inline-actions">
                <button className="primary-button adoption-submit" type="submit">
                  {editingId ? "Update adoption" : "Post adoption"}
                </button>
                {editingId && (
                  <button className="ghost-button" type="button" onClick={cancelEdit}>
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="adoption-list-wrap">
            <div className="module-detail-hero adoption-my-listings-hero">
              <div>
                <p className="eyebrow">My listings</p>
                <h2>Manage adoption posts</h2>
                <p>View post status, requester details, update listings, and delete adoption posts you created.</p>
              </div>
            </div>
            {myListings.length === 0 ? (
              <div className="module-card adoption-empty-state">
                <h3>No adoption posts yet</h3>
                <p>Create an adoption listing to see edit, delete, request status, and requester details here.</p>
              </div>
            ) : (
              <div className="adoption-list-grid">
                {myListings.map((item) => {
                  const summary = requestSummary(item);
                  return (
                    <article key={item._id} className="module-card adoption-list-card">
                      <div className="adoption-list-card-head">
                        <img
                          src={getUploadUrl(item?.pet?.images?.[0] || item?.images?.[0] || item?.photo, "https://images.unsplash.com/photo-1615751072497-5f5169febe17?auto=format&fit=crop&w=640&q=85")}
                          alt={item.pet?.name || item.title}
                          className="adoption-list-image"
                        />
                        <div className="adoption-owner-listing-body">
                          <div className="adoption-list-topline">
                            <h3>{item.title}</h3>
                            <span className={`adoption-status-badge ${statusTone(item.status)}`}>
                              {statusLabel(item.status)}
                            </span>
                          </div>
                          <p className="adoption-list-description">{item.description || "No description provided."}</p>
                          <div className="adoption-owner-meta">
                            <span>Pet: <strong>{item.pet?.name || "Selected pet"}</strong></span>
                            <span>Location: <strong>{item.location || "No location"}</strong></span>
                            <span>Fee: <strong>${item.adoptionFee || 0}</strong></span>
                          </div>
                          <div className="adoption-request-summary">
                            <span>Requested: <strong>{summary.total}</strong></span>
                            <span>Pending: <strong>{summary.pending}</strong></span>
                            <span>Approved: <strong>{summary.approved}</strong></span>
                            <span>Rejected: <strong>{summary.rejected}</strong></span>
                          </div>
                          <div className="inline-actions adoption-owner-actions">
                            <button type="button" className="primary-button compact" onClick={() => startEdit(item)}>
                              Edit adoption
                            </button>
                            <button
                              type="button"
                              className="danger-button compact"
                              onClick={() => deleteListing(item)}
                              disabled={busyKey === `delete-${item._id}`}
                            >
                              Delete adoption
                            </button>
                          </div>
                        </div>
                      </div>
                      {renderRequests(item)}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
  );

  if (embedded) return content;

  return (
    <div className="dashboard-with-sidebar">
      <DashboardSidebar />
      {content}
    </div>
  );
}
