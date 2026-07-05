import {
  BedDouble,
  Bot,
  ConciergeBell,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const features = [
  {
    id: "front-desk",
    icon: ConciergeBell,
    title: "前厅英语",
    subtitle: "Front Desk",
    description:
      "四大岗位：接待、礼宾、预订、客服。按 CEFR 级别闯关，单词→句子→对话→模拟逐级解锁。",
    href: "/courses/front-desk",
    color: "bg-primary",
    borderColor: "border-primary/30",
    lightBg: "bg-primary-light/30",
  },
  {
    id: "fnb",
    icon: UtensilsCrossed,
    title: "餐饮英语",
    subtitle: "Food & Beverage",
    description:
      "Fine dining 礼仪、wine pairing、special dietary requests 全覆盖。",
    href: "/courses#fnb",
    color: "bg-secondary",
    borderColor: "border-secondary/30",
    lightBg: "bg-secondary/10",
  },
  {
    id: "housekeeping",
    icon: BedDouble,
    title: "客房英语",
    subtitle: "Housekeeping",
    description:
      "Room service、turndown service、guest privacy 沟通技巧。",
    href: "/courses#housekeeping",
    color: "bg-accent",
    borderColor: "border-accent/30",
    lightBg: "bg-accent/10",
  },
  {
    id: "ai-simulation",
    icon: Bot,
    title: "AI 模拟真实客诉",
    subtitle: "AI Simulation",
    description:
      "AI 扮演 demanding guest，模拟 overbooking、noise complaint 等高压场景。",
    href: "/ai-coach",
    color: "bg-purple",
    borderColor: "border-purple/30",
    lightBg: "bg-purple/10",
    featured: true,
  },
];

export function FeatureSection() {
  return (
    <section className="bg-muted py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-wide text-primary">
            学习路径
          </p>
          <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">
            四大核心模块
          </h2>
          <p className="mt-4 text-base font-semibold text-muted-foreground">
            通关地图式学习，从上往下逐级闯关，A1 到 C1 五段旅程等你征服。
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.id}
              id={feature.id}
              className={`group card-elevated overflow-hidden p-6 transition-all hover:-translate-y-1 hover:shadow-md md:p-8 ${
                feature.featured ? "md:col-span-2" : ""
              } ${feature.lightBg}`}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <div
                    className={`flex size-14 items-center justify-center rounded-2xl ${feature.color} text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)]`}
                  >
                    <feature.icon className="size-7" strokeWidth={2} />
                  </div>
                  <span className="rounded-full border-2 border-border bg-white px-3 py-1 text-xs font-bold text-muted-foreground">
                    {feature.subtitle}
                  </span>
                </div>

                <h3 className="mt-6 font-display text-2xl text-foreground">
                  {feature.title}
                </h3>

                <p className="mt-3 flex-1 text-sm font-semibold leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                <div className="mt-6">
                  <Button
                    variant={feature.id === "front-desk" ? "default" : "outline"}
                    size="sm"
                    asChild
                  >
                    <Link href={feature.href}>
                      {feature.id === "front-desk" ? "进入学习" : "了解更多"}
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
