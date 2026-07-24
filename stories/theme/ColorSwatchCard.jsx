import React, { useState } from 'react';

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </svg>
  );
}

export function ColorSwatchCard({ color, tokenName, showBase = false, isBase = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(color).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div className="swatch-card">
      <div className="swatch-color-block" style={{ backgroundColor: color }}>
        <button className="swatch-hex-chip" onClick={handleCopy} aria-label={`Copy ${color}`}>
          <span className="swatch-hex-text">{copied ? 'Copied!' : color}</span>
          <span className="swatch-copy-icon">
            <CopyIcon />
          </span>
        </button>
        {showBase && isBase && (
          <div className="swatch-base-badge" aria-label="Base colour">
            <span className="swatch-base-text">B</span>
          </div>
        )}
      </div>
      <div className="swatch-token-name">{tokenName}</div>
    </div>
  );
}
