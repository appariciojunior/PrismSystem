# @ds/theme-ios

Design System theme package for iOS with Swift color definitions, typography tokens, and Xcode asset catalog support.

## Installation

```bash
npm install @ds/theme-ios
```

## Contents

### Swift Color Files

Pre-generated Swift files for iOS color assets:

```
src/Colors/
├── DarkCoreColors.swift
├── LightCoreColors.swift
├── DarkBrandColors.swift
├── LightBrandColors.swift
├── DarkChannelsColors.swift
├── LightChannelsColors.swift
└── ... (30+ color definition files)
```

### Xcode Asset Catalog

Complete color asset catalog ready for Xcode projects:

```
src/DS[Theme]/Colors/[ColorName].colorset/
├── Contents.json          # RGBA + dark mode appearance
└── ... (2,700+ color definitions)
```

### Spacing and Typography

```
src/
├── DSSpacing.swift       # Spacing token definitions (CGFloat)
└── DSTypography.swift    # Typography token definitions
```

## Usage

### In Your Xcode Project

1. **Copy the generated files** to your iOS project:

```bash
cp -r node_modules/@ds/theme-ios/src/* YourProject/DesignTokens/
```

2. **Add to Xcode** by dragging the folders into your project navigator

3. **Use in Swift code**:

```swift
import UIKit

class MyViewController: UIViewController {
  override func viewDidLoad() {
    super.viewDidLoad()

    // Use color tokens
    view.backgroundColor = UIColor(named: "SurfaceCanvas")

    // Use brand colors
    button.backgroundColor = UIColor(named: "BrandHome500")

    // Use spacing
    label.text = "Hello"
    label.font = UIFont.systemFont(ofSize: CGFloat.DSSpacing100)
  }
}
```

### Swift Color Definitions

Each color file contains semantic and brand color definitions:

```swift
class DarkCoreColors: DSColors {
  override val surfaceCanvas = UIColor(hex: 0xFF000000)
  override val surfaceLevel1 = UIColor(hex: 0xFF0D0D0D)
  override val textPrimary = UIColor(hex: 0xFFFFFFFF)
  override val textSecondary = UIColor(hex: 0xFFD9D9D9)
  // ... 200+ color properties
}
```

### Using with SwiftUI

```swift
import SwiftUI

struct ContentView: View {
  var body: some View {
    VStack {
      Text("Heading")
        .font(.system(size: 2.25 * 16)) // Use DSTypography.swift values
        .foregroundColor(Color(UIColor(named: "TextPrimary")!))

      Text("Body text")
        .font(.system(.body))
        .padding(CGFloat.DSSpacing100)
        .background(Color(UIColor(named: "SurfaceCanvas")!))
    }
  }
}
```

## Token Categories

### Colors (2,700+)

#### Semantic Colors

```
SurfaceCanvas, SurfaceLevel1-4, SurfaceInverse
TextPrimary, TextSecondary, TextTertiary
BorderPrimary, BorderSecondary
InteractivePrimary, InteractiveSecondary
```

#### Brand & Channel Colors

```
BrandHome500, BrandBusiness500, BrandSport500
BrandMoney500, BrandComment500, etc.
ChannelWorld500, ChannelUk500, etc.
```

#### Feedback Colors

```
FeedbackError, FeedbackSuccess, FeedbackWarning, FeedbackInfo
InputBorder*, InputFill*, InputText*
```

### Spacing (20 values)

```swift
CGFloat.DSSpacing025    // 0.25rem (4pt)
CGFloat.DSSpacing050    // 0.5rem (8pt)
CGFloat.DSSpacing100    // 1rem (16pt)
CGFloat.DSSpacing200    // 1.5rem (24pt)
// ... up to DSSpacing400
```

### Typography

```swift
// Font sizes
DSTypography.fontSize025    // 0.75rem
DSTypography.fontSize100    // 2.25rem

// Line heights
DSTypography.lineHeightTight
DSTypography.lineHeightNormal

// Font families
DSTypography.fontFamilySans
DSTypography.fontFamilySerif
```

## Dark Mode Support

All colors are automatically configured with dynamic appearance support:

```swift
// Automatically switches between light and dark
let color = UIColor(named: "TextPrimary")

// In SwiftUI
Color(UIColor(named: "SurfaceCanvas")!)
```

The colors use Xcode's dynamic appearance feature to switch based on:

- System appearance settings
- Trait collection (light/dark)

## File Structure

```
dist/
├── DSCoreColors.swift              # Core color definitions
├── DSSpacing.swift                 # Spacing tokens
├── DSTypography.swift              # Typography tokens
└── DS[Theme]/Colors/               # Xcode asset catalogs
    ├── DSBrandColors.colorset/
    ├── DSSemanticColors.colorset/
    └── ... (2,700+ color sets)
```

## Compatibility

- **iOS**: 12.0+
- **Swift**: 5.0+
- **Xcode**: 12.0+
- **macOS**: 10.15+
- **tvOS**: 12.0+
- **watchOS**: 5.0+

## Building

To rebuild after token changes:

```bash
npm run build
```

This generates:

- Swift color class definitions
- Xcode asset catalog with Contents.json files
- Dynamic appearance setup for dark mode

## License

ISC

#### Palette Tokens (Pre-resolved Colors)

```javascript
tokens.brand.primary; // Color ramp with 19 steps (100-1000)
tokens.channels.comment; // Channel-specific colors
tokens.dataVisualisation.data01; // Data visualization colors
```

#### Semantic Tokens

```javascript
tokens.semanticColor.surface.default; // "rgba(255, 255, 255, 1.00)"
tokens.semanticColor.text.primary; // "rgba(26, 26, 26, 1.00)"
tokens.semanticColor.interactive.primary; // Brand color for interactive elements
```

## Browser Support

All CSS custom properties (--ds-\*) are supported in modern browsers (Chrome, Firefox, Safari, Edge).

For older browsers, use the JavaScript tokens with fallback values:

```javascript
const fontSize = tokens.Foundation.fontSize100 || '2.25rem';
```

## Building

To rebuild the package after modifying tokens:

```bash
npm run build
```

This will:

1. Clean the `dist/` directory
2. Build ESM and CJS JavaScript modules
3. Copy CSS variables to dist/

## Publishing

```bash
npm publish
```

The package is configured with public access and will publish to the public npm registry.

## License

ISC
