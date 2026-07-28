import AVFoundation
import Foundation

// MARK: - 程序内实时合成音效引擎（无外部音频文件）
// 合成思路移植自 js/audio.js：方波 tick / 正弦 blip / 滤波噪声 pop /
// 低通扫频爆轰 + 低频轰击 / 三角波上行琶音。
// 播放方式：合成 PCM → 封装为内存 WAV Data → AVAudioPlayer 播放。
// 注：此前版本用 AVAudioEngine，engine.start() 在部分机器上会抛
// NSException（Swift 无法捕获）导致进程 abort，故改为 AVAudioPlayer。
// 线程安全：NSLock 保护状态；预合成在后台队列，播放在主线程。

enum SoundName: String, CaseIterable {
    case click, flag, unflag, reveal, explosion, win
}

final class SoundEngine: NSObject, AVAudioPlayerDelegate, @unchecked Sendable {
    static let shared = SoundEngine()

    private let lock = NSLock()
    private var wavData: [SoundName: Data] = [:]
    private var activePlayers: [AVAudioPlayer] = []
    private var enabled = true
    private var preparing = false
    private let sr: Double = 44100

    private override init() { super.init() }

    func setEnabled(_ on: Bool) {
        lock.lock()
        enabled = on
        lock.unlock()
    }

    /// 预合成全部音效（可在后台线程调用，幂等）
    func prepare() {
        lock.lock()
        if preparing { lock.unlock(); return }
        preparing = true
        let done = wavData.count == SoundName.allCases.count
        lock.unlock()
        guard !done else { return }

        var built: [SoundName: Data] = [:]
        for name in SoundName.allCases {
            built[name] = makeWAV(synthesize(name))
        }
        lock.lock()
        wavData = built
        lock.unlock()
    }

    func play(_ name: SoundName) {
        lock.lock()
        let ok = enabled
        let data = wavData[name]
        lock.unlock()
        guard ok else { return }
        guard let data else {
            // 预合成尚未完成（罕见）：后台补一次，本次静默
            DispatchQueue.global(qos: .utility).async { self.prepare() }
            return
        }
        DispatchQueue.main.async { self.playData(data) }
    }

    // MARK: 播放（每个事件一个 AVAudioPlayer，支持重叠播放）

    private func playData(_ data: Data) {
        lock.lock()
        activePlayers.removeAll { !$0.isPlaying } // 顺手清理已结束的
        lock.unlock()

        guard let player = try? AVAudioPlayer(data: data) else { return }
        player.delegate = self
        lock.lock()
        activePlayers.append(player)
        lock.unlock()
        player.prepareToPlay()
        player.play()
    }

