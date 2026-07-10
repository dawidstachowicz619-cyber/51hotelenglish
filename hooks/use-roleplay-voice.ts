"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { transcribeAudioBlob } from "@/lib/speech/transcribe-client";
import { preloadBrowserWhisper } from "@/lib/speech/browser-whisper";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

type VoiceState = "idle" | "recording" | "transcribing" | "loading-model";

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

export function useRoleplayVoice({ lang = "en-US" } = {}) {
  const [state, setState] = useState<VoiceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedMimeRef = useRef("audio/webm");
  const skipTranscribeRef = useRef(false);
  const liveTextRef = useRef("");

  const webSpeech = useSpeechRecognition({ lang, continuous: true });
  const webSpeechRef = useRef(webSpeech);
  webSpeechRef.current = webSpeech;

  useEffect(() => {
    setSupported(hasRecorderSupport());
    void preloadBrowserWhisper().catch(() => {
      // 预加载失败不阻断，停止录音时再试
    });
  }, []);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const transcribeRecording = useCallback(
    async (blob: Blob) => {
      if (blob.size < 200) {
        setError("录音太短，请多说几句。");
        setState("idle");
        return null;
      }

      setState("loading-model");
      setError(null);

      const liveText = liveTextRef.current.trim();
      if (liveText) {
        setState("idle");
        return liveText;
      }

      try {
        setState("transcribing");
        const { text } = await transcribeAudioBlob(blob, lang);
        setState("idle");
        return text;
      } catch {
        if (liveText) {
          setState("idle");
          return liveText;
        }
        setError("语音识别失败，请用 Chrome/Edge 重试或直接打字。");
        setState("idle");
        return null;
      }
    },
    [lang]
  );

  const stopRecording = useCallback(() => {
    webSpeechRef.current.stop();
    liveTextRef.current =
      webSpeechRef.current.transcript.trim() ||
      webSpeechRef.current.interimTranscript.trim();

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") {
      setState("idle");
      return Promise.resolve(liveTextRef.current || null);
    }

    return new Promise<string | null>((resolve) => {
      recorder.onstop = () => {
        releaseStream();
        mediaRecorderRef.current = null;

        if (skipTranscribeRef.current) {
          setState("idle");
          resolve(null);
          return;
        }

        const blob = new Blob(chunksRef.current, { type: recordedMimeRef.current });
        void transcribeRecording(blob).then(resolve);
      };

      try {
        recorder.stop();
      } catch {
        releaseStream();
        setState("idle");
        resolve(liveTextRef.current || null);
      }
    });
  }, [releaseStream, transcribeRecording]);

  const startRecording = useCallback(async () => {
    if (!hasRecorderSupport()) {
      setError("当前浏览器不支持录音。");
      return;
    }
    if (state !== "idle") return;

    try {
      setError(null);
      liveTextRef.current = "";
      skipTranscribeRef.current = false;
      chunksRef.current = [];

      webSpeechRef.current.start();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const mimeType = getRecorderMimeType();
      let recorder: MediaRecorder;
      try {
        recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      } catch {
        recorder = new MediaRecorder(stream);
      }

      recordedMimeRef.current = recorder.mimeType || mimeType || "audio/webm";

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onerror = () => {
        releaseStream();
        mediaRecorderRef.current = null;
        webSpeechRef.current.stop();
        setError("录音出错，请重试。");
        setState("idle");
      };

      mediaRecorderRef.current = recorder;
      recorder.start(200);
      setState("recording");
    } catch (err) {
      webSpeechRef.current.stop();
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setError("请允许麦克风权限。");
      } else {
        setError("无法访问麦克风。");
      }
      setState("idle");
    }
  }, [releaseStream, state]);

  const stop = useCallback(() => stopRecording(), [stopRecording]);

  const toggle = useCallback(async () => {
    if (state === "recording") return stopRecording();
    if (state === "idle") await startRecording();
  }, [startRecording, state, stopRecording]);

  useEffect(() => {
    return () => {
      skipTranscribeRef.current = true;
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        // ignore
      }
      releaseStream();
      webSpeechRef.current.stop();
    };
  }, [releaseStream]);

  const recording = state === "recording";
  const busy = state === "transcribing" || state === "loading-model";

  const hint = busy
    ? state === "loading-model"
      ? "正在加载语音模型（首次约 40MB）…"
      : "正在识别语音…"
    : recording
      ? "正在录音，点击下方停止"
      : "点击麦克风开始说话";

  const livePreview =
    webSpeech.listening && webSpeech.displayTranscript
      ? webSpeech.displayTranscript
      : "";

  return {
    supported,
    recording,
    busy,
    active: recording || busy,
    livePreview,
    error: error ?? (webSpeech.error && !recording ? webSpeech.error : null),
    toggle,
    stop,
    start: startRecording,
    hint,
  };
}
