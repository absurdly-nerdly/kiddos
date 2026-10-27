# ADR 0001: No-build PWA on GitHub Pages

## Decision
Ship activities as one installable PWA of plain HTML/CSS/ES modules, hosted from `main` on GitHub Pages.

## Why
- Installs from Chrome to the home screen, runs fullscreen and offline, no APK signing or store review.
- Progress is stored in on-device `localStorage` (persistent storage requested), so it survives app close and reboot.
- A network-first service worker means each push reaches the tablet on next online launch, with no version bumps.
- No build step or dependencies to maintain; edit, push, done.

## Consequences
- Progress is per device and per browser; a backup code (parent panel) is the recovery path.
- Clearing Chrome site data erases progress.
- Source is public, so privacy rules in `AGENTS.md` apply.
