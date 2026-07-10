"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  isBrowserWhisperSupported,
  preloadBrowserWhisper,
  transcribeInBrowser,
} from "@/lib/speech/browser-whisper";

type VoiceInputState = "idle" | "recording" | "transcribing" | "loading-model" | "listening";

type UseVoiceInputOptions = {
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

export function useVoiceInput({ lang = "en-US" }: UseVoiceInputOptions = {}) {
  const [state, setState] = useState<VoiceInputState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedMimeRef = useRef("audio/webm");
  const skipTranscribeRef = useRef(false);

  useEffect(() => {
    setSupported(hasRecorderSupport() && isBrowserWhisperSupported());
    void preloadBrowserWhisper();
  }, []);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const transcribeWithBrowser = useCallback(async (blob: Blob) => {
    if (!isBrowserWhisperSupported()) {
      setError("当前浏览器不支持本地语音识别。");
      setState("idle");
      return;
    }

    setState("loading-model");
    setError(null);

    try {
      const text = await transcribeInBrowser(blob);
      if (!text) {
        setError("未识别到语音内容，请再试一次。");
        setState("idle");
        return;
      }
      setTranscript(text);
      setState("idle");
    } catch {
      setError("本地语音识别失败，请重试或直接打字。");
      setState("idle");
    }
  }, []);

  const transcribeBlob = useCallback(
    async (blob: Blob, mimeType: string) => {
      setState("transcribing");
      setError(null);

      if (blob.size < 200) {
        setError("录音太短，请多说几句后再停止。");
        setState("idle");
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
            setState("idle");
            return;
          }
        }

        await transcribeWithBrowser(blob);
      } catch {
        await transcribeWithBrowser(blob);
      }
    },
    [lang, transcribeWithBrowser]
  );

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      if (state === "recording") setState("idle");
      return;
    }
    try {
      recorder.stop();
    } catch {
      releaseStream();
      mediaRecorderRef.current = null;
      setState("idle");
    }
  }, [releaseStream, state]);

  const startRecording = useCallback(async () => {
    if (!hasRecorderSupport()) {
      setError("当前浏览器不支持录音，请直接打字。");
      return;
    }

    if (state === "recording" || state === "transcribing" || state === "loading-model") return;

    try {
      setError(null);
      setTranscript("");
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
        setState("idle");
      };

      recorder.onstop = () => {
        releaseStream();
        mediaRecorderRef.current = null;

        if (skipTranscribeRef.current) {
          setState("idle");
          return;
        }

        const blob = new Blob(chunksRef.current, {
          type: recordedMimeRef.current || mimeType,
        });
        void transcribeBlob(blob, recordedMimeRef.current || mimeType);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(200);
      setState("recording");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setError("请允许麦克风权限后重试。");
      } else if (name === "NotFoundError") {
        setError("未检测到麦克风设备。");
      } else {
        setError("无法访问麦克风，请直接打字输入。");
      }
      setState("idle");
    }
  }, [releaseStream, state, transcribeBlob]);

  const stop = useCallback(() => {
    if (state === "recording") stopRecording();
  }, [state, stopRecording]);

  const start = useCallback(() => {
    if (state === "transcribing" || state === "loading-model") return;
    void startRecording();
  }, [startRecording, state]);

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

  const recording = state === "recording";
  const transcribing = state === "transcribing" || state === "loading-model";
  const active = recording || transcribing;

  const hint = state === "loading-model"
    ? "首次加载本地语音模型，约 40MB，请稍候…"
    : state === "transcribing"
      ? "正在识别语音…"
      : recording
        ? "正在录音，点击下方停止"
        : "点击麦克风开始录音";

  return {
    supported,
    recording,
    listening: false,
    transcribing,
    active,
    transcript,
    error,
    start,
    stop,
    hint,
  };
}
