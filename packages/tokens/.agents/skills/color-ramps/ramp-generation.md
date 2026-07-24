---
name: ramp-generation
description: Generate or modify color ramps with proper foundation references. Maintains consistent step intervals (50-1000) and applies OKLCH lightness modifiers.
license: MIT
metadata:
  category: color-ramps
  agents: [Architect, Code, Testing]
  autonomy: requires-approval (palette change)
---

# Ramp Generation

## Purpose

Generate or modify color ramps with proper foundation references, maintaining consistent step intervals and accessibility.

## Preconditions

- Foundation base color exists for the ramp
- Ramp naming convention understood (50, 100, 150... 1000)
- Understanding of light/dark mode ramp structure

## Inputs

| Parameter    | Type     | Required | Description                                                          |
| ------------ | -------- | -------- | -------------------------------------------------------------------- |
| `ramp_name`  | string   | yes      | Name for the ramp (e.g., `neutral`, `sky`, `brand-blue`)             |
| `base_color` | string   | yes      | Foundation color reference (e.g., `{foundation.brand.digital.blue}`) |
| `base_step`  | number   | no       | Which step is the base color (varies by ramp, usually 500-1000)      |
| `mode`       | enum     | yes      | `light`, `dark`, or `both`                                           |
| `steps`      | number[] | no       | Custom steps array (default: 50-1000 by 50s)                         |

## Procedure

### Step 1: Verify Foundation Color Exists

```python
import json

with open('packages/tokens/src/tokens.json') as f:
    data = json.load(f)

def extract_foundation_ref(ref_string):
    """Extract foundation path from {reference}"""
    import re
    match = re.search(r'\{([^}]+)\}', ref_string)
    return match.group(1) if match else ref_string

def verify_foundation_exists(ref_path):
    """Check foundation color exists"""
    parts = ref_path.split('.')
    obj = data
    for part in parts:
        if part not in obj:
            return False, f"Path segment '{part}' not found"
        obj = obj[part]
    return True, obj.get('value', obj)

exists, result = verify_foundation_exists(extract_foundation_ref(base_color))
if not exists:
    raise ValueError(f"Foundation color not found: {result}")
```

### Step 2: Define Ramp Structure

```python
# Standard ramp steps (19 total)
DEFAULT_STEPS = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500,
                 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000]

def generate_ramp_structure(ramp_name, base_color, base_step, mode):
    """Generate ramp token structure"""
    ramp = {}

    for step in DEFAULT_STEPS:
        token = {
            "type": "color",
            "description": ""
        }

        if step == base_step:
            # Base step references foundation directly
            token["value"] = base_color
            token["description"] = "🎨 Brand base color"
        else:
            # Other steps have modifiers
            # Calculate lightness adjustment based on step
            lightness_delta = calculate_lightness(step, base_step)
            token["value"] = base_color
            token["$extensions"] = {
                "studio.tokens": {
                    "modify": {
                        "type": "lightness",
                        "value": str(lightness_delta),
                        "space": "oklch"
                    }
                }
            }

        ramp[str(step)] = token

    return ramp
```

### Step 3: Calculate Lightness Modifiers

```python
def calculate_lightness(step, base_step):
    """
    Calculate lightness modifier for each step.

    Light mode: lower steps = lighter, higher steps = darker
    Base step = 0 modifier
    """
    # Steps from base
    delta = step - base_step

    # Each step is ~2.5% lightness change
    # Negative = lighter, positive = darker
    lightness_change = (delta / 50) * 2.5

    return round(lightness_change, 1)

# Example for neutral ramp with base at 500:
# Step 50:  lightness = -22.5% (very light)
# Step 500: lightness = 0% (base)
# Step 1000: lightness = +25% (very dark)
```

### Step 4: Handle Light/Dark Mode Differences

```python
def create_mode_ramps(ramp_name, base_color, base_step):
    """Create both light and dark mode ramps"""

    # Light mode: normal progression
    light_ramp = generate_ramp_structure(ramp_name, base_color, base_step, 'light')

    # Dark mode: For neutral ramps, the ramp is INVERTED
    # (light mode 50=white becomes dark mode 50=black)
    # Other color ramps typically keep same structure but different base

    if ramp_name == 'neutral':
        # Neutral is special: endpoints swap
        dark_ramp = generate_inverted_neutral_ramp(base_color)
    else:
        # Other colors: same structure, potentially different modifiers
        dark_ramp = generate_ramp_structure(ramp_name, base_color, base_step, 'dark')

    return {
        'light': light_ramp,
        'dark': dark_ramp
    }

def generate_inverted_neutral_ramp(base_color):
    """
    For dark mode neutral: 50=black, 1000=white (inverted from light)
    """
    ramp = {}

    # In dark mode:
    # Step 50 = foundation.brand.black
    # Step 1000 = foundation.brand.white

    ramp['50'] = {"value": "{foundation.brand.black}", "type": "color"}
    # ... intermediate steps with modifiers
    ramp['1000'] = {"value": "{foundation.brand.white}", "type": "color"}

    return ramp
```

## Outputs

| Output        | Type   | Description                       |
| ------------- | ------ | --------------------------------- |
| `ramp`        | object | Generated ramp structure          |
| `base_step`   | number | Which step is the unmodified base |
| `mode`        | string | Which mode(s) generated           |
| `steps_count` | number | Number of steps in ramp           |
| `validation`  | object | Pre-validation results            |

## Error Handling

| Error                        | Recovery                                                   |
| ---------------------------- | ---------------------------------------------------------- |
| `Foundation color not found` | Check foundation token exists; may need to create it first |
| `Invalid step interval`      | Use standard steps (50-1000 by 50s)                        |
| `Base step not in range`     | Adjust base_step to valid step number                      |

## Examples

### Example 1: Generate new brand color ramp

```
INVOKE: skill/color-ramps/ramp-generation
INPUTS: {
  ramp_name: "brand-purple",
  base_color: "{foundation.brand.digital.purple}",
  base_step: 600,
  mode: "both"
}
RESULT: {
  ramp: {
    light: { "50": {...}, "100": {...}, ... "1000": {...} },
    dark: { "50": {...}, "100": {...}, ... "1000": {...} }
  },
  base_step: 600,
  steps_count: 19,
  validation: { all_steps_valid: true }
}
```

### Example 2: Identify base step in existing ramp

```python
def identify_base_step(ramp_data):
    """Find which step has no modifier (the base)"""
    for step, token in ramp_data.items():
        if '$extensions' not in token or 'modify' not in token.get('$extensions', {}).get('studio.tokens', {}):
            return int(step)
    return None

# Usage:
base = identify_base_step(data['light/ brand']['brand']['core']['ramp']['neutral'])
print(f"Neutral ramp base step: {base}")
```

## Best Practices

1. **Always verify foundation first**: Ramp must reference existing foundation color
2. **Document base step**: Mark with 🎨 description or note in architecture
3. **Test both modes**: Generate and verify light AND dark mode ramps
4. **Use oklch color space**: Perceptually uniform lightness adjustments
5. **Standard intervals**: Stick to 50-step intervals for consistency
