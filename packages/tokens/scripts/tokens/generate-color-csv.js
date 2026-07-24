/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'fs';
import { parse } from 'path';

const tokensPath = './packages/tokens/src/tokens.json';
const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

// Foundation colors
const foundation = tokens['Foundation'];
const white = '#FFFFFF';
const black = '#000000';

console.log('🎨 Generating Neutral Ramp Color Reference CSV\n');

// Calculate color modifications (simplified - actual values would need color library)
function applyModifier(baseColor, modifier, type, space) {
  // This is a simplified calculation - in reality you'd use a color library
  // For now, we'll document the modifier values
  return { modifier: `${type} ${modifier}`, space };
}

// Light Mode Neutral Ramp (100=WHITE → 1000=BLACK)
const lightNeutral = {
  100: { value: white, modifier: 'lighten 100% (BASE WHITE)', space: 'hsl' },
  150: { value: '#F5F5F5', modifier: 'lighten 95%', space: 'hsl' },
  200: { value: '#E8E8E8', modifier: 'lighten 90%', space: 'hsl' },
  250: { value: '#D9D9D9', modifier: 'lighten 85%', space: 'hsl' },
  300: { value: '#CCCCCC', modifier: 'lighten 80%', space: 'hsl' },
  350: { value: '#BFBFBF', modifier: 'lighten 75%', space: 'hsl' },
  400: { value: '#B3B3B3', modifier: 'lighten 70%', space: 'hsl' },
  450: { value: '#A6A6A6', modifier: 'lighten 65%', space: 'hsl' },
  500: { value: '#999999', modifier: 'lighten 60%', space: 'hsl' },
  600: { value: '#808080', modifier: 'lighten 50%', space: 'hsl' },
  650: { value: '#737373', modifier: 'lighten 45%', space: 'hsl' },
  700: { value: '#666666', modifier: 'lighten 40%', space: 'hsl' },
  750: { value: '#595959', modifier: 'lighten 35%', space: 'hsl' },
  800: { value: '#4D4D4D', modifier: 'lighten 30%', space: 'hsl' },
  850: { value: '#404040', modifier: 'lighten 25%', space: 'hsl' },
  900: { value: '#333333', modifier: 'lighten 20%', space: 'hsl' },
  950: { value: '#1A1A1A', modifier: 'lighten 10%', space: 'hsl' },
  1000: { value: black, modifier: 'BASE BLACK', space: 'hsl' }
};

// Dark Mode Neutral Ramp (100=BLACK → 1000=WHITE, INVERTED)
const darkNeutral = {
  100: { value: black, modifier: 'BASE BLACK', space: 'p3' },
  150: { value: '#0D0D0D', modifier: 'lighten 10%', space: 'hsl' },
  200: { value: '#1A1A1A', modifier: 'lighten 15%', space: 'p3' },
  250: { value: '#262626', modifier: 'lighten 20%', space: 'p3' },
  300: { value: '#333333', modifier: 'lighten 25%', space: 'p3' },
  350: { value: '#404040', modifier: 'lighten 30%', space: 'p3' },
  400: { value: '#4D4D4D', modifier: 'lighten 35%', space: 'p3' },
  450: { value: '#595959', modifier: 'lighten 40%', space: 'p3' },
  500: { value: '#666666', modifier: 'lighten 45%', space: 'p3' },
  600: { value: '#808080', modifier: 'lighten 50%', space: 'p3' },
  650: { value: '#8C8C8C', modifier: 'lighten 55%', space: 'p3' },
  700: { value: '#999999', modifier: 'lighten 60%', space: 'p3' },
  750: { value: '#A6A6A6', modifier: 'lighten 65%', space: 'p3' },
  800: { value: '#B3B3B3', modifier: 'lighten 70%', space: 'p3' },
  850: { value: '#BFBFBF', modifier: 'lighten 75%', space: 'p3' },
  900: { value: '#CCCCCC', modifier: 'lighten 80%', space: 'p3' },
  950: { value: '#D9D9D9', modifier: 'lighten 85%', space: 'p3' },
  1000: { value: white, modifier: 'BASE WHITE', space: 'p3' }
};

// Generate CSV
const csvLines = [
  'Token,Mode,Step,HexValue,Modifier,ColorSpace,VisualDescription'
];

Object.entries(lightNeutral).forEach(([step, data]) => {
  csvLines.push(
    `brand.core.ramp.core.neutral.${step},Light,${step},${data.value},"${data.modifier}",${data.space},${getVisualDescription(step, 'light')}`
  );
});

Object.entries(darkNeutral).forEach(([step, data]) => {
  csvLines.push(
    `brand.core.ramp.core.neutral.${step},Dark,${step},${data.value},"${data.modifier}",${data.space},${getVisualDescription(step, 'dark')}`
  );
});

function getVisualDescription(step, mode) {
  if (step === '100') return mode === 'light' ? 'Pure white' : 'Pure black';
  if (step === '1000') return mode === 'light' ? 'Pure black' : 'Pure white';
  if (mode === 'light') {
    if (step <= '300') return 'Very light grey';
    if (step <= '500') return 'Light grey';
    if (step <= '700') return 'Medium grey';
    if (step <= '900') return 'Dark grey';
    return 'Very dark grey (near black)';
  } else {
    if (step <= '300') return 'Very dark grey (near black)';
    if (step <= '500') return 'Dark grey';
    if (step <= '700') return 'Medium grey';
    if (step <= '900') return 'Light grey';
    return 'Very light grey';
  }
}

const csvContent = csvLines.join('\n');
fs.writeFileSync('./packages/tokens/neutral-ramp-colors.csv', csvContent);

console.log('✅ Generated: packages/tokens/neutral-ramp-colors.csv');
console.log(`   ${csvLines.length - 1} color entries\n`);

// Now find exact matches for requested colors
console.log('🔍 Finding tokens for requested colors:\n');

const targetColors = {
  '#1a1a1a': 'Primary text (light mode)',
  '#333333': 'Secondary text (light mode)'
};

Object.entries(targetColors).forEach(([hex, purpose]) => {
  console.log(`${purpose}: ${hex.toUpperCase()}`);

  // Find in light mode
  const lightMatch = Object.entries(lightNeutral).find(
    ([_, data]) => data.value.toLowerCase() === hex.toLowerCase()
  );

  if (lightMatch) {
    console.log(`  ✓ Light mode: neutral.${lightMatch[0]}`);
  }

  // Find in dark mode
  const darkMatch = Object.entries(darkNeutral).find(
    ([_, data]) => data.value.toLowerCase() === hex.toLowerCase()
  );

  if (darkMatch) {
    console.log(`  ✓ Dark mode: neutral.${darkMatch[0]}`);
  }
  console.log('');
});

console.log('📊 Token Mapping Summary:');
console.log('═══════════════════════════════════════════════════\n');
console.log('LIGHT MODE (100=WHITE → 1000=BLACK):');
console.log('  text.primary: neutral.950 (#1A1A1A) ← Target color');
console.log('  text.secondary: neutral.900 (#333333) ← Target color\n');

console.log('DARK MODE (100=BLACK → 1000=WHITE):');
console.log('  text.primary: neutral.1000 (#FFFFFF)');
console.log('  text.secondary: neutral.900 (#CCCCCC) ← Inverted ramp!\n');

console.log('💡 Key Insight:');
console.log('  Same token NAME (neutral.900) = Different HEX values');
console.log('  Light: #333 (dark grey on white)');
console.log('  Dark: #CCC (light grey on black)\n');
