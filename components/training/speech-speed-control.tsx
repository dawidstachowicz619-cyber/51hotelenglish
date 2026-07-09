"use client";

import {
  SPEECH_SPEED_OPTIONS,
  type SpeechSpeed,
} from "@/lib/speech/speech-speed";
import { cn } from "@/lib/utils";

type SpeechSpeedControlProps = {
  value: SpeechSpeed;
  onChange: (speed: SpeechSpeed) => void;
  className?: string;
  compact?: boolean;
};

export function SpeechSpeedControl({
  value,
  onChange,
  className,
  compact = false,
}: SpeechSpeedControlProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-extrabold text-muted-foreground",
        className
      )}
    >
      {!compact && <span className="shrink-0">语速</span>}
      <select
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) as SpeechSpeed)}
        className="rounded-lg border border-border bg-white px-2 py-1 text-[10px] font-extrabold text-foreground outline-none focus:border-primary"
        aria-label="播放语速"
      >
        {SPEECH_SPEED_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