    /// AVAudioPlayerDelegate：播放结束后移除引用
    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        lock.lock()
        activePlayers.removeAll { $0 === player }
        lock.unlock()
    }

    // MARK: PCM → WAV（16-bit 单声道）

    private func makeWAV(_ samples: [Float]) -> Data {
        let dataSize = UInt32(samples.count * 2)
        var d = Data()
        d.reserveCapacity(44 + Int(dataSize))

        func u32(_ v: UInt32) { var le = v.littleEndian; d.append(Data(bytes: &le, count: 4)) }
        func u16(_ v: UInt16) { var le = v.littleEndian; d.append(Data(bytes: &le, count: 2)) }

        d.append(contentsOf: [0x52, 0x49, 0x46, 0x46]) // "RIFF"
        u32(36 + dataSize)
        d.append(contentsOf: [0x57, 0x41, 0x56, 0x45]) // "WAVE"
        d.append(contentsOf: [0x66, 0x6D, 0x74, 0x20]) // "fmt "
        u32(16)          // fmt 块大小
        u16(1)           // PCM
        u16(1)           // 单声道
        u32(UInt32(sr))  // 采样率
        u32(UInt32(sr) * 2) // 字节率
        u16(2)           // 块对齐
        u16(16)          // 位深
        d.append(contentsOf: [0x64, 0x61, 0x74, 0x61]) // "data"
        u32(dataSize)
        for s in samples {
            let clamped = max(-1, min(1, s))
            u16(UInt16(bitPattern: Int16(clamped * 32767)))
        }
        return d
    }

    // MARK: 合成

    private enum Wave { case sine, square, triangle }

    private func blank(_ dur: Double) -> [Float] {
        [Float](repeating: 0, count: Int(dur * sr) + 1)
    }

    private func finalize(_ s: [Float]) -> [Float] {
        // 主增益 0.9 + 限幅防爆音
        s.map { max(-1, min(1, $0)) * 0.9 }
    }

    private func synthesize(_ name: SoundName) -> [Float] {
        var s: [Float]
        switch name {
        case .click:
            s = blank(0.06)
            addTone(&s, wave: .square, f0: 1200, f1: nil, at: 0, dur: 0.03, peak: 0.15)
        case .flag:
            s = blank(0.12)
            addTone(&s, wave: .sine, f0: 880, f1: nil, at: 0, dur: 0.09, peak: 0.25)
        case .unflag:
            s = blank(0.12)
            addTone(&s, wave: .sine, f0: 520, f1: nil, at: 0, dur: 0.09, peak: 0.25)
        case .reveal:
            s = blank(0.1)
            addNoise(&s, at: 0, dur: 0.06, f0: 900, f1: 300, highpass: false, peak: 0.2)
            addTone(&s, wave: .sine, f0: 220, f1: nil, at: 0, dur: 0.06, peak: 0.12)
        case .explosion:
            s = blank(0.9)
            // 主体爆轰：低通噪声 5kHz → 60Hz 扫频
            addNoise(&s, at: 0, dur: 0.8, f0: 5000, f1: 60, highpass: false, peak: 0.7)
            // 高频裂响层
            addNoise(&s, at: 0, dur: 0.12, f0: 2000, f1: 4000, highpass: true, peak: 0.3)
            // 低频轰击：120Hz → 35Hz 下滑
            addTone(&s, wave: .sine, f0: 120, f1: 35, at: 0, dur: 0.55, peak: 0.65)
        case .win:
            s = blank(1.1)
            let notes = [523.25, 659.25, 783.99, 1046.50] // C5 E5 G5 C6
            let step = 0.13
            for (i, f) in notes.enumerated() {
                addTone(&s, wave: .triangle, f0: f, f1: nil, at: Double(i) * step, dur: 0.22, peak: 0.28)
            }
            let end = Double(notes.count) * step
            addTone(&s, wave: .triangle, f0: 1046.50, f1: nil, at: end, dur: 0.4, peak: 0.22)
            addTone(&s, wave: .triangle, f0: 1318.51, f1: nil, at: end, dur: 0.4, peak: 0.18)
        }
        return finalize(s)
    }

    /// 包络：attack 线性起音，随后指数衰减到 dur 末尾的 1e-4
    private func envelope(t: Double, attack: Double, dur: Double, peak: Double) -> Double {
        if t < attack { return peak * t / attack }
        return peak * pow(1e-4, (t - attack) / max(dur - attack, 1e-9))
    }

    private func addTone(_ s: inout [Float], wave: Wave, f0: Double, f1: Double?,
                         at start: Double, dur: Double, peak: Double) {
        let n = Int(dur * sr)
        let off = Int(start * sr)
        let attack = 0.008
        var phase = 0.0
        for i in 0..<n {
            let t = Double(i) / sr
            let f = f1.map { f0 * pow($0 / f0, t / dur) } ?? f0 // 指数扫频
            phase += 2 * .pi * f / sr
            let v: Double
            switch wave {
            case .sine:
                v = sin(phase)
            case .square:
                v = sin(phase) >= 0 ? 1 : -1
            case .triangle:
                let u = phase / (2 * .pi)
                v = 2 * abs(2 * (u - floor(u + 0.5))) - 1
            }
            let idx = off + i
            if idx < s.count {
                s[idx] += Float(v * envelope(t: t, attack: attack, dur: dur, peak: peak))
            }
        }
    }

    /// 一阶低通/高通滤波噪声（截止频率指数扫频）
    private func addNoise(_ s: inout [Float], at start: Double, dur: Double,
                          f0: Double, f1: Double, highpass: Bool, peak: Double) {
        let n = Int(dur * sr)
        let off = Int(start * sr)
        let attack = 0.01
        var lp = 0.0
        for i in 0..<n {
            let t = Double(i) / sr
            let f = f0 * pow(f1 / f0, t / dur)
            let alpha = 1 - exp(-2 * .pi * max(f, 1) / sr)
            let white = Double.random(in: -1...1)
            lp += alpha * (white - lp)
            let v = highpass ? (white - lp) : lp * 2.2 // 低通后补偿能量
            let idx = off + i
            if idx < s.count {
                s[idx] += Float(v * envelope(t: t, attack: attack, dur: dur, peak: peak))
            }
        }
    }
}
