# AGENTS.md

## After Every Change

Run all CI checks before considering work complete:

`npm run check`

## Keeping the `npm run check` in synch with `.github/workflows/ci.yml`

If we add new checks (e.g. linting) to the GitHub Actions CI configuration, you should also update the `npm run check` script to match it.

## Commit Conventions

- Conventional Commits format: short and clear messages, no need to describe everything in detail.
- In present tense. Example: `Add tests for ModuleX`. Wrong: `Added tests for ModuleX`.
