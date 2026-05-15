import React from 'react';
import { DEFAULT_IMAGE_FALLBACK, getUploadUrl } from '../utils/media.js';
import { Star } from 'lucide-react';
import { formatLKR } from '../utils/currency.js';

export default function ProductCard({ product, onAdd }) {
  const imageUrl = getUploadUrl(product.images?.[0]);
  const handleImageError = (event) => {
    if (event.currentTarget.src !== DEFAULT_IMAGE_FALLBACK) {
      event.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
    }
  };
  
  const rating = product.rating || 0;

  return (
    <div className="product-card">
      <div className="product-card-image">
        <img src={imageUrl} alt={product.name} onError={handleImageError} />
      </div>

      <div className="product-card-body">
        <span className="product-card-badge">
          {product.category || 'Product'}
        </span>

        <h3>{product.name}</h3>

        <div className="product-card-footer">
          <span className="product-card-price">
            {formatLKR(product.price)}
          </span>
          {rating > 0 && (
            <span>
              <Star size={14} fill="currentColor" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <div>{product.stock} in stock</div>

        <button onClick={() => onAdd(product)} className="primary-button" type="button">
          Add to cart
        </button>
      </div>
    </div>
  );
}
