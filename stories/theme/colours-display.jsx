import React from 'react';
import theme from '../../build/js/tokens.json';
import './tokens-display.css';

const generatePalettes = (palette) => {
  const paletteStyles = Object.entries(palette);
  console.log(palette, 'palette');

  const renderColours = (colour) => (
    <div
      className="color-palette"
      key={colour[0]}
      style={{
        borderColor: colour[1],
        backgroundColor: '',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
      }}
    >
      <div className="color-names">
        <div className="color-name" key={colour[0]}>
          {colour[0]}
        </div>
      </div>
      <div className="color-codes">
        <div className="color-name" key={colour[0]}>
          {colour[1]}
        </div>
      </div>
    </div>
  );

  const returnColoursFromObject = (object) => {
    const coloursArray = Object.entries(object);
    return coloursArray.map((colour) =>
      typeof colour[1] === 'object'
        ? returnColoursFromObject(colour[1])
        : renderColours(colour)
    );
  };

  return (
    <>
      {paletteStyles.map((paletteObject) => {
        // const paletteObjectColoursArray = Object.entries(
        //   paletteObject[1]
        // );

        const paletteObjectColoursArray =
          typeof paletteObject[1] === 'object'
            ? Object.entries(paletteObject[1])
            : [paletteObject];

        console.log(
          typeof paletteObject[1] === 'object',
          paletteObject,
          paletteObjectColoursArray,
          'paletteObjectColoursArray'
        );

        const paletteObjectColours = paletteObjectColoursArray.map(
          (paletteObjectColour) => {
            const colour =
              typeof paletteObjectColour[1] === 'object'
                ? returnColoursFromObject(paletteObjectColour[1])
                : paletteObjectColour[1];

            return typeof colour === 'object' ? (
              <>
                <h3 key={paletteObjectColour[0]}>{paletteObjectColour[0]}</h3>
                <div className="palette-container" key={paletteObjectColour[0]}>
                  {colour}
                </div>
              </>
            ) : (
              <div className="palette-container" key={paletteObjectColour[0]}>
                {renderColours(paletteObjectColour)}
              </div>
            );
          }
        );

        return (
          <>
            <h2 className="capitalise">{paletteObject[0]}</h2>
            <div>{paletteObjectColours}</div>
          </>
        );
      })}
    </>
  );
};

export const FoundationDisplay = () =>
  generatePalettes({
    brand: theme['foundation'].brand,
    marketing: theme['foundation'].marketing,
    'data-vis': theme['foundation']['data-vis']
  });

export const BrandsDisplay = () => generatePalettes(theme['light/ brand'].ramp);

// Brand-neutral semantic accent tiers. Replaces the removed newspaper channels.
// Sourced from the shadcn-inspired core theme: brand tiers, feedback and charts.
export const AccentsDisplay = () => {
  const t = theme['light/ core'].theme;
  return generatePalettes({
    primary: t.primary,
    'primary-foreground': t['primary-foreground'],
    secondary: t.secondary,
    'secondary-foreground': t['secondary-foreground'],
    tertiary: t.tertiary,
    'tertiary-foreground': t['tertiary-foreground'],
    info: t.info,
    success: t.success,
    warning: t.warning,
    error: t.error,
    destructive: t.destructive,
    'chart-1': t['chart-1'],
    'chart-2': t['chart-2'],
    'chart-3': t['chart-3'],
    'chart-4': t['chart-4'],
    'chart-5': t['chart-5']
  });
};

export const MarketingDisplay = () =>
  generatePalettes(theme['light/ marketing']);

export const CoreDisplay = () => generatePalettes(theme['light/ core']);

export const DataVisDisplay = () =>
  generatePalettes(theme['light/ dataVisualisation']);
