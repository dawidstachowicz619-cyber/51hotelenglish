"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

import { getGuestAvatarForScenario } from "@/lib/ai-coach/guest-avatars";
import { AI_COACH_SCENARIOS } from "@/lib/ai-coach/scenarios";
import { getCompletedScenarioIds } from "@/lib/ai-coach/session-storage";
import { CEFR_LABELS } from "@/lib/types/course";
import type { AiCoachScenario } from "@/lib/types/ai-coach";
import { cn } from "@/lib/utils";

const DEPT_LABELS: Record<string, string> = {
  reception: "前厅接待",
  concierge: "礼宾部",
};

type ScenarioPickerProps = {
  onSelect: (scenario: AiCoachScenario) => void;
};

export function ScenarioPicker({ onSelect }: ScenarioPickerProps) {
  const [level, setLevel] = useState<string>("all");
  const completed = useMemo(() => new Set(getCompletedScenarioIds()), []);

  const filtered = AI_COACH_SCENARIOS.filter(
    (s) => level === "all" || s.level === level
  );

  const levels = ["all", "A2", "B1", "B2", "C1"] as const;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {levels.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLevel(l)}
            className={cn(
              "rounded-full border-2 px-4 py-1.5 text-xs font-extrabold transition-all",
              level === l
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-border text-muted-foreground hover:border-secondary/30"
            )}
          >
            {l === "all" ? "全部" : `${l} ${CEFR_LABELS[l as keyof typeof CEFR_LABELS]}`}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((scenario) => {
          const done = completed.has(scenario.id);
          const avatar = getGuestAvatarForScenario(scenario.characterId);
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelect(scenario)}
              className="card-elevated group overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:border-secondary/40"
            >
              <div className="relative h-36 bg-muted">
                <Image
                  src={avatar.url}
                  alt={scenario.guestName}
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover transition-transform group-hover:scale-105"
                  style={{ objectPosition: avatar.position }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-sm font-extrabold text-white">{scenario.guestName}</p>
                  <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-white/80">
                    {scenario.guestPersona}
                  </p>
                </div>
                {done && (
                  <CheckCircle2 className="absolute right-3 top-3 size-5 text-primary drop-shadow" />
                )}
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-muted-foreground">
                  {DEPT_LABELS[scenario.department] ?? scenario.department} · {scenario.level}
                </p>
                <h3 className="mt-1 font-display text-lg text-foreground">{scenario.title}</h3>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  {scenario.subtitle}
                </p>
                <p className="mt-2 line-clamp-2 text-sm font-semibold text-muted-foreground">
                  {scenario.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
