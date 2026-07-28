import SwiftUI

@main
struct MinesweeperApp: App {
    @StateObject private var model = GameModel()

    var body: some Scene {
        WindowGroup("扫雷") {
            ContentView()
                .environmentObject(model)
        }
        .windowResizability(.contentSize)
        .commands {
            CommandMenu("游戏") {
                Button("新游戏") { model.newGame() }
                    .keyboardShortcut("n", modifiers: .command)
                Divider()
                Button("初级 (9×9, 10 雷)") { model.newGame(with: .beginner) }
                Button("中级 (16×16, 40 雷)") { model.newGame(with: .intermediate) }
                Button("高级 (30×16, 99 雷)") { model.newGame(with: .expert) }
            }
        }
    }
}

// MARK: - 主界面

struct ContentView: View {
    @EnvironmentObject var model: GameModel
    @Environment(\.colorScheme) private var scheme
    @AppStorage("appearance") private var appearance: AppearanceMode = .system
    @AppStorage("soundEnabled") private var soundEnabled = true
    @State private var showCustomSheet = false

    private var boardWidth: CGFloat { CGFloat(model.config.width) * GameModel.cellSize + 12 }

    var body: some View {
        let theme = Theme(scheme: scheme)
        VStack(spacing: 10) {
            header(theme: theme)
            controlsRow(theme: theme)
            BoardView()
                .padding(6)
                .background(theme.panel)
                .overlay(SunkenOverlay(theme: theme, width: 2))
        }
        .padding(12)
        .background(theme.windowBg)
        .fixedSize()
        .preferredColorScheme(appearance.colorScheme)
        .sheet(isPresented: $showCustomSheet) {
            CustomDifficultySheet { cfg in
                model.newGame(with: cfg)
            }
        }
        .onAppear {
            SoundEngine.shared.setEnabled(soundEnabled)
            DispatchQueue.global(qos: .utility).async { SoundEngine.shared.prepare() }
        }
        .onChange(of: soundEnabled) { _, v in SoundEngine.shared.setEnabled(v) }
    }

    // 顶部：雷数计数器 · 笑脸按钮 · 计时器（凹面面板内）
    private func header(theme: Theme) -> some View {
        HStack {
            LCDView(value: model.minesRemaining)
            Spacer()
            Button {
                model.newGame()
            } label: {
                Text(model.face.emoji)
                    .font(.system(size: 24))
                    .frame(width: 40, height: 40)
                    .background(theme.panel)
                    .overlay(BevelOverlay(theme: theme, width: 3))
            }
            .buttonStyle(.plain)
            .help("新游戏")
            Spacer()
            LCDView(value: min(model.time, 999))
        }
        .padding(8)
        .frame(width: boardWidth)
        .background(theme.panel)
        .overlay(SunkenOverlay(theme: theme, width: 2))
    }

    // 控制行：难度 · 外观 · 音效
    private func controlsRow(theme: Theme) -> some View {
        HStack(spacing: 10) {
            Menu {
                Button("初级 (9×9, 10 雷)") { model.newGame(with: .beginner) }
                Button("中级 (16×16, 40 雷)") { model.newGame(with: .intermediate) }
                Button("高级 (30×16, 99 雷)") { model.newGame(with: .expert) }
                Divider()
                Button("自定义…") { showCustomSheet = true }
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "square.grid.3x3.fill")
                    Text(model.config.summary)
                        .lineLimit(1)
                }
                .font(.system(size: 12))
                .foregroundStyle(theme.labelPrimary)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(theme.panel)
                .overlay(BevelOverlay(theme: theme, width: 2))
            }
            .menuStyle(.borderlessButton)
            .menuIndicator(.hidden)
            .fixedSize()

            Spacer()

            Menu {
                ForEach(AppearanceMode.allCases) { mode in
                    Button {
                        appearance = mode
                    } label: {
                        if appearance == mode {
                            Label(mode.title, systemImage: "checkmark")
                        } else {
                            Text(mode.title)
                        }
                    }
                }
            } label: {
                Image(systemName: scheme == .dark ? "moon.fill" : "sun.max.fill")
                    .font(.system(size: 13))
                    .foregroundStyle(theme.labelPrimary)
                    .frame(width: 30, height: 24)
                    .background(theme.panel)
                    .overlay(BevelOverlay(theme: theme, width: 2))
            }
            .menuStyle(.borderlessButton)
            .menuIndicator(.hidden)
            .fixedSize()
            .help("外观：跟随系统 / 浅色 / 深色")

