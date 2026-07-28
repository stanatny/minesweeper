import SwiftUI
import AppKit

// MARK: - 棋盘（网格 + 特效叠层 + 右键桥接 + 震动）

struct BoardView: View {
    @EnvironmentObject var model: GameModel
    @Environment(\.colorScheme) private var scheme
    @State private var shake: CGFloat = 0

    private var boardWidth: CGFloat { CGFloat(model.config.width) * GameModel.cellSize }
    private var boardHeight: CGFloat { CGFloat(model.config.height) * GameModel.cellSize }

    var body: some View {
        let theme = Theme(scheme: scheme)
        RightClickContainer(
            onRightDown: { p in if let i = cellIndex(at: p) { model.rightPressed(at: i) } },
            onRightUp: { p in if let i = cellIndex(at: p) { model.rightReleased(at: i) } }
        ) {
            ZStack {
                grid(theme: theme)
                EffectsOverlay()
                    .frame(width: boardWidth, height: boardHeight)
                    .allowsHitTesting(false)
            }
            .frame(width: boardWidth, height: boardHeight)
        }
        .frame(width: boardWidth, height: boardHeight)
        .modifier(ShakeEffect(animatableData: shake))
        .onChange(of: model.shakeToken) { _, _ in
            var t = Transaction()
            t.disablesAnimations = true
            withTransaction(t) { shake = 0 }
            withAnimation(.linear(duration: 0.5)) { shake = 1 }
        }
    }

    private func cellIndex(at p: CGPoint) -> Int? {
        let x = Int(p.x / GameModel.cellSize)
        let y = Int(p.y / GameModel.cellSize)
        guard x >= 0, x < model.config.width, y >= 0, y < model.config.height else { return nil }
        return model.index(x: x, y: y)
    }

    private func grid(theme: Theme) -> some View {
        VStack(spacing: 0) {
            ForEach(0..<model.config.height, id: \.self) { y in
                HStack(spacing: 0) {
                    ForEach(0..<model.config.width, id: \.self) { x in
                        let i = model.index(x: x, y: y)
                        CellView(cell: model.cells[i], theme: theme,
                                 pressed: model.pressedPreview.contains(i) || model.flashCells.contains(i))
                            .frame(width: GameModel.cellSize, height: GameModel.cellSize)
                            .contentShape(Rectangle())
                            .onTapGesture { model.handleTap(i) }
                            .simultaneousGesture(
                                DragGesture(minimumDistance: 0)
                                    .onChanged { _ in model.leftPressed(at: i) }
                                    .onEnded { _ in model.leftReleased() }
                            )
                    }
                }
            }
        }
        .background(theme.revealedBorder)
    }
}

// MARK: - 单格渲染

struct CellView: View {
    let cell: CellState
    let theme: Theme
    var pressed: Bool = false // chording 预览/闪烁：未翻开格临时呈"压下"凹陷外观

    var body: some View {
        ZStack {
            if cell.revealed {
                Rectangle().fill(cell.exploded ? Color(red: 1, green: 0.15, blue: 0.1) : theme.revealed)
                Rectangle().strokeBorder(theme.revealedBorder, lineWidth: 1)
                if cell.mine {
                    Text("💣").font(.system(size: GameModel.cellSize * 0.58))
                } else if cell.adjacent > 0 {
                    Text("\(cell.adjacent)")
                        .font(.system(size: GameModel.cellSize * 0.62, weight: .bold))
                        .foregroundStyle(theme.numberColor(cell.adjacent))
                }
            } else if pressed {
                // 压下/闪烁提示：去掉凸面斜边，像已翻开的空格一样凹陷
                Rectangle().fill(theme.revealed)
                Rectangle().strokeBorder(theme.revealedBorder, lineWidth: 1)
                if cell.flagged {
                    Text("🚩").font(.system(size: GameModel.cellSize * 0.58))
                }
            } else {
                Rectangle().fill(theme.panel)
                BevelOverlay(theme: theme, width: 3)
                if cell.flagged {
                    Text("🚩").font(.system(size: GameModel.cellSize * 0.58))
                    if cell.wrongFlag {
                        Text("✕")
                            .font(.system(size: GameModel.cellSize * 0.8, weight: .heavy))
                            .foregroundStyle(.red)
                            .shadow(color: .white.opacity(0.35), radius: 1)
                    }
                }
            }
        }
        .clipped()
    }
}

// MARK: - 震动效果（GeometryEffect）

struct ShakeEffect: GeometryEffect {
    var animatableData: CGFloat
    func effectValue(size: CGSize) -> ProjectionTransform {
        let progress = animatableData
        let damping = max(0, 1 - progress)
        let x = 8 * damping * sin(progress * .pi * 8)
        let y = 4 * damping * sin(progress * .pi * 6 + 1.3)
        return ProjectionTransform(CGAffineTransform(translationX: x, y: y))
    }
}

// MARK: - AppKit 桥接：右键事件容器
// SwiftUI 内容不消费右键，事件沿响应链冒泡到该容器后转发为回调。

struct RightClickContainer<Content: View>: NSViewRepresentable {
    var onRightDown: (CGPoint) -> Void
    var onRightUp: (CGPoint) -> Void
    var content: Content

    init(onRightDown: @escaping (CGPoint) -> Void,
         onRightUp: @escaping (CGPoint) -> Void,
         @ViewBuilder content: () -> Content) {
        self.onRightDown = onRightDown
        self.onRightUp = onRightUp
        self.content = content()
    }

    func makeNSView(context: Context) -> RightClickHostView<Content> {
        RightClickHostView(content: content, onRightDown: onRightDown, onRightUp: onRightUp)
    }

    func updateNSView(_ nsView: RightClickHostView<Content>, context: Context) {
        nsView.onRightDown = onRightDown
        nsView.onRightUp = onRightUp
        nsView.update(content: content)
    }
}

final class RightClickHostView<Content: View>: NSView {
    var onRightDown: (CGPoint) -> Void
    var onRightUp: (CGPoint) -> Void
    private let hosting: NSHostingView<Content>

    override var isFlipped: Bool { true } // 坐标系与 SwiftUI 一致（左上原点）

    init(content: Content,
         onRightDown: @escaping (CGPoint) -> Void,
         onRightUp: @escaping (CGPoint) -> Void) {
        self.onRightDown = onRightDown
        self.onRightUp = onRightUp
        self.hosting = NSHostingView(rootView: content)
        super.init(frame: .zero)
        hosting.autoresizingMask = [.width, .height]
        hosting.frame = bounds
        addSubview(hosting)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError() }

    func update(content: Content) { hosting.rootView = content }

    override func rightMouseDown(with event: NSEvent) {
        onRightDown(convert(event.locationInWindow, from: nil))
    }

    override func rightMouseUp(with event: NSEvent) {
        onRightUp(convert(event.locationInWindow, from: nil))
    }
}
