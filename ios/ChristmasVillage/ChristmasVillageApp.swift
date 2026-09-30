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
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = .all
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.isOpaque = false
        view.backgroundColor = UIColor(red: 16 / 255, green: 30 / 255, blue: 37 / 255, alpha: 1)
        view.scrollView.backgroundColor = view.backgroundColor
        view.scrollView.contentInsetAdjustmentBehavior = .never
        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Web") {
            view.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        return view
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
