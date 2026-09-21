import Combine
import Foundation
import SwiftUI

// MARK: - Difficulty presets

struct BoardConfig: Equatable {
  var width: Int
  var height: Int
  var mines: Int
  var name: String
  var isCustom: Bool

  static let beginner = BoardConfig(
    width: 9, height: 9, mines: 10, name: "Beginner", isCustom: false)
  static let intermediate = BoardConfig(
    width: 16, height: 16, mines: 40, name: "Intermediate", isCustom: false)
  static let expert = BoardConfig(width: 30, height: 16, mines: 99, name: "Expert", isCustom: false)

  var summary: String { "\(name) \(width)×\(height) · \(mines) mines" }
}

// MARK: - Cell state

struct CellState {
  var mine = false
  var revealed = false
  var flagged = false
  var adjacent = 0
  var wrongFlag = false  // Incorrect flag after a loss (red cross)
  var exploded = false  // Triggered mine (red background)
}

enum GameOutcome { case playing, lost, won }

enum FaceState {
  case smile, pressed, dead, cool
  var emoji: String {
    switch self {
    case .smile: return "🙂"
    case .pressed: return "😮"
    case .dead: return "😵"
    case .cool: return "😎"
    }
  }
}

/// Format the three-digit display: pad values such as -05 and 010; preserve larger values.
func format3(_ n: Int) -> String {
  if n < 0 {
    let a = abs(n)
    return "-" + (a < 100 ? String(format: "%02d", a) : String(a))
  }
  return n <= 999 ? String(format: "%03d", n) : String(n)
}

// MARK: - Game model, ported from the original classic browser implementation

@MainActor
final class GameModel: ObservableObject {
  static let cellSize: CGFloat = 28

  @Published private(set) var config: BoardConfig = .beginner
  @Published private(set) var cells: [CellState] = []
  @Published private(set) var outcome: GameOutcome = .playing
  @Published private(set) var flagCount = 0
  @Published private(set) var time = 0
  @Published var facePressed = false
  @Published var explosion: ExplosionFX?
  @Published var celebration: CelebrationFX?
  @Published var shakeToken = 0
  /// Cells pressed during a two-button chord preview, matching classic Windows Minesweeper.
  @Published private(set) var pressedPreview: Set<Int> = []
  /// Briefly flash chord candidates to show which cells may open or need flags.
  @Published private(set) var flashCells: Set<Int> = []

  private var minesPlaced = false
  private var revealedCount = 0
  private var timer: Timer?
  private var flashSeq = 0

  // Track simultaneous left and right mouse buttons for chording.
  private var leftDown = false
  private var rightDown = false
  private var chordArmed = false
  private var chordIndex: Int?

  var minesRemaining: Int { config.mines - flagCount }
  var face: FaceState {
    switch outcome {
    case .lost: return .dead
    case .won: return .cool
    case .playing: return facePressed ? .pressed : .smile
    }
  }

  init() { newGame() }

  // MARK: Coordinates

  func index(x: Int, y: Int) -> Int { y * config.width + x }
  func coord(_ i: Int) -> (Int, Int) { (i % config.width, i / config.width) }

  private func neighbors(_ i: Int) -> [Int] {
    let (x, y) = coord(i)
    var result: [Int] = []
    for dy in -1...1 {
      for dx in -1...1 where !(dx == 0 && dy == 0) {
        let nx = x + dx
        let ny = y + dy
        if nx >= 0, nx < config.width, ny >= 0, ny < config.height {
          result.append(index(x: nx, y: ny))
        }
      }
    }
    return result
  }

  // MARK: New game

  func newGame(with cfg: BoardConfig? = nil) {
    if let cfg { config = cfg }
    stopTimer()
    cells = Array(repeating: CellState(), count: config.width * config.height)
    minesPlaced = false
    outcome = .playing
    flagCount = 0
    revealedCount = 0
    time = 0
    facePressed = false
    explosion = nil
    celebration = nil
    leftDown = false
    rightDown = false
    chordArmed = false
    chordIndex = nil
    pressedPreview = []
    flashCells = []
  }

  // MARK: Timer (starts on the first reveal and stops at 999)

