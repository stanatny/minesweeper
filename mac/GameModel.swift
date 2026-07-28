import Foundation
import SwiftUI
import Combine

// MARK: - 难度配置

struct BoardConfig: Equatable {
    var width: Int
    var height: Int
    var mines: Int
    var name: String
    var isCustom: Bool

    static let beginner     = BoardConfig(width: 9,  height: 9,  mines: 10, name: "初级", isCustom: false)
    static let intermediate = BoardConfig(width: 16, height: 16, mines: 40, name: "中级", isCustom: false)
    static let expert       = BoardConfig(width: 30, height: 16, mines: 99, name: "高级", isCustom: false)

    var summary: String { "\(name) \(width)×\(height) · \(mines) 雷" }
}

// MARK: - 格子状态

struct CellState {
    var mine = false
    var revealed = false
    var flagged = false
    var adjacent = 0
    var wrongFlag = false   // 失败时：标错的旗（红叉）
    var exploded = false    // 被踩中的雷（红底）
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

/// 三位数码管格式化：负数如 -05，正数补零如 010，封顶/超界直接显示
func format3(_ n: Int) -> String {
    if n < 0 {
        let a = abs(n)
        return "-" + (a < 100 ? String(format: "%02d", a) : String(a))
    }
    return n <= 999 ? String(format: "%03d", n) : String(n)
}

// MARK: - 游戏模型（经典玩法移植自 js/game.js）

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
    /// 左右键同按期间的"压下预览"格（Windows 经典：同按时 3×3 邻域呈凹陷）
    @Published private(set) var pressedPreview: Set<Int> = []
    /// chording 触发时的短暂闪烁格（提示哪些位置会被翻开/需要插旗）
    @Published private(set) var flashCells: Set<Int> = []

    private var minesPlaced = false
    private var revealedCount = 0
    private var timer: Timer?
    private var flashSeq = 0

    // chording 按键跟踪（左+右同按）
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

    // MARK: 坐标

    func index(x: Int, y: Int) -> Int { y * config.width + x }
    func coord(_ i: Int) -> (Int, Int) { (i % config.width, i / config.width) }

    private func neighbors(_ i: Int) -> [Int] {
        let (x, y) = coord(i)
        var result: [Int] = []
        for dy in -1...1 {
            for dx in -1...1 where !(dx == 0 && dy == 0) {
                let nx = x + dx, ny = y + dy
                if nx >= 0, nx < config.width, ny >= 0, ny < config.height {
                    result.append(index(x: nx, y: ny))
                }
            }
        }
        return result
    }

    // MARK: 新游戏

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

    // MARK: 计时器（首击开始，封顶 999）

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

    // MARK: 布雷（首次点击后，排除被点格及 8 邻域）

    private func placeMines(safe: Int) {
        var forbidden = Set(neighbors(safe))
        forbidden.insert(safe)
        var candidates = (0..<cells.count).filter { !forbidden.contains($0) }
        if config.mines > candidates.count {
            // 高密度自定义局（雷数 > 宽×高−9）：退化为仅保证首点格安全
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

    // MARK: 左键：翻开 / 数字格单击 chording

    func handleTap(_ i: Int) {
        guard outcome == .playing else { return }
        let c = cells[i]
        if c.flagged { SoundEngine.shared.play(.click); return }
        if c.revealed {
            // 数字格 chording（等价网页版双击行为）
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

        if cells[i].mine { lose(hit: i); return true }

        // BFS 洪水展开
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

    // MARK: 右键：插旗 / 取消旗

    func toggleFlag(_ i: Int) {
        guard outcome == .playing, minesPlaced else { return } // 未布雷前不插旗（与网页版一致）
        if cells[i].revealed { return }
        cells[i].flagged.toggle()
        flagCount += cells[i].flagged ? 1 : -1
        SoundEngine.shared.play(cells[i].flagged ? .flag : .unflag)
    }

    // MARK: chording：周围旗数 == 数字时翻开其余邻格

    /// 自身及 8 邻域中未翻开、未插旗的格子（chording 候选位置）
    private func coveredAround(_ i: Int) -> Set<Int> {
        Set(([i] + neighbors(i)).filter { !cells[$0].revealed && !cells[$0].flagged })
    }

    /// 短暂闪烁候选格（Windows 经典反馈：提示哪些位置将被翻开 / 需要插旗）
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
        // 无论旗数是否匹配都闪一下候选格：匹配时随即翻开，不匹配时提示还缺/多旗
        flash(coveredAround(i))
        guard flags == c.adjacent else { return }
        for n in neighbors(i) where !cells[n].revealed && !cells[n].flagged {
            reveal(n)
        }
    }

    // MARK: 按键跟踪（笑脸 😮 + 左右键同按 chording）

    func leftPressed(at i: Int) {
        guard outcome == .playing else { return }
        facePressed = true
        leftDown = true
        if rightDown, !chordArmed {
            chordArmed = true
            chordIndex = i
            pressedPreview = coveredAround(i) // 同按期间 3×3 邻域呈压下预览
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
            finishChordIfReady() // chord 流程中不插旗
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

    // MARK: 失败 / 胜利

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
        // 自动给剩余雷插旗
        for i in 0..<cells.count where cells[i].mine && !cells[i].flagged {
            cells[i].flagged = true
            flagCount += 1
        }
        SoundEngine.shared.play(.win)
        celebration = CelebrationFX.make()
    }
}
