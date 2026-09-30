# Contributing

Keep the experience small: two scenes, no visible interface text. Prefer natural,
quiet interactions over extra features. Open an issue with a screen recording,
device/browser and reproduction steps for visual defects.

Run `npm ci`, `npx playwright install chromium`, `npm test`, `npm run build`,
`npm run ios:sync` and `node scripts/check-bundle.mjs` before submitting a change.
Check the portrait scene on a touch device and with reduced motion enabled.
Background masks and hotspots use normalized coordinates in `src/scene-config.ts`.
Do not commit credentials, generated build folders or local deployment logs.
