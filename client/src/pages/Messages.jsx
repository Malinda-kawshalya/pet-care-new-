import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function Messages() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ receiver: "", body: "", relatedPet: "" });

  const load = async () => {
    const messagesResp = await api.get("/messages");
    setItems(messagesResp.data.items || []);
  };

  useEffect(() => { load(); }, []);

  const send = async (event) => {
    event.preventDefault();
    await api.post("/messages", form);
    setForm({ receiver: "", body: "", relatedPet: "" });
    load();
  };

  return (
    <div className="section">
      <div className="module-detail-hero">
        <div>
          <p className="eyebrow">Messaging</p>
          <h1>Direct conversation</h1>
          <p>Send messages tied to adoption, matching, or support conversations.</p>
        </div>
      </div>

      <div className="grid-two content-start">
        <form className="module-card" onSubmit={send}>
          <h2>New message</h2>
          <input value={form.receiver} onChange={(e) => setForm({ ...form, receiver: e.target.value })} placeholder="Receiver user ID" required />
          <input value={form.relatedPet} onChange={(e) => setForm({ ...form, relatedPet: e.target.value })} placeholder="Related pet ID (optional)" />
          <textarea rows="5" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Message" required />
          <button className="primary-button" type="submit">Send message</button>
        </form>

        <div className="stack-gap">
          {items.map((message) => (
            <article key={message._id} className="module-card">
              <strong>{message.sender?.name} → {message.receiver?.name}</strong>
              <p>{message.body}</p>
              <small className="muted-text">{new Date(message.createdAt).toLocaleString()}</small>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}