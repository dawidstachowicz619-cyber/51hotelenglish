"use client";

import { useEffect, useMemo, useState } from "react";

import {
  DuolingoActionBar,
  DuolingoAnswerSlots,
  DuolingoAudioButton,
  DuolingoExerciseHeader,
  DuolingoInstruction,
  DuolingoLessonComplete,
  DuolingoLetterBank,
  DuolingoOptionGrid,
  DuolingoOutOfHearts,
} from "@/components/courses/front-desk/exercises/duolingo-exercise-ui";
import {
  generateNodeExercises,
  isSpellCorrect,
} from "@/lib/course/exercise-generator";
import {
  buildLetterBank,
  tilesToWord,
  type LetterTile,
} from "@/lib/course/spell-letter-bank";
import type { ProgressionNode } from "@/lib/types/course-progress";
import {
  DUOLINGO_INSTRUCTIONS,
  type LevelExercise,
} from "@/lib/types/level-exercise";
import {
  getScenarioLevelContent,
  type WorkScenario,
} from "@/lib/types/course";
import { useSpeech } from "@/hooks/use-speech";
import {
  playLessonCompleteSound,
  playSuccessSound,
} from "@/lib/audio/exercise-sounds";
import {
  canStartNewLearning,
  notifyLearningBlocked,
} from "@/lib/hr/hr-registration";

const MAX_HEARTS = 5;

type LevelExerciseFlowProps = {
  node: ProgressionNode;
  scenario: WorkScenario;
  onBack: () => void;
  onComplete: () => void;
  isCompleted?: boolean;
};

function playExerciseAudio(
  exercise: LevelExercise,
  speak: (text: string, lang?: "en-US" | "zh-CN") => void
) {
  speak(exercise.audioText, "en-US");
}

