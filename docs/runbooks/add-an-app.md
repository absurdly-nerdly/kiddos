# Add an app or level

## Add a level
- Append an entry to `LEVELS` in `apps/counting/levels.js`; stars unlock the next level automatically.

## Add an app
- Create `apps/<id>/index.html` and `app.js`; import `../../shared/ui.css`, `progress.js`, `speak.js`, `parent.js` as in `apps/counting/`.
- Keep round generation in a pure `levels.js` and add tests in `tests/`.
- Register `{ id, title, emoji, path: "apps/<id>/" }` in `shared/apps.js`.
- Use relative URLs only. Run `npm test`, serve locally, play it, push to `main`.
