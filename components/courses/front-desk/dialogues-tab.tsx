"use client";

import { useState } from "react";

import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { CourseImage } from "@/components/courses/course-image";
import { Button } from "@/components/ui/button";
import { getDialogueImage } from "@/lib/data/course-images";
import type { DialogueItem } from "@/lib/types/course";
import { cn } from "@/lib/utils";

type DialoguesTabProps = {
  dialogues: DialogueItem[];
};

export function DialoguesTab({ dialogues }: DialoguesTabProps) {
  const [activeId, setActiveId] = useState(dialogues[0]?.id ?? "");

  const active = dialogues.find((d) => d.id === activeId) ?? dialogues[0];

  if (!active) return null;

  return (
    <div className="space-y-6">
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

      <div className="card-elevated overflow-hidden">
        {(active.image ?? getDialogueImage(active.id)) && (
          <CourseImage
            src={active.image ?? getDialogueImage(active.id)!}
            alt={active.title}
            className="aspect-[21/9] w-full rounded-none border-0 border-b-2"
          />
        )}
        <div className="p-6 md:p-8">
        <div className="mb-8 border-b-2 border-border pb-6">
          <h3 className="font-display text-2xl text-foreground">{active.title}</h3>
          <p className="mt-1 text-sm font-bold text-muted-foreground">
            {active.subtitle}
          </p>
        </div>

        <div className="space-y-5">
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
                  line.speaker === "staff" ? "bg-primary" : "bg-secondary"
                )}
              >
                {line.speaker === "staff" ? "前台" : "客人"}
              </div>
              <div
                className={cn(
                  "max-w-[85%] flex-1 rounded-2xl border-2 p-4",
                  line.speaker === "staff"
                    ? "border-primary/20 bg-primary-light/30"
                    : "border-secondary/20 bg-secondary/5"
                )}
              >
                <div className="flex items-start gap-2">
                  <p className="flex-1 text-sm font-bold leading-relaxed text-foreground md:text-base">
                    {line.english}
                  </p>
                  <PronunciationButton text={line.english} />
                </div>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-muted-foreground md:text-sm">
                  {line.chinese}
                </p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
