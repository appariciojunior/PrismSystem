# Token Studio Architecture

**Purpose**: Technical reference for understanding how Token Studio maps design tokens to Figma Variables  
**Audience**: Developers, technical designers, plugin developers  
**Related**: [01-token-naming.md](01-token-naming.md), [05-color-ramps.md](05-color-ramps.md)

---

## Overview

Token Studio is a Figma plugin that bridges design tokens (JSON) with Figma's native Variables system. Understanding this architecture is critical for:

1. Maintaining token structure compatibility
2. Debugging sync issues
3. Understanding how themes/modes work
4. Planning future plugin development

---

## The `$themes` Array

Token Studio uses a `$themes` array at the root of `tokens.json` to define how token sets map to Figma Collections and Modes.

### Structure

```json
{
  "$themes": [
    {
      "id": "unique-identifier",
      "name": "☀️ Core",
      "group": "Theme",
      "selectedTokenSets": {
        "foundation": "source",
        "light/ brand": "source",
        "light/ core": "enabled"
      }
    }
  ]
}
```

### Properties Mapping

- `group`
  Maps to Figma Collection.
  Example: `"Theme"` -> Collection `Theme`.
- `name`
  Maps to Mode within a collection.
  Example: `"☀️ Core"` -> Mode `☀️ Core`.
- `id`
  Unique identifier used internally for the theme.
  Example: `"light-core-theme"`.
- `selectedTokenSets`
  Active token hierarchy source configuration.
  Example: `{"foundation": "source"}`.

### Token Set Status Types

| Status       | Meaning                             | Example Use                                 |
| ------------ | ----------------------------------- | ------------------------------------------- |
| `"enabled"`  | Primary active tokens for this mode | Semantic theme tokens (e.g., "light/ core") |
| `"source"`   | Inherited/fallback tokens           | Foundation primitives, Palette ramps        |
| `"disabled"` | Explicitly excluded                 | Unused token sets                           |

---

## Current Collections

The Design System uses three primary collections:

### 1. Mode Collection

**Purpose**: Base light/dark mode switch  
**Modes**:

- ☀️ Light
- 🌑 Dark

**Token Sets**:

- Light mode: `foundation`, `light/ brand`, `light/ core`, etc.
- Dark mode: `foundation`, `dark/ brand`, `dark/ core`, etc.

### 2. Theme Collection

**Purpose**: Core semantic tokens  
**Modes**:

- ☀️ Core (default)
- 📰 Comment
- 🎨 Life & Style
- 🧩 Puzzles
- 🎮 Gaming
- 📱 Culture
- 💼 Business
- ⚽ Sport
- 🌍 News
- 💡 Opinion
- 🧑 Subscriber
- 🔄 Whitelabel

**Token Sets**:
Each mode has corresponding light/dark semantic sets (e.g., `light/ core`, `dark/ core`)

### 3. Viewport Collection

**Purpose**: Responsive spacing and typography  
**Modes**:

- 📱 Small (0-767px)
- 💻 Medium (768-1023px)
- 🖥️ Large (1024-1439px)
- 📺 XLarge (1440px+)

**Token Sets**:

- `viewport/ small`
- `viewport/ medium`
- `viewport/ large`
- `viewport/ xlarge`

---

## Token Resolution Flow

When Token Studio resolves token references, it follows this hierarchy:

```
1. Current enabled set (e.g., "light/ core")
   ↓ (if not found)
2. Source sets in order (e.g., `light/ brand`)
   ↓ (if not found)
3. Foundation set
   ↓ (if not found)
4. ERROR: Unresolved reference
```

### Example Resolution

For token `{brand.core.ramp.neutral.1000}` in light/ core mode:

```json
{
  "$themes": [
    {
      "name": "☀️ Core",
      "selectedTokenSets": {
        "foundation": "source", // Step 3
        "light/ brand": "source", // Step 2
        "light/ core": "enabled" // Step 1 (start here)
      }
    }
  ]
}
```

**Resolution**:

1. Check `light/ core` → Not found
2. Check `light/ brand` → Found! `brand.core.ramp.neutral.1000`
3. Resolve value → References `{brand.white}` from Foundation
4. Final resolution → `#FFFFFF`

---

## Figma Variables Metadata

Token Studio stores Figma-specific IDs in the token JSON:

### Collection IDs

```json
{
  "$themes": [
    {
      "$figmaCollectionId": "VariableCollectionId:123:456",
      "$figmaModeId": "789:012"
    }
  ]
}
```

### Variable References

```json
{
  "text": {
    "primary": {
      "value": "{brand.core.ramp.neutral.1000}",
      "$extensions": {
        "studio.tokens": {
          "$figmaVariableReferences": {
            "value": "VariableID:345:678"
          }
        }
      }
    }
  }
}
```

⚠️ **CRITICAL**: Never manually edit `$figmaCollectionId`, `$figmaModeId`, or `$figmaVariableReferences`. These are managed by Token Studio and breaking them severs the design-code sync.

### Variable Scopes (`com.figma.scopes`)

Viewport token sets include `com.figma.scopes` metadata so Figma's variable picker can suggest tokens by property context.

| Token group | Scope value(s)        | Viewport token count |
| :---------- | :-------------------- | -------------------: |
| Spacing     | `WIDTH_HEIGHT`, `GAP` |                  160 |
| Grid        | `GAP`, `WIDTH_HEIGHT` |                   24 |
| Font size   | `FONT_SIZE`           |                  100 |
| **Total**   | -                     |                  284 |

