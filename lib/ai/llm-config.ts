export type ChatLlmProvider = "deepseek" | "openai";

export type ChatLlmConfig = {
  provider: ChatLlmProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
};

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/** AI 对练对话：优先 DeepSeek，其次 OpenAI */
export function getChatLlmConfig(): ChatLlmConfig | null {
  const preference = (process.env.AI_CHAT_PROVIDER ?? "auto").toLowerCase();

  const deepseek: ChatLlmConfig | null = process.env.DEEPSEEK_API_KEY
    ? {
        provider: "deepseek",
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseUrl: normalizeBaseUrl(
          process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com"
        ),
        model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
      }
    : null;

  const openai: ChatLlmConfig | null = process.env.OPENAI_API_KEY
    ? {
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: normalizeBaseUrl(
          process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"
        ),
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      }
    : null;

  if (preference === "deepseek") return deepseek;
  if (preference === "openai") return openai;
  return deepseek ?? openai;
}

export function isAiCoachConfigured(): boolean {
  return !!getChatLlmConfig();
}
