# Toast Rollout Verification Checklist

Use this checklist whenever Toast semantic tokens are added or changed.

## Scope

- Source of truth: `light/ core.toast` and `dark/ core.toast`
- Rollout target: semantic theme sets only (`core light + core dark`). Exclude non-semantic sets: `brand`, `marketing`, `dataVisualisation`
- Publishing rule: every Toast leaf token must include:

```json
"$extensions": {
  "com.figma.hiddenFromPublishing": true
}
```

## Checks

1. Run strict rollout verifier.

```bash
npm run verify:toast-rollout
```

2. Validate JSON syntax.

```bash
python3 -m json.tool packages/tokens/src/tokens.json > /dev/null
```

3. Validate output tests.

```bash
npm run test:output
```

4. Validate output build.

```bash
npm run build:output
```

## Expected Result

- `verify:toast-rollout` returns PASS
- JSON validation exits successfully
- output tests pass
- output build completes successfully

## Release Routing Rule

- Do not add hidden Toast token rollout to Token Library release artifacts.
- Keep it as UI Kit placeholder only until Toast component docs/spec/stories are ready.
