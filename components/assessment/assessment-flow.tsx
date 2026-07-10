"use client";

import { useCallback, useMemo, useState } from "react";

import { AssessmentIntro } from "@/components/assessment/assessment-intro";
import { AssessmentResultView } from "@/components/assessment/assessment-result";
import { DialogueOralQuestionCard } from "@/components/assessment/dialogue-oral-question";
import { IdentityVerification } from "@/components/assessment/identity-verification";
import {
  getIsCorrect,
  QuestionCard,
} from "@/components/assessment/question-card";
import { getLevelQuestions } from "@/lib/assessment/level-question-generator";
import {
  calculateLevelTestResult,
  type LevelTestResult,
} from "@/lib/assessment/level-scoring";
import {
  saveLevelTestResult,
} from "@/lib/assessment/level-progress-storage";
import {
  awardAssessmentPoints,
  awardIdentityPoints,
} from "@/lib/points/storage";
import type { CEFRLevel } from "@/lib/types/assessment";

type Phase = "intro" | "identity" | "quiz" | "result";

export function AssessmentFlow() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | null>(null);
  const [identityPhoto, setIdentityPhoto] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(
    null
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [oralCorrect, setOralCorrect] = useState(false);
  const [answers, setAnswers] = useState<Map<string, boolean>>(new Map());
  const [userAnswers, setUserAnswers] = useState<Map<string, string | boolean>>(
    new Map()
  );
  const [result, setResult] = useState<LevelTestResult | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);

  const questions = useMemo(
    () => (selectedLevel ? getLevelQuestions(selectedLevel) : []),
    [selectedLevel]
  );

  const question = questions[currentIndex];

  const resetQuizState = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setOralCorrect(false);
    setAnswers(new Map());
    setUserAnswers(new Map());
    setResult(null);
    setPointsEarned(0);
  }, []);

  const handleSelectLevel = useCallback((level: CEFRLevel) => {
    setSelectedLevel(level);
    resetQuizState();
    setPhase("identity");
  }, [resetQuizState]);

  const handleBackToLevels = useCallback(() => {
    setSelectedLevel(null);
    resetQuizState();
    setIdentityPhoto(null);
    setPhase("intro");
  }, [resetQuizState]);

  const handleIdentityVerified = useCallback(
    (photoDataUrl: string) => {
      setIdentityPhoto(photoDataUrl);
      resetQuizState();
      setPhase("quiz");
      awardIdentityPoints();

      try {
        sessionStorage.setItem(
          "assessment-identity",
          JSON.stringify({
            photo: photoDataUrl,
            level: selectedLevel,
            timestamp: new Date().toISOString(),
          })
        );
      } catch {
        /* ignore storage errors */
      }
    },
    [resetQuizState, selectedLevel]
  );

  const handleRetry = useCallback(() => {
    resetQuizState();
    setPhase("identity");
    try {
      sessionStorage.removeItem("assessment-identity");
    } catch {
      /* ignore */
    }
  }, [resetQuizState]);

  const handleSelect = useCallback(
    (answer: string | boolean) => {
      if (showFeedback || !question || question.type === "dialogue_oral") return;
      setSelectedAnswer(answer);
      setShowFeedback(true);
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(question.id, getIsCorrect(question, answer));
        return next;
      });
      setUserAnswers((prev) => {
        const next = new Map(prev);
        next.set(question.id, answer);
        return next;
      });
    },
    [showFeedback, question]
  );

  const handleOralSubmit = useCallback(
    (correct: boolean) => {
      if (showFeedback || !question || question.type !== "dialogue_oral") return;
      setOralCorrect(correct);
      setShowFeedback(true);
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(question.id, correct);
        return next;
      });
      setUserAnswers((prev) => {
        const next = new Map(prev);
        next.set(
          question.id,
          correct ? question.modelAnswer : "（口语/选择未达标）"
        );
        return next;
      });
    },
    [showFeedback, question]
  );

  const handleContinue = useCallback(() => {
    if (!selectedLevel) return;

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setOralCorrect(false);
      return;
    }

    const finalAnswers = new Map(answers);
    if (question && question.type !== "dialogue_oral" && selectedAnswer !== null) {
      finalAnswers.set(question.id, getIsCorrect(question, selectedAnswer));
    }

    const levelResult = calculateLevelTestResult(
      selectedLevel,
      questions,
      finalAnswers
    );
    setResult(levelResult);
    setPhase("result");

    saveLevelTestResult(selectedLevel, {
      passed: levelResult.passed,
      score: levelResult.score,
      correct: levelResult.correct,
      total: levelResult.total,
      date: new Date().toISOString(),
    });

    const earned = awardAssessmentPoints(
      levelResult.correct,
      levelResult.total,
      levelResult.level,
      levelResult.score
    );
    setPointsEarned(earned);

    try {
      localStorage.setItem(
        "cefr-level",
        JSON.stringify({
          level: levelResult.level,
          percentage: levelResult.score,
          passed: levelResult.passed,
          date: new Date().toISOString(),
          verified: !!identityPhoto,
        })
      );
    } catch {
      /* ignore storage errors */
    }
  }, [
    currentIndex,
    answers,
    question,
    selectedAnswer,
    identityPhoto,
    selectedLevel,
    questions,
  ]);

  if (phase === "intro") {
    return <AssessmentIntro onSelectLevel={handleSelectLevel} />;
  }

  if (phase === "identity" && selectedLevel) {
    return (
      <IdentityVerification
        onVerified={handleIdentityVerified}
        onBack={handleBackToLevels}
      />
    );
  }

  if (phase === "result" && result) {
    return (
      <AssessmentResultView
        result={result}
        questions={questions}
        userAnswers={userAnswers}
        answerResults={answers}
        onRetry={handleRetry}
        onBackToLevels={handleBackToLevels}
        identityVerified={!!identityPhoto}
        pointsEarned={pointsEarned}
      />
    );
  }

  if (!question || !selectedLevel) return null;

  if (question.type === "dialogue_oral") {
    return (
      <DialogueOralQuestionCard
        key={question.id}
        question={question}
        questionIndex={currentIndex}
        total={questions.length}
        showFeedback={showFeedback}
        isCorrect={oralCorrect}
        onSubmit={handleOralSubmit}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <QuestionCard
      question={question}
      questionIndex={currentIndex}
      total={questions.length}
      selectedAnswer={selectedAnswer}
      showFeedback={showFeedback}
      onSelect={handleSelect}
      onContinue={handleContinue}
    />
  );
}
