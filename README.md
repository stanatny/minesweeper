# 扫雷

一个经典 Windows 风格的扫雷游戏，同时提供 macOS 原生 App 和纯前端网页版。

## 在线体验

[打开网页版扫雷](https://stanatny.github.io/minesweeper/)

## 功能

- 初级、中级、高级和自定义棋盘
- 左键翻开、右键插旗、双击数字格快速翻开
- 剩余雷数与计时器
- 音效、爆炸和胜利特效
- macOS 原生 SwiftUI 版本
- 无框架、无构建依赖的网页版

## macOS App

系统要求：macOS 14 或更高版本。

从 [Releases](https://github.com/stanatny/minesweeper/releases) 下载最新的
`扫雷-macOS-*.zip`，解压后即可运行。

也可以从源码构建：

```bash
chmod +x build.sh
./build.sh
```

构建脚本会优先生成同时支持 Apple Silicon 和 Intel Mac 的通用 App。
产物位于项目根目录的 `扫雷.app`。

当前发布包使用 ad-hoc 签名，没有 Apple Developer ID 公证。如果 macOS
首次打开时显示安全提示，请在 Finder 中右键 App，选择“打开”。

## 网页版

直接打开 `index.html`，或在项目目录启动任意静态文件服务器：

```bash
python3 -m http.server 8000
```

然后访问 <http://localhost:8000>。

## 项目结构

- `mac/`：macOS 原生 Swift 源码和图标
- `index.html`：网页版入口
- `css/`：网页版样式
- `js/`：网页版游戏逻辑、音效和特效
- `build.sh`：macOS App 构建与打包脚本

## License

[MIT](LICENSE)
