# Release Notes

## [Unreleased]

### Summary

This release introduces a significant update to typography tokens and the Link component. Typography tokens for `linkInline` and `linkStandalone` now include `regular` and `bold` weight sub-groups. The Link component gains a new `emphasis` boolean property to support weight toggling, enhancing semantic clarity and alignment with design principles.

### Key Updates

- **Link Component Emphasis Property**: New boolean `emphasis` property enables weight toggling.
  - `emphasis=false` (default): Uses regular-weight text tokens (`linkInline.regular`, `linkStandalone.regular`).
  - `emphasis=true`: Uses bold-weight text tokens (`linkInline.bold`, `linkStandalone.bold`).
  - Independent of other properties; works with all intent, sentiment, inline, and size combinations.

- **New Token Structure**: Added `regular` and `bold` sub-groups for `linkInline` and `linkStandalone`.
  - `brand.regular` → `fontWeight040`
  - `brand.bold` → `fontWeight070`
  - `utility.regular` → `fontWeight050` (Medium)

### Breaking Changes

- Flat `linkInline` and `linkStandalone` tokens have been removed. Migration to the new structure is required.

### Migration Guide

- Update your references:
  - `linkInline` → `linkInline.regular` or `linkInline.bold`
  - `linkStandalone` → `linkStandalone.regular` or `linkStandalone.bold`

### Validation

- JSON structure validated.
- Build and test processes confirmed compatibility.
