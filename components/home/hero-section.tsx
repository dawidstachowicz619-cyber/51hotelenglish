import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/40 via-white to-white pt-16">
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-secondary/10" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-56 rounded-full bg-accent/10" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 size-32 rounded-full bg-primary/10" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-white px-4 py-1.5 text-sm font-bold text-primary">
            <Sparkles className="size-4" />
            酒店英语 · 轻松开练
          </div>

          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
            像玩游戏一样
            <br />
            <span className="brand-gradient-text">学会酒店英语</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg font-semibold leading-relaxed text-muted-foreground">
            前厅、餐饮、客房场景化课程 + AI 真实客诉模拟。
            每天 15 分钟，自信接待 international guests。
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/assessment">先测 CEFR 水平</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/courses">
                直接开始学习
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm font-semibold text-muted-foreground">
            不确定从哪里开始？{" "}
            <Link href="/assessment" className="font-bold text-secondary hover:underline">
              免费测评
            </Link>
            帮你找到合适的学习路径
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4">
          {[
            { value: "200+", label: "场景对话", color: "bg-primary" },
            { value: "4", label: "核心部门", color: "bg-secondary" },
            { value: "24/7", label: "AI 陪练", color: "bg-accent" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card-elevated flex flex-col items-center px-4 py-6 text-center"
            >
              <p
                className={`font-display text-2xl text-white ${stat.color} rounded-xl px-3 py-1 md:text-3xl`}
              >
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
