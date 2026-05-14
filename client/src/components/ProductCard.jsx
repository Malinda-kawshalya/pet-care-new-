import React from 'react';
import { getUploadUrl } from '../utils/media.js';

export default function ProductCard({ product, onAdd }) {
  const imageUrl = getUploadUrl(product.images?.[0]);
  
  const rating = product.rating || 0;

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    }}
    >
      {/* Image Container */}
      <div style={{
        width: '100%',
        height: '200px',
        overflow: 'hidden',
        background: '#f6f7fb',
        position: 'relative'
      }}>
        <img 
          src={imageUrl} 
          alt={product.name} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Content Container */}
      <div style={{
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Category Badge */}
        <span style={{
          display: 'inline-block',
          background: '#e3f2fd',
          color: '#0066cc',
          fontSize: '12px',
          fontWeight: '600',
          padding: '4px 8px',
          borderRadius: '4px',
          width: 'fit-content',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {product.category || 'Product'}
        </span>

        {/* Product Name */}
        <h3 style={{
          margin: '0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#1a1a1a',
          lineHeight: '1.3',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {product.name}
        </h3>

        {/* Price and Rating Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto'
        }}>
          <span style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#0066cc'
          }}>
            ${product.price.toFixed(2)}
          </span>
          {rating > 0 && (
            <span style={{
              fontSize: '14px',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ color: '#ffa500' }}>★</span>
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Stock Info */}
        <div style={{
          fontSize: '13px',
          color: '#666',
          marginBottom: '8px'
        }}>
          {product.stock} in stock
        </div>

        {/* Add Button */}
        <button 
          onClick={() => onAdd(product)}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#0052a3'}
          onMouseLeave={(e) => e.target.style.background = '#0066cc'}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
