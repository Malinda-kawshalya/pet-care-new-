import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductFilters from '../components/ProductFilters.jsx';
import { useCart } from '../contexts/CartContext.jsx';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, total: 0 });
  const { addItem } = useCart();

  async function load(q = {}) {
    setLoading(true);
    try {
      const params = { page: q.page || 1, limit: 24 };
      if (q.q) params.q = q.q;
      if (q.category) params.category = q.category;
      if (q.brand) params.brand = q.brand;
      if (q.minPrice) params.minPrice = q.minPrice;
      if (q.maxPrice) params.maxPrice = q.maxPrice;
      const res = await api.get('/market/products', { params });
      setProducts(res.data.items || []);
      setMeta({ page: res.data.page || 1, total: res.data.total || 0 });
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <section className="section">
      <h1>Marketplace</h1>
      <ProductFilters onChange={(s) => load({ ...s, page: 1 })} />
      {loading && <p>Loading...</p>}
      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {products.map(p => <ProductCard key={p._id} product={p} onAdd={(prod) => addItem(prod, 1)} />)}
      </div>
    </section>
  );
}
