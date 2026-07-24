import fs from 'fs-extra';
import { hexToRgb } from '../../../../tokens/scripts/colors/process-colour-functions.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const infoObj = {
 info: {
 author: 'xcode',
 version: 1
 }
};

const parseUIColorString = (colorString) => {
 const regex =
 /Red:([\d.]+)f?\s+green:([\d.]+)f?\s+blue:([\d.]+)f?\s+alpha:([\d.]+)f?/;
 const match = colorString.match(regex);

 if (!match) {
 throw new Error(`Invalid UIColor string format: ${colorString}`);
 }

 const formatRGBValue = (value) => {
 const num = parseFloat(value);
 if (num >= 0 && num <= 1) {
 return Math.round(num * 255);
 }
 return Math.round(num);
 };

 return [
 formatRGBValue(match[1]),
 formatRGBValue(match[2]),
 formatRGBValue(match[3]),
 parseFloat(match[4])
 ];
};

const generateInterface = (tokens, interfaceType) => {
 const iosDir = path.resolve(__dirname, `../../../../theme-ios/src`);

 let tokenReferences = tokens.map(
 (tokenRef) => `
 case ${tokenRef.replace('static let', '').split(':')[0].trim()}`
 );

 if (interfaceType === 'Colors') {
 tokenReferences = tokens.map(
 (tokenRef) => `
 case ${tokenRef}`
 );
 }

 const enumContent = `import Foundation
 
public enum DS${interfaceType}Preset: String, CaseIterable {${tokenReferences.join('')}
}`;

 fs.ensureDirSync(iosDir);
 fs.writeFileSync(
 path.join(iosDir, `DS${interfaceType}Preset.swift`),
 enumContent
 );
};

const generateTypographyInterface = (typographyTokens) => {
 const iosDir = path.resolve(__dirname, `../../../../theme-ios/src`);

 const typographyCases = typographyTokens.map(
 (tokenRef) => `
 case ${tokenRef}`
 );

 const switchCaseTokens = (selector) =>
 typographyTokens
.filter((token) => {
 if (typeof selector === 'string') {
 return token.includes(selector);
 }
 if (selector instanceof RegExp) {
 return selector.test(token);
 }
 return false;
 })
.map((token) => `.${token}`)
.join(', ');

 const headlineTokens = switchCaseTokens('Heading');
 const subHeadlineTokens = switchCaseTokens('Subheading');
 const bodyTokens = switchCaseTokens(/Body|Intro|Paragraph|Link/);
 const calloutTokens = switchCaseTokens(/Meta|Button|Label/);
 const footnoteokens = switchCaseTokens(/Caption|Intro/);

 const enumContent = `import UIKit
 
public enum DSTypographyPreset: String, CaseIterable {${typographyCases.join('')}

 var style: UIFont.TextStyle {
 switch self {
 case ${headlineTokens}: return .headline
 case ${subHeadlineTokens}: return .subheadline
 case ${bodyTokens}: return .body
 case ${calloutTokens}: return .callout
 case ${footnoteokens}: return .footnote
 }
 }
}`;

 fs.ensureDirSync(iosDir);
 fs.writeFileSync(path.join(iosDir, 'DSTypographyPreset.swift'), enumContent);
};

const generateBundleFile = (theme) => {
 const iosDir = path.resolve(
 __dirname,
 `../../../../theme-ios/src/DS${theme}/Colors`
 );

 const mergedOutput = `import Foundation

public extension Bundle {
 static let ${theme} = Bundle.module
}
`;

 fs.ensureDirSync(iosDir);
 fs.writeFileSync(
 path.join(iosDir, `Bundle+${theme}Theme.swift`),
 mergedOutput
 );
};

const generateInfoFile = (theme) => {
 const iosDir = path.resolve(
 __dirname,
 `../../../../theme-ios/src/DS${theme}/Colors/${theme}.xcassets`
 );

 fs.ensureDirSync(iosDir);
 fs.writeFileSync(
 path.join(iosDir, `Contents.json`),
 JSON.stringify(infoObj, null, 2) + '\n'
 );
};

