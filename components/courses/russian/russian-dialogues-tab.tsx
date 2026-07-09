"use client";

import { useState } from "react";

import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { Button } from "@/components/ui/button";
import type { RussianDialogueItem } from "@/lib/types/hotel-russian";
import { cn } from "@/lib/utils";

type RussianDialoguesTabProps = {
  dialogues: RussianDialogueItem[];
};

export function RussianDialoguesTab({ dialogues }: RussianDialoguesTabProps) {
  const [activeId, setActiveId] = useState(dialogues[0]?.id ?? "");
  const active = dialogues.find((d) => d.id === activeId) ?? dialogues[0];

  if (!active) {
    return (
      <div className="card-elevated p-8 text-center text-sm font-semibold text-muted-foreground">
        暂无对话内容
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dialogues.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {dialogues.map((dialogue) => (
            <Button
              key={dialogue.id}
              variant={activeId === dialogue.id ? "default" : "outline"}
              size="sm"
              className="normal-case tracking-normal"
              onClick={() => setActiveId(dialogue.id)}
            >
              {dialogue.title}
            </Button>
          ))}
        </div>
      )}

      <div className="card-elevated overflow-hidden">
        <div className="border-b-2 border-border bg-[#0039A6]/5 px-6 py-4 md:px-8">
          <h3 className="font-display text-2xl text-foreground">{active.title}</h3>
          <p className="mt-1 text-sm font-bold text-muted-foreground">{active.subtitle}</p>
          <p className="mt-2 text-xs font-semibold text-primary">
            先看懂中文，再跟读俄语 · 点击喇叭听发音
          </p>
        </div>

        <div className="space-y-5 p-6 md:p-8">
          {active.lines.map((line, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3",
                line.speaker === "staff" ? "flex-row" : "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white",
                  line.speaker === "staff" ? "bg-[#0039A6]" : "bg-secondary"
                )}
              >
                {line.speaker === "staff" ? "员工" : "客人"}
              </div>
              <div
                className={cn(
                  "max-w-[85%] flex-1 rounded-2xl border-2 p-4",
                  line.speaker === "staff"
                    ? "border-[#0039A6]/20 bg-[#0039A6]/5"
                    : "border-secondary/20 bg-secondary/5"
                )}
              >
                <p className="text-sm font-bold leading-relaxed text-foreground">
                  {line.chinese}
                </p>
                <div className="mt-3 flex items-start justify-between gap-2 border-t border-border/60 pt-3">
                  <div>
                    <p className="text-sm font-bold leading-relaxed text-foreground md:text-base">
                      {line.russian}
                    </p>
                    <p className="mt-1 text-xs font-semibold italic text-muted-foreground">
                      {line.transliteration}
                    </p>
                  </div>
                  <PronunciationButton text={line.russian} lang="ru-RU" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
