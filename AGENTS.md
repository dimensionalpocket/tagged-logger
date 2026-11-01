# AGENTS.md

## Commands

This package has no `scripts` in `package.json` on purpose. Use Bun's built-in
commands directly.

| Task      | Command           |
| --------- | ----------------- |
| Typecheck | `bun check`       |
| Lint      | `bun fmt --check` |
| Format    | `bun fmt`         |
| Test      | `bun test`        |

`bun check` replaces `tsc --noEmit`. `bun fmt` replaces Prettier and reads its
options from the `[fmt]` section of `bunfig.toml`. There is no `typescript`
dependency; type definitions come from `@types/bun`.

## Do not add npm scripts that shadow Bun commands

Bun prefers a `package.json` script over its own command of the same name. A
script named `lint`, `fmt`, `check` or `test` that invokes `bun lint`,
`bun fmt`, `bun check` or `bun test` therefore calls itself. Bun stops at its
script-depth limit and **exits 0**, so the failure is silent.

If such a script is ever needed, pass `--no-script`:

```sh
bun lint --no-script
bun fmt --no-script
bun check --no-script
```

Prefer running the commands directly, as above.

## `bun lint` is not available yet

`bun lint` exists only in canary builds (`1.4.4-canary.1+3f3a9ff87` verified),
not in the stable `1.4.4` this repo pins in `.tool-versions`, even though
<https://bun.com/docs/lint> is already published.

Until the repo is on a release that has it, "lint" means `bun fmt --check`. Once
`bun lint` is available, linting becomes:

```sh
bun lint --no-script && bun fmt --no-script --check
```

Current `bun lint` warnings, all intentional and all in test files:

- `no-control-regex` — the ANSI escape regexes in `src/TaggedLogger.test.ts`.
- `@typescript-eslint/no-explicit-any` — invalid-color inputs in
  `src/colorize.test.ts`.

## Toolchain

- Bun version is pinned in `.tool-versions` and managed by `mise`. Run
  `bun install` after a fresh clone.
- `bun check` needs `@types/bun` installed; without it, it fails with "Bun's
  type definitions (console, fetch, Bun, bun:test) are not installed".

## Layout

- `index.ts` — package entry point, re-exports `TaggedLogger`.
- `src/TaggedLogger.ts` — the logger itself.
- `src/colorize.ts` — ANSI coloring helper (`Bun.color`), vendored so the
  package has no runtime dependencies.
