# AGENTS.md

## Critical rules

- NEVER commit or push the changes unless explicitly asked by user.
- All visual changes and interfaces must be responsive (work on 320px–1920px screens).
- Always follow DDD and DRY practices.
- Be concise, especially if not writing documentation or specs. Don't output too much information. At the end of big tasks with long TODO lists, there's no need to summarize what you did. I already see the plan.

## After Every Change

Run all CI checks before considering work complete:

`npm run check`

## Keeping the `npm run check` in synch with `.github/workflows/ci.yml`

If we add new checks (e.g. linting) to the GitHub Actions CI configuration, you should also update the `npm run check` script to match it.

## Commit Conventions

- Short and clear messages, no need to describe everything in detail.
- In present tense. Example: `Add tests for ModuleX`. Wrong: `Added tests for ModuleX`.
- NO `feat:`, `fix:`, `chore:` or any other type prefix. Just the summary.

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
1. Ask for feedback and wait for confirmation.
1. If feedback is given, incorporate it into the spec.
1. Keep iterating until approved.
1. Save the final spec to `SPECS/{NNNN}-{SUMMARY_LIKE_THIS}.md`.

## TDD

When the user asks to use TDD, the process is as follows:

1. You first generate the tests based on the spec or the verbal description of the desired functionality.
1. Run the tests to ensure that they're red.
1. Then you start implementing the functionality step by step, meaning that you implement one module, which makes the tests green one by. one. Make sure to run the tests after each change and check that it actually switched from red to green.
1. Iterate until all tests are green.
1. Run `npm run check` again.
