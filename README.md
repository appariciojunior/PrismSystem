# Prism System

Prism System is a white-label design system in a box. It is a monorepo that carries everything a product team needs to look like themselves: a token source of truth, a themed component library, build pipelines for web and iOS, and a visual controller that turns a brand into a working theme in minutes.

The idea is a bubble you step inside. You clone the repo, run the controller, and feed it your brand: colours, fonts, a logo, reference imagery, even your existing website. The controller digests those inputs, derives a complete token system from them, and rebuilds every output so the whole monorepo now speaks your brand. From that point on, AI agents working inside the repo generate product UI that is on brand by construction, because everything they touch is themed from the same tokens.

Nothing here is tied to any one company. Fork it, brand it, generate.

## Quick start

```sh
git clone <your-repo-url> prism-system
cd prism-system
npm install --legacy-peer-deps
```

Then run the controller and open it in a browser:

```sh
npm run controller
# http://localhost:4400
```

Set your brand in the controller and press Save. It rewrites the token sources and runs the build for you. You can also run the pieces directly:

```sh
npm run build:output   # reconcile tokens and rebuild css, scss and ios outputs
npm run storybook      # browse the themed component library
```

## The controller

The controller is a zero-dependency Node server at `tools/controller`. It serves a visual editor where the left rail defines the brand and the right side previews the result live.

The rail works top down. Theme presets give you a one-click starting point (a set of tweakcn-style themes) that you then refine. Colours sets the primary, neutral tint, tertiary and chart hues. Typography chooses heading and body fonts. Shape controls corner radius, Spacing the density scale, and Effects the shadows. Below those, a Derived tokens table shows every token the engine computes from your choices, so nothing that lands in the codebase is a mystery.

The preview has sub-tabs so you can judge the theme against real surfaces: the component sheet, a full Dashboard example, a Mail client example, plus mood and type specimens.

Beyond the theme itself, further tabs capture the rest of the brand. Identity records the name, tagline, industry, audience, voice and values, and can digest an existing website to pull those out. Imagery accepts reference images and brand material; when the local `claude` CLI is installed the server uses it to analyse each image with AI and propose palette, typography and shape settings, and falls back to client-side colour extraction otherwise. Guidelines collects written rules; on save everything is written to `design-corpus/brand/GUIDELINES.md`, where the generation agents read it.

Every save takes a timestamped backup of the previous token sources under `tools/controller/backups`, so experiments are cheap.

## Architecture

```
packages/
  tokens/            tokens.json and resolved-hexes.json, the source of truth
    .agents/         the agent system: 107 skills, briefs, coordination
  output/            Style Dictionary pipeline (reconcile, build)
  theme-css/         built CSS variables
  theme-scss/        built SCSS variables and palettes
  theme-ios/         built Swift tokens
  ui/                the full shadcn/ui component set, themed via theme.css
  components-react/  React components
  icons/             Phosphor icons as @ds/icons
tools/
  controller/        the visual brand controller (port 4400)
design-corpus/       brand guidelines and reference imagery
sandbox/             where generated designs and code land, one folder per run
```

Orchestration for Claude, Cursor, Copilot and Codex lives in `.claude`, `.cursor`, `.github` and `.continue`, all reading the same skills registered in `packages/tokens/.agents/skills/skills.json`.

## How theming flows

The controller writes your brand into `packages/tokens/src/tokens.json` and `packages/tokens/data/resolved-hexes.json`. A reconcile step in `packages/output` merges the two into a resolved token set, then Style Dictionary builds the platform outputs: CSS variables into `packages/theme-css`, SCSS into `packages/theme-scss` and Swift into `packages/theme-ios`. The same build regenerates `packages/ui/src/styles/theme.css`, so the shadcn/ui components and everything built from them pick up the brand automatically. One source, every platform.

## Generating UI with agents

Once the brand is set, the agents do the product work. Run `/design-start` in your IDE for guided design intake, or `/engineer-start` to turn a design or prototype into production code. Both write their output to dated run folders in `sandbox/`, so no generation ever overwrites another. Component work leans on the shadcn-ui skill so generated screens use the themed `@ds/ui` set, and icons come from Phosphor via `@ds/icons`.

## Requirements

Node 22 or later and npm. The `claude` CLI is optional; without it the controller's image analysis falls back to client-side colour extraction.

## License

MIT. See `LICENSE`.
