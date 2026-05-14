import React, { useEffect } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <Check size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />
  };

  const colors = {
    success: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '#10b981' },
    error: { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: '#ef4444' },
    info: { bg: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', icon: '#0ea5e9' }
  };

  const style = colors[type];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: '10px',
        background: style.bg,
        color: 'white',
        fontWeight: 600,
        fontSize: '14px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        animation: 'slideIn 0.3s ease-out',
        marginBottom: '12px',
        maxWidth: '100%'
      }}
    >
      <div style={{ color: style.icon, display: 'flex', alignItems: 'center' }}>
        {icons[type]}
      </div>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
      >
        <X size={18} />
      </button>
    </div>
  );
}
