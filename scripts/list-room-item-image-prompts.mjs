#!/usr/bin/env node
/**
 * 批量生成客房物品 AI 配图说明
 *
 * 图片由 Cursor GenerateImage / 外部 AI 绘图 API 生成，
 * 保存至 public/images/russian-room-items/{id}.png
 *
 * 运行前请确保目录存在：
 *   mkdir -p public/images/russian-room-items
 *
 * 本脚本输出每条物品的 imagePrompt，便于批量绘图。
 */
import { HOTEL_RUSSIAN_ROOM_ITEMS } from "../lib/data/hotel-russian-room-items.ts";

const outDir = "public/images/russian-room-items";

console.log(`# 共 ${HOTEL_RUSSIAN_ROOM_ITEMS.length} 张配图`);
console.log(`# 目标目录: ${outDir}/\n`);

for (const item of HOTEL_RUSSIAN_ROOM_ITEMS) {
  console.log(`${item.id}.png\t${item.imagePrompt}`);
}
