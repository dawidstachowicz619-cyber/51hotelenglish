#!/bin/bash
# 将 Cursor GenerateImage 生成的 ri-*.png 同步到 public 目录
SRC="${CURSOR_ASSETS_DIR:-/Users/mac/.cursor/projects/Users-mac-Documents-2026-2026cursor-51hotelenglish/assets}"
DST="$(cd "$(dirname "$0")/.." && pwd)/public/images/russian-room-items"
mkdir -p "$DST"
if [ -d "$SRC" ]; then
  cp -n "$SRC"/ri-*.png "$DST/" 2>/dev/null || true
fi
echo "public/images/russian-room-items: $(ls "$DST"/ri-*.png 2>/dev/null | wc -l | tr -d ' ') images"
