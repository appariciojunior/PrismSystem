# @ds/ui blocks

27 vendored shadcn Blocks: hand-designed page compositions (dashboards, sidebars, login and signup flows) that import `@ds/ui` components and inherit your tokens, material and typography automatically.

These are the design system's **composition vocabulary**. Two uses:

1. Copy a block into your app as a designed starting point, then adjust.
2. The generation agents read them as reference patterns, so new screens compose like these rather than dropping raw primitives.

Kinds: dashboard, login, sidebar, signup.

Each block is a folder with a `page.tsx` entry and a local `components/` directory. Imports point at `@ds/ui` for components and stay relative for block-internal parts.
