import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductFilters from '../components/ProductFilters.jsx';
import CartModal from '../components/CartModal.jsx';
import { useCart } from '../contexts/CartContext.jsx';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, total: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addItem, cart, updateQty, removeItem } = useCart();

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
      <div className="module-detail-hero">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1>Browse pet essentials and wellness products</h1>
          <p>Filter by category, brand, and budget, then add items to cart instantly.</p>
        </div>
      </div>
      <ProductFilters onChange={(s) => load({ ...s, page: 1 })} />
      {loading && <p>Loading...</p>}
      <div className="product-grid product-grid-market">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAdd={(selectedProduct) => {
              addItem(selectedProduct, 1);
              setIsCartOpen(true);
            }}
          />
        ))}
      </div>
      {!loading && !!meta.total && <p className="muted-text top-gap-16">Showing {products.length} of {meta.total} products.</p>}
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
