import { matchSpeechTranscript } from "@/lib/assessment/speech-match";
import type { RoleplayTurn } from "@/lib/types/ai-coach";

export function evaluateStaffResponse(
  message: string,
  turn: RoleplayTurn
): { score: number; passed: boolean; feedback: string } {
  const trimmed = message.trim();
  if (trimmed.length < 8) {
    return {
      score: 20,
      passed: false,
      feedback: "回复太短，请用完整、专业的句子回应客人。",
    };
  }

  const { score, passed, matchedKeywords } = matchSpeechTranscript(
    trimmed,
    turn.expectedKeywords,
    turn.modelAnswer
  );

  let feedback: string;
  if (score >= 75) {
    feedback = "表达专业，关键词到位，客人情绪缓和。";
  } else if (score >= 55) {
    feedback = `不错。可补充：${turn.expectedKeywords.filter((k) => !matchedKeywords.includes(k)).slice(0, 2).join("、") || "更多细节"}`;
  } else {
    feedback = `建议参考：「${turn.modelAnswer.slice(0, 80)}…」`;
  }

  return { score, passed, feedback };
}
