import type { RussianWordItem } from "@/lib/types/hotel-russian";

import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { RussianPronunciationPractice } from "@/components/training/russian-pronunciation-practice";

type RussianWordsTabProps = {
  words: RussianWordItem[];
};

export function RussianWordsTab({ words }: RussianWordsTabProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {words.map((word) => (
        <article
          key={word.id}
          className="card-elevated overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="border-b-2 border-[#0039A6]/10 bg-[#0039A6]/5 px-5 py-3">
            <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
              中文释义
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">{word.chinese}</p>
            <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
              {word.english}
            </p>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl text-foreground">{word.russian}</p>
                <p className="mt-1 text-sm font-semibold italic text-muted-foreground">
                  {word.transliteration}
                </p>
              </div>
              <PronunciationButton
                text={word.russian}
                lang="ru-RU"
                className="text-[#0039A6] hover:bg-[#0039A6]/10"
              />
            </div>
            {word.example && (
              <p className="mt-4 rounded-xl bg-muted px-3 py-2 text-xs font-semibold leading-relaxed text-foreground/80">
                例：{word.example}
              </p>
            )}
            <RussianPronunciationPractice
              variant="compact"
              className="mt-4"
              target={{
                russian: word.russian,
                transliteration: word.transliteration,
                chinese: word.chinese,
              }}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
