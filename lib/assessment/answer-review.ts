import type { AssessmentQuestion } from "@/lib/types/assessment";
import { QUESTION_TYPE_LABELS } from "@/lib/types/assessment";

export type QuestionAnswerRecord = {
  question: AssessmentQuestion;
  userAnswer: string | boolean | null;
  isCorrect: boolean;
};

export function getCorrectAnswerText(question: AssessmentQuestion): string {
  switch (question.type) {
    case "true_false":
      return question.correct ? "True · 正确" : "False · 错误";
    case "dialogue_oral":
      return question.modelAnswer;
    default:
      return question.options[question.correctIndex] ?? "";
  }
}

export function formatUserAnswer(
  question: AssessmentQuestion,
  answer: string | boolean | null | undefined
): string {
  if (answer === null || answer === undefined) return "未作答";
  if (typeof answer === "boolean") {
    return answer ? "True · 正确" : "False · 错误";
  }
  return answer;
}

export function getQuestionSummary(question: AssessmentQuestion): string {
  switch (question.type) {
    case "true_false":
      return question.statement;
    case "fill_blank":
      return question.sentence.replace("___", "______");
    case "matching":
      return `${question.term} — ${question.prompt}`;
    case "reading":
      return question.question;
    case "dialogue_oral":
      return question.guestLine;
    default:
      return question.prompt;
  }
}

export function buildWrongAnswerRecords(
  questions: AssessmentQuestion[],
  answers: Map<string, boolean>,
  userAnswers: Map<string, string | boolean>
): QuestionAnswerRecord[] {
  return questions
    .filter((q) => !answers.get(q.id))
    .map((q) => ({
      question: q,
      userAnswer: userAnswers.get(q.id) ?? null,
      isCorrect: false,
    }));
}

export function questionTypeLabel(question: AssessmentQuestion): string {
  return QUESTION_TYPE_LABELS[question.type];
}
