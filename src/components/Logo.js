import React, { useState } from 'react';

const Logo = ({ src, alt = 'EMS Portal Logo', className = '', style = {} }) => {
  const [imageError, setImageError] = useState(false);

  const defaultLogo = (
    <div className={`default-logo ${className}`} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ maxWidth: '100%', maxHeight: '100%' }}>
        <circle cx="50" cy="50" r="45" fill="#4F46E5" />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="40"
          fontWeight="bold"
        >
          EMS
        </text>
      </svg>
    </div>
  );

  // Show fallback if no src or image failed to load
  if (!src || imageError) {
    return defaultLogo;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setImageError(true)}
    />
  );
};

export default Logo;