export const formatIOSColours = ({ dictionary }) => {
 const outputTokens = dictionary.allTokens
.map((token) => {
 const rgb = token.original.value.includes('#')
 ? hexToRgb(token.original.value)
 : parseUIColorString(token.value);

 const isDarkObj = token.path[0].includes('dark/')
 ? {
 appearances: [
 {
 appearance: 'luminosity',
 value: 'dark'
 }
 ]
 }
 : null;

 const output = {
 token_key: token.path.join('.'),
 token_name: token.name,
 token_value: {
 idiom: 'universal',
 color: {
 'color-space': 'srgb',
 components: {
 alpha: '1.000',
 blue: `${rgb[2]}`,
 green: `${rgb[1]}`,
 red: `${rgb[0]}`
 }
 },
...isDarkObj
 }
 };

 return output;
 })
.filter((token) => !token.token_name.match(/Hover|Pressed/gi));

 const lightTokens = outputTokens.filter((token) =>
 token.token_key.includes('light/')
 );

 const colourTokens = lightTokens.filter((token) =>
 token.token_key.includes('light/ core')
 );

 const interfaceTokens = (tokenArr) =>
 tokenArr.map((token) => {
 const dynamicToken = token.token_key
.replace('light/ ', '')
.replace('-', '')
.split('.')
.map((tokenPart, tokenIndex) =>
 tokenIndex > 0
 ? tokenPart.charAt(0).toUpperCase() + tokenPart.slice(1)
 : ''
 )
.join('');

 return dynamicToken.charAt(0).toUpperCase() + dynamicToken.slice(1);
 });

 outputTokens
.filter((token) => token.token_key.includes('dark/'))
.map((token) => {
 const lightToken = lightTokens.find(
 (t) => t.token_key.replace('light/', 'dark/') === token.token_key
 );

 const fallbackLightValue = {
...token.token_value
 };
 delete fallbackLightValue.appearances;

 const lightTokenValue = lightToken?.token_value || fallbackLightValue;

 const themeDir = token.token_key.split('.')[0].replace('dark/ ', '');
 const formattedThemeDir =
 themeDir.charAt(0).toUpperCase() + themeDir.slice(1);
 const dynamicPath = token.token_key.split('.')[1];
 const formattedDynamicPath =
 dynamicPath.charAt(0).toUpperCase() + dynamicPath.slice(1);
 const dynamicToken = token.token_key
.replace('dark/ ', '')
.replace('-', '')
.split('.')
.map((tokenPart, tokenIndex) =>
 tokenIndex > 0
 ? tokenPart.charAt(0).toUpperCase() + tokenPart.slice(1)
 : `${tokenPart.charAt(0).toUpperCase() + tokenPart.slice(1)}.xcassets/${formattedDynamicPath}/`
 )
.join('');

 const iosDir = path.resolve(
 __dirname,
 `../../../../theme-ios/src/DS${formattedThemeDir}/Colors/${dynamicToken.charAt(0).toUpperCase() + dynamicToken.slice(1)}.colorset`
 );
 const mergedOutput = {
 colors: [token.token_value, lightTokenValue],
...infoObj
 };

 fs.ensureDirSync(iosDir);
 fs.writeFileSync(
 path.join(iosDir, 'Contents.json'),
 JSON.stringify(mergedOutput, null, 2) + '\n'
 );

 generateBundleFile(formattedThemeDir);
 generateInfoFile(formattedThemeDir);

 return {
 colors: [token.token_value, lightTokenValue],
...infoObj
 };
 });

 if (colourTokens.length > 0)
 generateInterface(interfaceTokens(colourTokens), 'Colors');
};

export const formatIOSTypography = ({ dictionary }) => {
 let tokenReferences = [];

 const outputTokens = dictionary.allTokens.map((token) => {
 const tokenReference = token.name.replace('TypographyTokens', '');
 const formattedTokenReference =
 tokenReference.charAt(0).toLowerCase() + tokenReference.slice(1);
 const fontFamilyRef = `${token.value.fontFamily.replaceAll(' ', '')}${token.value.fontWeight || ''}`;
 const formattedFontFamily =
 fontFamilyRef.charAt(0).toLowerCase() + fontFamilyRef.slice(1);
 const formattedFontSize = token.value.fontSize.includes('rem')
 ? eval(token.value.fontSize.replace('rem', '')) * 16
 : token.value.fontSize;

 tokenReferences.push(formattedTokenReference);

 return `
 case .${formattedTokenReference}: return FontStyle(face: .${formattedFontFamily}, size: ${formattedFontSize}, preset: preset)`;
 });

 generateTypographyInterface(tokenReferences);

 return `import Foundation

struct DSTypography: ThemedTypography {
 func fontStyle(for preset: DSTypographyPreset, formatting: TextFormatting) -> FontStyle {
 switch preset {${outputTokens.join('')}
 }
 }
}`;
};

export const formatIOSSpacing = ({ dictionary }) => {
 const outputTokens = dictionary.allTokens.map((token) => {
 const tokenReference = token.name.replace('ViewportSmallS', 's');

 return `
 static let ${tokenReference}: CGFloat = ${token.value}`;
 });

 generateInterface(outputTokens, 'Spacing');

 return `import Foundation

public extension CGFloat {${outputTokens.join('')}
}`;
};
