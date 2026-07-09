"use client";

import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { RussianPronunciationPractice } from "@/components/training/russian-pronunciation-practice";
import type { HotelRussianDiningItem } from "@/lib/types/hotel-russian-dining-item";
import { DINING_ITEM_CATEGORY_LABELS } from "@/lib/types/hotel-russian-dining-item";
import { cn } from "@/lib/utils";

import { DiningItemImage } from "./dining-item-image";

type DiningItemCardProps = {
  item: HotelRussianDiningItem;
  index?: number;
  compact?: boolean;
};

export function DiningItemCard({ item, index, compact }: DiningItemCardProps) {
  return (
    <article className="card-elevated overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
      <DiningItemImage
        item={item}
        className={compact ? "aspect-square" : "aspect-[4/3]"}
        priority={index !== undefined && index < 4}
      />
      <div className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-[#D52B1E]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#B91C1C]">
            {DINING_ITEM_CATEGORY_LABELS[item.category].zh}
          </span>
          {index !== undefined && (
            <span className="text-[10px] font-bold text-muted-foreground">#{index + 1}</span>
          )}
        </div>
        <p className="mt-2 text-base font-bold text-foreground">{item.chinese}</p>
        <p className="text-xs font-semibold text-muted-foreground">{item.english}</p>
        <div className="mt-3 rounded-xl border-2 border-[#0039A6]/15 bg-[#0039A6]/5 px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display text-lg leading-snug text-foreground">{item.russian}</p>
              <p className="mt-0.5 text-xs font-semibold italic text-muted-foreground">
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
