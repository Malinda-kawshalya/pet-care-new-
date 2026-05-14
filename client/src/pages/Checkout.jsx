import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext.jsx';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { cart, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/market/orders', {
        items: cart.map(c => ({ product: c.product, quantity: c.quantity })),
        shipping: { name: 'Demo User', email: 'demo@example.com', phone: '', address: '123 Demo St' },
        paymentMethod: 'mock'
      });
      clear();
      navigate(`/orders/${res.data.item._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  }

  return (
    <section className="section">
      <h1>Checkout</h1>
      {error && <div className="form-alert error">{error}</div>}
      <p>Order total: <strong>${total.toFixed(2)}</strong></p>
      <form onSubmit={handlePlaceOrder}>
        <button className="primary-button" disabled={loading}>{loading ? 'Placing...' : 'Place Order (mock pay)'}</button>
      </form>
    </section>
  );
}
