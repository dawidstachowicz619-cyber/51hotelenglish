"use client";

import { useState } from "react";

import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { DiningItemImage } from "@/components/courses/russian/dining-items/dining-item-image";
import { RoomItemImage } from "@/components/courses/russian/room-items/room-item-image";
import { RussianPronunciationPractice } from "@/components/training/russian-pronunciation-practice";
import { getDiningItemById } from "@/lib/data/hotel-russian-dining-items";
import { getRoomItemById } from "@/lib/data/hotel-russian-room-items";
import type { RussianDailyVocabItem } from "@/lib/types/russian-daily-checkin";

type RussianDailyVocabCardProps = {
  item: RussianDailyVocabItem;
  index: number;
  total: number;
};

export function RussianDailyVocabCard({ item, index, total }: RussianDailyVocabCardProps) {
  const roomItem = item.source === "room" ? getRoomItemById(item.id) : undefined;
  const diningItem = item.source === "dining" ? getDiningItemById(item.id) : undefined;

  return (
    <article className="card-elevated overflow-hidden">
      <div className="border-b-2 border-border bg-[#0039A6]/5 px-4 py-2 text-center">
        <p className="text-xs font-extrabold text-[#0039A6]">
          今日词汇 {index + 1} / {total}
        </p>
      </div>
      {roomItem && <RoomItemImage item={roomItem} className="aspect-[4/3]" priority />}
      {diningItem && <DiningItemImage item={diningItem} className="aspect-[4/3]" priority />}
      <div className="p-5">
        <span className="rounded-full bg-[#D52B1E]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#B91C1C]">
          {item.category}
        </span>
        <p className="mt-2 text-xl font-bold text-foreground">{item.chinese}</p>
        <p className="text-sm font-semibold text-muted-foreground">{item.english}</p>
        <div className="mt-3 rounded-xl border-2 border-[#0039A6]/15 bg-[#0039A6]/5 px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display text-lg text-foreground">{item.russian}</p>
              <p className="text-xs font-semibold italic text-muted-foreground">
                {item.transliteration}
              </p>
            </div>
            <PronunciationButton text={item.russian} lang="ru-RU" />
          </div>
        </div>
        <RussianPronunciationPractice
          variant="compact"
          className="mt-3"
          target={{
            russian: item.russian,
            transliteration: item.transliteration,
            chinese: item.chinese,
          }}
        />
      </div>
    </article>
  );
}
