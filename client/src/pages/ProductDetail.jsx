import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';
import { useCart } from '../contexts/CartContext.jsx';
import CartModal from '../components/CartModal.jsx';
import { DEFAULT_IMAGE_FALLBACK, getUploadUrl } from '../utils/media.js';
import { formatLKR } from '../utils/currency.js';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addItem, cart, updateQty, removeItem } = useCart();

  const handleImageError = (event) => {
    if (event.currentTarget.src !== DEFAULT_IMAGE_FALLBACK) {
      event.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try { const res = await api.get(`/market/products/${id}`); setProduct(res.data.item); } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <section className="section">Loading...</section>;
  if (!product) return <section className="section">Product not found</section>;

  return (
    <section className="section">
      <div className="product-detail-grid page-card">
        <div className="product-detail-image-wrap">
          <img
            className="product-detail-image"
            src={getUploadUrl(product.images?.[0])}
            alt={product.name}
            onError={handleImageError}
          />
        </div>
        <div className="product-detail-copy">
          <p className="eyebrow">Product detail</p>
          <h1>{product.name}</h1>
          <p className="muted-text">{product.brand} • {product.category}</p>
          <h2>{formatLKR(product.price)}</h2>
          <p>{product.description}</p>
          <div className="button-row">
            <button
              className="primary-button"
              onClick={() => {
                addItem(product, 1);
                setIsCartOpen(true);
              }}
              type="button"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQty={updateQty}
        removeItem={removeItem}
      />
    </section>
  );
}
