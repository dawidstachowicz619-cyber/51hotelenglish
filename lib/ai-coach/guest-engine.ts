import { evaluateStaffResponse } from "@/lib/ai-coach/response-evaluator";
import type { AiCoachScenario, GuestMood, GuestReplyResult } from "@/lib/types/ai-coach";

function moodFromScore(score: number, current: GuestMood): GuestMood {
  if (score >= 75) return "satisfied";
  if (score >= 55) return current === "angry" ? "impatient" : "calm";
  if (score >= 35) return "impatient";
  return "angry";
}

export function buildGuestReply(
  scenario: AiCoachScenario,
  staffMessage: string,
  turnIndex: number,
  currentMood: GuestMood
): GuestReplyResult {
  const turn = scenario.turns[turnIndex];
  if (!turn) {
    return {
      english: "Thank you for your assistance. That will be all for now.",
      chinese: "谢谢您的帮助，暂时没有其他事了。",
      mood: "satisfied",
      staffScore: 80,
      feedback: "对练完成！",
      sessionComplete: true,
    };
  }

  const { score, feedback } = evaluateStaffResponse(staffMessage, turn);
  const mood = moodFromScore(score, currentMood);

  let english: string;
  let chinese: string;
  if (score >= 70) {
    english = turn.guestGood;
    chinese = turn.guestGoodCn;
  } else if (score >= 45) {
    english = turn.guestNeutral;
    chinese = turn.guestNeutralCn;
  } else {
    english = turn.guestPoor;
    chinese = turn.guestPoorCn;
  }

  const nextIndex = turnIndex + 1;
  const sessionComplete = nextIndex >= scenario.turns.length;

  if (sessionComplete) {
    return {
      english,
      chinese,
      mood: score >= 55 ? "satisfied" : mood,
      staffScore: score,
      feedback: score >= 70 ? "出色！你成功化解了局面。" : feedback,
      sessionComplete: true,
    };
  }

  return {
    english,
    chinese,
    mood,
    staffScore: score,
    feedback,
    sessionComplete: false,
  };
}

export function createOpeningMessage(scenario: AiCoachScenario) {
  return {
    english: scenario.openingLine,
    chinese: scenario.openingLineCn,
    mood: "impatient" as GuestMood,
  };
}
