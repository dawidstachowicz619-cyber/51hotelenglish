import { isSectionOpenerSentence } from "@/lib/speech/narration-script";

export type SpeechLang = "en-US" | "zh-CN" | "ru-RU";

export { isSectionOpenerSentence };

const PREFERRED_VOICE_HINTS: Record<string, string[]> = {
  zh: [
    "Tingting",
    "Meijia",
    "Yu-shu",
    "Sin-ji",
    "Li-mu",
    "Xiaoxiao",
    "Yunxi",
    "Google 普通话",
    "Microsoft Yaoyao",
    "Microsoft Huihui",
    "Microsoft Xiaoxiao",
    "Premium",
    "Enhanced",
    "Neural",
    "Natural",
  ],
  en: [
    "Samantha",
    "Karen",
    "Daniel",
    "Google US English",
    "Microsoft Zira",
    "Microsoft David",
    "Premium",
    "Enhanced",
    "Neural",
    "Natural",
  ],
  ru: [
    "Milena",
    "Katya",
    "Yuri",
    "Google русский",
    "Microsoft Irina",
    "Microsoft Pavel",
    "Premium",
    "Enhanced",
    "Neural",
  ],
};

const AVOID_VOICE_HINTS = [
  "Compact",
  "Robot",
  "Bad News",
  "Bahh",
  "Bells",
  "Boing",
  "Bubbles",
  "Cellos",
  "Deranged",
  "Good News",
  "Jester",
  "Organ",
  "Superstar",
  "Trinoids",
  "Whisper",
  "Zarvox",
];

function voiceScore(voice: SpeechSynthesisVoice, langPrefix: string): number {
  const lang = voice.lang.toLowerCase();
  if (!lang.startsWith(langPrefix)) return -1000;

  let score = 0;
  const name = voice.name;

  for (const hint of PREFERRED_VOICE_HINTS[langPrefix] ?? []) {
    if (name.includes(hint)) score += 12;
  }
  for (const hint of AVOID_VOICE_HINTS) {
    if (name.includes(hint)) score -= 20;
  }

  if (voice.localService) score += 4;
  if (name.includes("Google")) score += 6;
  if (name.includes("Apple") || name.includes("com.apple")) score += 3;
  if (name.includes("Neural") || name.includes("Natural")) score += 8;
  if (voice.default) score += 1;

  return score;
}

export function pickNaturalVoice(lang: SpeechLang): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  const langPrefix = lang.startsWith("zh")
    ? "zh"
    : lang.startsWith("ru")
      ? "ru"
      : "en";
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const ranked = voices
    .map((voice) => ({ voice, score: voiceScore(voice, langPrefix) }))
    .filter((item) => item.score > -100)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.voice ?? null;
}

/** 等待浏览器加载可用发音人（Safari / Chrome 首次调用常为空） */
export function waitForSpeechVoices(timeoutMs = 1200): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve([]);
  }

  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) return Promise.resolve(existing);

  return new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener("voiceschanged", finish);
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener("voiceschanged", finish);
    window.speechSynthesis.getVoices();

    setTimeout(finish, timeoutMs);
  });
}

/** 将长段落拆成短句，朗读更有停顿感 */
export function splitForNaturalSpeech(text: string, lang: SpeechLang): string[] {
  const cleaned = text.replace(/\s+/g, "").trim();
  if (!cleaned) return [];

  const parts =
    lang === "zh-CN"
      ? cleaned.split(/(?<=[。！？；.!?])/)
      : cleaned.split(/(?<=[.!?])\s+/);

  const chunks: string[] = [];
  for (const part of parts) {
    const sentence = part.trim();
    if (!sentence) continue;

    if (isSectionOpenerSentence(sentence)) {
      chunks.push(sentence);
      continue;
    }

    if (lang === "zh-CN" && sentence.length > 36) {
      const clauses = sentence.split(/(?<=[，、；：])/);
      for (const clause of clauses) {
        const piece = clause.trim();
        if (piece.length >= 2) chunks.push(piece);
      }
    } else {
      chunks.push(sentence);
    }
  }

  return chunks.length > 0 ? chunks : [cleaned];
}

export function naturalSpeechRate(lang: SpeechLang): number {
  if (lang === "zh-CN") return 0.88;
  if (lang === "ru-RU") return 0.86;
  return 0.8;
}

export function pauseBetweenSentencesMs(lang: SpeechLang): number {
  if (lang === "zh-CN") return 580;
  if (lang === "ru-RU") return 520;
  return 400;
}

export function detectSpeechLang(text: string): SpeechLang {
  if (/[\u4e00-\u9fff]/.test(text)) return "zh-CN";
  if (/[\u0400-\u04FF]/.test(text)) return "ru-RU";
  return "en-US";
}
