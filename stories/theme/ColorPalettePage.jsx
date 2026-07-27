import React, { useState } from 'react';
import theme from '../../build/js/tokens.json';
import { parseBrandRamps } from './parsePaletteVariables';
import brandRampRaw from '../../packages/theme-css/src/variables.css?raw';
import { ColorFoundationSection } from './ColorFoundationSection';
import { ColorRampSection } from './ColorRampSection';
import './ColorPalettePage.css';

const brandRamps = parseBrandRamps(brandRampRaw);

export function ColorPalettePage() {
  const [activeTab, setActiveTab] = useState('foundation');
  const fd = theme['foundation'];

  return (
    <div>
      <div
        className="palette-tab-nav"
        role="tablist"
        aria-label="Palette view tabs"
      >
        <button
          role="tab"
          aria-selected={activeTab === 'foundation'}
          className={`palette-tab-btn${activeTab === 'foundation' ? ' active' : ''}`}
          onClick={() => setActiveTab('foundation')}
        >
          Foundation
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'palette'}
          className={`palette-tab-btn${activeTab === 'palette' ? ' active' : ''}`}
          onClick={() => setActiveTab('palette')}
        >
          Palette (light)
        </button>
      </div>

      {activeTab === 'foundation' && (
        <div role="tabpanel">
          <ColorFoundationSection
            groupName="Core brand"
            data={fd.brand}
            prefix="brand"
          />
          {fd.marketing && (
            <ColorFoundationSection
              groupName="Marketing"
              data={fd.marketing}
              prefix="marketing"
            />
          )}
          {fd['data-vis'] && (
            <ColorFoundationSection
              groupName="Data visualization"
              data={fd['data-vis']}
              prefix="data-vis"
            />
          )}
        </div>
      )}

      {activeTab === 'palette' && (
        <div role="tabpanel">
          <>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 600,
                marginBottom: '1rem',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              Brand core ramps
            </h2>
            {Object.entries(brandRamps).map(([rampName, steps]) => (
              <ColorRampSection
                key={rampName}
                rampName={rampName}
                rampSteps={steps}
              />
            ))}
          </>
        </div>
      )}
    </div>
  );
}
