import React from 'react';
import { ColorSwatchCard } from './ColorSwatchCard';

// Flattens nested object to array of {tokenPath, hex}
function flattenFoundation(obj, prefix) {
  const results = [];
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') {
      results.push({ tokenPath: `${prefix}.${key}`, hex: val });
    } else if (typeof val === 'object' && val !== null) {
      results.push(...flattenFoundation(val, `${prefix}.${key}`));
    }
  }
  return results;
}

export function ColorFoundationSection({ groupName, data, prefix }) {
  const tokens = flattenFoundation(data, prefix);
  return (
    <section className="swatch-section">
      <h3 className="swatch-section-heading">{groupName}</h3>
      <div className="swatch-grid">
        {tokens.map(({ tokenPath, hex }) => (
          <ColorSwatchCard
            key={tokenPath}
            color={hex}
            tokenName={tokenPath}
            showBase={false}
          />
        ))}
      </div>
    </section>
  );
}
