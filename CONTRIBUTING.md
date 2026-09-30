# Contributing

Keep the experience small: two scenes, no visible interface text. Prefer natural,
quiet interactions over extra features. Open an issue with a screen recording,
device/browser and reproduction steps for visual defects.

See [development](docs/development.md) for setup and checks. Use `npm run format`
to keep code readable. Add short comments explaining non-obvious rendering,
gesture handling and resource lifetime decisions; avoid narrating every line.
Check the portrait scene on a touch device and with reduced motion enabled.
Background masks and hotspots use normalized coordinates in `src/scene-config.ts`.
Do not commit credentials, generated build folders or local deployment logs.
