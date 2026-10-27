# Project Instructions

## Project overview
- Purpose: a public GitHub Pages PWA hub of small learning games for a kindergartener on an Android tablet. Plain HTML/CSS/ES modules, no build step, no runtime dependencies.
- Deployed from `main` root to `https://absurdly-nerdly.github.io/kiddos/`; every push is the release.

## Repo map
- `index.html`: hub launcher; tiles come from `shared/apps.js`.
- `sw.js`, `manifest.webmanifest`: service worker and install manifest (root scope).
- `shared/`: progress storage, speech, parent gate, SW registration, common CSS.
- `apps/<id>/`: one folder per activity (`index.html`, `app.js`, `levels.js`).
- `tests/`: `node:test` unit tests for pure logic.

## Run and validate
- Test: `npm test`
- Serve locally: `npx serve@14 -l 4173 .` (service workers need localhost or https)

## Conventions
- All URLs relative (site lives under `/kiddos/`); never root-absolute paths.
- Levels are data in `apps/<id>/levels.js`; keep generators pure so they are testable.
- Save progress after every answer via `shared/progress.js`; bump `schema` and add a `migrate` step for any save-shape change.
- New app: folder, entry in `shared/apps.js`, tests for its generator. See `docs/runbooks/add-an-app.md`.
- UI for a 5-year-old: large tap targets, spoken prompts, no penalties for wrong answers, no text-only instructions.

## Privacy (repo is public)
- Never track the child's name, photos, voice recordings, birthday, location, or progress data; UI text stays generic.
- No analytics, third-party scripts, CDNs, or non-same-origin network calls.
- No secrets or `.env` files; `.gitignore` covers `private/`, `recordings/`, `secrets/`.
- Commit with the GitHub noreply email only.

## Documentation and Context
- Documentation home: `docs/README.md`

## Definition of done
- `npm test` passes; hub and changed app load in a browser with no console errors; progress survives reload.
