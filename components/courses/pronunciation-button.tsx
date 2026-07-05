"use client";

import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/use-speech";
import { cn } from "@/lib/utils";

type PronunciationButtonProps = {
  text: string;
  className?: string;
  size?: "sm" | "default";
};

export function PronunciationButton({
  text,
  className,
  size = "sm",
}: PronunciationButtonProps) {
  const { speak, stop, speaking, supported } = useSpeech();

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "shrink-0 rounded-xl text-secondary hover:bg-secondary/10 hover:text-secondary",
        size === "sm" ? "size-9" : "size-11",
        speaking && "bg-secondary/15 text-secondary-dark",
        className
      )}
      onClick={() => (speaking ? stop() : speak(text))}
      aria-label={speaking ? "停止播放" : "播放发音"}
      title={speaking ? "停止播放" : "播放发音"}
    >
      {speaking ? (
        <VolumeX className="size-4" />
      ) : (
        <Volume2 className="size-4" />
      )}
    </Button>
  );
}
