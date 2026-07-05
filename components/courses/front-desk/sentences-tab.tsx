import type { SentenceItem } from "@/lib/types/course";

import { PronunciationButton } from "@/components/courses/pronunciation-button";

type SentencesTabProps = {
  sentences: SentenceItem[];
};

export function SentencesTab({ sentences }: SentencesTabProps) {
  return (
    <div className="space-y-4">
      {sentences.map((sentence, index) => (
        <article
          key={sentence.id}
          className="card-elevated p-5 transition-all hover:-translate-y-0.5 hover:shadow-md md:p-6"
        >
          <div className="flex items-start gap-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-white">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full bg-secondary/15 px-3 py-0.5 text-xs font-bold text-secondary-dark">
                {sentence.context}
              </span>
              <div className="mt-3 flex items-start gap-2">
                <p className="flex-1 text-base font-bold leading-relaxed text-foreground">
                  {sentence.english}
                </p>
                <PronunciationButton text={sentence.english} />
              </div>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-muted-foreground">
                {sentence.chinese}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
