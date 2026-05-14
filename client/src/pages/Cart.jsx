import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';

export default function Cart() {
  const { cart, removeItem, updateQty, total } = useCart();
  const navigate = useNavigate();

  return (
    <section className="section">
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <div>
          <p>Cart is empty.</p>
          <Link to="/market">Browse products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {cart.map(item => (
            <div key={item.product} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src={item.image || '/placeholder.png'} alt={item.name} style={{ width: 80, height: 64, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{item.name}</h3>
                <div style={{ color: 'var(--muted)' }}>${item.price.toFixed(2)}</div>
              </div>
              <div>
                <input type="number" value={item.quantity} min={1} onChange={(e) => updateQty(item.product, Number(e.target.value))} style={{ width: 64 }} />
              </div>
              <div>
                <button onClick={() => removeItem(item.product)} className="action-btn delete">Remove</button>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Total: ${total.toFixed(2)}</strong>
            <button className="primary-button" onClick={() => navigate('/checkout')}>Checkout</button>
          </div>
        </div>
      )}
    </section>
  );
}
