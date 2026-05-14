import React, { useState } from 'react';

export default function ProductFilters({ onChange, categories = [], brands = [] }) {
  const [state, setState] = useState({ q: '', category: '', brand: '', minPrice: '', maxPrice: '' });

  function update(k, v) {
    const next = { ...state, [k]: v };
    setState(next);
    onChange && onChange(next);
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <input placeholder="Search products" value={state.q} onChange={(e) => update('q', e.target.value)} style={{ minWidth: 200 }} />
      <select value={state.category} onChange={(e) => update('category', e.target.value)}>
        <option value="">All categories</option>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={state.brand} onChange={(e) => update('brand', e.target.value)}>
        <option value="">All brands</option>
        {brands.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>
      <input placeholder="Min" value={state.minPrice} onChange={(e) => update('minPrice', e.target.value)} style={{ width: 80 }} />
      <input placeholder="Max" value={state.maxPrice} onChange={(e) => update('maxPrice', e.target.value)} style={{ width: 80 }} />
    </div>
  );
}
