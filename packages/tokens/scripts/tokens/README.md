# Token Utility Scripts

Quick reference for analysis, transformation, and reporting utilities located in this directory.

## Analysis & Validation

### analyze-channel-text.js

Analyze channel token usage patterns and text rendering characteristics. Produces statistics on channel token distribution across the system.

```bash
node analyze-channel-text.js
```

### check-overlay.js

Validate overlay color specifications for accessibility and contrast requirements. Identifies overlay tokens that may have contrast issues.

```bash
node check-overlay.js
```

## Transformation & Cleanup

### deep-clean-tokens.py

Sanitize and validate token data, removing inconsistencies and orphaned references. Produces a cleaned copy of tokens.json.

```bash
python3 deep-clean-tokens.py
```

### fix-interactive-cascade.py

Repair interactive token layer structure to follow semantic cascade pattern. Ensures interactive tokens inherit from base interactive token properly.

```bash
python3 fix-interactive-cascade.py
```

### fix-primary-text-contrast.py

Fix text contrast accessibility issues in primary text tokens. Ensures all text tokens meet WCAG contrast requirements.

```bash
python3 fix-primary-text-contrast.py
```

### fix-primary-text-neutral.py

Normalize neutral text token values across the system. Ensures consistent neutral text styling.

```bash
python3 fix-primary-text-neutral.py
```

### flatten-tokens-correct.py

Flatten nested token structure to a flatter hierarchy. Useful for simplifying token organization.

```bash
python3 flatten-tokens-correct.py
```

### flatten-tokens-fontsizes.py

Flatten font size token nesting to simplify typography token structure.

```bash
python3 flatten-tokens-fontsizes.py
```

## Reporting & Export

### generate-color-csv.js

Export color analysis to CSV format for external tools and reporting. Generates a spreadsheet with color token definitions and metrics.

```bash
node generate-color-csv.js
```

## Usage Notes

- All scripts operate on `../../src/tokens.json` (relative path from this directory)
- Some scripts create output files; check script headers for output locations
- Always backup tokens.json before running transformation scripts
- Validate with `npm run test:output` after using these utilities
- For bulk token operations, consider using `token-operations.py` instead (parent scripts/ directory)

## Running from Project Root

From the project root, you can run utilities like:

```bash
# From project root
node packages/tokens/scripts/tokens/analyze-channel-text.js
python3 packages/tokens/scripts/tokens/deep-clean-tokens.py

# Or from packages/tokens/ directory
cd packages/tokens
node scripts/tokens/analyze-channel-text.js
python3 scripts/tokens/deep-clean-tokens.py
```

## Integration with Token Operations

These utilities are standalone tools. For automated, parameterized bulk edits, use the main token-operations.py interface:

```bash
python3 scripts/token-operations.py reorder "Foundation.spacing" --pattern numeric
python3 scripts/token-operations.py describe "Foundation.colors.*" --template "Color token"
```

See `scripts/token-operations.py` documentation for full details.
