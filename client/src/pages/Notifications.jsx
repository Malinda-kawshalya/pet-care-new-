import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function Notifications() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const resp = await api.get("/notifications");
    setItems(resp.data.items || []);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}`);
    load();
  };

  const markAllRead = async () => {
    await api.patch("/notifications");
    load();
  };

  return (
    <div className="section">
      <div className="module-detail-hero">
        <div>
          <p className="eyebrow">Notifications</p>
          <h1>System alerts and reminders</h1>
          <p>Track reminders for appointments, vaccines, messages, and other platform events.</p>
        </div>
        <button className="primary-button" type="button" onClick={markAllRead}>Mark all read</button>
      </div>

      <div className="stack-gap">
        {items.map((item) => (
          <article key={item._id} className="module-card">
            <h3>{item.title}</h3>
            <p>{item.message}</p>
            <small className="muted-text">{item.readAt ? `Read ${new Date(item.readAt).toLocaleString()}` : "Unread"}</small>
            {!item.readAt && <button className="ghost-button" type="button" onClick={() => markRead(item._id)}>Mark read</button>}
          </article>
        ))}
      </div>
    </div>
  );
}