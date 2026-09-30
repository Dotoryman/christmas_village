# Development

Use Node.js 22.12+ or 24 LTS.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`. The included WebP artwork is ready to use.

## Project map

| Location | Purpose |
| --- | --- |
| `src/main.ts` | Scene state, touch controls and doorway transitions |
| `src/scene-config.ts` | Portrait artwork, hotspots and light masks |
| `src/effects/` | Shared animation loop, atmosphere, glass frost and sound |
| `src/assets/`, `public/` | Runtime artwork, favicon and sharing image |
| `scripts/`, `tests/` | Build helpers and browser/offline checks |
| `ios/` | SwiftUI wrapper and synchronized offline page |
| `docs/` | Screenshots, artwork provenance and release notes |

Effects use normalized portrait coordinates. The shared animation loop pauses
when hidden and freezes decorative motion when reduced motion is enabled.
Code comments explain masks, gestures, timing and audio resource ownership.
The cabin's small table opens the feast scene; its open archway returns to the
living room. Each scene owns its own hotspots and preserves existing room states.

## Checks and formatting

```sh
npm run format
npx playwright install chromium
npm test
npm run build
npm run ios:sync
node scripts/check-bundle.mjs
```

`dist/` contains the web build. `dist-ios/index.html` is a self-contained page
copied to `ios/ChristmasVillage/Web/index.html`. These are different builds.

## iOS

On a Mac, open `ios/ChristmasVillage.xcodeproj` in Xcode and choose an iOS 16+
simulator. For devices, set your Team and unique bundle identifier. The SwiftUI
shell loads the bundled page without a network connection. Windows browser
checks do not verify Xcode, native WKWebView, physical devices or VoiceOver.

## Deploy

`npm run deploy` builds and deploys with local Wrangler authentication. Forks
must change the account, Worker name and domain in `wrangler.jsonc`.
The tag workflow verifies web and offline builds, then deploys using repository
secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Never commit credentials.

## Controls

Tab, Enter and Space operate hotspots; Escape returns from the feast to the
living room, then exits the cabin. Shift+Enter starts
tree illumination. Enter/Space on the window wipes a path; on foreground snow it
stirs powder. Reduced motion suppresses powder and instantly lights the tree.
Sound is initially muted and requires the speaker button.

## Artwork

See [generation prompts](image-prompts.md). Runtime assets are optimized WebP.
Original PNGs remain available in the [0.4.0 source archive](https://github.com/Dotoryman/christmas_village/releases/tag/v0.4.0)
and Git history instead of duplicating them in the current source tree. Optional
replacement PNGs in `.local/artwork/` can be encoded with
`node scripts/optimize-assets.mjs`. Existing artwork never needs regeneration to build.
