# Design corpus

How the Design System learns from the real product. Drop screenshots of the live website and app here; the `corpus/distill-corpus` skill reads them in batches, files them, and distils what it sees into versioned reference documents that every design skill can cite.

The corpus is how the suite stays honest about how your brand *actually* designs, not just how the tokens say it should.

## How to use it (designers)

1. Drop any screenshots into `raw/inbox/`. No naming needed; the skill classifies and renames them.
2. Ask an agent: **"distil the corpus"** (or run `/design` and pick corpus-distill).
3. Review what it wrote in `distilled/` and the proposed rules in `distilled/rules-candidates.md`.

Batch of 10 to 20 screenshots at a time works best. Web, iOS and Android are all welcome; more coverage of a channel or a journey means stronger evidence.

## Layout

```
design-corpus/
├── README.md                 you are here
├── raw/                      screenshots — GITIGNORED, never committed
│   ├── inbox/                drop zone, unsorted
│   └── <surface>/<channel>/  where the skill files them: web|ios|android / channel or core
├── manifest/
│   └── corpus-manifest.json  the record: sha256, surface, channel, journey, date per screen
└── distilled/                the knowledge — committed, versioned, citable
    ├── VERSION.md            what each corpus version analysed
    ├── layout-patterns.md    grids, card anatomy, page templates seen in the wild
    ├── channel-styling.md    how each channel's colour and tone play out in practice
    ├── component-usage.md    DS components as actually used: variants, frequency, misuse
    ├── rules-candidates.md   observations proposed for promotion into foundation/design-rules.md
    └── ux-patterns/          per-journey UX patterns (reader journey, paywall, onboarding, live-blog, nav/search)
```

## Rules of the corpus

* **Raw images are never committed.** They may contain subscriber content, unreleased design, or personal data. `raw/` is gitignored; only the manifest (hashes and metadata) and the distilled documents are kept. In this repo nothing is committed at all yet — it is a local sandbox — but the gitignore keeps that boundary clear.
* **Distilled docs are evidence, not law.** They describe what the product does. On any conflict, `packages/tokens/src/tokens.json`, `content-styleguide.md` and `foundation/design-dna.md` outrank the corpus. See `foundation/corpus-guide.md` for the citation contract.
* **Every observation is traceable.** Each line in a distilled doc references the corpus version and the manifest entries it came from, so a claim can always be traced back to the screens that support it.
* **The corpus grows the rules.** Distillation proposes new rules into `distilled/rules-candidates.md`; a human promotes the good ones into `foundation/design-rules.md`.
