# VOID SURVEY · 静默边界

一场发生在悬浮遗迹上的三维扫雷。探索金属舱盖、读取周围异常、部署能量信标。保留经典扫雷规则，重新设计场景、材质、输入和任务界面。

[Changelog (English)](changelog.md)

## 网页版

直接双击 `index.html` 即可运行；构建产物包含 Three.js，不需要联网下载 CDN 资源。也可以启动静态服务器：

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

打开 <http://127.0.0.1:8765>。浏览器需要 WebGL 2；不可用或显卡上下文丢失时，自动切到保持同一棋局的二维兼容界面。

[GitHub Pages 线上入口](https://stanatny.github.io/minesweeper/)随仓库的发布配置更新；本地修改不会自动发布到线上。

### 操作

| 操作       | 方式                                              |
| ---------- | ------------------------------------------------- |
| 探索       | 左键／轻点舱盖；首击及其八邻域安全                |
| 标记       | 右键、底部“标记”模式，或触屏长按                  |
| 连开       | 双击已探索数字，周围信标数匹配时展开邻格          |
| 旋转       | 拖动；俯视模式会锁定旋转                          |
| 缩放       | 滚轮、触屏双指；中键或双指拖动平移                |
| 键盘       | Tab 进入棋盘，方向键选择，Enter／空格探索，F 标记 |
| 视角／重开 | V 切换俯视，R 请求重新开始；进行中的棋局会先确认  |

初级 9×9／10 雷、中级 16×16／40 雷、高级 30×16／99 雷，自定义宽 5–50、高 5–30、雷数 1–宽×高−9。背景音乐与音效默认开启，首次点击或键盘操作后播放；右上角的音符与扬声器按钮可分别关闭。切换到后台时暂停音频。

触雷后，机械核心会先预热，再从触发位置向外逐颗爆开；每颗爆炸同步发声，留下焦黑残骸。引爆先零星、后密集，高级及更大棋盘连同收尾不超过约 4 秒（后台暂停）。连锁结束后显示结算，过程中可以重新探索，立即停止旧棋局的爆炸。

### 开发与验证

需要 Node.js 22 或更高版本、npm；浏览器测试使用本机 Google Chrome。

```bash
npm ci
npm run build
npm test
# 先在另一个终端启动上面的 8765 静态服务器
npm run test:browser
npm run test:polish
npm run test:timing
npm run test:flames
```

修改 `js/` 后执行 `npm run build`，刷新同一页面。浏览器实际加载 `dist/explorer.js`，不是源文件；构建产物保留在仓库中以支持直接打开与静态托管。

### 结构与素材

- `index.html`、`css/style.css`：响应式任务界面与无障碍控件。
- `js/explorer.js`：输入、计时、难度、状态与兼容模式。
- `js/game_engine.js`：独立扫雷状态引擎。
- `js/survey_scene.js`：参数化三维舱盖、破碎岩柱、悬浮能源核心、轨道、信标和相机；这是可编辑的模型来源。
- `js/cosmic_environment.js`：程序化行星、大气层、星群与尘带。
- `js/survey_effects.js`：共用粒子池、扫描波、标记能量柱、冲击波和抛射火星拖尾。
- `js/flame_jets.js`：实例化喷射火柱、翻卷火舌与短烟尾；密集爆炸复用固定实例池。
- `js/mine_model.js`：实例化机械地雷、预热状态与爆炸残骸。
- `js/detonation_sequence.js`：独立的逐雷显现与引爆时间线。
- `js/survey_audio.js`：本地合成背景音乐、操作音与分层爆破声，无外部音频。
- `dist/`：浏览器实际运行的离线构建与许可说明。
- `tests/`：规则测试与真实浏览器交互验收。
- `artifacts/`：本机验收截图，已排除版本控制。

所有场景几何和数字纹理均由代码生成，无外部模型、照片或字体。使用 Three.js 0.186.0（MIT），完整许可见 [third_party_notices.md](third_party_notices.md)。

## macOS 原生版本

`mac/` 中保留原有 SwiftUI 经典版本，本次三维重构作用于网页版。原生应用的视觉与发布包尚未同步为三维版本。

系统要求 macOS 14 或更高版本；从 [Releases](https://github.com/stanatny/minesweeper/releases) 下载已有版本，或运行：

```bash
chmod +x build.sh
./build.sh
```

脚本优先构建 Apple Silicon 与 Intel 的通用 App，输出 `扫雷.app`。当前应用采用 ad-hoc 签名，没有 Apple Developer ID 公证。

## License

[MIT](LICENSE)
