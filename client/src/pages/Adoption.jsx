import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { getUploadUrl } from "../utils/media.js";

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

export default function Adoption() {
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

  const resolvePetImage = (item) => {
    const image = item?.pet?.images?.[0] || item?.images?.[0] || item?.photo;
    return getUploadUrl(image, "https://images.unsplash.com/photo-1615751072497-5f5169febe17?auto=format&fit=crop&w=640&q=85");
  };

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

      await api.post("/adoptions", {
        ...form,
        pet: petId,
        adoptionFee: form.adoptionFee === "" ? 0 : Number(form.adoptionFee)
      });

      setForm(emptyForm);
      setPetForm(emptyPetForm);
      setMessage("Adoption listing created and submitted for review.");
      await load();
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || "Failed to create adoption listing.");
    }
  };

  const requestAdoption = async (id) => {
    setBusyKey(`request-${id}`);
    setMessage("");
    setError("");
    try {
      await api.post(`/adoptions/${id}/requests`, { message: "I would love to adopt this pet." });
      setMessage("Adoption request sent.");
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to send adoption request.");
    } finally {
      setBusyKey("");
    }
  };

  const contactOwner = async (id) => {
    setBusyKey(`contact-${id}`);
    setMessage("");
    setError("");
    try {
      await api.post(`/adoptions/${id}/contact`, { message: "Interested in the adoption listing." });
      setMessage("Owner contacted.");
      await load();
    } catch (contactError) {
      setError(contactError.response?.data?.message || "Failed to contact owner.");
    } finally {
      setBusyKey("");
    }
  };

  const respondToRequest = async (postId, requestId, status) => {
    setBusyKey(`${postId}-${requestId}-${status}`);
    setMessage("");
    setError("");
    try {
      await api.patch(`/adoptions/${postId}/requests/respond`, { requestId, status });
      setMessage(`Request ${status}.`);
      await load();
    } catch (respondError) {
      setError(respondError.response?.data?.message || "Failed to update request.");
    } finally {
      setBusyKey("");
    }
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

          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={createPetForListing}
              onChange={(event) => setCreatePetForListing(event.target.checked)}
            />
            Create a new pet for this listing
          </label>

          {!createPetForListing && (
            <select value={form.pet} onChange={(e) => setForm({ ...form, pet: e.target.value })} required>
              <option value="">Choose pet</option>
              {pets.map((pet) => <option key={pet._id} value={pet._id}>{pet.name}</option>)}
            </select>
          )}

          {createPetForListing && (
            <div className="stack-gap">
              <h3 style={{ margin: 0 }}>Pet details</h3>
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
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {petForm.images.map((image, index) => (
                  <div key={`${image}-${index}`} style={{ position: "relative", width: 72, height: 72 }}>
                    <img
                      src={getUploadUrl(image)}
                      alt="Pet"
                      style={{ width: "100%", height: "100%", borderRadius: 8, objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      className="ghost-button compact"
                      style={{ position: "absolute", top: 2, right: 2, padding: "0 6px", minHeight: "auto" }}
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
          <button className="primary-button" type="submit">Post adoption</button>
        </form>

        <div className="stack-gap">
          {message && <div className="community-alert success">{message}</div>}
          {error && <div className="community-alert error">{error}</div>}
          {items.map((item) => (
            <article key={item._id} className="module-card">
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <img
                  src={resolvePetImage(item)}
                  alt={item.pet?.name || item.title}
                  style={{ width: 96, height: 96, borderRadius: 12, objectFit: "cover", flexShrink: 0 }}
                />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <p>
                    {item.pet?.name || "Pet"}
                    {item.pet?.breed ? ` • ${item.pet.breed}` : ""}
                    {item.pet?.age != null ? ` • ${item.pet.age}y` : ""}
                  </p>
                  <p>{item.location || "No location"} • {item.status} • Fee: ${item.adoptionFee || 0}</p>
                </div>
              </div>
              <div className="button-row">
                {!isOwnerOfListing(item) && (
                  <button className="ghost-button" type="button" onClick={() => requestAdoption(item._id)} disabled={busyKey === `request-${item._id}`}>
                    Request adoption
                  </button>
                )}
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