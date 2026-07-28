# 扫雷游戏开发计划

目标：macOS 可运行的经典 Windows 玩法扫雷（浏览器打开的单页应用）。

## 文件结构
- index.html — 页面结构（契约定义 DOM id）
- css/style.css — Windows 经典风格样式
- js/audio.js — Web Audio 合成音效，全局 API `GameAudio`
- js/effects.js — Canvas 粒子爆炸/震屏/胜利庆祝，全局 API `GameFX`
- js/game.js — 游戏逻辑（布雷、翻开、插旗、计时、胜负判定）

## 阶段
1. 并行开发 4 个模块（共享接口契约，互不修改对方文件）
2. 集成校验：语法检查 + 契约一致性检查 + 修复对接问题
3. 交付：双击 index.html 运行
