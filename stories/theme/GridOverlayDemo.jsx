import React, { useState } from 'react';

const GRID_CONFIG = {
  small: {
    label: 'small',
    range: '<768px',
    columns: 4,
    gutter: 24,
    margin: 20,
    contentArea: 393,
    viewportLimit: 433
  },
  medium: {
    label: 'medium',
    range: '768-1023px',
    columns: 12,
    gutter: 32,
    margin: 24,
    contentArea: 768,
    viewportLimit: 816
  },
  large: {
    label: 'large',
    range: '1024-1439px',
    columns: 12,
    gutter: 32,
    margin: 24,
    contentArea: 1024,
    viewportLimit: 1072
  },
  xlarge: {
    label: 'xlarge',
    range: '≥1440px',
    columns: 12,
    gutter: 32,
    margin: 24,
    contentArea: 1144,
    viewportLimit: 1440
  }
};

const VIEWPORT_ORDER = ['small', 'medium', 'large', 'xlarge'];

const MODES = [
  { key: 'off', label: 'Off' },
  { key: 'columns', label: 'Columns' },
  { key: 'columns-baseline', label: 'Columns + Baseline' }
];

export default function GridOverlayDemo() {
  const [mode, setMode] = useState('columns');

  const shouldShowColumns = mode === 'columns' || mode === 'columns-baseline';
  const shouldShowBaseline = mode === 'columns-baseline';

  return (
    <div className="grid-demo">
      <div className="grid-demo-toolbar">
        <div
          className="grid-demo-toggle"
          role="radiogroup"
          aria-label="Grid overlay mode"
        >
          {MODES.map((toggleMode) => {
            const isActive = mode === toggleMode.key;

            return (
              <button
                key={toggleMode.key}
                type="button"
                role="radio"
                aria-checked={isActive}
                className={`grid-demo-toggle-btn ${isActive ? 'is-active' : ''}`.trim()}
                onClick={() => setMode(toggleMode.key)}
              >
                {toggleMode.label}
              </button>
            );
          })}
        </div>

        <p className="grid-demo-meta">
          <strong>All viewports</strong>
          <span>Small, Medium, Large, Xlarge (stacked)</span>
          <span>
            Overlay:{' '}
            {mode === 'columns-baseline'
              ? 'Columns + Baseline'
              : mode === 'columns'
                ? 'Columns'
                : 'Off'}
          </span>
        </p>
      </div>

      <div className="grid-demo-gallery">
        {VIEWPORT_ORDER.map((viewportKey) => {
          const config = GRID_CONFIG[viewportKey];

          return (
            <div key={viewportKey} className="grid-demo-viewport">
              <p className="grid-demo-meta grid-demo-meta-viewport">
                <strong>{config.label}</strong>
                <span>({config.range})</span>
                <span>{config.columns} cols</span>
                <span>{config.gutter}px gutter</span>
                <span>{config.margin}px margin</span>
                <span>{config.contentArea}px content area</span>
                <span>{config.viewportLimit}px viewport limit</span>
              </p>

              <div className="grid-demo-scroll">
                <div
                  className="grid-demo-frame"
                  style={{
                    '--grid-columns': config.columns,
                    '--grid-gutter': `${config.gutter}px`,
                    '--grid-margin': `${config.margin}px`,
                    '--grid-content-area': `${config.contentArea}px`,
                    '--grid-viewport-limit': `${config.viewportLimit}px`
                  }}
                >
                  <div className="grid-demo-margins">
                    <span className="grid-demo-margin-label">
                      Margin {config.margin}px
                    </span>
                    <span className="grid-demo-margin-label">
                      Margin {config.margin}px
                    </span>
                  </div>

                  <div className="grid-demo-content">
                    {shouldShowColumns ? (
                      <div
                        className="grid-demo-columns"
                        aria-hidden="true"
                        role="presentation"
                      >
                        {Array.from({ length: config.columns }).map(
                          (_, index) => (
                            <span
                              key={`${viewportKey}-grid-column-${index}`}
                              className="grid-demo-column"
                            />
                          )
                        )}
                      </div>
                    ) : null}

                    {shouldShowBaseline ? (
                      <div
                        className="grid-demo-baseline"
                        aria-hidden="true"
                        role="presentation"
                      />
                    ) : null}

                    <div className="grid-demo-layout">
                      <div className="grid-demo-block span-full">
                        Span {config.columns} (full width)
                      </div>
                      {Array.from({ length: config.columns }, (_, index) => {
                        const span = index + 1;
                        return (
                          <div
                            key={`${viewportKey}-span-${span}`}
                            className="grid-demo-block"
                            style={{ gridColumn: `1 / span ${span}` }}
                          >
                            Span {span}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
