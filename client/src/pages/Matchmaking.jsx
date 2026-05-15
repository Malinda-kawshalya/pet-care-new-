import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import api from "../services/api.js";
import { DEFAULT_IMAGE_FALLBACK, getUploadUrl } from "../utils/media.js";

const defaultProfile = { isLooking: false, preferredBreed: "", preferredGender: "any", preferredAgeMin: "", preferredAgeMax: "", notes: "" };
const defaultApplication = {
  requesterPet: "",
  applicantName: "",
  applicantEmail: "",
  applicantPhone: "",
  meetingPreference: "publicPark",
  message: "",
  applicantNotes: ""
};

export default function Matchmaking() {
  const [pets, setPets] = useState([]);
  const [myPets, setMyPets] = useState([]);
  const [inboxRequests, setInboxRequests] = useState([]);
  const [outboxRequests, setOutboxRequests] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);
  const [requestTab, setRequestTab] = useState("inbox");
  const [form, setForm] = useState(defaultProfile);
  const [applicationForm, setApplicationForm] = useState(defaultApplication);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const load = async () => {
    const [petsResp, myPetsResp, inboxResp, outboxResp] = await Promise.all([
      api.get("/match/pets"),
      api.get("/pets"),
      api.get("/match/requests", { params: { type: "inbox" } }),
      api.get("/match/requests", { params: { type: "outbox" } })
    ]);
    setPets(petsResp.data.items || []);
    setMyPets(myPetsResp.data.items || []);
    setInboxRequests(inboxResp.data.items || []);
    setOutboxRequests(outboxResp.data.items || []);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (user) {
      setApplicationForm((prev) => ({
        ...prev,
        applicantName: user.name || prev.applicantName,
        applicantEmail: user.email || prev.applicantEmail,
        applicantPhone: user.phone || prev.applicantPhone
      }));
    }
  }, [user]);

  const saveProfile = async () => {
    if (!selectedPet) return;
    await api.put(`/match/profile/${selectedPet}`, form);
    setForm(defaultProfile);
    load();
  };

  const openApplication = (listing) => {
    setSelectedListing(listing);
    setApplicationForm((prev) => ({
      ...defaultApplication,
      requesterPet: myPets[0]?._id || "",
      applicantName: user?.name || prev.applicantName,
      applicantEmail: user?.email || prev.applicantEmail,
      applicantPhone: user?.phone || prev.applicantPhone
    }));
  };

  const sendRequest = async (event) => {
    event.preventDefault();
    if (!selectedListing) return;
    setLoading(true);
    setMessage("");
    try {
      await api.post("/match/requests", {
        ...applicationForm,
        targetPet: selectedListing._id
      });
      setSelectedListing(null);
      setMessage("Request sent to the listing owner.");
      await load();
    } catch (submitError) {
      setMessage(submitError.response?.data?.message || "Unable to send request right now.");
    } finally {
      setLoading(false);
    }
  };

  const respond = async (id, status) => {
    await api.patch(`/match/requests/${id}/respond`, { status });
    load();
  };

  const visibleRequests = useMemo(() => (requestTab === "inbox" ? inboxRequests : outboxRequests), [requestTab, inboxRequests, outboxRequests]);

  return (
    <div className="section match-page">
      <div className="module-detail-hero">
        <div>
          <p className="eyebrow">Find a mate</p>
          <h1>Browse active listings and send a proper application.</h1>
          <p>Pet owners and pet shops can publish a match profile, and interested users can apply with their own pet details.</p>
        </div>
      </div>

      <div className="grid-two content-start">
        <div className="module-card">
          <h2>Match profile</h2>
          <select value={selectedPet} onChange={(e) => setSelectedPet(e.target.value)}>
            <option value="">Choose my pet</option>
            {myPets.map((pet) => <option key={pet._id} value={pet._id}>{pet.name}</option>)}
          </select>
          <label>Looking for matches</label>
          <select value={String(form.isLooking)} onChange={(e) => setForm({ ...form, isLooking: e.target.value === "true" })}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
          <label>Preferred breed</label>
          <input value={form.preferredBreed} onChange={(e) => setForm({ ...form, preferredBreed: e.target.value })} />
          <label>Preferred gender</label>
          <select value={form.preferredGender} onChange={(e) => setForm({ ...form, preferredGender: e.target.value })}>
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <div className="grid-two">
            <input placeholder="Min age" type="number" value={form.preferredAgeMin} onChange={(e) => setForm({ ...form, preferredAgeMin: e.target.value })} />
            <input placeholder="Max age" type="number" value={form.preferredAgeMax} onChange={(e) => setForm({ ...form, preferredAgeMax: e.target.value })} />
          </div>
          <textarea rows="4" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="primary-button" onClick={saveProfile} type="button">Save profile</button>
        </div>

        <div className="stack-gap">
          <div className="module-card">
            <div className="section-heading-row">
              <div>
                <h2>Active listings</h2>
                <p>Only pets marked as looking for a mate are shown here.</p>
              </div>
              <span className="section-count">{pets.length} listings</span>
            </div>
            <div className="match-listing-grid">
              {pets.map((pet) => (
                <article key={pet._id} className="match-listing-card">
                  <img src={getUploadUrl(pet.images?.[0], DEFAULT_IMAGE_FALLBACK)} alt={pet.name} />
                  <div className="match-card-body">
                    <div>
                      <strong>{pet.name}</strong>
                      <p>{pet.breed || pet.species} • {pet.gender} • {pet.location?.city || "No city listed"}</p>
                    </div>
                    <p className="match-card-notes">{pet.matchProfile?.notes || "Open for compatible introductions."}</p>
                    <button className="ghost-button" type="button" onClick={() => openApplication(pet)} disabled={!myPets.length}>
                      Apply to meet
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="module-card">
            <div className="section-heading-row">
              <div>
                <h2>Requests</h2>
                <p>Review incoming applications and track sent requests.</p>
              </div>
              <div className="tab-switcher">
                <button type="button" className={requestTab === "inbox" ? "active" : ""} onClick={() => setRequestTab("inbox")}>Inbox</button>
                <button type="button" className={requestTab === "outbox" ? "active" : ""} onClick={() => setRequestTab("outbox")}>Sent</button>
              </div>
            </div>
            {visibleRequests.map((request) => (
              <div key={request._id} className="list-item match-request-item">
                <div>
                  <strong>{request.applicantName || request.requesterPet?.owner?.name || request.requesterPet?.name}</strong>
                  <div>{request.message || "Match request"}</div>
                  <small>{request.applicantEmail || request.requesterPet?.owner?.email || ""}</small>
                </div>
                {requestTab === "inbox" ? (
                  <div className="button-row">
                    <button className="ghost-button" type="button" onClick={() => respond(request._id, "accepted")}>Accept</button>
                    <button className="danger-button" type="button" onClick={() => respond(request._id, "rejected")}>Reject</button>
                  </div>
                ) : (
                  <span className="request-status">{request.status}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedListing && (
        <div className="request-modal-backdrop" onClick={() => setSelectedListing(null)}>
          <div className="request-modal" onClick={(event) => event.stopPropagation()}>
            <div className="request-modal-head">
              <div>
                <p className="eyebrow">Apply to meet</p>
                <h3>{selectedListing.name}</h3>
              </div>
              <button type="button" className="ghost-button" onClick={() => setSelectedListing(null)}>Close</button>
            </div>
            <form className="request-form" onSubmit={sendRequest}>
              <label>
                Your pet
                <select value={applicationForm.requesterPet} onChange={(event) => setApplicationForm({ ...applicationForm, requesterPet: event.target.value })} required>
                  <option value="">Choose a pet</option>
                  {myPets.map((pet) => <option key={pet._id} value={pet._id}>{pet.name}</option>)}
                </select>
              </label>
              <div className="split-fields">
                <label>
                  Name
                  <input value={applicationForm.applicantName} onChange={(event) => setApplicationForm({ ...applicationForm, applicantName: event.target.value })} required />
                </label>
                <label>
                  Email
                  <input type="email" value={applicationForm.applicantEmail} onChange={(event) => setApplicationForm({ ...applicationForm, applicantEmail: event.target.value })} required />
                </label>
              </div>
              <div className="split-fields">
                <label>
                  Phone
                  <input value={applicationForm.applicantPhone} onChange={(event) => setApplicationForm({ ...applicationForm, applicantPhone: event.target.value })} />
                </label>
                <label>
                  Meeting preference
                  <select value={applicationForm.meetingPreference} onChange={(event) => setApplicationForm({ ...applicationForm, meetingPreference: event.target.value })}>
                    <option value="publicPark">Public park</option>
                    <option value="clinic">Vet clinic</option>
                    <option value="homeVisit">Home visit</option>
                  </select>
                </label>
              </div>
              <label>
                Message
                <textarea rows="4" value={applicationForm.message} onChange={(event) => setApplicationForm({ ...applicationForm, message: event.target.value })} placeholder="Introduce your pet and explain why the pair could be a good match." />
              </label>
              <label>
                Additional notes
                <textarea rows="3" value={applicationForm.applicantNotes} onChange={(event) => setApplicationForm({ ...applicationForm, applicantNotes: event.target.value })} placeholder="Temperament, availability, or special care notes." />
              </label>
              <div className="button-row">
                <button className="primary-button" type="submit" disabled={loading}>{loading ? "Sending..." : "Send application"}</button>
                <button className="ghost-button" type="button" onClick={() => setSelectedListing(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {message && <div className="form-alert success match-feedback">{message}</div>}
    </div>
  );
}