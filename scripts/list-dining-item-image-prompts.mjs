#!/usr/bin/env node
/**
 * 批量生成餐饮物品 AI 配图说明
 *
 * 图片由 Cursor GenerateImage / 外部 AI 绘图 API 生成，
 * 保存至 public/images/russian-dining-items/{id}.png
 */
import { HOTEL_RUSSIAN_DINING_ITEMS } from "../lib/data/hotel-russian-dining-items.ts";

const outDir = "public/images/russian-dining-items";

console.log(`# 共 ${HOTEL_RUSSIAN_DINING_ITEMS.length} 张配图`);
console.log(`# 目标目录: ${outDir}/\n`);

for (const item of HOTEL_RUSSIAN_DINING_ITEMS) {
  console.log(`${item.id}.png\t${item.imagePrompt}`);
}
