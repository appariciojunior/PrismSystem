---
name: dark-mode-mapping
description: CRITICAL - Map between light/dark mode ramp steps correctly. Documents the neutral ramp REVERSAL where step 50 and 1000 swap between white/black.
license: MIT
metadata:
  category: color-ramps
  agents: [Architect, Code, Testing]
  autonomy: autonomous (essential knowledge)
---

# Dark Mode Mapping

## Purpose

Map between light and dark mode ramp steps correctly, accounting for the neutral ramp REVERSAL in dark mode.

## ⚠️ CRITICAL KNOWLEDGE

**Dark mode neutral ramps are REVERSED:**

| Step | Light Mode            | Dark Mode            |
| ---- | --------------------- | -------------------- |
| 50   | #ffffff (white)       | #000000 (black)      |
| 100  | #f2f2f2 (light gray)  | #0c0c0c (dark gray)  |
| 500  | #808080 (medium gray) | #808080 (medium)     |
| 900  | #1a1a1a (dark gray)   | #e6e6e6 (light gray) |
| 1000 | #000000 (black)       | #ffffff (white)      |

**This means:**

- Same semantic meaning (e.g., "primary text") uses SAME step number
- But the ACTUAL COLOR is different between modes
- To get white text in dark mode, use `neutral.1000` (not neutral.50!)

## Preconditions

- Understanding of semantic intent (what color do I WANT?)
- Knowledge of which ramp is being used

## Inputs

| Parameter         | Type   | Required | Description                                                |
| ----------------- | ------ | -------- | ---------------------------------------------------------- |
| `semantic_intent` | string | yes      | What you want: `white`, `black`, `light-gray`, `dark-gray` |
| `ramp`            | string | no       | Ramp name (default: `neutral`)                             |
| `mode`            | enum   | yes      | Target mode: `light` or `dark`                             |

## Procedure

### Step 1: Define Intent-to-Step Mapping

```python
# For NEUTRAL ramp specifically (most common case)
NEUTRAL_MAPPING = {
    'light': {
        # Intent → Step (in light mode)
        'white': 50,
        'near-white': 100,
        'very-light-gray': 150,
        'light-gray': 300,
        'medium-gray': 500,
        'dark-gray': 700,
        'near-black': 900,
        'black': 1000
    },
    'dark': {
        # Intent → Step (in dark mode - REVERSED for white/black!)
        'white': 1000,  # ← KEY: In dark mode, step 1000 = white
        'near-white': 900,
        'very-light-gray': 850,
        'light-gray': 700,
        'medium-gray': 500,
        'dark-gray': 300,
        'near-black': 100,
        'black': 50  # ← KEY: In dark mode, step 50 = black
    }
}

def get_step_for_intent(intent, mode):
    """Get the correct step number for semantic intent in given mode"""
    mapping = NEUTRAL_MAPPING[mode]
    return mapping.get(intent, mapping['medium-gray'])
```

### Step 2: Common Use Cases

```python
USE_CASES = {
    'primary-text-on-canvas': {
        'light': {'intent': 'black', 'step': 1000},  # Black text
        'dark': {'intent': 'white', 'step': 1000}    # White text (SAME step!)
    },
    'secondary-text-on-canvas': {
        'light': {'intent': 'dark-gray', 'step': 700},
        'dark': {'intent': 'light-gray', 'step': 700}  # SAME step, different color
    },
    'surface-canvas': {
        'light': {'intent': 'white', 'step': 50},   # White background
        'dark': {'intent': 'black', 'step': 50}     # Black background (SAME step!)
    },
    'surface-elevated': {
        'light': {'intent': 'white', 'step': 50},
        'dark': {'intent': 'near-black', 'step': 100}  # Slightly lighter than canvas
    },
    'border-default': {
        'light': {'intent': 'light-gray', 'step': 300},
        'dark': {'intent': 'dark-gray', 'step': 300}  # SAME step!
    }
}
```

### Step 3: Verification Workflow

