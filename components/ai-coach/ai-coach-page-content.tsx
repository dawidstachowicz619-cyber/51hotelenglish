"use client";

import { useState } from "react";
import { Bot, Mic, Sparkles, Users } from "lucide-react";

import { RoleplayChat } from "@/components/ai-coach/roleplay-chat";
import { ScenarioPicker } from "@/components/ai-coach/scenario-picker";
import type { AiCoachScenario } from "@/lib/types/ai-coach";

export function AiCoachPageContent() {
  const [active, setActive] = useState<AiCoachScenario | null>(null);

  if (active) {
    return <RoleplayChat scenario={active} onBack={() => setActive(null)} />;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-24 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-secondary text-white shadow-[0_4px_0_0_var(--secondary-dark)]">
          <Bot className="size-8" />
        </div>
        <p className="mt-4 text-sm font-extrabold uppercase tracking-wide text-secondary">
          AI Roleplay
        </p>
        <h1 className="mt-2 font-display text-3xl text-foreground md:text-4xl">
          AI 真人模拟对练
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-muted-foreground">
          AI 扮演酒店客人，您以前台/礼宾身份用英语应对。支持语音输入与语音播放，在安全环境中锤炼真实对话能力。
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card-elevated flex flex-col items-center p-5 text-center">
          <Users className="size-6 text-secondary" />
          <p className="mt-2 font-extrabold text-foreground">5 位 AI 客人</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">商务客、游客、投诉、深夜入住、宴会</p>
        </div>
        <div className="card-elevated flex flex-col items-center p-5 text-center">
          <Mic className="size-6 text-primary" />
          <p className="mt-2 font-extrabold text-foreground">语音对练</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">说英语 / 听 AI 客人回复</p>
        </div>
        <div className="card-elevated flex flex-col items-center p-5 text-center">
          <Sparkles className="size-6 text-accent" />
          <p className="mt-2 font-extrabold text-foreground">智能评分</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">实时反馈 · 客人情绪变化</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl text-foreground">选择对练场景</h2>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          点击场景开始，AI 客人会先开口，请您用英语专业应对
        </p>
        <div className="mt-6">
          <ScenarioPicker onSelect={setActive} />
        </div>
      </div>
    </div>
  );
}
