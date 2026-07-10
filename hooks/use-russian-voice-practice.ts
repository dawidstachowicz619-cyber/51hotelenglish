"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

type VoiceMode = "recorder" | "webspeech";

type UseRussianVoicePracticeOptions = {
  lang?: string;
};

function getRecorderMimeType(): string {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/aac", "audio/ogg"];
  for (const type of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "audio/webm";
}

function hasRecorderSupport(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

function createMediaRecorder(stream: MediaStream): { recorder: MediaRecorder; mimeType: string } {
  const preferred = getRecorderMimeType();
  if (preferred) {
    try {
      return { recorder: new MediaRecorder(stream, { mimeType: preferred }), mimeType: preferred };
    } catch {
      // fall through
    }
  }
  const recorder = new MediaRecorder(stream);
  return { recorder, mimeType: recorder.mimeType || "audio/webm" };
}

/** Web Speech 在 iOS / 微信 / 非 Chrome 上常假启动、无结果 */
export function isUnreliableWebSpeech(): boolean {
  if (typeof navigator === "undefined") return true;
  const ua = navigator.userAgent;
  if (/MicroMessenger/i.test(ua)) return true;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  if (/Android/i.test(ua) && !/Chrome\//i.test(ua)) return true;
  return false;
}

function pickVoiceMode(): VoiceMode {
  if (isUnreliableWebSpeech()) return "recorder";
  if (hasRecorderSupport()) return "recorder";
  return "webspeech";
}

export function useRussianVoicePractice({
  lang = "ru-RU",
}: UseRussianVoicePracticeOptions = {}) {
  const [mode] = useState<VoiceMode>(pickVoiceMode);
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingSelfCheck, setPendingSelfCheck] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedMimeRef = useRef("audio/webm");
  const skipTranscribeRef = useRef(false);

  const webSpeech = useSpeechRecognition({ lang, continuous: false });

  useEffect(() => {
    if (mode === "recorder") {
      setSupported(hasRecorderSupport());
      return;
    }
    setSupported(webSpeech.supported);
  }, [mode, webSpeech.supported]);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const transcribeBlob = useCallback(
    async (blob: Blob, mimeType: string) => {
      setTranscribing(true);
      setError(null);

      if (blob.size < 200) {
        setError("录音太短，请按住多说一秒再松开。");
        setTranscribing(false);
        return;
      }

      try {
        const form = new FormData();
        form.append("audio", blob, mimeType.includes("mp4") ? "speech.m4a" : "speech.webm");
        form.append("lang", lang);

        const res = await fetch("/api/ai-coach/transcribe", { method: "POST", body: form });
        if (res.ok) {
          const data = (await res.json()) as { text?: string };
          const text = (data.text ?? "").trim();
          if (text) {
            setTranscript(text);
            setTranscribing(false);
            return;
          }
        }
      } catch {
        // fall through to self-check
      }

      setTranscribing(false);
      setPendingSelfCheck(true);
    },
    [lang]
  );

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setRecording(false);
      return;
    }
    try {
      recorder.stop();
    } catch {
      releaseStream();
      mediaRecorderRef.current = null;
      setRecording(false);
    }
  }, [releaseStream]);

  const startRecording = useCallback(async () => {
    if (!hasRecorderSupport()) {
      setError("当前浏览器不支持录音，请点喇叭听发音后用选择题练习。");
      return;
    }
    if (recording || transcribing) return;

    try {
      setError(null);
      setTranscript("");
      setPendingSelfCheck(false);
      skipTranscribeRef.current = false;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const { recorder, mimeType } = createMediaRecorder(stream);
      recordedMimeRef.current = mimeType;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        releaseStream();
        mediaRecorderRef.current = null;
        setError("录音出错，请重试。");
        setRecording(false);
      };

      recorder.onstop = () => {
        releaseStream();
        mediaRecorderRef.current = null;
        setRecording(false);

        if (skipTranscribeRef.current) return;

        const blob = new Blob(chunksRef.current, {
          type: recordedMimeRef.current || mimeType,
        });
        void transcribeBlob(blob, recordedMimeRef.current || mimeType);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(200);
      setRecording(true);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setError("请允许麦克风权限后重试。");
      } else if (name === "NotFoundError") {
        setError("未检测到麦克风设备。");
      } else {
        setError("无法访问麦克风，请点喇叭听发音。");
      }
      setRecording(false);
    }
  }, [recording, transcribing, releaseStream, transcribeBlob]);

  const start = useCallback(() => {
    setPendingSelfCheck(false);
    setTranscript("");
    setError(null);

    if (mode === "recorder") {
      void startRecording();
      return;
    }
    webSpeech.start();
  }, [mode, startRecording, webSpeech]);

  const stop = useCallback(() => {
    if (mode === "recorder") {
      stopRecording();
      return;
    }
    webSpeech.stop();
  }, [mode, stopRecording, webSpeech]);

  const confirmSelfCheck = useCallback((passed: boolean) => {
    setPendingSelfCheck(false);
    setTranscript(passed ? "self-check-pass" : "");
    if (!passed) {
      setError("没关系，再听一遍标准发音后重录。");
    }
  }, []);

  useEffect(() => {
    return () => {
      skipTranscribeRef.current = true;
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        // ignore
      }
      releaseStream();
    };
  }, [releaseStream]);

  const listening = mode === "recorder" ? recording : webSpeech.listening;
  const displayTranscript =
    mode === "recorder"
      ? pendingSelfCheck
        ? ""
        : transcript && transcript !== "self-check-pass"
          ? transcript
          : ""
      : webSpeech.displayTranscript;

  return {
    mode,
    supported,
    listening,
    transcribing,
    transcript:
      transcript === "self-check-pass"
        ? ""
        : mode === "recorder"
          ? transcript
          : webSpeech.transcript,
    interimTranscript: mode === "recorder" ? "" : webSpeech.interimTranscript,
    displayTranscript,
    error: error ?? (mode === "webspeech" ? webSpeech.error : null),
    pendingSelfCheck,
    start,
    stop,
    confirmSelfCheck,
  };
}
