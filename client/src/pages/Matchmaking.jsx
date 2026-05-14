import { useEffect, useState } from "react";
import api from "../services/api.js";

const defaultProfile = { isLooking: false, preferredBreed: "", preferredGender: "any", preferredAgeMin: "", preferredAgeMax: "", notes: "" };

export default function Matchmaking() {
  const [pets, setPets] = useState([]);
  const [myPets, setMyPets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [form, setForm] = useState(defaultProfile);

  const load = async () => {
    const [petsResp, myPetsResp, requestsResp] = await Promise.all([
      api.get("/match/pets"),
      api.get("/pets"),
      api.get("/match/requests")
    ]);
    setPets(petsResp.data.items || []);
    setMyPets(myPetsResp.data.items || []);
    setRequests(requestsResp.data.items || []);
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async () => {
    if (!selectedPet) return;
    await api.put(`/match/profile/${selectedPet}`, form);
    setForm(defaultProfile);
    load();
  };

  const sendRequest = async (requesterPet, targetPet) => {
    await api.post("/match/requests", { requesterPet, targetPet, message: "Would you like to match our pets?" });
    load();
  };

  const respond = async (id, status) => {
    await api.patch(`/match/requests/${id}/respond`, { status });
    load();
  };

  return (
    <div className="section">
      <div className="module-detail-hero">
        <div>
          <p className="eyebrow">Matchmaking</p>
          <h1>Safe pet matching</h1>
          <p>Publish a match profile, search compatible pets, and manage requests from one screen.</p>
        </div>
      </div>

      <div className="grid-two" style={{ alignItems: "start" }}>
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
            <h2>Compatible pets</h2>
            {pets.map((pet) => (
              <div key={pet._id} className="list-item">
                <div>
                  <strong>{pet.name}</strong>
                  <div>{pet.breed || pet.species} • {pet.gender}</div>
                </div>
                <button className="ghost-button" type="button" onClick={() => sendRequest(myPets[0]?._id, pet._id)} disabled={!myPets[0]}>Send request</button>
              </div>
            ))}
          </div>

          <div className="module-card">
            <h2>Requests</h2>
            {requests.map((request) => (
              <div key={request._id} className="list-item">
                <div>
                  <strong>{request.status}</strong>
                  <div>{request.message || "Match request"}</div>
                </div>
                <div className="button-row">
                  <button className="ghost-button" type="button" onClick={() => respond(request._id, "accepted")}>Accept</button>
                  <button className="danger-button" type="button" onClick={() => respond(request._id, "rejected")}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}