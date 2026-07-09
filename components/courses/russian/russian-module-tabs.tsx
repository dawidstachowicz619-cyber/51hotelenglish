"use client";

import type { RussianModuleTab } from "@/lib/types/hotel-russian";
import { cn } from "@/lib/utils";

const tabs: { id: RussianModuleTab; label: string; color: string }[] = [
  { id: "words", label: "单词", color: "bg-primary" },
  { id: "sentences", label: "句子", color: "bg-secondary" },
  { id: "dialogues", label: "对话", color: "bg-accent" },
  { id: "practice", label: "场景练习", color: "bg-[#0039A6]" },
];

type RussianModuleTabsProps = {
  active: RussianModuleTab;
  onChange: (tab: RussianModuleTab) => void;
  counts: Record<RussianModuleTab, number>;
};

export function RussianModuleTabs({ active, onChange, counts }: RussianModuleTabsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-2xl border-2 px-5 py-2.5 text-sm font-extrabold transition-all",
            active === tab.id
              ? `${tab.color} border-transparent text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)]`
              : "border-border bg-white text-muted-foreground hover:border-[#0039A6]/30 hover:text-foreground"
          )}
        >
          {tab.label}
          <span className="ml-1.5 opacity-80">({counts[tab.id]})</span>
        </button>
      ))}
    </div>
  );
}
