# Security Policy

## Reporting a vulnerability

Please do not open a public issue for security problems.

Report vulnerabilities privately through GitHub's **Private vulnerability reporting**: go to the repository's **Security** tab and choose **Report a vulnerability**. This opens a private advisory visible only to the maintainers.

Please include a description of the issue, steps to reproduce, and the potential impact. You can expect an initial response within a reasonable time, and we will keep you updated as we work on a fix.

## Scope

This is a design-system starter that people fork and brand. The most relevant risks are secrets accidentally committed to a fork (keys, tokens, `.env` files) and dependency vulnerabilities. Secret scanning, push protection and Dependabot are recommended for every fork.

## Handling secrets

Never commit credentials. `.env` files and common key formats are gitignored. If you believe a secret was committed, rotate it immediately and remove it from history, do not rely on deleting the file in a later commit.
