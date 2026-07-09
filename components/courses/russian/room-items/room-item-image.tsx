"use client";

import { useState } from "react";
import Image from "next/image";

import {
  roomItemImagePath,
  ROOM_ITEM_CATEGORY_LABELS,
  type HotelRussianRoomItem,
} from "@/lib/types/hotel-russian-room-item";
import { cn } from "@/lib/utils";

type RoomItemImageProps = {
  item: HotelRussianRoomItem;
  className?: string;
  priority?: boolean;
};

export function RoomItemImage({ item, className, priority }: RoomItemImageProps) {
  const [failed, setFailed] = useState(false);
  const src = roomItemImagePath(item.id);

  if (failed) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-gradient-to-br from-[#0039A6]/10 to-primary-light/30 p-4 text-center",
          className
        )}
      >
        <span className="text-4xl">🏨</span>
        <p className="mt-2 text-xs font-extrabold text-[#0039A6]">
          {ROOM_ITEM_CATEGORY_LABELS[item.category].zh}
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
