export type TranscribeProvider = "siliconflow" | "openai";

export type TranscribeConfig = {
  provider: TranscribeProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
};

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/** 服务端语音转文字：SiliconFlow（国内）或 OpenAI Whisper */
export function getTranscribeConfig(): TranscribeConfig | null {
  const preference = (process.env.SPEECH_PROVIDER ?? "auto").toLowerCase();

  const siliconflow: TranscribeConfig | null = process.env.SILICONFLOW_API_KEY
    ? {
        provider: "siliconflow",
        apiKey: process.env.SILICONFLOW_API_KEY,
        baseUrl: normalizeBaseUrl(
          process.env.SILICONFLOW_BASE_URL ?? "https://api.siliconflow.cn/v1"
        ),
        model: process.env.SILICONFLOW_SPEECH_MODEL ?? "FunAudioLLM/SenseVoiceSmall",
      }
    : null;

  const openai: TranscribeConfig | null = process.env.OPENAI_API_KEY
    ? {
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: normalizeBaseUrl(
          process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"
        ),
        model: process.env.OPENAI_WHISPER_MODEL ?? "whisper-1",
      }
    : null;

  if (preference === "siliconflow") return siliconflow;
  if (preference === "openai") return openai;
  return siliconflow ?? openai;
}
