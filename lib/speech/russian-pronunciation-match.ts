export type RussianPronunciationTarget = {
  russian: string;
  transliteration: string;
  chinese?: string;
};

export type RussianPronunciationEval = {
  passed: boolean;
  score: number;
  feedback: string;
  level: "excellent" | "good" | "retry";
};

/** 西里尔字母规范化（ё→е、去标点） */
export function normalizeCyrillic(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 拉丁转写规范化 */
export function normalizeLatin(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''´`]/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const next = Math.min(row[j] + 1, prev + 1, row[j - 1] + cost);
      row[j - 1] = prev;
      prev = next;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

function similarityRatio(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.92;

  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, 1 - dist / maxLen);
}

function tokenBestScore(transcript: string, target: string): number {
  const t = normalizeCyrillic(transcript);
  const ref = normalizeCyrillic(target);
  if (!ref) return 0;

  let best = similarityRatio(t, ref);
  const tokens = t.split(" ").filter(Boolean);
  for (const token of tokens) {
    best = Math.max(best, similarityRatio(token, ref));
  }
  return best;
}

function latinBestScore(transcript: string, transliteration: string): number {
  const t = normalizeLatin(transcript);
  const ref = normalizeLatin(transliteration);
  if (!ref) return 0;

  let best = similarityRatio(t.replace(/\s/g, ""), ref.replace(/\s/g, ""));
  best = Math.max(best, similarityRatio(t, ref));

  const refParts = ref.split(/[\s-]+/).filter((p) => p.length >= 3);
  if (refParts.length > 0) {
    const matched = refParts.filter((p) => t.includes(p)).length;
    best = Math.max(best, matched / refParts.length);
  }
  return best;
}

/** 评价俄语单词跟读（支持西里尔识别或拉丁转写识别） */
export function evaluateRussianPronunciation(
  transcript: string,
  target: RussianPronunciationTarget
): RussianPronunciationEval {
  const cleaned = transcript.trim();
  if (!cleaned) {
    return {
      passed: false,
      score: 0,
      feedback: "未识别到语音，请靠近麦克风再试一次。",
      level: "retry",
    };
  }

  const cyrillicScore = tokenBestScore(cleaned, target.russian);
  const latinScore = latinBestScore(cleaned, target.transliteration);
  const raw = Math.max(cyrillicScore, latinScore * 0.95);
  const score = Math.round(raw * 100);

  const passed = score >= 62;
  let level: RussianPronunciationEval["level"] = "retry";
  if (score >= 88) level = "excellent";
  else if (passed) level = "good";

  const label = target.chinese ? `「${target.chinese}」` : "该词";
  let feedback: string;
  if (level === "excellent") {
    feedback = `${label}发音很好！匹配度 ${score}%，继续保持。`;
  } else if (level === "good") {
    feedback = `${label}基本正确（${score}%）。可再听标准发音后重读一遍。`;
  } else {
    feedback = `${label}还需练习（${score}%）。标准读法：${target.russian}（${target.transliteration}）`;
  }

  return { passed, score, feedback, level };
}
