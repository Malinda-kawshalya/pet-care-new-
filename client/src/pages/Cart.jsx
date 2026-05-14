import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';

export default function Cart() {
  const { cart, removeItem, updateQty, total } = useCart();
  const navigate = useNavigate();

  return (
    <section className="section">
      <div className="module-detail-hero">
        <div>
          <p className="eyebrow">Your cart</p>
          <h1>Review items before checkout</h1>
          <p>Adjust quantities or remove products before placing your order.</p>
        </div>
      </div>
      {cart.length === 0 ? (
        <div className="page-card">
          <p>Cart is empty.</p>
          <Link to="/market" className="primary-button fit-content-btn">Browse products</Link>
        </div>
      ) : (
        <div className="cart-list">
          {cart.map(item => (
            <article key={item.product} className="cart-item-row">
              <img className="cart-item-image" src={item.image || '/placeholder.png'} alt={item.name} />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <div className="muted-text">${item.price.toFixed(2)}</div>
              </div>
              <div>
                <input className="cart-qty-input" type="number" value={item.quantity} min={1} onChange={(e) => updateQty(item.product, Number(e.target.value))} />
              </div>
              <div>
                <button onClick={() => removeItem(item.product)} className="action-btn delete">Remove</button>
              </div>
            </article>
          ))}
          <div className="cart-total-row page-card">
            <strong>Total: ${total.toFixed(2)}</strong>
            <button className="primary-button" onClick={() => navigate('/checkout')}>Checkout</button>
          </div>
        </div>
      )}
    </section>
  );
}
