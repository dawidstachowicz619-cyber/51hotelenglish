"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, ChevronLeft, Lightbulb, Mic, Square, X } from "lucide-react";

import {
  GuestChatAvatar,
  GuestVideoPanel,
} from "@/components/ai-coach/guest-video-panel";
import { getGuestAvatarForScenario } from "@/lib/ai-coach/guest-avatars";
import { createOpeningMessage } from "@/lib/ai-coach/guest-engine";
import {
  getCompletedScenarioIds,
  markScenarioCompleted,
  saveRoleplaySession,
} from "@/lib/ai-coach/session-storage";
import {
  afterLearningCompletion,
  canStartNewLearning,
  notifyLearningBlocked,
} from "@/lib/hr/hr-registration";
import { appendLearningHistory } from "@/lib/hr/learning-history-storage";
import { loadProfile } from "@/lib/points/storage";
import type { AiCoachScenario, RoleplayMessage, RoleplaySession } from "@/lib/types/ai-coach";
import { useSpeech } from "@/hooks/use-speech";
import { useRoleplayVoice } from "@/hooks/use-roleplay-voice";
import { cn } from "@/lib/utils";

type RoleplayChatProps = {
  scenario: AiCoachScenario;
  onBack: () => void;
};

function msgId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function RoleplayChat({ scenario, onBack }: RoleplayChatProps) {
  const opening = createOpeningMessage(scenario);
  const [session, setSession] = useState<RoleplaySession>(() => ({
    scenarioId: scenario.id,
    startedAt: new Date().toISOString(),
    turnIndex: 0,
    messages: [
      {
        id: msgId(),
        role: "guest",
        english: opening.english,
        chinese: opening.chinese,
        at: new Date().toISOString(),
      },
    ],
    scores: [],
    mood: opening.mood,
    completed: false,
  }));
  const [input, setInput] = useState("");
  const [hintOpen, setHintOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { speak, speaking, supported: ttsSupported } = useSpeech();
  const voice = useRoleplayVoice({ lang: "en-US" });

  const currentTurn = scenario.turns[session.turnIndex];
  const latestGuest = [...session.messages].reverse().find((m) => m.role === "guest");
  const avatar = getGuestAvatarForScenario(scenario.characterId);

  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [session.messages, loading]);

  useEffect(() => {
    if (voice.livePreview) setInput(voice.livePreview);
  }, [voice.livePreview]);

  const handleStopVoice = async () => {
    const text = await voice.stop();
    if (text) setInput(text);
  };

  const speakGuest = useCallback(
    (text: string) => {
      if (ttsSupported) speak(text, "en-US");
    },
    [speak, ttsSupported]
  );

  useEffect(() => {
    speakGuest(opening.english);
  }, [opening.english, speakGuest]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || session.completed) return;

    if (session.turnIndex === 0 && session.scores.length === 0 && !canStartNewLearning()) {
      notifyLearningBlocked();
      return;
    }

    const staffMsg: RoleplayMessage = {
      id: msgId(),
      role: "staff",
      english: trimmed,
      at: new Date().toISOString(),
    };

    setLoading(true);
    setInput("");
    void voice.stop();
    setSession((s) => ({
      ...s,
      messages: [...s.messages, staffMsg],
    }));

    try {
      const res = await fetch("/api/ai-coach/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id,
          staffMessage: trimmed,
          turnIndex: session.turnIndex,
          mood: session.mood,
          history: session.messages.map((m) => ({
            role: m.role,
            english: m.english,
          })),
        }),
      });

      const data = (await res.json()) as {
        english: string;
        chinese: string;
        mood: RoleplaySession["mood"];
        staffScore: number;
        feedback: string;
        sessionComplete: boolean;
      };

      const guestMsg: RoleplayMessage = {
        id: msgId(),
        role: "guest",
        english: data.english,
        chinese: data.chinese,
        at: new Date().toISOString(),
      };

      setLastFeedback(data.feedback);

      const next: RoleplaySession = {
        ...session,
        messages: [...session.messages, staffMsg, guestMsg],
        scores: [...session.scores, data.staffScore],
        mood: data.mood,
        turnIndex: session.turnIndex + 1,
        completed: data.sessionComplete,
        completedAt: data.sessionComplete ? new Date().toISOString() : undefined,
      };

      setSession(next);
      saveRoleplaySession(next);
      speakGuest(data.english);

      if (data.sessionComplete) {
        const alreadyDone = getCompletedScenarioIds().includes(scenario.id);
        markScenarioCompleted(scenario.id);
        if (!alreadyDone) afterLearningCompletion();
        const profile = loadProfile();
        appendLearningHistory({
          employeeId: profile.userId,
          at: new Date().toISOString(),
          phase: "role",
          ask: "skill",
          title: `AI 对练 · ${scenario.title}`,
          subtitle: `得分 ${Math.round(next.scores.reduce((a, b) => a + b, 0) / next.scores.length)}`,
        });
      }
    } catch {
      setLastFeedback("网络错误，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const avgScore =
    session.scores.length > 0
      ? Math.round(session.scores.reduce((a, b) => a + b, 0) / session.scores.length)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f0f0f0]">
      {/* 顶栏 */}
      <header className="flex h-12 shrink-0 items-center border-b border-[#e0e0e0] bg-white px-2">
        <button
          type="button"
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full text-[#333] hover:bg-[#f0f0f0]"
          aria-label="返回"
        >
          <ChevronLeft className="size-6" strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-center text-base font-extrabold text-[#333]">
          AI 模拟对练
        </h1>
        <button
          type="button"
          onClick={() => setHintOpen((v) => !v)}
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            hintOpen ? "bg-amber-100 text-amber-700" : "text-[#666] hover:bg-[#f0f0f0]"
          )}
          aria-label="提示"
        >
          <Lightbulb className="size-5" />
        </button>
      </header>

      {/* 视频区 */}
      <div className="relative h-[168px] w-full shrink-0">
        <GuestVideoPanel
          avatarUrl={avatar.url}
          avatarPosition={avatar.position}
          guestName={scenario.guestName}
          guestPersona={scenario.guestPersona}
          mood={session.mood}
          speaking={speaking || loading}
          subtitle={speaking || loading ? latestGuest?.english : undefined}
          subtitleCn={speaking || loading ? latestGuest?.chinese : undefined}
        />
        <div className="absolute bottom-3 left-3 z-10 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
          {scenario.title} · 回合 {Math.min(session.turnIndex + 1, scenario.turns.length)}/
          {scenario.turns.length}
          {avgScore !== null && ` · ${avgScore}分`}
        </div>
      </div>

      {/* 提示浮层 */}
      {hintOpen && currentTurn && !session.completed && (
        <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-extrabold text-amber-900">本轮提示</p>
              <p className="mt-1 text-xs font-semibold text-amber-800">{currentTurn.staffHint}</p>
              <p className="mt-1 text-[10px] text-amber-700/80">{currentTurn.modelAnswer}</p>
            </div>
            <button type="button" onClick={() => setHintOpen(false)} className="text-amber-600">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* 对话区 */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mx-auto max-w-lg space-y-5">
          {session.messages.map((msg) =>
            msg.role === "guest" ? (
              <div key={msg.id} className="flex items-start gap-2.5">
                <GuestChatAvatar
                  avatarUrl={avatar.url}
                  avatarPosition={avatar.position}
                  guestName={scenario.guestName}
                  size="sm"
                />
                <div className="max-w-[78%] rounded-lg bg-[#e8e8e8] px-3.5 py-2.5">
                  {msg.chinese && (
                    <p className="text-sm font-semibold leading-relaxed text-[#333]">
                      {msg.chinese}
                    </p>
                  )}
                  <p
                    className={cn(
                      "font-semibold leading-relaxed text-[#555]",
                      msg.chinese ? "mt-1 text-xs" : "text-sm text-[#333]"
                    )}
                  >
                    {msg.english}
                  </p>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex items-start justify-end gap-2.5">
                <div className="max-w-[78%] rounded-2xl bg-[#3d3d3d] px-3.5 py-2.5">
                  <p className="text-sm font-semibold leading-relaxed text-white">
                    {msg.english}
                  </p>
                </div>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#3d3d3d] text-xs font-extrabold text-white">
                  我
                </div>
              </div>
            )
          )}

          {loading && (
            <p className="text-center text-xs font-semibold text-[#999]">客人正在回应…</p>
          )}

          {session.completed && (
            <div className="rounded-xl bg-white p-4 text-center shadow-sm">
              <p className="font-extrabold text-[#333]">对练完成</p>
              <p className="mt-1 text-xs font-semibold text-[#888]">
                平均得分 {avgScore ?? "—"}
              </p>
              <button
                type="button"
                onClick={onBack}
                className="mt-3 rounded-full bg-[#3d3d3d] px-6 py-2 text-xs font-bold text-white"
              >
                返回场景列表
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 反馈 */}
      {lastFeedback && !session.completed && (
        <div className="shrink-0 border-t border-amber-100 bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-800">
          {lastFeedback}
        </div>
      )}

      {/* 底部输入栏 */}
      {!session.completed && (
        <div className="shrink-0 border-t border-[#e0e0e0] bg-white px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (voice.recording) void handleStopVoice();
                else {
                  setInput("");
                  void voice.start();
                }
              }}
              disabled={!voice.supported || voice.busy}
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                voice.recording
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-[#ddd] text-[#666] hover:border-[#bbb]",
                voice.busy && "opacity-50"
              )}
              aria-label="语音输入"
            >
              <Mic className={cn("size-5", voice.recording && "animate-pulse")} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的前台英语应对…"
              className="h-10 flex-1 rounded-full border border-[#e0e0e0] bg-[#fafafa] px-4 text-sm font-semibold text-[#333] outline-none placeholder:text-[#bbb] focus:border-[#999]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void sendMessage(input);
                }
              }}
            />

            <button
              type="button"
              disabled={!input.trim() || loading}
              onClick={() => void sendMessage(input)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#3d3d3d] text-white transition-opacity disabled:opacity-40"
              aria-label="发送"
            >
              <ArrowUp className="size-5" strokeWidth={2.5} />
            </button>
          </div>

          {voice.recording && (
            <button
              type="button"
              onClick={() => void handleStopVoice()}
              className="mx-auto mt-2 flex max-w-lg items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-red-600"
            >
              <Square className="size-3.5 fill-current" />
              停止录音
            </button>
          )}

          <p
            className={cn(
              "mt-1.5 text-center text-[10px] font-bold",
              voice.error ? "text-red-500" : voice.recording ? "text-secondary" : "text-[#999]"
            )}
          >
            {voice.error ?? voice.hint}
          </p>
        </div>
      )}
    </div>
  );
}
