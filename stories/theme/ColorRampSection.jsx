import React from 'react';
import { ColorSwatchCard } from './ColorSwatchCard';

const toSentenceCase = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');

export function ColorRampSection({ rampName, rampSteps }) {
  return (
    <section className="swatch-section">
      <h3 className="swatch-section-heading">{toSentenceCase(rampName)}</h3>
      <div className="swatch-grid">
        {Object.entries(rampSteps).map(([step, { hex, isBase }]) => (
          <ColorSwatchCard
            key={step}
            color={hex}
            tokenName={`ramp.${rampName}.${step}`}
            showBase
            isBase={isBase}
          />
        ))}
      </div>
    </section>
  );
}
