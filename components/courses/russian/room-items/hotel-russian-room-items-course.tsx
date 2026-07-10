"use client";

import { useState } from "react";
import { BookOpen, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HOTEL_RUSSIAN_ROOM_ITEMS } from "@/lib/data/hotel-russian-room-items";
import { cn } from "@/lib/utils";

import { RoomItemsLearnTab } from "./room-items-learn-tab";
import { RoomItemsPracticeTab } from "./room-items-practice-tab";

type Tab = "learn" | "practice";

export function HotelRussianRoomItemsCourse() {
  const [tab, setTab] = useState<Tab>("learn");

  return (
    <div>
      <div className="mb-4">
        <p className="text-[10px] font-bold text-muted-foreground">Room Items · 客房物品</p>
        <h1 className="font-display text-xl text-foreground">客房常用物品俄语 100</h1>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">
          图卡学习 + 选择题练习 · 点击喇叭听发音
        </p>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        {(
          [
            ["learn", "图卡学习", BookOpen],
            ["practice", "巩固练习", Layers],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-sm font-extrabold transition-all active:scale-[0.98]",
              tab === key
                ? "border-[#0039A6] bg-[#0039A6] text-white shadow-[0_3px_0_0_rgba(0,57,166,0.35)]"
                : "border-border bg-white text-muted-foreground hover:border-[#0039A6]/30"
            )}
          >
            <Icon className="size-4" />
            {label}
            {key === "learn" && (
              <span className="opacity-80">({HOTEL_RUSSIAN_ROOM_ITEMS.length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "learn" ? <RoomItemsLearnTab /> : <RoomItemsPracticeTab />}
      </div>
    </div>
  );
}
