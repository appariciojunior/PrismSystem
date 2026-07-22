import fs from 'fs';

const file = './packages/tokens/src/tokens.json';
const raw = fs.readFileSync(file, 'utf8');
const data = JSON.parse(raw);

const LIGHT_THEME_PREFIX = 'Palette - Light/';
const LIGHT_THEME_SUFFIX = ' - Light';

const neutral950 = '{brand.core.ramp.core.neutral.950}';
const neutral900 = '{brand.core.ramp.core.neutral.900}';

let themesUpdated = 0;
let channelsUpdated = 0;

for (const [key, theme] of Object.entries(data)) {
  if (!key.startsWith(LIGHT_THEME_PREFIX) || !key.endsWith(LIGHT_THEME_SUFFIX))
    continue;

  // Update global text tokens in light themes
  if (theme.text && theme.text.primary && theme.text.primary.value) {
    if (theme.text.primary.value !== neutral950) {
      theme.text.primary.value = neutral950;
      themesUpdated++;
    }
  }
  if (theme.text && theme.text.secondary && theme.text.secondary.value) {
    if (theme.text.secondary.value !== neutral900) {
      theme.text.secondary.value = neutral900;
      themesUpdated++;
    }
  }

  // Update channel-specific non-interactive text tokens
  if (theme.channel && theme.channel.text) {
    const chText = theme.channel.text;
    if (
      chText.primary &&
      chText.primary.value &&
      chText.primary.value !== neutral950
    ) {
      chText.primary.value = neutral950;
      channelsUpdated++;
    }
    if (
      chText.secondary &&
      chText.secondary.value &&
      chText.secondary.value !== neutral900
    ) {
      chText.secondary.value = neutral900;
      channelsUpdated++;
    }
  }
}

fs.writeFileSync(file, JSON.stringify(data, null, 2));

console.log(
  `Updated ${themesUpdated} theme text tokens and ${channelsUpdated} channel text tokens in light mode.`
);
