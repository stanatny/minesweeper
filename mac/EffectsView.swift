import SwiftUI

// MARK: - 粒子参数（确定性预计算，绘制为关于 elapsed time 的纯函数）

struct SparkParams {
    var angle: Double
    var speed: Double
    var gravity: Double
    var drag: Double
    var life: Double
    var size: Double
    var upBias: Double
    var color: Int
}

struct ConfettiParams {
    var angle: Double
    var speed: Double
    var life: Double
    var size: Double
    var wobble: Double
    var wobbleSpeed: Double
    var rotation: Double
    var rotSpeed: Double
    var color: Int
}

struct Burst {
    var at: Double      // 相对庆祝开始的秒数
    var fx: Double      // 喷射点 x（宽度比例）
    var fy: Double      // 喷射点 y（高度比例）
    var color: Int
    var confetti: [ConfettiParams]
    var sparks: [SparkParams]
}

// MARK: - 爆炸事件（踩雷格中心：火花 + 冲击波 + 闪光）

struct ExplosionFX {
    let cell: Int
    let start: Date
    let sparks: [SparkParams]

    static let duration: Double = 1.1

    static func make(cell: Int) -> ExplosionFX {
        let sparks = (0..<70).map { _ in
            SparkParams(angle: .random(in: 0...(2 * .pi)),
                        speed: 90 + .random(in: 0..<260),
                        gravity: 520,
                        drag: 0.985,
                        life: 0.5 + .random(in: 0..<0.5),
                        size: 2 + .random(in: 0..<3.5),
                        upBias: 60,
                        color: .random(in: 0..<5))
        }
        return ExplosionFX(cell: cell, start: Date(), sparks: sparks)
    }
}

// MARK: - 庆祝事件（约 2 秒连续喷射纸屑 + 烟花）

struct CelebrationFX {
    let start: Date
    let bursts: [Burst]

    static let duration: Double = 4.4

    static func make() -> CelebrationFX {
        var bursts: [Burst] = []
        var t = 0.0
        while t < 2.0 {
            bursts.append(makeBurst(at: t))
            t += 0.09 + Double.random(in: 0..<0.14)
        }
        return CelebrationFX(start: Date(), bursts: bursts)
    }

    private static func makeBurst(at t: Double) -> Burst {
        let confetti = (0..<14).map { _ in
            ConfettiParams(angle: -.pi / 2 + .random(in: -0.7..<0.7),
                           speed: 180 + .random(in: 0..<320),
                           life: 1.2 + .random(in: 0..<1.0),
                           size: 3 + .random(in: 0..<4),
                           wobble: .random(in: 0...(2 * .pi)),
                           wobbleSpeed: 4 + .random(in: 0..<6),
                           rotation: .random(in: 0...(2 * .pi)),
                           rotSpeed: .random(in: -6..<6),
                           color: .random(in: 0..<8))
        }
        let sparks = (0..<24).map { _ in
            SparkParams(angle: .random(in: 0...(2 * .pi)),
                        speed: 60 + .random(in: 0..<220),
                        gravity: 260,
                        drag: 0.975,
                        life: 0.7 + .random(in: 0..<0.7),
                        size: 1.5 + .random(in: 0..<2.5),
                        upBias: 0,
                        color: 0)
        }
        return Burst(at: t,
                     fx: 0.1 + .random(in: 0..<0.8),
                     fy: 0.15 + .random(in: 0..<0.55),
                     color: .random(in: 0..<7),
                     confetti: confetti,
                     sparks: sparks)
    }
}

// MARK: - 特效叠层（Canvas + TimelineView，事件存在时才驱动刷新）

struct EffectsOverlay: View {
    @EnvironmentObject var model: GameModel

    private static let sparkColors: [Color] = [
        Color(red: 1.0, green: 0.87, blue: 0.33), // #ffdd55
        Color(red: 1.0, green: 0.67, blue: 0.20), // #ffaa33
        Color(red: 1.0, green: 0.47, blue: 0.13), // #ff7722
        Color(red: 1.0, green: 0.27, blue: 0.07), // #ff4411
        Color(red: 1.0, green: 0.80, blue: 0.40)  // #ffcc66
    ]
    private static let confettiColors: [Color] = [
        Color(red: 1.0, green: 0.33, blue: 0.33),
        Color(red: 1.0, green: 0.67, blue: 0.20),
        Color(red: 1.0, green: 0.93, blue: 0.33),
        Color(red: 0.33, green: 0.87, blue: 0.47),
        Color(red: 0.33, green: 0.60, blue: 1.00),
        Color(red: 0.80, green: 0.47, blue: 1.00),
        Color(red: 1.0, green: 0.47, blue: 0.67),
        .white
    ]
    private static let fireworkColors: [Color] = [
        Color(red: 1.0, green: 0.33, blue: 0.33),
        Color(red: 1.0, green: 0.67, blue: 0.20),
        Color(red: 1.0, green: 0.93, blue: 0.33),
        Color(red: 0.33, green: 0.87, blue: 0.47),
        Color(red: 0.33, green: 0.60, blue: 1.00),
        Color(red: 0.80, green: 0.47, blue: 1.00),
        Color(red: 1.0, green: 0.47, blue: 0.67)
    ]

