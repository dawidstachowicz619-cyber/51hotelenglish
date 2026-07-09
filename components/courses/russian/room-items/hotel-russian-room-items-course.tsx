"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";

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
      <Button variant="outline" size="sm" asChild>
        <Link href="/courses/russian">
          <ArrowLeft className="size-4" />
          返回酒店俄语
        </Link>
      </Button>

      <div className="mt-6 flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#0039A6] text-white shadow-[0_4px_0_0_rgba(0,57,166,0.35)]">
          <Layers className="size-7" />
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground">Room Items · 客房物品</p>
          <h1 className="font-display text-3xl text-foreground md:text-4xl">
            酒店客房常用物品俄语 100
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
            ["practice", "巩固练习", Layers],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl border-2 px-5 py-2.5 text-sm font-extrabold transition-all",
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
