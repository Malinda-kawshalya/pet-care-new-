import React from 'react';

export default function ProductCard({ product, onAdd }) {
  return (
    <div className="product-card module-card">
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 120, height: 96, overflow: 'hidden', borderRadius: 12, background: '#f6f7fb' }}>
          <img src={product.images?.[0] ? (product.images[0].startsWith('uploads') ? `/${product.images[0]}` : product.images[0]) : '/placeholder.png'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0 }}>{product.name}</h3>
          <div style={{ color: 'var(--muted)', marginTop: 6 }}>{product.brand || '—'} • {product.category}</div>
          <div style={{ marginTop: 8 }}>
            <strong>${product.price.toFixed(2)}</strong>
          </div>
        </div>
        <div style={{ display: 'grid', alignContent: 'center' }}>
          <button className="primary-button" onClick={() => onAdd(product)}>Add</button>
        </div>
      </div>
    </div>
  );
}
