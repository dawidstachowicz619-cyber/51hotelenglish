"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseSpeechRecognitionOptions = {
  lang?: string;
  continuous?: boolean;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useSpeechRecognition({
  lang = "en-US",
  continuous = true,
}: UseSpeechRecognitionOptions = {}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const intentionalStopRef = useRef(false);
  const shouldRestartRef = useRef(false);
  const listenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearListenTimeout = useCallback(() => {
    if (listenTimeoutRef.current) {
      clearTimeout(listenTimeoutRef.current);
      listenTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    setSupported(!!getSpeechRecognitionCtor());
  }, []);

  const stop = useCallback(() => {
    intentionalStopRef.current = true;
    shouldRestartRef.current = false;
    clearListenTimeout();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, [clearListenTimeout]);

  const start = useCallback(() => {
    const SR = getSpeechRecognitionCtor();
    if (!SR) {
      setError("您的浏览器不支持语音识别，请直接打字输入。");
      return;
    }

    if (recognitionRef.current) {
      intentionalStopRef.current = true;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setError(null);
    setTranscript("");
    setInterimTranscript("");
    intentionalStopRef.current = false;
    shouldRestartRef.current = true;

    const recognition = new SR();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      clearListenTimeout();
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        setTranscript((prev) => `${prev} ${finalText}`.trim());
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      clearListenTimeout();
      if (intentionalStopRef.current || event.error === "aborted") {
        setListening(false);
        return;
      }

      shouldRestartRef.current = false;

      if (event.error === "no-speech") {
        setError("未检测到语音，请再试一次。");
      } else if (event.error === "not-allowed") {
        setError("请允许麦克风权限后重试。");
      } else if (event.error === "network") {
        setError("语音服务网络不可用，请改用录音模式或直接打字。");
      } else if (event.error === "audio-capture") {
        setError("未检测到麦克风，请检查设备连接。");
      } else if (event.error === "service-not-allowed") {
        setError("当前环境不支持语音输入，请直接打字。");
      } else {
        setError(`语音识别出错（${event.error}），请重试或直接打字。`);
      }
      setListening(false);
    };

    recognition.onend = () => {
      clearListenTimeout();
      if (intentionalStopRef.current || !shouldRestartRef.current) {
        setListening(false);
        recognitionRef.current = null;
        return;
      }

      try {
        recognition.start();
      } catch {
        setListening(false);
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
      clearListenTimeout();
      listenTimeoutRef.current = setTimeout(() => {
        if (!intentionalStopRef.current) {
          shouldRestartRef.current = false;
          recognition.stop();
          setError("语音识别超时，请改用录音模式或直接打字。");
          setListening(false);
        }
      }, 12000);
    } catch {
      setError("无法启动语音识别，请直接打字输入。");
      setListening(false);
      recognitionRef.current = null;
    }
  }, [lang, continuous, clearListenTimeout]);

  useEffect(() => {
    return () => {
      intentionalStopRef.current = true;
      shouldRestartRef.current = false;
      clearListenTimeout();
      recognitionRef.current?.stop();
    };
  }, [clearListenTimeout]);

  return {
    supported,
    listening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    displayTranscript: transcript || interimTranscript,
  };
}
