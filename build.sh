#!/bin/bash
# Compile and package Minesweeper.app using swiftc without an Xcode project.
# - Target macOS 14 rather than the build machine's OS version so older Macs can run it.
# - Prefer a universal arm64 + x86_64 binary; fall back to arm64 if the SDK cannot build both.
set -e
cd "$(dirname "$0")"
APP="Minesweeper.app"
SRC="mac/MinesweeperApp.swift mac/GameModel.swift mac/BoardView.swift mac/EffectsView.swift mac/SoundEngine.swift mac/Theme.swift"
DEPLOY=14.0

rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

UNIVERSAL_OK=0
if swiftc -O -whole-module-optimization -target "arm64-apple-macosx$DEPLOY" \
    -o "$TMP/minesweeper-arm64" $SRC 2> "$TMP/arm64.log" \
  && swiftc -O -whole-module-optimization -target "x86_64-apple-macosx$DEPLOY" \
    -o "$TMP/minesweeper-x86_64" $SRC 2> "$TMP/x86_64.log"; then
  UNIVERSAL_OK=1
else
  # Print compiler diagnostics for the failed architecture.
  cat "$TMP/arm64.log" "$TMP/x86_64.log" >&2 || true
fi

if [ "$UNIVERSAL_OK" = "1" ]; then
  lipo -create "$TMP/minesweeper-arm64" "$TMP/minesweeper-x86_64" -output "$APP/Contents/MacOS/Minesweeper"
  echo "Architecture: universal (arm64 + x86_64)"
else
  echo "Warning: universal build failed; falling back to arm64 (Intel Macs are not supported)." >&2
  swiftc -O -whole-module-optimization -target "arm64-apple-macosx$DEPLOY" \
    -o "$APP/Contents/MacOS/Minesweeper" $SRC
  echo "Architecture: arm64 only"
fi

cp mac/Info.plist "$APP/Contents/Info.plist"
cp mac/AppIcon.icns "$APP/Contents/Resources/AppIcon.icns"
# Sign again after copying Info.plist; the linker's earlier ad-hoc signature would otherwise be invalid.
codesign --force --sign - "$APP"
echo "Build complete: $(pwd)/$APP"
