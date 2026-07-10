"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Languages } from "lucide-react";

import { HotelRussianPhraseGrid } from "@/components/home/hotel-russian-phrase-grid";
import { Button } from "@/components/ui/button";
import { getRussianCourseStats } from "@/lib/data/hotel-russian-course";

export function HotelRussianSection() {
  const stats = getRussianCourseStats();

  return (
    <section
      id="hotel-russian"
      className="relative overflow-hidden border-t-2 border-border bg-gradient-to-b from-white via-[#FFF5F5] to-white py-20 md:py-28"
    >
      <div className="pointer-events-none absolute -left-20 top-16 size-72 rounded-full bg-[#D52B1E]/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 size-64 rounded-full bg-[#0039A6]/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#D52B1E]/25 bg-white px-4 py-1.5 text-sm font-bold text-[#B91C1C]">
            <Languages className="size-4" />
            手机 H5 · 通过中文学习俄语
          </div>
          <h2 className="mt-5 font-display text-3xl text-foreground sm:text-4xl">
            酒店俄语：单词、句子、对话、场景练习
          </h2>
          <p className="mt-4 text-base font-semibold leading-relaxed text-muted-foreground">
            先看中文理解含义，再学俄语表达与转写跟读。
            {stats.scenarios} 大场景 · {stats.words} 单词 · {stats.sentences} 常用句 · 配套情景对话与选择题练习。
          </p>
        </div>

        <div className="mt-10">
          <HotelRussianPhraseGrid />
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild className="bg-[#0039A6] hover:bg-[#002d85]">
            <Link href="/courses/russian">
              进入场景课程
              <ArrowRight className="size-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/courses/russian/room-items">
              客房物品 100
              <ArrowRight className="size-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/courses/russian/dining-items">
              餐饮物品 100
              <ArrowRight className="size-5" />
            </Link>
          </Button>
          <p className="text-center text-xs font-semibold text-muted-foreground">
            单词 → 句子 → 对话 → 看中文选俄语
          </p>
        </div>
      </div>
    </section>
  );
}
