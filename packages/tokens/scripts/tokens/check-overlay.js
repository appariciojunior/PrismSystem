import tokens from './packages/tokens/src/tokens.json';

// Find overlay tokens
const Brand = tokens['Palette - Light/ Brand'];
if (Brand?.brand?.core?.ramp?.digital?.overlay?.dark) {
  const overlay = Brand.brand.core.ramp.digital.overlay.dark;
  console.log('Overlay dark token 100 structure:');
  console.log('  value:', overlay['100']?.value);
  console.log('  type:', overlay['100']?.type);
  console.log('  $extensions:', overlay['100']?.$extensions);
  console.log(
    '  has modify?:',
    !!overlay['100']?.$extensions?.['studio.tokens']?.modify
  );
}
