"use client";

import { Gamepad2 } from "lucide-react";

import { ScenariosTab } from "@/components/courses/front-desk/scenarios-tab";
import { getLevelSimulations, SIMULATIONS_PER_LEVEL } from "@/lib/data/front-desk";
import type { CefrLevel } from "@/lib/types/course";

type SimulationLibraryProps = {
  level: CefrLevel;
};

export function SimulationLibrary({ level }: SimulationLibraryProps) {
  const simulations = getLevelSimulations(level);

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple text-white shadow-[0_3px_0_0_#7c3aed]">
          <Gamepad2 className="size-6" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-foreground">
            {level} 模拟场景库
          </h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            本级别共 {SIMULATIONS_PER_LEVEL} 个模拟场景，覆盖前厅各类工作情境，支持搜索与分页浏览。
          </p>
        </div>
      </div>

      <ScenariosTab scenarios={simulations} showCategory />
    </section>
  );
}
