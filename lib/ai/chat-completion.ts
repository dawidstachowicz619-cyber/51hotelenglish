import type { ChatLlmConfig } from "@/lib/ai/llm-config";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionOptions = {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
};

export async function chatCompletion(
  config: ChatLlmConfig,
  options: ChatCompletionOptions
): Promise<string | null> {
  const url = `${config.baseUrl}/chat/completions`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: options.messages,
        max_tokens: options.maxTokens ?? 200,
        temperature: options.temperature ?? 0.8,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error(`[chat/${config.provider}]`, res.status, detail);
      return null;
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.error(`[chat/${config.provider}]`, error);
    return null;
  }
}

export function parseGuestLlmReply(text: string): {
  english: string;
  chinese: string;
  feedback: string;
} {
  const parts = text.split("---").map((p) => p.trim());
  const english = parts[0] ?? text;
  const chinese = parts[1]?.replace(/^FEEDBACK:.*$/m, "").trim() ?? "";
  const feedbackMatch = text.match(/FEEDBACK:\s*(.+)/);
  const feedback = feedbackMatch?.[1]?.trim() ?? "继续加油！";

  return { english, chinese, feedback };
}
