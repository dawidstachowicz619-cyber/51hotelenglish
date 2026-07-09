"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import {
  HOTEL_RUSSIAN_DINING_ITEMS,
  getDiningItemsByCategory,
} from "@/lib/data/hotel-russian-dining-items";
import {
  DINING_ITEM_CATEGORY_LABELS,
  type DiningItemCategory,
} from "@/lib/types/hotel-russian-dining-item";
import { cn } from "@/lib/utils";

import { DiningItemCard } from "./dining-item-card";

const ALL_CATEGORIES = Object.keys(DINING_ITEM_CATEGORY_LABELS) as DiningItemCategory[];

export function DiningItemsLearnTab() {
  const [category, setCategory] = useState<DiningItemCategory | "all">("all");
  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    const base =
      category === "all" ? HOTEL_RUSSIAN_DINING_ITEMS : getDiningItemsByCategory(category);
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (item) =>
        item.chinese.includes(q) ||
        item.russian.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        item.transliteration.toLowerCase().includes(q)
    );
  }, [category, search]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-extrabold text-foreground">
          共 {HOTEL_RUSSIAN_DINING_ITEMS.length} 个餐饮常用物品 · 图 + 中俄英 + 发音
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索中文 / 俄语 / English…"
            className="w-full rounded-xl border-2 border-border bg-white py-2 pl-9 pr-4 text-sm font-semibold outline-none focus:border-[#D52B1E] sm:w-64"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={cn(
            "rounded-full border-2 px-3 py-1.5 text-xs font-extrabold transition-all",
            category === "all"
              ? "border-[#D52B1E] bg-[#D52B1E] text-white"
              : "border-border bg-white text-muted-foreground hover:border-[#D52B1E]/30"
          )}
        >
          全部
        </button>
        {ALL_CATEGORIES.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={cn(
              "rounded-full border-2 px-3 py-1.5 text-xs font-extrabold transition-all",
              category === key
                ? "border-[#D52B1E] bg-[#D52B1E] text-white"
                : "border-border bg-white text-muted-foreground hover:border-[#D52B1E]/30"
            )}
          >
            {DINING_ITEM_CATEGORY_LABELS[key].zh}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item, index) => (
          <DiningItemCard key={item.id} item={item} index={index} />
        ))}
      </div>

      {items.length === 0 && (
        <p className="mt-8 text-center text-sm font-semibold text-muted-foreground">
          未找到匹配物品
        </p>
      )}
    </div>
  );
}
