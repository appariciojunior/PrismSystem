# Inter fonts (iOS)

All design-system typography uses a single family: **Inter**. The old
proprietary type families have been retired. The `DSTypography` presets now reference these `FontFace` cases:

| FontFace case      | File                | PostScript name  |
| ------------------ | ------------------- | ---------------- |
| `.interRegular`    | `Inter-Regular.ttf` | `Inter-Regular`  |
| `.interItalic`     | `Inter-Italic.ttf`  | `Inter-Italic`   |
| `.interMedium`     | `Inter-Medium.ttf`  | `Inter-Medium`   |
| `.interSemiBold`   | `Inter-SemiBold.ttf`| `Inter-SemiBold` |
| `.interBold`       | `Inter-Bold.ttf`    | `Inter-Bold`     |

The `.ttf` files ship alongside this README in `src/Fonts/`.

## Registering the fonts

This package is distributed as source and does not build an app bundle itself,
so adopting apps must register the Inter faces at runtime or via their bundle.

### UIKit / Info.plist

Copy the five `.ttf` files into your app target and add them under
`UIAppFonts` (Fonts provided by application) in your `Info.plist`:

```xml
<key>UIAppFonts</key>
<array>
  <string>Inter-Regular.ttf</string>
  <string>Inter-Italic.ttf</string>
  <string>Inter-Medium.ttf</string>
  <string>Inter-SemiBold.ttf</string>
  <string>Inter-Bold.ttf</string>
</array>
```

### SwiftUI / Swift Package Manager

Add the `Fonts` directory to your target resources (for example
`.copy("Fonts")` in `Package.swift`) and register each face on launch with
`CTFontManagerRegisterFontsForURL`, then reference them through the
`FontFace` cases listed above.

Map any weight your `FontFace` enum still exposes to the nearest shipped face:
Light and Book fall back to `.interRegular`; ExtraBold, Black and Heavy fall
back to `.interBold`.
