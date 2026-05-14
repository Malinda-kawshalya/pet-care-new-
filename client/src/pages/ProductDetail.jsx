import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';
import { useCart } from '../contexts/CartContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try { const res = await api.get(`/market/products/${id}`); setProduct(res.data.item); } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <section className="section module-detail-hero">
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 18 }}>
        <div>
          <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} style={{ width: '100%', borderRadius: 12 }} />
        </div>
        <div>
          <h1>{product.name}</h1>
          <p style={{ color: 'var(--muted)' }}>{product.brand} • {product.category}</p>
          <h2>${product.price.toFixed(2)}</h2>
          <p>{product.description}</p>
          <div style={{ marginTop: 12 }}>
            <button className="primary-button" onClick={() => addItem(product, 1)}>Add to cart</button>
          </div>
        </div>
      </div>
    </section>
  );
}
