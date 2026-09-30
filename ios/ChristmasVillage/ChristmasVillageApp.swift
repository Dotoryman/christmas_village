import SwiftUI
import WebKit

@main
struct ChristmasVillageApp: App {
    var body: some Scene {
        WindowGroup {
            VillageWebView()
                .ignoresSafeArea()
                .background(Color(red: 16 / 255, green: 30 / 255, blue: 37 / 255))
                .preferredColorScheme(.dark)
        }
    }
}

struct VillageWebView: UIViewRepresentable {
    // The wrapper keeps the web scene and gestures identical to the browser version.
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        // Ambient sound must begin with the visitor's explicit speaker-button gesture.
        configuration.mediaTypesRequiringUserActionForPlayback = .all
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.isOpaque = false
        view.backgroundColor = UIColor(red: 16 / 255, green: 30 / 255, blue: 37 / 255, alpha: 1)
        view.scrollView.backgroundColor = view.backgroundColor
        view.scrollView.contentInsetAdjustmentBehavior = .never
        // npm run ios:sync provides a self-contained page; no network is needed here.
        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Web") {
            view.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        return view
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
