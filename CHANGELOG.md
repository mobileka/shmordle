# Changelog

## [Unreleased]

### Fixed

- Re-triggering tile flip animation when typing and clearing the next row. The animation on the previous row no longer replays when the current guess becomes empty again. Fixed by guarding the animation trigger with the `animating` flag from `useGame`, which is only true during the 1600ms window after a genuine submission.
