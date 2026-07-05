export function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchSpeechTranscript(
  transcript: string,
  keywords: string[],
  modelAnswer: string
): { passed: boolean; matchedKeywords: string[]; score: number } {
  const normalized = normalizeSpeech(transcript);
  const normalizedModel = normalizeSpeech(modelAnswer);

  const matchedKeywords = keywords.filter((kw) =>
    normalized.includes(normalizeSpeech(kw))
  );

  const keywordScore =
    keywords.length > 0 ? matchedKeywords.length / keywords.length : 0;

  const modelWords = normalizedModel.split(" ").filter((w) => w.length > 2);
  const matchedModelWords = modelWords.filter((w) => normalized.includes(w));
  const modelScore =
    modelWords.length > 0 ? matchedModelWords.length / modelWords.length : 0;

  const score = Math.max(keywordScore, modelScore * 0.85);
  const passed = score >= 0.55 || matchedKeywords.length >= Math.ceil(keywords.length * 0.5);

  return { passed, matchedKeywords, score: Math.round(score * 100) };
}
