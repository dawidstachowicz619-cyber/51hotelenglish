"use client";

import { useCallback, useEffect, useState } from "react";
import { Gamepad2 } from "lucide-react";

import { DiningCatchGame } from "@/components/games/dining-catch/dining-catch-game";
import { DiningCatchMap } from "@/components/games/dining-catch/dining-catch-map";
import { DiningCatchMobileShell } from "@/components/games/dining-catch/dining-catch-mobile-shell";
import {
  loadDiningCatchProgress,
  type DiningCatchProgress,
} from "@/lib/games/dining-catch/progress-storage";
import { primeGameSpeech, unlockGameAudioSync } from "@/lib/games/dining-catch/game-audio";

type View = "map" | "game";

export function DiningCatchHub() {
  const [view, setView] = useState<View>("map");
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [progress, setProgress] = useState<DiningCatchProgress>(() =>
    loadDiningCatchProgress()
  );

  const refreshProgress = useCallback(() => {
    setProgress(loadDiningCatchProgress());
  }, []);

  useEffect(() => {
    const onUpdate = () => refreshProgress();
    window.addEventListener("dining-catch-updated", onUpdate);
    return () => window.removeEventListener("dining-catch-updated", onUpdate);
  }, [refreshProgress]);

  const handleSelectLevel = (level: number) => {
    unlockGameAudioSync();
    void primeGameSpeech();
    setActiveLevel(level);
    setView("game");
  };

  const handleBackToMap = () => {
    setView("map");
    setActiveLevel(null);
    refreshProgress();
  };

  if (view === "game" && activeLevel) {
    return (
      <DiningCatchMobileShell title={`第 ${activeLevel} 关`} onBack={handleBackToMap}>
        <DiningCatchGame
          level={activeLevel}
          onBack={handleBackToMap}
          onComplete={handleBackToMap}
        />
      </DiningCatchMobileShell>
    );
  }

  return (
    <DiningCatchMobileShell title="餐饮单词大闯关" backHref="/">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-3">
        <div className="mb-5 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-white shadow-[0_4px_0_0_#E08600]">
            <Gamepad2 className="size-7" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-accent">Fun Game</p>
            <h2 className="font-display text-2xl text-foreground">餐饮单词大闯关</h2>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">
              竖屏 9:16 · 单词从上往下掉 · 可调快慢 · 无需登录
            </p>
          </div>
        </div>

        <DiningCatchMap
          completedCount={progress.completedLevels.length}
          onSelectLevel={handleSelectLevel}
        />
      </div>
    </DiningCatchMobileShell>
  );
}
