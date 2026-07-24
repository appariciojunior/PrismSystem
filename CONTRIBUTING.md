# Contributing to Prism System

Thanks for your interest in improving Prism System. It is a white-label design system, so contributions that keep it generic and reusable are especially welcome.

## Getting set up

You need Node 22 or later and npm.

```sh
git clone https://github.com/appariciojunior/PrismSystem.git
cd PrismSystem
npm install --legacy-peer-deps
npm run controller   # visual brand controller at http://localhost:4400
npm run storybook    # browse the themed component library
npm run build:output # reconcile tokens and rebuild css, scss and ios outputs
```

`START-HERE.md` is the one-page orientation and `README.md` covers the architecture.

## How to propose a change

1. Fork the repo and create a branch off `main`. Use a short, descriptive name, for example `fix/token-contrast` or `feat/new-block`.
2. Make your change. Keep it focused: one topic per pull request.
3. Run the checks locally: `npm run lint`, `npm run build:output`, and the token tests if you touched tokens.
4. Open a pull request against `main` and fill in the template. Link an issue if there is one.

## Ground rules

- Keep it brand-neutral. Nothing tied to a specific company: no real brand names, internal links, tracker tickets, or account keys. This is a starting point people fork and brand themselves.
- Tokens are the source of truth. Never hardcode a colour, radius, font or shadow in a component; bind to tokens. Edit tokens through the controller or the governance skills, not by hand where a pipeline exists.
- Never commit secrets. No `.env` files, API keys, tokens or credentials. See `SECURITY.md`.
- British English, and no em dashes, in prose and content.
- Match the existing style. Prettier and ESLint are configured; run `npm run format` and `npm run lint:fix` before pushing.

## Reporting bugs and requesting features

Open an issue using the templates. For anything security related, follow `SECURITY.md` instead of opening a public issue.

## Licence

By contributing, you agree that your contributions are licensed under the repository's `LICENSE`.
