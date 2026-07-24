import React from 'react';
import theme from '../../build/js/tokens.json';
import './tokens-display.css';
import { Text } from '@ds/components-react';

const flattenObject = (ob, tokenType) => {
  var toReturn = {};

  for (var i in ob) {
    if (!Object.getOwnPropertyDescriptor(ob, i)) continue;

    if (typeof ob[i] == 'object' && ob[i] !== null) {
      if (ob[i].fontFamily && tokenType === 'typography') {
        toReturn[i] = ob[i];
        continue;
      }
      toReturn[i] = ob[i];
      // console.log('flattening:', i, ob[i]);

      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        const keyName = x.replace('.value', '').toLocaleLowerCase();
        if (!Object.getOwnPropertyDescriptor(flatObject, x)) continue;
        toReturn[i + '.' + keyName] = flatObject[x];
      }
    }
  }
  console.log('toReturn:', toReturn);
  return toReturn;
};

export const TypographyDisplay = () => {
  const fontSizes = Object.entries(theme['foundation']).filter((token) =>
    token[0].includes('fontSize')
  );
  const fontFamilies = Object.entries(theme['foundation']).filter((token) =>
    token[0].includes('fontFamily')
  );
  const fontLineHeights = Object.entries(theme['foundation']).filter((token) =>
    token[0].includes('fontLineHeight')
  );

  return (
    <>
      <h2>Font Families</h2>
      {fontFamilies.map((fontFamily) => (
        <div
          className="font-sizes"
          key={fontFamily[0]}
          style={{ fontFamily: fontFamily[1] }}
        >
          {fontFamily[0]}: {fontFamily[1]}
        </div>
      ))}
      <h2>Font Size Scale</h2>
      {fontSizes.map((fontSize) => (
        <div
          className="font-sizes"
          key={fontSize[0]}
          style={{ fontSize: fontSize[1] }}
        >
          {fontSize[0]}
        </div>
      ))}
      <h2>Font Line Heights</h2>
      {fontLineHeights.map((fontLineHeight) => (
        <div
          className="font-sizes"
          key={fontLineHeight[0]}
          style={{ lineHeight: fontLineHeight[1] }}
        >
          {fontLineHeight[0]}: This is the Design System
        </div>
      ))}
    </>
  );
};

const generateTypography = (typography) => {
  const flattenedTypography = flattenObject(typography, 'typography');
  const typographyStyles = Object.entries(flattenedTypography);

  return (
    <>
      {typographyStyles.map((typographyObject) => {
        if (typographyObject[1].fontSize) {
          return typographyObject[1].fontSize ? (
            <div
              className="font-sizes"
              key={typographyObject[0]}
              // style={typographyStyle[1]}
            >
              <Text typographyStyle={typographyObject[0]}>
                {typographyObject[0]}
              </Text>
            </div>
          ) : null;
        }
      })}
    </>
  );
};

export const TypographyDisplayComposed = () =>
  generateTypography(theme['typographyTokens']);
