---
name: contrast-check
description: Verify color combinations meet WCAG accessibility contrast requirements. Supports AA (4.5:1) and AAA (7:1) levels for text and UI components.
license: MIT
metadata:
  category: color-ramps
  agents: [Architect, Code, Testing]
  autonomy: autonomous
---

# Contrast Check

## Purpose

Verify color combinations meet WCAG accessibility contrast requirements (AA: 4.5:1, AAA: 7:1).

## Preconditions

- Colors resolved to hex values (not token references)
- Background and foreground colors identified

## Inputs

| Parameter    | Type   | Required | Description                                                   |
| ------------ | ------ | -------- | ------------------------------------------------------------- |
| `foreground` | string | yes      | Foreground color (hex `#RRGGBB` or token path)                |
| `background` | string | yes      | Background color (hex `#RRGGBB` or token path)                |
| `level`      | enum   | no       | Target WCAG level: `AA` (4.5:1) or `AAA` (7:1), default: `AA` |
| `component`  | string | no       | Component type: `normal-text`, `large-text`, `ui-component`   |

## Procedure

### Step 1: Resolve Token References to Hex

```python
import json
import re

def resolve_token_to_hex(token_path, mode='light'):
    """Resolve token path to final hex value"""

    # If already hex, return as-is
    if token_path.startswith('#'):
        return token_path

    with open('packages/tokens/src/tokens.json') as f:
        data = json.load(f)

    # Navigate to token
    token = get_nested(data, token_path)
    if not token:
        raise ValueError(f"Token not found: {token_path}")

    value = token.get('value', token)

    # If reference, resolve recursively
    ref_match = re.search(r'\{([^}]+)\}', str(value))
    if ref_match:
        return resolve_token_to_hex(ref_match.group(1), mode)

    # If has modifier, calculate final color
    if '$extensions' in token:
        modifier = token['$extensions'].get('studio.tokens', {}).get('modify', {})
        if modifier:
            return apply_modifier(value, modifier)

    return value
```

### Step 2: Calculate Relative Luminance

```python
def hex_to_rgb(hex_color):
    """Convert hex to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def relative_luminance(rgb):
    """Calculate relative luminance per WCAG 2.1"""
    def adjust(channel):
        c = channel / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = [adjust(c) for c in rgb]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
```

### Step 3: Calculate Contrast Ratio

```python
def contrast_ratio(color1_hex, color2_hex):
    """Calculate WCAG contrast ratio between two colors"""
    lum1 = relative_luminance(hex_to_rgb(color1_hex))
    lum2 = relative_luminance(hex_to_rgb(color2_hex))

    lighter = max(lum1, lum2)
    darker = min(lum1, lum2)

    return (lighter + 0.05) / (darker + 0.05)
```

### Step 4: Evaluate Against WCAG Thresholds

```python
def evaluate_contrast(ratio, level='AA', component='normal-text'):
    """Evaluate contrast ratio against WCAG requirements"""

    # WCAG 2.1 thresholds
    thresholds = {
        'normal-text': {'AA': 4.5, 'AAA': 7.0},
        'large-text': {'AA': 3.0, 'AAA': 4.5},
        'ui-component': {'AA': 3.0, 'AAA': 4.5}
    }

    required = thresholds.get(component, thresholds['normal-text'])[level]

    return {
        'ratio': round(ratio, 2),
        'required': required,
        'passes': ratio >= required,
        'level': level,
        'component': component,
        'margin': round(ratio - required, 2)
    }
```

### Step 5: Full Check with Token Resolution

```python
def check_contrast(foreground, background, level='AA', component='normal-text', mode='light'):
    """Full contrast check with token resolution"""

    # Resolve tokens to hex
    fg_hex = resolve_token_to_hex(foreground, mode) if not foreground.startswith('#') else foreground
    bg_hex = resolve_token_to_hex(background, mode) if not background.startswith('#') else background

    # Calculate ratio
    ratio = contrast_ratio(fg_hex, bg_hex)

    # Evaluate
    result = evaluate_contrast(ratio, level, component)
    result['foreground'] = {'token': foreground, 'hex': fg_hex}
    result['background'] = {'token': background, 'hex': bg_hex}

    return result
```

## Outputs

| Output       | Type    | Description                            |
| ------------ | ------- | -------------------------------------- |
| `ratio`      | number  | Calculated contrast ratio (e.g., 4.52) |
| `passes`     | boolean | Whether ratio meets required threshold |
| `required`   | number  | Required ratio for level/component     |
| `level`      | string  | WCAG level checked (AA/AAA)            |
| `margin`     | number  | How much above/below threshold         |
| `foreground` | object  | {token, hex} for foreground            |
| `background` | object  | {token, hex} for background            |

## Error Handling

| Error                | Recovery                                   |
| -------------------- | ------------------------------------------ |
| `Token not found`    | Verify token path; check mode (light/dark) |
| `Invalid hex format` | Check for proper #RRGGBB format            |
| `Circular reference` | Use dependency-graph to identify cycle     |

## Examples

### Example 1: Check text on surface

```
INVOKE: skill/color-ramps/contrast-check
INPUTS: {
  foreground: "light/ core.text.primary",
  background: "light/ core.surface.canvas",
  level: "AA",
  component: "normal-text"
}
RESULT: {
  ratio: 15.8,
  passes: true,
  required: 4.5,
  margin: 11.3,
  level: "AA",
  foreground: { token: "light/ core.text.primary", hex: "#000000" },
  background: { token: "light/ core.surface.canvas", hex: "#ffffff" }
}
```

### Example 2: Failing contrast

```
INVOKE: skill/color-ramps/contrast-check
INPUTS: {
  foreground: "#808080",
  background: "#ffffff",
  level: "AA"
}
RESULT: {
  ratio: 4.0,
  passes: false,
  required: 4.5,
  margin: -0.5,
  level: "AA",
  foreground: { token: "#808080", hex: "#808080" },
  background: { token: "#ffffff", hex: "#ffffff" }
}
```

### Example 3: Find passing step

```python
def find_passing_step(ramp_path, background_hex, target_ratio=4.5, mode='light'):
    """Find the first ramp step that passes contrast against background"""

    with open('packages/tokens/src/tokens.json') as f:
        data = json.load(f)

    ramp = get_nested(data, ramp_path)
    passing_steps = []

    for step in sorted(ramp.keys(), key=lambda x: int(x) if x.isdigit() else 0):
        step_hex = resolve_token_to_hex(f"{ramp_path}.{step}", mode)
        ratio = contrast_ratio(step_hex, background_hex)

        if ratio >= target_ratio:
            passing_steps.append({
                'step': step,
                'hex': step_hex,
                'ratio': round(ratio, 2)
            })

    return passing_steps

# Example: Find all neutral steps passing 4.5:1 against white
passing = find_passing_step('light/ brand.brand.core.ramp.neutral', '#ffffff')
print(f"First passing step: {passing[0]['step']} ({passing[0]['ratio']}:1)")
```

## Reference Data

Use `hex_batch_lookup` MCP tool for resolved hex values

Columns include:

- Mode (Light/Dark)
- Ramp name
- Step number
- Hex value
- Contrast vs white
- Contrast vs black

## WCAG Quick Reference

| Level | Normal Text | Large Text | UI Components |
| ----- | ----------- | ---------- | ------------- |
| AA    | 4.5:1       | 3.0:1      | 3.0:1         |
| AAA   | 7.0:1       | 4.5:1      | 4.5:1         |

**Large Text**: 18pt+ or 14pt bold
