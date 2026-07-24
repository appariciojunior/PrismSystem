# Ramp Colors Reference (concise)

For full methodology and implementation details, see the canonical module:

- [Color Ramps & Generation Methodology](../reference-modules/05-color-ramps.md)

Quick pointers:

- Use the `hex_lookup` MCP tool for hex lookups and contrast checks.
- This file intentionally contains only rendered ramp guidance; implementation details live in the reference-module linked above.

```

### Future Enhancements

**Automatic Theme Generation:**

- Generate light mode and dark mode variants automatically
- Auto-map semantic tokens (primary, secondary, success, error)
- Create hover/active/disabled states systematically

**Advanced Accessibility:**

- APCA (future WCAG 3.0) contrast calculations
- Perceptual lightness corrections (CIELAB)
- Colorblind simulation and validation

**Benefits:**
This methodology ensures all color ramps in the Design System are:

- **Visually harmonious**: Equal perceptual steps create natural progression
- **Accessible by default**: Built-in contrast checking eliminates guesswork
- **Systematically scalable**: Repeatable process across any hue
- **Designer-friendly**: Clear documentation for every color step
```