export function LevelExerciseFlow({
  node,
  scenario,
  onBack,
  onComplete,
  isCompleted = false,
}: LevelExerciseFlowProps) {
  const content = getScenarioLevelContent(scenario, node.cefrLevel);
  const exercises = useMemo(() => {
    const levelContent = content ?? {
      level: node.cefrLevel,
      words: [],
      sentences: [],
      dialogues: [],
      scenarios: [],
    };
    return generateNodeExercises(node, levelContent);
  }, [node, content]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedTiles, setSelectedTiles] = useState<LetterTile[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [finished, setFinished] = useState(isCompleted);
  const [outOfHearts, setOutOfHearts] = useState(false);
  const { speak, speaking, supported } = useSpeech();

  useEffect(() => {
    if (isCompleted) return;
    if (!canStartNewLearning()) {
      notifyLearningBlocked();
      onBack();
    }
  }, [isCompleted, onBack]);

  const current = exercises[index];
  const progress = exercises.length
    ? ((index + (showFeedback ? 1 : 0)) / exercises.length) * 100
    : 0;

  const letterBank = useMemo(
    () =>
      current?.type === "spell_word"
        ? buildLetterBank(current.correctAnswer, current.id)
        : [],
    [current]
  );

  const usedTileIds = useMemo(
    () => new Set(selectedTiles.map((tile) => tile.id)),
    [selectedTiles]
  );

  const spellInput = tilesToWord(selectedTiles);

  const checkCorrect = () => {
    if (!current) return false;
    if (current.type === "spell_word") {
      return isSpellCorrect(spellInput, current.correctAnswer);
    }
    return selected === current.correctAnswer;
  };

  const isCorrect = showFeedback ? checkCorrect() : false;

  const resetQuestionState = () => {
    setSelected(null);
    setSelectedTiles([]);
    setShowFeedback(false);
  };

  const restartLesson = () => {
    setIndex(0);
    setCorrectCount(0);
    setHearts(MAX_HEARTS);
    setFinished(false);
    setOutOfHearts(false);
    resetQuestionState();
  };

  useEffect(() => {
    if (!current || !supported || showFeedback || finished || outOfHearts)
      return;
    const t = setTimeout(() => playExerciseAudio(current, speak), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, index, supported, finished, outOfHearts]);

  if (!content || exercises.length === 0) {
    return (
      <div className="card-elevated p-8 text-center">
        <p className="font-bold text-muted-foreground">该关卡暂无练习题。</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 rounded-2xl border-2 border-border px-6 py-3 text-sm font-extrabold uppercase tracking-wide"
        >
          Back to map
        </button>
      </div>
    );
  }

  if (outOfHearts) {
    return (
      <DuolingoOutOfHearts onRestart={restartLesson} onBack={onBack} />
    );
  }

  if (finished) {
    return (
      <DuolingoLessonComplete
        correctCount={correctCount}
        total={exercises.length}
        heartsLeft={hearts}
        onClaim={onComplete}
        onBack={onBack}
        isCompleted={isCompleted}
        title={node.workScenarioTitle}
        subtitle={`${node.moduleLabel} · ${node.cefrLevel}`}
      />
    );
  }

  const handleCheck = () => {
    if (current.type === "spell_word") {
      if (!spellInput.trim()) return;
    } else if (!selected) return;

    const ok = checkCorrect();
    setShowFeedback(true);
    if (ok) {
      setCorrectCount((c) => c + 1);
      playSuccessSound();
    } else {
      setHearts((h) => {
        const next = h - 1;
        if (next <= 0) {
          setTimeout(() => setOutOfHearts(true), 600);
        }
        return next;
      });
    }
  };

  const handleContinue = () => {
    if (index >= exercises.length - 1) {
      setFinished(true);
      playLessonCompleteSound();
      return;
    }
    setIndex((i) => i + 1);
    resetQuestionState();
  };

  const canCheck =
    current.type === "spell_word"
      ? spellInput.length >= current.correctAnswer.replace(/[^a-zA-Z]/g, "").length
      : Boolean(selected);

  const feedbackAnswer =
    current.type === "listen_pick_sentence" ||
    current.type === "listen_pick_line"
      ? current.correctAnswer
      : current.correctAnswer;

  const handlePickTile = (tile: LetterTile) => {
    if (showFeedback) return;
    setSelectedTiles((prev) => [...prev, tile]);
  };

  const handleRemoveTile = (tile: LetterTile) => {
    if (showFeedback) return;
    setSelectedTiles((prev) => {
      const idx = prev.findIndex((t) => t.id === tile.id);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

  const slotLength = current.correctAnswer.replace(/[^a-zA-Z]/g, "").length;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <DuolingoExerciseHeader
        progress={progress}
        hearts={hearts}
        onClose={onBack}
      />

      <div className="flex flex-1 flex-col px-1 py-6 md:px-4">
        <DuolingoInstruction
          text={DUOLINGO_INSTRUCTIONS[current.type]}
        />

        {current.type === "spell_word" && current.chineseHint && (
          <p className="mt-4 text-center font-display text-2xl text-foreground md:text-3xl">
            {current.chineseHint}
          </p>
        )}

        {current.type === "situational_pick" && (
          <p className="mt-4 rounded-2xl border-2 border-border bg-muted/50 px-4 py-3 text-center text-sm font-bold text-foreground">
            {current.prompt}
          </p>
        )}

        {current.type !== "situational_pick" && (
          <div className="mt-8 flex justify-center">
            <DuolingoAudioButton
              speaking={speaking}
              onPlay={() => playExerciseAudio(current, speak)}
            />
          </div>
        )}

        {current.type === "spell_word" && (
          <div className="mt-8 space-y-6">
            <DuolingoAnswerSlots
              length={slotLength}
              filled={selectedTiles.map((t) => t.char)}
              showFeedback={showFeedback}
              isCorrect={isCorrect}
            />
            <DuolingoLetterBank
              tiles={letterBank}
              usedIds={usedTileIds}
              showFeedback={showFeedback}
              onPick={handlePickTile}
              onRemove={handleRemoveTile}
            />
          </div>
        )}

        {current.options && current.type !== "spell_word" && (
          <div className="mt-8">
            <DuolingoOptionGrid
              options={current.options}
              selected={selected}
              correctAnswer={current.correctAnswer}
              showFeedback={showFeedback}
              onSelect={setSelected}
            />
          </div>
        )}
      </div>

      <DuolingoActionBar
        phase={showFeedback ? "feedback" : "check"}
        canCheck={canCheck}
        isCorrect={isCorrect}
        correctAnswer={feedbackAnswer}
        explanation={current.explanation}
        onCheck={handleCheck}
        onContinue={handleContinue}
        isLast={index >= exercises.length - 1}
      />
    </div>
  );
}
