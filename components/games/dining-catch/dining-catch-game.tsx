"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Check, Heart, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { playLessonCompleteSound, playSuccessSound } from "@/lib/audio/exercise-sounds";
import {
  prefersCloudGameTts,
  setDiningCatchBgmVolume,
  speakGameWord,
  startDiningCatchBgm,
  stopDiningCatchBgm,
  stopGameSpeech,
  supportsDiningCatchBgm,
  unlockGameAudioSync,
} from "@/lib/games/dining-catch/game-audio";
import { isHarmonyOsDevice, isWeChatBrowser } from "@/lib/speech/browser-speech";
import {
  DINING_CATCH_PASS_SCORE,
  DINING_CATCH_ROUNDS,
  getDiningCatchLevel,
  pickRoundItems,
} from "@/lib/games/dining-catch/levels";
import { completeDiningCatchLevel } from "@/lib/games/dining-catch/progress-storage";
import { diningItemImagePath } from "@/lib/types/hotel-russian-dining-item";
import type { HotelRussianDiningItem } from "@/lib/types/hotel-russian-dining-item";
import { cn } from "@/lib/utils";

const LANE_POSITIONS = [18, 50, 82] as const;

type FallSpeed = "slow" | "fast";

const SPEED_CONFIG: Record<
  FallSpeed,
  { label: string; durationMin: number; durationMax: number; roundTimeMs: number }
> = {
  slow: { label: "慢", durationMin: 7.5, durationMax: 9.5, roundTimeMs: 18000 },
  fast: { label: "快", durationMin: 3.2, durationMax: 4.8, roundTimeMs: 10000 },
};

type FallingSprite = {
  id: string;
  itemId: string;
  left: number;
  duration: number;
  delay: number;
};

type SpriteState = "idle" | "correct" | "wrong";

type DiningCatchGameProps = {
  level: number;
  onBack: () => void;
  onComplete: () => void;
};

function FallingWord({
  item,
  sprite,
  state,
  disabled,
  onPick,
}: {
  item: HotelRussianDiningItem;
  sprite: FallingSprite;
  state: SpriteState;
  disabled: boolean;
  onPick: () => void;
}) {
  const paused = state !== "idle";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPick}
      className={cn(
        "dining-catch-fall-item absolute z-10 flex w-[min(30vw,7.25rem)] flex-col items-center rounded-2xl border-[3px] border-white bg-white p-2 shadow-xl active:scale-95",
        state === "correct" && "border-primary ring-4 ring-primary/30",
        state === "wrong" && "dining-catch-block-shake border-red",
        disabled && state === "idle" && "pointer-events-none opacity-85"
      )}
      style={{
        left: `${sprite.left}%`,
        animation: `dining-catch-fall ${sprite.duration}s linear ${sprite.delay}s forwards`,
        animationPlayState: paused ? "paused" : "running",
      }}
    >
      <div className="relative size-[min(24vw,5.5rem)]">
        <Image
          src={diningItemImagePath(item.id)}
          alt={item.chinese}
          fill
          className="object-contain p-1"
          sizes="110px"
          priority
        />
      </div>
      <p className="mt-1 w-full truncate px-1 text-center text-[11px] font-extrabold text-foreground">
        {item.chinese}
      </p>

      {state === "correct" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-primary/20 backdrop-blur-[1px]">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_3px_0_var(--primary-dark)]">
            <Check className="size-8" strokeWidth={3} />
          </div>
          <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-extrabold text-white">
            +1 分
          </span>
        </div>
      )}
    </button>
  );
}

