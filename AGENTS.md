# AGENTS.md

## After Every Change

Run all CI checks before considering work complete:

`npm run check`

## Keeping the `npm run check` in synch with `.github/workflows/ci.yml`

If we add new checks (e.g. linting) to the GitHub Actions CI configuration, you should also update the `npm run check` script to match it.

## Commit Conventions

- Conventional Commits format: short and clear messages, no need to describe everything in detail.
- In present tense. Example: `Add tests for ModuleX`. Wrong: `Added tests for ModuleX`.

## Specs

Specs live in the `SPECS/` directory in chronological order:

```
SPECS/
  0001-INITIAL_IMPLEMENTATION.md
  0002-DARK-THEME.md  (planned)
```

Naming convention: `{NNNN}-{SUMMARY}.md`. Read them sequentially to understand the full product context before building.

### Spec Process

When the user says we're working on a spec, follow this process:

1. Generate a detailed spec describing the feature step by step.
2. Ask for feedback and wait for confirmation.
3. If feedback is given, incorporate it into the spec.
4. Keep iterating until approved.
5. Save the final spec to `SPECS/{NNNN}-{SUMMARY}.md`.
