# Christmas Village 0.6.0

More snow, a little sugar and easier-to-extend source. Outdoor snowfall now uses
680 layered flakes. Touch the gingerbread for icing glints or dust the yule log
with sugar; both reactions fade without leaving marks.

Scene definitions and painters now live in `src/scenes/`. Shared gestures,
navigation and the action registry live in `src/app/`. The development guide
shows how to register a new effect without changing the app's navigation code.

Validation: mobile/desktop browser tests, web build and offline bundle checks.
The offline iOS source is synchronized; native Xcode/WKWebView execution is not
verified on Windows.
