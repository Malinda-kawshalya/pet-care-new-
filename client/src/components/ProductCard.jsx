import React from 'react';
import { DEFAULT_IMAGE_FALLBACK, getUploadUrl } from '../utils/media.js';
import { ShoppingCart, Star } from 'lucide-react';
import { formatLKR } from '../utils/currency.js';

export default function ProductCard({ product, onAdd }) {
  const imageUrl = getUploadUrl(product.images?.[0]);
  const handleImageError = (event) => {
    if (event.currentTarget.src !== DEFAULT_IMAGE_FALLBACK) {
      event.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
    }
  };
  
  const rating = product.rating || 0;
  const stockLabel = Number(product.stock || 0) > 0 ? `${product.stock} in stock` : 'Out of stock';
  const summary = product.description || `${product.brand || product.category || 'Pet care'} essential for daily care.`;

  return (
    <article className="product-card">
      <div className="product-card-image-wrap">
        <img src={imageUrl} alt={product.name} onError={handleImageError} />
      </div>

      <div className="product-card-copy">
        <div className="product-card-topline">
          <span className="product-card-badge">
            {product.category || 'Product'}
          </span>
          <span className="product-card-price">
            {formatLKR(product.price)}
          </span>
        </div>

        <h3>{product.name}</h3>

        <p className="product-card-meta">
          {product.brand || stockLabel}
          {rating > 0 && (
            <span className="product-card-rating">
              <Star size={14} fill="currentColor" />
              {rating.toFixed(1)}
            </span>
          )}
        </p>

        <p className="product-card-summary">{summary}</p>
        <p className="product-card-stock">{stockLabel}</p>

        <div className="product-card-actions">
          <button onClick={() => onAdd(product)} className="primary-button" type="button">
            <ShoppingCart size={16} />
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
