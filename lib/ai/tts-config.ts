export type TtsConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  voice: string;
  sampleRate: number;
};

export type TtsSpeechMode = "fall" | "success" | "default";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function parseSampleRate(value: string | undefined): number {
  const parsed = Number(value);
  return parsed === 32000 || parsed === 44100 ? parsed : 32000;
}

/** 游戏单词用纯文本，避免 CosyVoice 提示词产生杂音 */
export function formatTtsInput(text: string, mode: TtsSpeechMode = "default"): string {
  const word = text.trim();
  if (!word) return word;

  if (mode === "fall" || mode === "success") {
    return word;
  }

  return `Read this clearly and naturally in American English.<|endofprompt|>${word}`;
}

export function ttsSpeedForMode(mode: TtsSpeechMode): number {
  if (mode === "success") return 0.94;
  if (mode === "fall") return 0.9;
  return 0.92;
}

export function getTtsConfig(): TtsConfig | null {
  const apiKey = process.env.SILICONFLOW_API_KEY?.trim();
  if (!apiKey) return null;

  const model =
    process.env.SILICONFLOW_TTS_MODEL ?? "FunAudioLLM/CosyVoice2-0.5B";
  const voicePreset = process.env.SILICONFLOW_TTS_VOICE ?? "anna";

  return {
    apiKey,
    baseUrl: normalizeBaseUrl(
      process.env.SILICONFLOW_BASE_URL ?? "https://api.siliconflow.cn/v1"
    ),
    model,
    voice: voicePreset.includes(":")
      ? voicePreset
      : `${model}:${voicePreset}`,
    sampleRate: parseSampleRate(process.env.SILICONFLOW_TTS_SAMPLE_RATE),
  };
}
