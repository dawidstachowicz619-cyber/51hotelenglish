import type { WordItem } from "@/lib/types/course";

import { CourseImage } from "@/components/courses/course-image";
import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { getWordImage } from "@/lib/data/course-images";

type WordsTabProps = {
  words: WordItem[];
};

export function WordsTab({ words }: WordsTabProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {words.map((word) => {
        const imageSrc = word.image ?? getWordImage(word.id);

        return (
          <article
            key={word.id}
            className="card-elevated overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            {imageSrc && (
              <CourseImage
                src={imageSrc}
                alt={word.english}
                className="aspect-[16/10] w-full rounded-none border-0 border-b-2"
              />
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl text-foreground">
                      {word.english}
                    </h3>
                    <PronunciationButton text={word.english} />
                  </div>
                  <p className="mt-1 text-sm font-bold text-secondary">
                    {word.phonetic}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-muted-foreground">
                    {word.chinese}
                  </p>
                </div>
              </div>
              {word.example && (
                <p className="mt-4 rounded-xl bg-primary-light/40 px-3 py-2 text-xs font-semibold leading-relaxed text-foreground/80 italic">
                  &ldquo;{word.example}&rdquo;
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
