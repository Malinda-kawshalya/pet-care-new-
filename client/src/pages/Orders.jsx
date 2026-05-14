import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useParams, Link } from 'react-router-dom';

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function OrderView() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/market/orders/${id}`);
        setOrder(res.data.item);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order');
      }
    }
    load();
  }, [id]);

  if (error) return <section className="section"><div className="form-alert error">{error}</div></section>;
  if (!order) return <div>Loading...</div>;

  return (
    <section className="section">
      <h1>Order {order._id}</h1>
      <p>Status: {order.orderStatus} - Payment: {order.paymentStatus}</p>
      <p>Payment method: {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Card'}</p>
      {order.trackingNumber && <p>Tracking: {order.trackingNumber}</p>}
      {order.paymentMethod === 'cod' && order.orderStatus === 'placed' && (
        <div className="form-alert success">Your cash on delivery order is waiting for shop approval.</div>
      )}
      <h3>Items</h3>
      <ul>
        {order.items.map((item) => (
          <li key={item._id}>
            {item.product?.name || item.product} x {item.quantity} - {formatCurrency(item.price)}
          </li>
        ))}
      </ul>
      <h3>Total: {formatCurrency(order.total)}</h3>
    </section>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/market/orders');
        setOrders(res.data.items || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
      }
    }
    load();
  }, []);

  return (
    <section className="section">
      <h1>Your Orders</h1>
      {error && <div className="form-alert error">{error}</div>}
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order._id}>
              <Link to={`/orders/${order._id}`}>{order._id}</Link> - {order.orderStatus} - {order.paymentMethod === 'cod' ? 'COD' : 'Card'} - {formatCurrency(order.total)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