  private func startTimer() {
    guard timer == nil else { return }
    timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
      Task { @MainActor in self?.tick() }
    }
  }

  private func stopTimer() {
    timer?.invalidate()
    timer = nil
  }

  private func tick() {
    time = min(time + 1, 999)
    if time >= 999 { stopTimer() }
  }

  // MARK: Mine placement (exclude the first cell and its eight neighbors)

  private func placeMines(safe: Int) {
    var forbidden = Set(neighbors(safe))
    forbidden.insert(safe)
    var candidates = (0..<cells.count).filter { !forbidden.contains($0) }
    if config.mines > candidates.count {
      // For dense custom boards with more than width * height - 9 mines, protect only the first cell.
      candidates = (0..<cells.count).filter { $0 != safe }
    }
    candidates.shuffle()
    for i in candidates.prefix(min(config.mines, candidates.count)) {
      cells[i].mine = true
    }
    for i in 0..<cells.count where !cells[i].mine {
      cells[i].adjacent = neighbors(i).filter { cells[$0].mine }.count
    }
    minesPlaced = true
  }

  // MARK: Left click: reveal a cell or chord a revealed number

  func handleTap(_ i: Int) {
    guard outcome == .playing else { return }
    let c = cells[i]
    if c.flagged {
      SoundEngine.shared.play(.click)
      return
    }
    if c.revealed {
      // Chord a numbered cell, equivalent to a double-click in the browser version.
      if c.adjacent > 0 { chord(i) } else { SoundEngine.shared.play(.click) }
      return
    }
    reveal(i)
  }

  @discardableResult
  private func reveal(_ i: Int) -> Bool {
    if cells[i].revealed || cells[i].flagged || outcome != .playing { return false }

    if !minesPlaced {
      placeMines(safe: i)
      startTimer()
    }

    if cells[i].mine {
      lose(hit: i)
      return true
    }

    // Flood reveal with breadth-first search.
    var stack = [i]
    var opened = false
    while let cur = stack.popLast() {
      if cells[cur].revealed || cells[cur].flagged || cells[cur].mine { continue }
      cells[cur].revealed = true
      revealedCount += 1
      opened = true
      if cells[cur].adjacent == 0 {
        for n in neighbors(cur) where !cells[n].revealed && !cells[n].flagged && !cells[n].mine {
          stack.append(n)
        }
      }
    }
    if opened {
      SoundEngine.shared.play(.reveal)
      checkWin()
    }
    return opened
  }

  // MARK: Right click: place or remove a flag

  func toggleFlag(_ i: Int) {
    // Ignore flags before mine placement, matching the browser version.
    guard outcome == .playing, minesPlaced else { return }
    if cells[i].revealed { return }
    cells[i].flagged.toggle()
    flagCount += cells[i].flagged ? 1 : -1
    SoundEngine.shared.play(cells[i].flagged ? .flag : .unflag)
  }

  // MARK: Chording: reveal neighbors when the adjacent flag count matches the number

  /// Covered, unflagged cells in the surrounding 3-by-3 area, including this cell.
  private func coveredAround(_ i: Int) -> Set<Int> {
    Set(([i] + neighbors(i)).filter { !cells[$0].revealed && !cells[$0].flagged })
  }

  /// Briefly flash chord candidates to indicate cells that will open or need flags.
  private func flash(_ indices: Set<Int>) {
    guard !indices.isEmpty else { return }
    flashSeq += 1
    let seq = flashSeq
    flashCells = indices
    Task { [weak self] in
      try? await Task.sleep(nanoseconds: 350_000_000)
      guard let self, !Task.isCancelled, self.flashSeq == seq else { return }
      self.flashCells = []
    }
  }

  func chord(_ i: Int) {
    guard outcome == .playing, minesPlaced else { return }
    let c = cells[i]
    guard c.revealed, c.adjacent > 0 else { return }
    let flags = neighbors(i).filter { cells[$0].flagged }.count
    // Flash candidates before checking flags; matching counts reveal them, otherwise highlight the mismatch.
    flash(coveredAround(i))
    guard flags == c.adjacent else { return }
    for n in neighbors(i) where !cells[n].revealed && !cells[n].flagged {
      reveal(n)
    }
  }

  // MARK: Mouse tracking (pressed face and two-button chording)

  func leftPressed(at i: Int) {
    guard outcome == .playing else { return }
    facePressed = true
    leftDown = true
    if rightDown, !chordArmed {
      chordArmed = true
      chordIndex = i
      // Show a pressed preview of the 3-by-3 area while both buttons are held.
      pressedPreview = coveredAround(i)
    }
  }

  func leftReleased() {
    facePressed = false
    leftDown = false
    finishChordIfReady()
  }

  func rightPressed(at i: Int) {
    guard outcome == .playing else { return }
    rightDown = true
    if leftDown, !chordArmed {
      chordArmed = true
      chordIndex = i
      pressedPreview = coveredAround(i)
    }
  }

  func rightReleased(at i: Int) {
    rightDown = false
    if chordArmed {
      finishChordIfReady()  // Do not toggle flags during a chord.
      return
    }
    toggleFlag(i)
  }

  private func finishChordIfReady() {
    guard chordArmed, !leftDown, !rightDown else { return }
    chordArmed = false
    pressedPreview = []
    if let idx = chordIndex { chord(idx) }
    chordIndex = nil
  }

  // MARK: Loss and victory

  private func lose(hit: Int) {
    outcome = .lost
    stopTimer()
    SoundEngine.shared.play(.explosion)
    explosion = ExplosionFX.make(cell: hit)
    shakeToken += 1
    for i in 0..<cells.count {
      if cells[i].mine && !cells[i].flagged {
        cells[i].revealed = true
      } else if !cells[i].mine && cells[i].flagged {
        cells[i].wrongFlag = true
      }
    }
    cells[hit].exploded = true
    facePressed = false
    pressedPreview = []
  }

  private func checkWin() {
    guard outcome == .playing else { return }
    guard revealedCount == config.width * config.height - config.mines else { return }
    outcome = .won
    stopTimer()
    // Automatically flag the remaining mines.
    for i in 0..<cells.count where cells[i].mine && !cells[i].flagged {
      cells[i].flagged = true
      flagCount += 1
    }
    SoundEngine.shared.play(.win)
    celebration = CelebrationFX.make()
  }
}
