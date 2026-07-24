# Start here

A one-page orientation for Prism System, so anyone can find their way without being the person who built it.

## What this is

Prism System is a white-label design system monorepo: fork it, feed it a brand, and generate on-brand product UI with AI agents. The `README.md` is the front door; read it first for the concept, the quick start and the architecture map.

## The mental model (three layers)

1. **The product.** The design tokens, the built themes (css, scss, ios) and the components. This is what ships. Lives in `packages/`.
2. **The controller.** The visual brand editor at `tools/controller`. Run `npm run controller` and open http://localhost:4400 to set colours, fonts, shape, identity and imagery. Saving rewrites the token sources and rebuilds everything.
3. **The agent system.** Skills, briefs and coordination for design and engineering work, shared across Claude, Cursor, Copilot and Codex. Lives in `packages/tokens/.agents/`. It is machine-facing, not a human tutorial.

## Where do I start? (by what you want to do)

- **Brand this system** > `npm run controller`, then work through the rail and press Save.
- **Use the tokens or components in an app** > `README.md`, then `packages/tokens/docs/`.
- **Design something** > run `/design-start` in your IDE.
- **Build something** > run `/engineer-start` in your IDE.
- **Edit tokens safely** > `packages/tokens/.agents/README.md`, then the governance skills.

## Where work lands

Every design or code generation lands in `sandbox/`, one dated folder per run, never overwritten. Each run carries a `MANIFEST.md` saying what was asked and what came out. See `sandbox/README.md` for the convention. The brand itself, once saved, lives in the token sources and in `design-corpus/brand/GUIDELINES.md`.

## The rules that keep it safe

- The tokens in `packages/tokens/src` are the single source of truth. When anything disagrees with them, they win.
- Never edit the foundation layer directly; use the controller or the governance skills.
- Check `content-styleguide.md` before writing product copy.
- The skills under `packages/tokens/.agents/skills/` are symlinked into four IDE folders. If you move anything there, update the references and run `npm run sync:skills`.