    var body: some View {
        if model.explosion != nil || model.celebration != nil {
            TimelineView(.animation) { timeline in
                Canvas { context, size in
                    var ctx = context
                    let now = timeline.date
                    if let ex = model.explosion {
                        drawExplosion(ctx: &ctx, size: size, fx: ex, now: now)
                    }
                    if let cb = model.celebration {
                        drawCelebration(ctx: &ctx, size: size, fx: cb, now: now)
                    }
                }
                .onChange(of: timeline.date) { _, now in
                    if let ex = model.explosion,
                       now.timeIntervalSince(ex.start) > ExplosionFX.duration {
                        model.explosion = nil
                    }
                    if let cb = model.celebration,
                       now.timeIntervalSince(cb.start) > CelebrationFX.duration {
                        model.celebration = nil
                    }
                }
            }
        }
    }

    // 阻尼位移闭式解：v(t) = v0·drag^(60t)，位移 = v0·(e^(kt)−1)/k，k = 60·ln(drag)
    private func dragDisp(v0: Double, drag: Double, t: Double) -> Double {
        let k = 60 * log(drag)
        return v0 * (exp(k * t) - 1) / k
    }

    private func drawExplosion(ctx: inout GraphicsContext, size: CGSize, fx: ExplosionFX, now: Date) {
        let t = now.timeIntervalSince(fx.start)
        guard t >= 0 else { return }
        let cs = GameModel.cellSize
        let cx = CGFloat(fx.cell % model.config.width) * cs + cs / 2
        let cy = CGFloat(fx.cell / model.config.width) * cs + cs / 2

        // 白色闪光（快速放大淡出，0.18s）
        if t < 0.18 {
            let p = t / 0.18
            let r = CGFloat(6 + 900 * t)
            var c = ctx
            c.opacity = (1 - p) * 0.85
            c.fill(Path(ellipseIn: CGRect(x: cx - r, y: cy - r, width: r * 2, height: r * 2)),
                   with: .color(.white))
        }
        // 冲击波圆环（0.45s）
        if t < 0.45 {
            let p = t / 0.45
            let r = CGFloat(4 + 320 * t)
            var c = ctx
            c.opacity = (1 - p) * 0.9
            c.stroke(Path(ellipseIn: CGRect(x: cx - r, y: cy - r, width: r * 2, height: r * 2)),
                     with: .color(Color(red: 1.0, green: 0.78, blue: 0.47)),
                     lineWidth: max(0.5, CGFloat(5 * (1 - p))))
        }
        // 橙红火花（径向飞散 + 重力衰减）
        for s in fx.sparks where t < s.life {
            let k = t / s.life
            let sz = CGFloat(s.size * (1 - k * 0.8))
            if sz < 0.3 { continue }
            let disp = dragDisp(v0: s.speed, drag: s.drag, t: t)
            let x = cx + CGFloat(cos(s.angle) * disp)
            let y = cy + CGFloat(sin(s.angle) * disp - s.upBias * t + 0.5 * s.gravity * t * t)
            var c = ctx
            c.opacity = 1 - k
            c.fill(Path(ellipseIn: CGRect(x: x - sz, y: y - sz, width: sz * 2, height: sz * 2)),
                   with: .color(Self.sparkColors[s.color]))
        }
    }

    private func drawCelebration(ctx: inout GraphicsContext, size: CGSize, fx: CelebrationFX, now: Date) {
        let t = now.timeIntervalSince(fx.start)
        guard t >= 0 else { return }
        for burst in fx.bursts {
            let bt = t - burst.at
            if bt < 0 { continue }
            let bx = size.width * burst.fx
            let by = size.height * burst.fy

            // 烟花火花（单色一束，径向飞散）
            for s in burst.sparks where bt < s.life {
                let k = bt / s.life
                let sz = CGFloat(s.size * (1 - k * 0.6))
                if sz < 0.3 { continue }
                let disp = dragDisp(v0: s.speed, drag: s.drag, t: bt)
                let x = bx + CGFloat(cos(s.angle) * disp)
                let y = by + CGFloat(sin(s.angle) * disp + 0.5 * s.gravity * bt * bt)
                var c = ctx
                c.opacity = 1 - k
                c.fill(Path(ellipseIn: CGRect(x: x - sz, y: y - sz, width: sz * 2, height: sz * 2)),
                       with: .color(Self.fireworkColors[burst.color]))
            }

            // 彩色纸屑（向上喷出、左右飘动、翻转）
            for p in burst.confetti where bt < p.life {
                let k = bt / p.life
                let disp = dragDisp(v0: p.speed, drag: 0.99, t: bt)
                let w = p.wobble + p.wobbleSpeed * bt
                let sway = 30 / p.wobbleSpeed * (cos(p.wobble) - cos(w)) // ∫ sin(w)·30 dt
                let x = bx + CGFloat(cos(p.angle) * disp + sway)
                let y = by + size.height * 0.3 + CGFloat(sin(p.angle) * disp + 0.5 * 420 * bt * bt)
                let h = max(0.6, CGFloat(p.size * 1.2 * abs(sin(w))))
                var c = ctx
                c.opacity = 1 - k
                c.translateBy(x: x, y: y)
                c.rotate(by: .radians(p.rotation + p.rotSpeed * bt))
                c.fill(Path(CGRect(x: -CGFloat(p.size), y: -h / 2, width: CGFloat(p.size) * 2, height: h)),
                       with: .color(Self.confettiColors[p.color]))
            }
        }
    }
}
