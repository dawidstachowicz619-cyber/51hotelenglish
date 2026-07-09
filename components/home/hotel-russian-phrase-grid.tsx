"use client";

import { useMemo, useState } from "react";
import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { getRussianPreviewPhrases } from "@/lib/data/hotel-russian-course";
import { cn } from "@/lib/utils";

type PreviewCategory = "all" | "reception" | "fnb" | "housekeeping";

const CATEGORY_LABELS: Record<PreviewCategory, string> = {
  all: "全部",
  reception: "前厅接待",
  fnb: "餐饮",
  housekeeping: "客房",
};

export function HotelRussianPhraseGrid() {
  const phrases = useMemo(() => getRussianPreviewPhrases(), []);
  const [active, setActive] = useState<PreviewCategory>("all");

  const filtered =
    active === "all" ? phrases : phrases.filter((p) => p.category === active);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        {(Object.keys(CATEGORY_LABELS) as PreviewCategory[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={cn(
              "rounded-full border-2 px-4 py-2 text-xs font-extrabold transition-all",
              active === key
                ? "border-[#0039A6] bg-[#0039A6] text-white shadow-[0_3px_0_0_rgba(0,57,166,0.35)]"
                : "border-border bg-white text-muted-foreground hover:border-[#0039A6]/30 hover:text-foreground"
            )}
          >
            {CATEGORY_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filtered.slice(0, 6).map((phrase) => (
          <article
            key={phrase.id}
            className="card-elevated overflow-hidden border-[#D52B1E]/10 bg-white/90 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md md:p-6"
          >
            <div className="flex items-start gap-2">
              <span className="rounded-md bg-primary-light/50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-primary">
                中文
              </span>
              <p className="flex-1 text-sm font-bold leading-relaxed text-foreground">
                {phrase.chinese}
              </p>
            </div>

            <div className="mt-4 rounded-xl border-2 border-[#0039A6]/15 bg-[#0039A6]/5 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#0039A6]">
                    Русский · 俄语
                  </span>
                  <p className="mt-1 font-display text-lg leading-snug text-foreground">
                    {phrase.russian}
                  </p>
                  <p className="mt-1 text-xs font-semibold italic text-muted-foreground">
                    {phrase.transliteration}
                  </p>
                </div>
                <PronunciationButton
                  text={phrase.russian}
                  lang="ru-RU"
                  className="text-[#0039A6] hover:bg-[#0039A6]/10 hover:text-[#0039A6]"
                />
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-secondary/8 px-4 py-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-secondary">
                English · 英语
              </span>
              <p className="mt-1 text-sm font-bold leading-relaxed text-foreground">
                {phrase.english}
              </p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
