import SwiftUI

@main
struct MinesweeperApp: App {
  @StateObject private var model = GameModel()

  var body: some Scene {
    WindowGroup("Minesweeper") {
      ContentView()
        .environmentObject(model)
    }
    .windowResizability(.contentSize)
    .commands {
      CommandMenu("Game") {
        Button("New Game") { model.newGame() }
          .keyboardShortcut("n", modifiers: .command)
        Divider()
        Button("Beginner (9×9, 10 mines)") { model.newGame(with: .beginner) }
        Button("Intermediate (16×16, 40 mines)") { model.newGame(with: .intermediate) }
        Button("Expert (30×16, 99 mines)") { model.newGame(with: .expert) }
      }
    }
  }
}

// MARK: - Main view

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

  // Header: mine counter, face button, and timer inside a recessed panel.
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
      .help("New Game")
      Spacer()
      LCDView(value: min(model.time, 999))
    }
    .padding(8)
    .frame(width: boardWidth)
    .background(theme.panel)
    .overlay(SunkenOverlay(theme: theme, width: 2))
  }

  // Controls: difficulty, appearance, and sound effects.
  private func controlsRow(theme: Theme) -> some View {
    HStack(spacing: 10) {
      Menu {
        Button("Beginner (9×9, 10 mines)") { model.newGame(with: .beginner) }
        Button("Intermediate (16×16, 40 mines)") { model.newGame(with: .intermediate) }
        Button("Expert (30×16, 99 mines)") { model.newGame(with: .expert) }
        Divider()
        Button("Custom…") { showCustomSheet = true }
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
      .help("Appearance: System / Light / Dark")

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
      .help(soundEnabled ? "Sound effects: On" : "Sound effects: Off")
    }
    .frame(width: boardWidth)
  }
}

// MARK: - Digital counter

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

// MARK: - Custom difficulty form
// Width and height: 9–50. Mines: 5...min(999, width * height - 1), leaving a safe first cell.
// Clamp out-of-range input and lower the mine count when the board shrinks.

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

  /// Maximum mine count for the current dimensions.
  private var maxMines: Int {
    let w = Self.dimRange.clamp(Int(widthText) ?? 16)
    let h = Self.dimRange.clamp(Int(heightText) ?? 16)
    return max(Self.mineFloor, min(999, w * h - 1))
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 14) {
      Text("Custom Difficulty")
        .font(.headline)

      Grid(alignment: .leading, horizontalSpacing: 10, verticalSpacing: 8) {
        GridRow {
          Text("Width (9–50):")
          TextField("", text: $widthText)
            .textFieldStyle(.roundedBorder)
            .frame(width: 90)
            .focused($focus, equals: .w)
            .onSubmit { clampDim(.w) }
        }
        GridRow {
          Text("Height (9–50):")
          TextField("", text: $heightText)
            .textFieldStyle(.roundedBorder)
            .frame(width: 90)
            .focused($focus, equals: .h)
            .onSubmit { clampDim(.h) }
        }
        GridRow {
          Text("Mines (5–\(maxMines)):")
          TextField("", text: $minesText)
            .textFieldStyle(.roundedBorder)
            .frame(width: 90)
            .focused($focus, equals: .m)
            .onSubmit { clampMines() }
        }
      }

      Text("Out-of-range values are adjusted automatically.")
        .font(.caption)
        .foregroundStyle(.secondary)

      HStack {
        Button("Cancel") { dismiss() }
          .keyboardShortcut(.cancelAction)
        Spacer()
        Button("Start Game") { apply() }
          .keyboardShortcut(.defaultAction)
      }
    }
    .padding(20)
    .frame(width: 300)
    // Clamp input when a field loses focus.
    .onChange(of: focus) { old, new in
      if old == .w, new != .w { clampDim(.w) }
      if old == .h, new != .h { clampDim(.h) }
      if old == .m, new != .m { clampMines() }
    }
  }

  /// Clamp dimensions to 9–50, then adjust the mine count to the new board size.
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

  /// Clamp the mine count to 5...maxMines.
  private func clampMines() {
    let m = Int(minesText) ?? Self.mineFloor
    minesText = String(min(max(m, Self.mineFloor), maxMines))
  }

  private func apply() {
    // Clamp all inputs again before applying the configuration.
    clampDim(.w)
    clampDim(.h)
    let w = Int(widthText)!
    let h = Int(heightText)!
    let m = Int(minesText)!
    onApply(BoardConfig(width: w, height: h, mines: m, name: "Custom", isCustom: true))
    dismiss()
  }
}

extension ClosedRange where Bound == Int {
  fileprivate func clamp(_ v: Int) -> Int { Swift.min(Swift.max(v, lowerBound), upperBound) }
}
