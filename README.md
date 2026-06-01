# Franciscan Community Site

A mostly static Astro website for the Franciscan community, deployed with
Cloudflare Workers Static Assets.

## Requirements

- Node `22.22.2`
- Corepack
- pnpm `11.5.0`

Enable the pinned package manager:

```sh
corepack enable
corepack prepare pnpm@11.5.0 --activate
```

## Commands

```sh
pnpm install
pnpm dev
pnpm check
pnpm build
pnpm test:e2e
pnpm preview
pnpm deploy
```

`pnpm build` runs `astro check` before `astro build` so type and content
errors fail the build.

`pnpm test:e2e` runs Playwright smoke tests against `pnpm preview`. Build the
site first with `pnpm build`, and install the Chromium test browser with
`pnpm exec playwright install chromium` if it is not already available locally.

## Deployment

The production target is Cloudflare Workers Static Assets. Deployment
configuration lives in `wrangler.jsonc`; the initial static build publishes
Astro's `dist/` directory.

Production URL: <https://stmargaretofcortona.endian.dev>

pnpm dependency build-script approvals are recorded in `pnpm-workspace.yaml`.
Keep that file in sync when dependency changes introduce new packages that need
install-time build scripts.

Use Cloudflare Workers Builds as the single production deploy path:

- production branch: `main`
- build command: `pnpm build`
- deploy command: `pnpm deploy`
- root directory: `/`
- package manager: Corepack with the pinned pnpm version from `package.json`

GitHub Actions is used as the merge gate and should not deploy production.
Workers Builds also runs non-production branch builds for PR preview URLs.

## Branch Workflow

This repository uses trunk-based development:

- `main` is the only long-lived branch and production source.
- Work happens on short-lived branches such as `feat/*`, `fix/*`,
  `chore/*`, and `docs/*`.
- Pull requests merge to `main` only after CI passes.
- Unfinished work should use drafts, hidden routes, preview builds, or
  feature flags rather than long-lived branches.

See `docs/repo-settings.md` for repository settings to apply in GitHub.
