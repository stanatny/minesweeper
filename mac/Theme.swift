import SwiftUI

// MARK: - Appearance mode (System / Light / Dark)

enum AppearanceMode: String, CaseIterable, Identifiable {
  case system, light, dark
  var id: String { rawValue }
  var title: String {
    switch self {
    case .system: return "System"
    case .light: return "Light"
    case .dark: return "Dark"
    }
  }
  var colorScheme: ColorScheme? {
    switch self {
    case .system: return nil
    case .light: return .light
    case .dark: return .dark
    }
  }
}

// MARK: - Classic Windows Minesweeper styling in light and dark palettes

struct Theme {
  let scheme: ColorScheme
  var isDark: Bool { scheme == .dark }

  // Window and panel backgrounds.
  var windowBg: Color {
    isDark
      ? Color(red: 0.13, green: 0.13, blue: 0.15)
      : Color(red: 0.753, green: 0.753, blue: 0.753)
  }  // Classic #c0c0c0
  var panel: Color {
    isDark
      ? Color(red: 0.18, green: 0.18, blue: 0.20)
      : Color(red: 0.753, green: 0.753, blue: 0.753)
  }
  // Raised-cell highlight (top left) and shadow (bottom right).
  var highlight: Color { isDark ? Color(red: 0.38, green: 0.38, blue: 0.42) : .white }
  var shadow: Color {
    isDark
      ? Color(red: 0.05, green: 0.05, blue: 0.06)
      : Color(red: 0.48, green: 0.48, blue: 0.48)
  }
  // Revealed, recessed cells.
  var revealed: Color {
    isDark
      ? Color(red: 0.14, green: 0.14, blue: 0.16)
      : Color(red: 0.72, green: 0.72, blue: 0.72)
  }
  var revealedBorder: Color {
    isDark
      ? Color(red: 0.04, green: 0.04, blue: 0.05)
      : Color(red: 0.50, green: 0.50, blue: 0.50)
  }
  var labelPrimary: Color { isDark ? Color(white: 0.9) : Color(white: 0.12) }

  // Number colors: classic colors in light mode, brighter variants for dark-mode readability.
  func numberColor(_ n: Int) -> Color {
    let light: [Color] = [
      Color(red: 0.00, green: 0.00, blue: 1.00),  // 1 Blue
      Color(red: 0.00, green: 0.48, blue: 0.00),  // 2 Green
      Color(red: 1.00, green: 0.00, blue: 0.00),  // 3 Red
      Color(red: 0.00, green: 0.00, blue: 0.48),  // 4 Navy
      Color(red: 0.48, green: 0.00, blue: 0.00),  // 5 Maroon
      Color(red: 0.00, green: 0.48, blue: 0.48),  // 6 Teal
      Color(red: 0.00, green: 0.00, blue: 0.00),  // 7 Black
      Color(red: 0.42, green: 0.42, blue: 0.42),  // 8 Gray
    ]
    let dark: [Color] = [
      Color(red: 0.45, green: 0.66, blue: 1.00),  // 1
      Color(red: 0.36, green: 0.85, blue: 0.42),  // 2
      Color(red: 1.00, green: 0.42, blue: 0.38),  // 3
      Color(red: 0.62, green: 0.56, blue: 1.00),  // 4
      Color(red: 1.00, green: 0.55, blue: 0.36),  // 5
      Color(red: 0.30, green: 0.82, blue: 0.82),  // 6
      Color(red: 0.92, green: 0.92, blue: 0.92),  // 7
      Color(red: 0.62, green: 0.62, blue: 0.64),  // 8
    ]
    let idx = max(1, min(8, n)) - 1
    return isDark ? dark[idx] : light[idx]
  }
}

// MARK: - Raised bevels for covered cells, buttons, and borders

struct BevelOverlay: View {
  let theme: Theme
  var width: CGFloat = 3
  var body: some View {
    GeometryReader { geo in
      let w = geo.size.width
      let h = geo.size.height
      let b = width
      Path { p in  // Top-left highlight
        p.move(to: CGPoint(x: 0, y: h))
        p.addLine(to: CGPoint(x: 0, y: 0))
        p.addLine(to: CGPoint(x: w, y: 0))
        p.addLine(to: CGPoint(x: w - b, y: b))
        p.addLine(to: CGPoint(x: b, y: b))
        p.addLine(to: CGPoint(x: b, y: h - b))
        p.closeSubpath()
      }
      .fill(theme.highlight)
      Path { p in  // Bottom-right shadow
        p.move(to: CGPoint(x: w, y: 0))
        p.addLine(to: CGPoint(x: w, y: h))
        p.addLine(to: CGPoint(x: 0, y: h))
        p.addLine(to: CGPoint(x: b, y: h - b))
        p.addLine(to: CGPoint(x: w - b, y: h - b))
        p.addLine(to: CGPoint(x: w - b, y: b))
        p.closeSubpath()
      }
      .fill(theme.shadow)
    }
    .allowsHitTesting(false)
  }
}

// MARK: - Recessed bevels for counters and the board border

struct SunkenOverlay: View {
  let theme: Theme
  var width: CGFloat = 2
  var body: some View {
    GeometryReader { geo in
      let w = geo.size.width
      let h = geo.size.height
      let b = width
      Path { p in  // Top-left shadow
        p.move(to: CGPoint(x: 0, y: h))
        p.addLine(to: CGPoint(x: 0, y: 0))
        p.addLine(to: CGPoint(x: w, y: 0))
        p.addLine(to: CGPoint(x: w - b, y: b))
        p.addLine(to: CGPoint(x: b, y: b))
        p.addLine(to: CGPoint(x: b, y: h - b))
        p.closeSubpath()
      }
      .fill(theme.shadow)
      Path { p in  // Bottom-right highlight
        p.move(to: CGPoint(x: w, y: 0))
        p.addLine(to: CGPoint(x: w, y: h))
        p.addLine(to: CGPoint(x: 0, y: h))
        p.addLine(to: CGPoint(x: b, y: h - b))
        p.addLine(to: CGPoint(x: w - b, y: h - b))
        p.addLine(to: CGPoint(x: w - b, y: b))
        p.closeSubpath()
      }
      .fill(theme.highlight)
    }
    .allowsHitTesting(false)
  }
}
