"use client";

import { useState } from "react";
import Image from "next/image";

import {
  diningItemImagePath,
  DINING_ITEM_CATEGORY_LABELS,
  type HotelRussianDiningItem,
} from "@/lib/types/hotel-russian-dining-item";
import { cn } from "@/lib/utils";

type DiningItemImageProps = {
  item: HotelRussianDiningItem;
  className?: string;
  priority?: boolean;
};

export function DiningItemImage({ item, className, priority }: DiningItemImageProps) {
  const [failed, setFailed] = useState(false);
  const src = diningItemImagePath(item.id);

  if (failed) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-gradient-to-br from-[#D52B1E]/10 to-[#0039A6]/10 p-4 text-center",
          className
        )}
      >
        <span className="text-4xl">🍽️</span>
        <p className="mt-2 text-xs font-extrabold text-[#D52B1E]">
          {DINING_ITEM_CATEGORY_LABELS[item.category].zh}
        </p>
        <p className="mt-1 text-[10px] font-semibold text-muted-foreground">{item.chinese}</p>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-white", className)}>
      <Image
        src={src}
        alt={item.chinese}
        fill
        className="object-contain p-3"
        sizes="(max-width: 768px) 50vw, 200px"
        priority={priority}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
