# Christmas Village 🎄

A quiet winter hideaway you can touch. Snow falls outside a cabin; open the door
and settle beside the fire. Built for a phone held upright, with no visible text
or menus.

**[Enter the village](https://christmasvillage.cloud)** · [한국어](#한국어)

<p align="center">
  <img src="docs/screenshots/mobile-outside.png" width="270" alt="Snowy cabin beneath a winter moon">
  <img src="docs/screenshots/mobile-inside.png" width="270" alt="Warm cabin with a fireplace and Christmas tree">
</p>

## Explore

Touch the windows, tree or lantern to switch their lights. Brush snow off the roof,
greet the snowman, then open the cabin door. Inside, tend the fire, lift a gift bow,
or warm your cocoa. The right-hand door takes you outside again.

Generated cinematic backgrounds, clipped light plates and one Canvas loop form
the scenes. Snow has depth and drift; fire uses the original flame texture with
gentle displacement. This is animated artwork, not a 3D game. No accounts,
tracking, external fonts or audio.

## Run locally

Use Node.js 22.12+ or 24 LTS.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`. `npm run build` produces cacheable web assets in
`dist`; `npm run preview` serves them locally. The complete portrait fits the
viewport with a blurred surround on wider screens.

## iOS

Run `npm run ios:sync`, then open `ios/ChristmasVillage.xcodeproj` on a Mac with
Xcode. Choose an iOS 16+ simulator. For a device, set your development Team and
unique bundle identifier. The SwiftUI shell loads a self-contained WKWebView
page offline. The iOS build is separate from the web build. Windows browser
checks do not verify Xcode, WKWebView, device performance or VoiceOver.

## Verify and deploy

```sh
npx playwright install chromium
npm test
npm run build
npm run ios:sync
node scripts/check-bundle.mjs
npm run deploy
```

Wrangler deploys static assets to Cloudflare Workers with `christmasvillage.cloud`.
Forks must change the account, Worker name and domain in `wrangler.jsonc`.
Use `npx wrangler login` for local deployment.

The workflow runs on `v*` tags or manual dispatch. It checks both builds.
Deployment needs repository secrets `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID`; otherwise it reports a notice and skips deployment.
Credentials are never included in source. Releases are created explicitly with
reviewed notes and a downloadable iOS source bundle.

Tab, Enter and Space operate the scene; Escape exits the cabin. System reduced
motion produces a still scene and immediate switches. Animation pauses when
hidden. Browser tests cover touch, transitions, retained light state, keyboard
controls, reduced motion and the offline bundle.

## Source and artwork

- `src/scene-config.ts`: artwork, hotspot geometry and light masks.
- `src/animation.ts`: Canvas snow, fire, steam and particles.
- `src/main.ts`: state, asset loading and scene transitions.
- `ios/`: SwiftUI shell and synchronized offline page.
- [Image prompts](docs/image-prompts.md), [changelog](CHANGELOG.md), [contributing](CONTRIBUTING.md).

Code and included artwork: [MIT](LICENSE). Backgrounds were created with OpenAI
ImageGen; prompts and provenance are recorded in the document above. Dependencies
retain their own licenses.

## 한국어

휴대폰을 세로로 들고 즐기는 작은 크리스마스 마을입니다. 화면에는 그림과
움직임만 보입니다. 창문·트리·가로등을 누르면 조명이 바뀌고, 지붕의 눈을
털거나 눈사람에게 인사할 수 있습니다. 오두막 문을 열면 따뜻한 실내가
나옵니다. 벽난로·촛불·선물·코코아를 눌러보세요.

`npm ci`와 `npm run dev`로 로컬에서 실행합니다. 웹 빌드는 `npm run build`,
iOS 번들 동기화는 `npm run ios:sync`입니다. Mac에서 Xcode 프로젝트를 열어
실행하세요. Windows에서는 iOS 네이티브 빌드와 실기기 검증을 수행하지
않았습니다. 웹과 오프라인 번들은 Chromium으로 검증합니다.

눈·빛·불꽃·김을 정지 이미지 위에서 움직이는 구조입니다. 기능을 많이
추가하기보다 두 장면의 분위기와 작은 반응을 다듬는 프로젝트입니다.