export function DiningCatchGame({ level, onBack, onComplete }: DiningCatchGameProps) {
  const levelConfig = useMemo(() => getDiningCatchLevel(level), [level]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [muted, setMuted] = useState(false);
  const [fallSpeed, setFallSpeed] = useState<FallSpeed>("slow");
  const [phase, setPhase] = useState<"playing" | "done">("playing");
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [sprites, setSprites] = useState<FallingSprite[]>([]);
  const [spriteStates, setSpriteStates] = useState<Record<string, SpriteState>>({});
  const [targetId, setTargetId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [needsTapForAudio, setNeedsTapForAudio] = useState(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const useCloudTts = prefersCloudGameTts();

  const targetEnglish = useMemo(() => {
    if (!levelConfig || !targetId) return "";
    return levelConfig.items.find((i) => i.id === targetId)?.english ?? "";
  }, [levelConfig, targetId]);

  const speedConfig = SPEED_CONFIG[fallSpeed];

  const clearRoundTimer = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
  }, []);

  const failHeart = useCallback((message: string, advanceDelay = 1200) => {
    setLocked(true);
    setFeedback(message);
    setHearts((h) => {
      const next = h - 1;
      if (next <= 0) {
        setPhase("done");
        setResult("lose");
        stopDiningCatchBgm();
      } else {
        window.setTimeout(() => setRoundIndex((r) => r + 1), advanceDelay);
      }
      return next;
    });
  }, []);

  const playRoundAudio = useCallback(
    (english: string) => {
      if (muted || !english) return;
      setNeedsTapForAudio(false);
      speakGameWord(english, "fall");
    },
    [muted]
  );

  const handlePick = useCallback(
    (itemId: string, spriteId: string) => {
      if (locked || phase !== "playing" || !targetId || !levelConfig) return;
      unlockGameAudioSync();
      clearRoundTimer();
      setLocked(true);

      const item = levelConfig.items.find((i) => i.id === itemId);
      if (!item) return;

      if (itemId === targetId) {
        setSpriteStates({ [spriteId]: "correct" });
        setScore((s) => s + 1);
        setFeedback(`正确！${item.chinese}`);
        if (!muted) {
          if (supportsDiningCatchBgm()) playSuccessSound();
          speakGameWord(item.english, "success");
        }
        window.setTimeout(() => setRoundIndex((r) => r + 1), 1200);
      } else {
        setSpriteStates({ [spriteId]: "wrong" });
        setFeedback("不对，再听一遍");
        if (!muted && targetEnglish) speakGameWord(targetEnglish, "fall");
        setHearts((h) => {
          const next = h - 1;
          if (next <= 0) {
            setPhase("done");
            setResult("lose");
            stopDiningCatchBgm();
          } else {
            window.setTimeout(() => setRoundIndex((r) => r + 1), 1200);
          }
          return next;
        });
      }
    },
    [locked, phase, targetId, levelConfig, muted, targetEnglish, clearRoundTimer]
  );

  const startRound = useCallback(
    (index: number) => {
      if (!levelConfig) return;
      clearRoundTimer();
      setLocked(false);
      setFeedback(null);
      setSpriteStates({});

      const { target, options } = pickRoundItems(levelConfig.items, 3);
      const { durationMin, durationMax, roundTimeMs } = SPEED_CONFIG[fallSpeed];

      setTargetId(target.id);
      setPrompt("听发音 3 遍，点击掉落的正确中文！");

      const nextSprites: FallingSprite[] = options.map((item, i) => ({
        id: `${index}-${item.id}-${i}`,
        itemId: item.id,
        left: LANE_POSITIONS[i] ?? 50,
        duration: durationMin + Math.random() * (durationMax - durationMin),
        delay: i * 0.45,
      }));
      setSprites(nextSprites);
      setNeedsTapForAudio(useCloudTts);

      if (!muted && !useCloudTts) {
        window.setTimeout(() => {
          speakGameWord(target.english, "fall");
        }, 350);
      }

      const maxFallMs =
        Math.max(...nextSprites.map((s) => (s.duration + s.delay) * 1000)) + 600;
      roundTimerRef.current = setTimeout(() => {
        failHeart("时间到！再试一次", 900);
      }, Math.max(roundTimeMs, maxFallMs));
    },
    [levelConfig, muted, fallSpeed, clearRoundTimer, failHeart, useCloudTts]
  );

  useEffect(() => {
    if (phase !== "playing" || !levelConfig) return;
    if (roundIndex >= DINING_CATCH_ROUNDS) {
      setScore((currentScore) => {
        const passed = currentScore >= DINING_CATCH_PASS_SCORE;
        setPhase("done");
        setResult(passed ? "win" : "lose");
        if (passed) {
          completeDiningCatchLevel(level, currentScore);
          if (supportsDiningCatchBgm()) playLessonCompleteSound();
        }
        stopDiningCatchBgm();
        return currentScore;
      });
      return;
    }
    startRound(roundIndex);
  }, [roundIndex, phase, levelConfig, startRound, level]);

  useEffect(() => {
    void startDiningCatchBgm(muted ? 0 : 0.07);
    return () => {
      clearRoundTimer();
      stopDiningCatchBgm();
      stopGameSpeech();
    };
  }, [clearRoundTimer, muted]);

  useEffect(() => {
    if (supportsDiningCatchBgm()) {
      setDiningCatchBgmVolume(muted ? 0 : 0.07);
    }
  }, [muted]);

  if (!levelConfig) return null;

  if (phase === "done" && result) {
    return (
      <div className="flex flex-1 flex-col justify-center px-4 py-6">
        <div
          className={cn(
            "card-elevated p-8 text-center",
            result === "win" ? "border-primary/30 bg-primary-light/20" : "border-red/20 bg-red/5"
          )}
        >
          <p className="text-6xl">{result === "win" ? "🎉" : "💪"}</p>
          <h2 className="mt-4 font-display text-2xl text-foreground">
            {result === "win" ? "闯关成功！" : "再接再厉"}
          </h2>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            第 {level} 关 · {levelConfig.title} · 得分 {score}/{DINING_CATCH_ROUNDS}
          </p>
          {result === "win" ? (
            <p className="mt-1 text-xs font-bold text-primary">下一关已解锁</p>
          ) : (
            <p className="mt-1 text-xs font-bold text-muted-foreground">
              需要 {DINING_CATCH_PASS_SCORE} 分通关
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                if (result === "lose") {
                  setRoundIndex(0);
                  setScore(0);
                  setHearts(3);
                  setPhase("playing");
                  setResult(null);
                  setSprites([]);
                  void startDiningCatchBgm(muted ? 0 : 0.07);
                  return;
                }
                onComplete();
              }}
            >
              {result === "win" ? "返回地图" : "再玩一次"}
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={onBack}>
              退出
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 pt-2">
      <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
        <div className="flex-1 text-center">
          <p className="text-[11px] font-bold text-muted-foreground">
            第 {level} 关 · {levelConfig.title}
          </p>
          <p className="text-sm font-extrabold text-foreground">
            {roundIndex + 1}/{DINING_CATCH_ROUNDS} · 得分 {score}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/80 text-muted-foreground shadow-sm active:scale-95"
          aria-label={muted ? "开启声音" : "静音"}
        >
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </button>
      </div>

      <div className="mb-2 flex shrink-0 items-center justify-center gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Heart
            key={i}
            className={cn(
              "size-6",
              i < hearts ? "fill-red text-red" : "fill-muted text-muted"
            )}
          />
        ))}
      </div>

      <div className="mb-2 flex shrink-0 justify-center">
        <div className="inline-flex rounded-full border-2 border-border bg-white p-1 shadow-sm">
          {(Object.keys(SPEED_CONFIG) as FallSpeed[]).map((speed) => (
            <button
              key={speed}
              type="button"
              disabled={locked}
              onClick={() => setFallSpeed(speed)}
              className={cn(
                "rounded-full px-5 py-1.5 text-xs font-extrabold transition-colors",
                fallSpeed === speed
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted-foreground",
                locked && "opacity-60"
              )}
            >
              {SPEED_CONFIG[speed].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 shrink-0 rounded-2xl border-2 border-accent/30 bg-white/95 px-4 py-3 text-center shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <p className="flex-1 text-lg font-extrabold leading-snug text-foreground">{prompt}</p>
          {useCloudTts && (
            <button
              type="button"
              disabled={locked || muted || !targetEnglish}
              onPointerDown={() => unlockGameAudioSync()}
              onClick={() => playRoundAudio(targetEnglish)}
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-full border-2 shadow-sm active:scale-95",
                needsTapForAudio && !muted
                  ? "animate-pulse border-accent bg-accent/15 text-accent"
                  : "border-border bg-white text-primary"
              )}
              aria-label="听发音 3 遍"
            >
              <Volume2 className="size-6" />
            </button>
          )}
        </div>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">
          单词从上往下掉 · 显示中文 · 速度 {speedConfig.label}
          {useCloudTts && !muted && " · 请点喇叭听发音"}
        </p>
        {(isHarmonyOsDevice() || isWeChatBrowser()) && !muted && useCloudTts && (
          <p className="mt-1 text-xs font-bold text-accent">
            鸿蒙/微信内请点右侧喇叭 🔊 听单词
          </p>
        )}
        {feedback && (
          <p
            className={cn(
              "mt-2 text-base font-bold",
              feedback.startsWith("正确") ? "text-primary" : "text-red"
            )}
          >
            {feedback}
          </p>
        )}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl border-2 border-[#0039A6]/15 bg-gradient-to-b from-sky-300/90 via-sky-100 to-amber-100/90 shadow-inner">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-14 bg-gradient-to-b from-white/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-16 bg-gradient-to-t from-amber-200/80 to-transparent" />

        {sprites.map((sprite) => {
          const item = levelConfig.items.find((i) => i.id === sprite.itemId);
          if (!item) return null;
          return (
            <FallingWord
              key={sprite.id}
              item={item}
              sprite={sprite}
              state={spriteStates[sprite.id] ?? "idle"}
              disabled={locked}
              onPick={() => handlePick(sprite.itemId, sprite.id)}
            />
          );
        })}
      </div>

      <p className="mt-2 shrink-0 pb-1 text-center text-xs font-semibold text-muted-foreground">
        点击正确中文 · 显示 ✓ 并 +1 分
      </p>
    </div>
  );
}