Coverage spans all viewport modes: `viewport/ small`, `viewport/ medium`, `viewport/ large`, and `viewport/ xlarge`.

Note: Viewport `border-radius` tokens already used `CORNER_RADIUS` and were not changed in this rollout.

Semantic interactive link scope definitions are maintained in the canonical master scope tables:
`packages/tokens/docs/reference/semantic-tokens.md` (`#### Link Primary` and `#### Link Secondary`).

---

## Mode Switching Behavior

When switching modes in Figma, Token Studio:

1. Identifies active mode via `$figmaModeId`
2. Loads corresponding `selectedTokenSets` from `$themes`
3. Resolves all token references using the hierarchy
4. Updates Figma variable values
5. Triggers Figma's UI refresh

### Example: Switching from Light to Dark

```
User clicks: Light → Dark mode toggle

Token Studio:
1. Finds `$themes` entry with name "🌑 Dark"
2. Activates: `dark/ brand` (source)
3. Activates: "dark/ core" (enabled)
4. Re-resolves all references:
   - {brand.core.ramp.neutral.1000} now resolves to dark mode value
5. Updates Figma variables
6. UI updates automatically
```

---

## Common Issues & Fixes

### Issue: "Cannot read properties of undefined"

**Cause**: Malformed `$themes` array or missing token set reference

**Fix**:

1. Validate JSON: `python3 -m json.tool tokens.json > /dev/null`
2. Check all `selectedTokenSets` exist in token set list
3. Ensure no typos in token set names

### Issue: Token resolves to wrong value

**Cause**: Token set hierarchy issue or name collision

**Fix**:

1. Check `selectedTokenSets` order (enabled > source)
2. Verify token path uniqueness
3. Test resolution manually:
   ```bash
   jq '.["light/ brand"].brand.core.ramp.neutral["1000"]' tokens.json
   ```

### Issue: Figma variables not updating

**Cause**: Broken `$figmaVariableReferences` or collection IDs

**Fix**:

1. Re-export from Token Studio (generates new IDs)
2. Verify `$figmaCollectionId` matches Figma collection
3. Check variable IDs haven't changed in Figma

---

## Best Practices

### ✅ DO

1. **Use Token Studio for structural changes** (adding collections, modes)
2. **Edit token values/descriptions manually** in JSON (safe for sync)
3. **Test in Token Studio immediately** after JSON edits
4. **Keep selectedTokenSets minimal** (only include what's needed)
5. **Follow semantic → palette → foundation hierarchy**

### ❌ DON'T

1. **Edit `$figma*` metadata manually** (breaks sync)
2. **Add custom keys to `$themes` array** (Token Studio ignores them)
3. **Reference Foundation directly from Semantic** (breaks theme switching)
4. **Use raw values in Palette/Semantic** (violates architecture)
5. **Modify collection/mode IDs** (severs Figma connection)

---

## Reference Schema

### Minimal Valid `$themes` Entry

```json
{
  "id": "unique-id",
  "name": "Display Name",
  "group": "Collection Name",
  "selectedTokenSets": {
    "token-set-name": "enabled|source|disabled"
  }
}
```

### Complete Entry with Figma IDs

```json
{
  "id": "light-core-theme",
  "name": "☀️ Core",
  "group": "Theme",
  "selectedTokenSets": {
    "foundation": "source",
    "light/ brand": "source",
    "light/ core": "enabled"
  },
  "$figmaCollectionId": "VariableCollectionId:123:456",
  "$figmaModeId": "789:012"
}
```

---

## Token Studio Compatibility Rules

To maintain Token Studio compatibility:

1. **JSON must be valid** (no trailing commas, quoted keys)
2. **Follow property naming** (`group`, `name`, `selectedTokenSets` - case-sensitive)
3. **Status values must be exact** (`"enabled"`, `"source"`, `"disabled"` - lowercase)
4. **Token sets must exist** (references in selectedTokenSets must match actual sets)
5. **No custom metadata at root** (unless documented by Token Studio)

---

## Future: A Brand-Specific Plugin

We're planning a brand-specific plugin that will:

1. ✅ Understand our 3-layer architecture natively
2. ✅ Validate semantic → palette → foundation hierarchy
3. ✅ Provide better error messages for DS patterns
4. ✅ Support advanced mode switching with better UX
5. ✅ Export to multiple formats (Style Dictionary, Tailwind, etc.)

**Roadmap**: See [plugin-roadmap.md](https://github.com/your-org/ds/blob/main/packages/tokens/.agents/archive/plugin-roadmap.md) (archived)

---

## Related Documentation

- **Token Naming System**: [01-token-naming.md](01-token-naming.md)
- **Color Ramps**: [05-color-ramps.md](05-color-ramps.md)
- **Elevation System**: [02-elevation-system.md](02-elevation-system.md)
- **Token Studio Docs**: [docs.tokens.studio](https://docs.tokens.studio/)
- **Figma Variables API**: [figma.com/plugin-docs/api/variables](https://www.figma.com/plugin-docs/api/variables/)

---

**Last Updated**: 2025-02-12  
**Maintainer**: Design System Team  
**Questions**: [#ds-support](https://your-workspace.slack.example/ds-support)
