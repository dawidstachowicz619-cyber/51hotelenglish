"use client";

import type { CourseTab } from "@/lib/types/course";
import { cn } from "@/lib/utils";

const tabs: { id: CourseTab; label: string; color: string }[] = [
  { id: "words", label: "单词", color: "bg-primary" },
  { id: "sentences", label: "句子", color: "bg-secondary" },
  { id: "dialogues", label: "对话", color: "bg-accent" },
  { id: "scenario", label: "场景", color: "bg-purple" },
];

type CourseTabsProps = {
  active: CourseTab;
  onChange: (tab: CourseTab) => void;
};

export function CourseTabs({ active, onChange }: CourseTabsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-2xl border-2 px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide transition-all",
            active === tab.id
              ? `${tab.color} border-transparent text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)]`
              : "border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
