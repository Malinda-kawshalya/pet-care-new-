import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext.jsx';
import api from '../services/api.js';

const initialShipping = {
  name: '',
  email: '',
  phone: '',
  address: ''
};

const initialCard = {
  name: '',
  number: '',
  expiry: '',
  cvc: ''
};

export default function Checkout() {
  const { cart, total, clear } = useCart();
  const [shipping, setShipping] = useState(initialShipping);
  const [card, setCard] = useState(initialCard);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const cardLast4 = useMemo(() => card.number.replace(/\D/g, '').slice(-4), [card.number]);

  function updateShipping(field, value) {
    setShipping((current) => ({ ...current, [field]: value }));
  }

  function updateCard(field, value) {
    setCard((current) => ({ ...current, [field]: value }));
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();
    if (cart.length === 0) return;

    if (paymentMethod === 'card' && cardLast4.length !== 4) {
      setError('Enter a valid card number before placing the order.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        items: cart.map((item) => ({ product: item.product, quantity: item.quantity })),
        shipping,
        paymentMethod,
        paymentLast4: paymentMethod === 'card' ? cardLast4 : undefined,
        paymentToken: paymentMethod === 'card' ? `mock_card_${Date.now()}_${cardLast4}` : undefined,
        notes: paymentMethod === 'cod'
          ? 'Customer selected cash on delivery. Awaiting shop approval.'
          : 'Customer paid by card.'
      };

      const { data } = await api.post('/market/orders', payload);
      clear();
      navigate(`/orders/${data.item._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <section className="section">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <Link className="primary-button compact" to="/market">Browse products</Link>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-header">
        <p className="eyebrow">Secure checkout</p>
        <h1>Complete your order</h1>
        <p>Pay by card immediately or submit a cash on delivery request for shop approval.</p>
      </div>

      {error && <div className="form-alert error">{error}</div>}

      <form className="checkout-grid" onSubmit={handlePlaceOrder}>
        <div className="panel-stack">
          <div className="module-card">
            <div className="widget-header">
              <h2><MapPin size={20} /> Delivery details</h2>
            </div>
            <div className="panel-fields">
              <div className="form-group">
                <label htmlFor="shipping-name">Full name</label>
                <input id="shipping-name" required value={shipping.name} onChange={(event) => updateShipping('name', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="shipping-email">Email</label>
                <input id="shipping-email" required type="email" value={shipping.email} onChange={(event) => updateShipping('email', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="shipping-phone">Phone</label>
                <input id="shipping-phone" required value={shipping.phone} onChange={(event) => updateShipping('phone', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="shipping-address">Delivery address</label>
                <textarea id="shipping-address" required rows={4} value={shipping.address} onChange={(event) => updateShipping('address', event.target.value)} />
              </div>
            </div>
          </div>

          <div className="module-card">
            <div className="widget-header">
              <h2><CreditCard size={20} /> Payment method</h2>
            </div>
            <div className="panel-fields">
              <label className="checkbox-row checkout-choice">
                <input type="radio" name="paymentMethod" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                <span>
                  <strong>Card payment</strong>
                  <small>Mock card processing marks the order as paid immediately.</small>
                </span>
              </label>
              <label className="checkbox-row checkout-choice">
                <input type="radio" name="paymentMethod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <span>
                  <strong>Cash on delivery</strong>
                  <small>The order is sent to the shop dashboard for approval.</small>
                </span>
              </label>
            </div>

            {paymentMethod === 'card' && (
              <div className="panel-fields top-gap-18">
                <div className="form-group">
                  <label htmlFor="card-name">Name on card</label>
                  <input id="card-name" required value={card.name} onChange={(event) => updateCard('name', event.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="card-number">Card number</label>
                  <input id="card-number" required inputMode="numeric" value={card.number} onChange={(event) => updateCard('number', event.target.value)} placeholder="4242 4242 4242 4242" />
                </div>
                <div className="form-grid-two">
                  <div className="form-group">
                    <label htmlFor="card-expiry">Expiry</label>
                    <input id="card-expiry" required value={card.expiry} onChange={(event) => updateCard('expiry', event.target.value)} placeholder="MM/YY" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="card-cvc">CVC</label>
                    <input id="card-cvc" required inputMode="numeric" value={card.cvc} onChange={(event) => updateCard('cvc', event.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="module-card checkout-summary">
          <div className="widget-header">
            <h2><Truck size={20} /> Order summary</h2>
          </div>
          <div className="panel-fields">
            {cart.map((item) => (
              <div key={item.product} className="summary-line">
                <span>{item.name} x {item.quantity}</span>
                <strong>${((item.price || 0) * item.quantity).toFixed(2)}</strong>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <button className="primary-button checkout-submit" disabled={loading} type="submit">
            {loading ? 'Placing order...' : paymentMethod === 'cod' ? 'Submit COD order' : 'Pay and place order'}
          </button>
        </aside>
      </form>
    </section>
  );
}
