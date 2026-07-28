#!/bin/bash
# 编译并打包 扫雷.app（纯 swiftc，无 Xcode 工程）
# - 部署目标 macOS 14（swiftc 默认编译为当前系统版本，会导致旧系统提示
#   "不能与此版本的 macOS 配合使用"）
# - 优先构建 arm64 + x86_64 通用二进制（Intel Mac 可用）；SDK 不支持时回退 arm64
set -e
cd "$(dirname "$0")"
APP="扫雷.app"
SRC="mac/MinesweeperApp.swift mac/GameModel.swift mac/BoardView.swift mac/EffectsView.swift mac/SoundEngine.swift mac/Theme.swift"
DEPLOY=14.0

rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

UNIVERSAL_OK=0
if swiftc -O -whole-module-optimization -target "arm64-apple-macosx$DEPLOY" \
    -o "$TMP/saolei-arm64" $SRC 2> "$TMP/arm64.log" \
  && swiftc -O -whole-module-optimization -target "x86_64-apple-macosx$DEPLOY" \
    -o "$TMP/saolei-x86_64" $SRC 2> "$TMP/x86_64.log"; then
  UNIVERSAL_OK=1
else
  # 打印失败架构的日志，便于排查
  cat "$TMP/arm64.log" "$TMP/x86_64.log" >&2 || true
fi

if [ "$UNIVERSAL_OK" = "1" ]; then
  lipo -create "$TMP/saolei-arm64" "$TMP/saolei-x86_64" -output "$APP/Contents/MacOS/扫雷"
  echo "架构: universal (arm64 + x86_64)"
else
  echo "警告: 通用二进制构建失败，回退为 arm64（Intel Mac 将无法运行）" >&2
  swiftc -O -whole-module-optimization -target "arm64-apple-macosx$DEPLOY" \
    -o "$APP/Contents/MacOS/扫雷" $SRC
  echo "架构: arm64 only"
fi

cp mac/Info.plist "$APP/Contents/Info.plist"
cp mac/AppIcon.icns "$APP/Contents/Resources/AppIcon.icns"
# 链接器的 ad-hoc 签名在 Info.plist 复制前生成，会导致 LaunchServices 拒绝启动，需重签
codesign --force --sign - "$APP"
echo "构建完成: $(pwd)/$APP"
