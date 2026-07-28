import SwiftUI

// MARK: - 外观模式（跟随系统 / 浅色 / 深色）

enum AppearanceMode: String, CaseIterable, Identifiable {
    case system, light, dark
    var id: String { rawValue }
    var title: String {
        switch self {
        case .system: return "跟随系统"
        case .light: return "浅色"
        case .dark: return "深色"
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

// MARK: - 主题：经典 Windows 扫雷质感，明暗双套配色

struct Theme {
    let scheme: ColorScheme
    var isDark: Bool { scheme == .dark }

    // 窗口 / 面板底色
    var windowBg: Color { isDark ? Color(red: 0.13, green: 0.13, blue: 0.15)
                                 : Color(red: 0.753, green: 0.753, blue: 0.753) } // 经典 #c0c0c0
    var panel: Color { isDark ? Color(red: 0.18, green: 0.18, blue: 0.20)
                              : Color(red: 0.753, green: 0.753, blue: 0.753) }
    // 凸面格高光（左上）与阴影（右下）
    var highlight: Color { isDark ? Color(red: 0.38, green: 0.38, blue: 0.42) : .white }
    var shadow: Color { isDark ? Color(red: 0.05, green: 0.05, blue: 0.06)
                               : Color(red: 0.48, green: 0.48, blue: 0.48) }
    // 已翻开格（凹面）
    var revealed: Color { isDark ? Color(red: 0.14, green: 0.14, blue: 0.16)
                                 : Color(red: 0.72, green: 0.72, blue: 0.72) }
    var revealedBorder: Color { isDark ? Color(red: 0.04, green: 0.04, blue: 0.05)
                                       : Color(red: 0.50, green: 0.50, blue: 0.50) }
    var labelPrimary: Color { isDark ? Color(white: 0.9) : Color(white: 0.12) }

    // 数字 1~8 配色：浅色用经典原色，深色整体调亮保证可读
    func numberColor(_ n: Int) -> Color {
        let light: [Color] = [
            Color(red: 0.00, green: 0.00, blue: 1.00), // 1 蓝
            Color(red: 0.00, green: 0.48, blue: 0.00), // 2 绿
            Color(red: 1.00, green: 0.00, blue: 0.00), // 3 红
            Color(red: 0.00, green: 0.00, blue: 0.48), // 4 深蓝
            Color(red: 0.48, green: 0.00, blue: 0.00), // 5 深红
            Color(red: 0.00, green: 0.48, blue: 0.48), // 6 青
            Color(red: 0.00, green: 0.00, blue: 0.00), // 7 黑
            Color(red: 0.42, green: 0.42, blue: 0.42)  // 8 灰
        ]
        let dark: [Color] = [
            Color(red: 0.45, green: 0.66, blue: 1.00), // 1
            Color(red: 0.36, green: 0.85, blue: 0.42), // 2
            Color(red: 1.00, green: 0.42, blue: 0.38), // 3
            Color(red: 0.62, green: 0.56, blue: 1.00), // 4
            Color(red: 1.00, green: 0.55, blue: 0.36), // 5
            Color(red: 0.30, green: 0.82, blue: 0.82), // 6
            Color(red: 0.92, green: 0.92, blue: 0.92), // 7
            Color(red: 0.62, green: 0.62, blue: 0.64)  // 8
        ]
        let idx = max(1, min(8, n)) - 1
        return isDark ? dark[idx] : light[idx]
    }
}

// MARK: - 凸面斜边（未翻开的格子 / 按钮 / 外框）

struct BevelOverlay: View {
    let theme: Theme
    var width: CGFloat = 3
    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height
            let b = width
            Path { p in // 左上高光
                p.move(to: CGPoint(x: 0, y: h))
                p.addLine(to: CGPoint(x: 0, y: 0))
                p.addLine(to: CGPoint(x: w, y: 0))
                p.addLine(to: CGPoint(x: w - b, y: b))
                p.addLine(to: CGPoint(x: b, y: b))
                p.addLine(to: CGPoint(x: b, y: h - b))
                p.closeSubpath()
            }
            .fill(theme.highlight)
            Path { p in // 右下阴影
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

// MARK: - 凹面斜边（计数器面板 / 棋盘外框）

struct SunkenOverlay: View {
    let theme: Theme
    var width: CGFloat = 2
    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height
            let b = width
            Path { p in // 左上阴影
                p.move(to: CGPoint(x: 0, y: h))
                p.addLine(to: CGPoint(x: 0, y: 0))
                p.addLine(to: CGPoint(x: w, y: 0))
                p.addLine(to: CGPoint(x: w - b, y: b))
                p.addLine(to: CGPoint(x: b, y: b))
                p.addLine(to: CGPoint(x: b, y: h - b))
                p.closeSubpath()
            }
            .fill(theme.shadow)
            Path { p in // 右下高光
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
