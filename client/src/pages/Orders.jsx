import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useParams, Link } from 'react-router-dom';

export function OrderView() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => { async function load(){ try{ const res = await api.get(`/market/orders/${id}`); setOrder(res.data.item);}catch(e){console.error(e);} } load(); }, [id]);

  if (!order) return <div>Loading...</div>;
  return (
    <section className="section">
      <h1>Order {order._id}</h1>
      <p>Status: {order.orderStatus} • Payment: {order.paymentStatus}</p>
      <h3>Items</h3>
      <ul>
        {order.items.map(it => (
          <li key={it._id}>{it.product?.name || it.product} × {it.quantity} — ${it.price}</li>
        ))}
      </ul>
    </section>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { async function load(){ try{ const res = await api.get('/orders'); setOrders(res.data.items || res.data); }catch(e){console.error(e);} } load(); }, []);
  return (
    <section className="section">
      <h1>Your Orders</h1>
      <ul>
        {orders.map(o => (
          <li key={o._id}><Link to={`/orders/${o._id}`}>{o._id}</Link> — {o.orderStatus} — ${o.total}</li>
        ))}
      </ul>
    </section>
  );
}