```python
def verify_dark_mode_token(token_path, expected_color_intent):
    """
    Verify a dark mode token produces the expected visual result.

    ALWAYS run this when implementing dark mode tokens!
    """
    import json

    # Use hex_lookup MCP tool for resolved hex values

    # Get the step from the token
    # Look up the DARK mode hex value for that step
    # Verify it matches the expected intent

    print(f"Token: {token_path}")
    print(f"Expected: {expected_color_intent}")
    print(f"Step used: {step}")
    print(f"Actual hex (dark mode): {actual_hex}")
    print(f"Matches intent: {matches}")
```

## Outputs

| Output      | Type   | Description                                   |
| ----------- | ------ | --------------------------------------------- |
| `step`      | number | Correct step number for the mode              |
| `intent`    | string | The semantic intent being mapped              |
| `mode`      | string | Which mode this applies to                    |
| `hex_value` | string | Resolved hex color for this step in this mode |

## Error Handling

| Error                   | Recovery                                |
| ----------------------- | --------------------------------------- |
| `Intent not recognized` | Use closest semantic match from mapping |
| `Ramp not found`        | Verify ramp exists in tokens.json       |
| `Mode mismatch`         | Double-check mode parameter             |

## Examples

### Example 1: Primary text in both modes

```
INVOKE: skill/color-ramps/dark-mode-mapping
INPUTS: { semantic_intent: "black-text-on-white-bg" }

For light/ core.text.primary:
  Mode: light
  Intent: black text on white
  Step: 1000 (neutral.1000 in light = #000000)
  ✅ Correct

For dark/ core.text.primary:
  Mode: dark
  Intent: white text on black
  Step: 1000 (neutral.1000 in dark = #ffffff)  ← SAME step, different color!
  ✅ Correct
```

### Example 2: Canvas surface in both modes

```
INVOKE: skill/color-ramps/dark-mode-mapping
INPUTS: { semantic_intent: "background-surface" }

For light/ core.surface.canvas:
  Mode: light
  Intent: white background
  Step: 50 (neutral.50 in light = #ffffff)
  ✅ Correct

For dark/ core.surface.canvas:
  Mode: dark
  Intent: black background
  Step: 50 (neutral.50 in dark = #000000)  ← SAME step, different color!
  ✅ Correct
```

### Example 3: Common MISTAKE to avoid

```
❌ WRONG: "I need white in dark mode, so I'll use neutral.50"
   Result: neutral.50 in dark mode = #000000 (BLACK!)

✅ RIGHT: "I need white in dark mode, checking CSV..."
   Reference shows: neutral.1000 in dark mode = #ffffff (WHITE!)
   Use step: 1000
```

## Quick Reference Table

### Neutral Ramp - Same Step, Different Colors

| Semantic Use Case | Step | Light Mode Color | Dark Mode Color |
| ----------------- | ---- | ---------------- | --------------- |
| Primary text      | 1000 | #000000 (black)  | #ffffff (white) |
| Canvas surface    | 50   | #ffffff (white)  | #000000 (black) |
| Secondary text    | 700  | #404040 (dark)   | #a0a0a0 (light) |
| Default border    | 300  | #b0b0b0 (light)  | #505050 (dark)  |
| Disabled text     | 500  | #808080          | #808080         |

### Other Color Ramps (NOT inverted)

For non-neutral ramps (blue, red, green, etc.):

- Steps maintain relative meaning (lower = lighter, higher = darker)
- Dark mode adjustments come from `$extensions` modifiers
- Same step number typically works for both modes

## Decision Tree

```
Need to set a dark mode token color?
│
├─ Is it neutral/grayscale?
│   ├─ YES → Check this skill's mapping table
│   │         Use hex_lookup MCP tool for exact hex
│   │         Remember: 50↔1000 endpoints are SWAPPED
│   │
│   └─ NO → Use same step as light mode
│            Dark mode modifiers handle adjustment
│
└─ Verify with CSV data before committing
```

## Reference

- Full hex values by mode: `hex_lookup` MCP tool
- Identify base steps: `python3 packages/tokens/scripts/colors/identify-ramp-base-steps.py`
