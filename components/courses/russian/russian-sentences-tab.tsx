import type { RussianSentenceItem } from "@/lib/types/hotel-russian";

import { PronunciationButton } from "@/components/courses/pronunciation-button";

type RussianSentencesTabProps = {
  sentences: RussianSentenceItem[];
};

export function RussianSentencesTab({ sentences }: RussianSentencesTabProps) {
  return (
    <div className="space-y-4">
      {sentences.map((sentence, index) => (
        <article
          key={sentence.id}
          className="card-elevated p-5 transition-all hover:-translate-y-0.5 hover:shadow-md md:p-6"
        >
          <div className="flex items-start gap-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0039A6] text-sm font-extrabold text-white">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full bg-primary-light/50 px-3 py-0.5 text-xs font-bold text-primary">
                {sentence.context}
              </span>
              <p className="mt-3 text-base font-bold leading-relaxed text-foreground">
                {sentence.chinese}
              </p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                {sentence.english}
              </p>
              <div className="mt-4 rounded-xl border-2 border-[#0039A6]/15 bg-[#0039A6]/5 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-extrabold text-[#0039A6]">俄语</p>
                    <p className="mt-1 text-base font-bold leading-relaxed text-foreground">
                      {sentence.russian}
                    </p>
                    <p className="mt-1 text-xs font-semibold italic text-muted-foreground">
                      {sentence.transliteration}
                    </p>
                  </div>
                  <PronunciationButton text={sentence.russian} lang="ru-RU" />
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
