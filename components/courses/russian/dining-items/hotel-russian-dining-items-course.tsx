"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HOTEL_RUSSIAN_DINING_ITEMS } from "@/lib/data/hotel-russian-dining-items";
import { cn } from "@/lib/utils";

import { DiningItemsLearnTab } from "./dining-items-learn-tab";
import { DiningItemsPracticeTab } from "./dining-items-practice-tab";

type Tab = "learn" | "practice";

export function HotelRussianDiningItemsCourse() {
  const [tab, setTab] = useState<Tab>("learn");

  return (
    <div>
      <Button variant="outline" size="sm" asChild>
        <Link href="/courses/russian">
          <ArrowLeft className="size-4" />
          返回酒店俄语
        </Link>
      </Button>

      <div className="mt-6 flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#D52B1E] text-white shadow-[0_4px_0_0_rgba(213,43,30,0.35)]">
          <UtensilsCrossed className="size-7" />
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground">Dining Items · 餐饮物品</p>
          <h1 className="font-display text-3xl text-foreground md:text-4xl">
            酒店餐饮常用物品俄语 100
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-muted-foreground">
            通过中文学习俄语 · AI 配图 · 中俄英三语 · 发音 · 语音跟读评价 · 选择题练习
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {(
          [
            ["learn", "图卡学习", BookOpen],
            ["practice", "巩固练习", UtensilsCrossed],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl border-2 px-5 py-2.5 text-sm font-extrabold transition-all",
              tab === key
                ? "border-[#D52B1E] bg-[#D52B1E] text-white shadow-[0_3px_0_0_rgba(213,43,30,0.35)]"
                : "border-border bg-white text-muted-foreground hover:border-[#D52B1E]/30"
            )}
          >
            <Icon className="size-4" />
            {label}
            {key === "learn" && (
              <span className="opacity-80">({HOTEL_RUSSIAN_DINING_ITEMS.length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "learn" ? <DiningItemsLearnTab /> : <DiningItemsPracticeTab />}
      </div>
    </div>
  );
}
