import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';
import { useCart } from '../contexts/CartContext.jsx';
import { DEFAULT_IMAGE_FALLBACK, getUploadUrl } from '../utils/media.js';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

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
          <h2>${product.price.toFixed(2)}</h2>
          <p>{product.description}</p>
          <div className="button-row">
            <button className="primary-button" onClick={() => addItem(product, 1)}>Add to cart</button>
          </div>
        </div>
      </div>
    </section>
  );
}
