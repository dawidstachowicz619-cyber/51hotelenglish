export type TtsConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  voice: string;
};

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getTtsConfig(): TtsConfig | null {
  const apiKey = process.env.SILICONFLOW_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: normalizeBaseUrl(
      process.env.SILICONFLOW_BASE_URL ?? "https://api.siliconflow.cn/v1"
    ),
    model: process.env.SILICONFLOW_TTS_MODEL ?? "fishaudio/fish-speech-1.5",
    voice:
      process.env.SILICONFLOW_TTS_VOICE ?? "fishaudio/fish-speech-1.5:alex",
  };
}
