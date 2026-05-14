import { useEffect, useState } from "react";
import api from "../services/api.js";

const emptyForm = { pet: "", title: "", description: "", adoptionFee: "", location: "" };

export default function Adoption() {
  const [items, setItems] = useState([]);
  const [pets, setPets] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const [adoptionsResp, petsResp] = await Promise.all([api.get("/adoptions"), api.get("/pets")]);
    setItems(adoptionsResp.data.items || []);
    setPets(petsResp.data.items || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post("/adoptions", form);
    setForm(emptyForm);
    load();
  };

  const requestAdoption = async (id) => {
    await api.post(`/adoptions/${id}/requests`, { message: "I would love to adopt this pet." });
    load();
  };

  const contactOwner = async (id) => {
    await api.post(`/adoptions/${id}/contact`, { message: "Interested in the adoption listing." });
    load();
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
          {items.map((item) => (
            <article key={item._id} className="module-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p>{item.pet?.name} • {item.location || "No location"} • {item.status}</p>
              <div className="button-row">
                <button className="ghost-button" type="button" onClick={() => requestAdoption(item._id)}>Request adoption</button>
                <button className="secondary-button" type="button" onClick={() => contactOwner(item._id)}>Contact owner</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}