            Button {
                soundEnabled.toggle()
            } label: {
                Image(systemName: soundEnabled ? "speaker.wave.2.fill" : "speaker.slash.fill")
                    .font(.system(size: 13))
                    .foregroundStyle(theme.labelPrimary)
                    .frame(width: 30, height: 24)
                    .background(theme.panel)
                    .overlay(BevelOverlay(theme: theme, width: 2))
            }
            .buttonStyle(.plain)
            .help(soundEnabled ? "音效：开" : "音效：关")
        }
        .frame(width: boardWidth)
    }
}

// MARK: - 数码管计数器

struct LCDView: View {
    let value: Int
    var body: some View {
        Text(format3(value))
            .font(.system(size: 26, weight: .bold, design: .monospaced))
            .foregroundStyle(Color(red: 1, green: 0.15, blue: 0.1))
            .padding(.horizontal, 6)
            .padding(.vertical, 1)
            .background(Color.black)
            .cornerRadius(3)
            .overlay(
                RoundedRectangle(cornerRadius: 3)
                    .stroke(Color.white.opacity(0.12), lineWidth: 1)
            )
    }
}

// MARK: - 自定义难度表单
// 规则：宽/高 9–50；雷数 5 ~ min(999, 宽×高−1)（至少留 1 格给首次点击）。
// 输入超限自动收敛到边界值；宽/高缩小后雷数随之自动下调。

struct CustomDifficultySheet: View {
    enum Field { case w, h, m }

    @Environment(\.dismiss) private var dismiss
    @State private var widthText = "16"
    @State private var heightText = "16"
    @State private var minesText = "40"
    @FocusState private var focus: Field?

    var onApply: (BoardConfig) -> Void

    private static let dimRange = 9...50
    private static let mineFloor = 5

    /// 当前宽高下允许的最大雷数
    private var maxMines: Int {
        let w = Self.dimRange.clamp(Int(widthText) ?? 16)
        let h = Self.dimRange.clamp(Int(heightText) ?? 16)
        return max(Self.mineFloor, min(999, w * h - 1))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("自定义难度")
                .font(.headline)

            Grid(alignment: .leading, horizontalSpacing: 10, verticalSpacing: 8) {
                GridRow {
                    Text("宽度（9–50）:")
                    TextField("", text: $widthText)
                        .textFieldStyle(.roundedBorder)
                        .frame(width: 90)
                        .focused($focus, equals: .w)
                        .onSubmit { clampDim(.w) }
                }
                GridRow {
                    Text("高度（9–50）:")
                    TextField("", text: $heightText)
                        .textFieldStyle(.roundedBorder)
                        .frame(width: 90)
                        .focused($focus, equals: .h)
                        .onSubmit { clampDim(.h) }
                }
                GridRow {
                    Text("雷数（5–\(maxMines)）:")
                    TextField("", text: $minesText)
                        .textFieldStyle(.roundedBorder)
                        .frame(width: 90)
                        .focused($focus, equals: .m)
                        .onSubmit { clampMines() }
                }
            }

            Text("超出范围的输入会自动调整为最近的可取值")
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack {
                Button("取消") { dismiss() }
                    .keyboardShortcut(.cancelAction)
                Spacer()
                Button("开始游戏") { apply() }
                    .keyboardShortcut(.defaultAction)
            }
        }
        .padding(20)
        .frame(width: 300)
        // 输入框失焦时自动收敛
        .onChange(of: focus) { old, new in
            if old == .w, new != .w { clampDim(.w) }
            if old == .h, new != .h { clampDim(.h) }
            if old == .m, new != .m { clampMines() }
        }
    }

    /// 宽/高收敛到 9–50；随后雷数按新格子总数重新收敛（格子变少时雷数自动下调）
    private func clampDim(_ field: Field) {
        switch field {
        case .w:
            widthText = String(Self.dimRange.clamp(Int(widthText) ?? Self.dimRange.lowerBound))
        case .h:
            heightText = String(Self.dimRange.clamp(Int(heightText) ?? Self.dimRange.lowerBound))
        case .m:
            break
        }
        clampMines()
    }

    /// 雷数收敛到 5 ~ maxMines
    private func clampMines() {
        let m = Int(minesText) ?? Self.mineFloor
        minesText = String(min(max(m, Self.mineFloor), maxMines))
    }

    private func apply() {
        // 全部输入以收敛后的值为准（防御性再收敛一次）
        clampDim(.w)
        clampDim(.h)
        let w = Int(widthText)!
        let h = Int(heightText)!
        let m = Int(minesText)!
        onApply(BoardConfig(width: w, height: h, mines: m, name: "自定义", isCustom: true))
        dismiss()
    }
}

private extension ClosedRange where Bound == Int {
    func clamp(_ v: Int) -> Int { Swift.min(Swift.max(v, lowerBound), upperBound) }
}
