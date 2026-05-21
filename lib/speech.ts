"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hasEnglishVoice, setHasEnglishVoice] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      setHasEnglishVoice(v.some((voice) => voice.lang.toLowerCase().startsWith("en")));
    };
    update();
    window.speechSynthesis.onvoiceschanged = update;
  }, []);

  const pickEnglishVoice = (): SpeechSynthesisVoice | undefined => {
    const englishOnly = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
    if (englishOnly.length === 0) return undefined;

    const priorities = [
      (v: SpeechSynthesisVoice) =>
        v.lang === "en-US" && /google/i.test(v.name) && /us/i.test(v.name),
      (v: SpeechSynthesisVoice) => v.lang === "en-US" && /google/i.test(v.name),
      (v: SpeechSynthesisVoice) => v.lang === "en-US" && /natural/i.test(v.name),
      (v: SpeechSynthesisVoice) => v.lang === "en-US" && !/korean/i.test(v.name),
      (v: SpeechSynthesisVoice) => v.lang.startsWith("en-") && !/korean/i.test(v.name),
      (v: SpeechSynthesisVoice) => v.lang.startsWith("en"),
    ];

    for (const p of priorities) {
      const match = englishOnly.find(p);
      if (match) return match;
    }
    return englishOnly[0];
  };

  const speak = (text: string, opts: { rate?: number } = {}) => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();

    const voice = pickEnglishVoice();
    if (!voice) {
      alert(
        "이 컴퓨터에는 영어 음성이 설치되어 있지 않습니다.\n\nWindows: 설정 → 시간 및 언어 → 음성 → 음성 추가 → 'English (United States)' 다운로드\n\nChrome 브라우저 권장.",
      );
      return;
    }

    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice.lang;
    u.voice = voice;
    u.rate = opts.rate ?? 0.95;
    u.pitch = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return { speak, stop, speaking, voices, hasEnglishVoice };
}

export function useSTT() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string>("");
  const recognitionRef = useRef<any>(null);
  const restartingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("이 브라우저는 음성 인식을 지원하지 않습니다 (Chrome 권장)");
      return;
    }
    const r = new SR();
    r.lang = "en-US";
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (e: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) {
          finalText += res[0].transcript + " ";
        } else {
          interimText += res[0].transcript;
        }
      }
      if (finalText) setTranscript((prev) => prev + finalText);
      setInterimTranscript(interimText);
    };

    r.onerror = (e: any) => {
      if (e.error === "no-speech" || e.error === "aborted") {
        return;
      }
      setError(
        e.error === "not-allowed"
          ? "마이크 권한이 차단되었습니다. 주소창 자물쇠 → 마이크 허용"
          : `음성 인식 오류: ${e.error}`,
      );
      setListening(false);
    };

    r.onend = () => {
      if (restartingRef.current) {
        try {
          r.start();
        } catch {}
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = r;

    return () => {
      restartingRef.current = false;
      try {
        r.stop();
      } catch {}
    };
  }, []);

  const start = () => {
    setError("");
    setTranscript("");
    setInterimTranscript("");
    restartingRef.current = true;
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch (e: any) {
      setError(e.message || "시작 실패");
    }
  };

  const stop = () => {
    restartingRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {}
    setListening(false);
  };

  const reset = () => {
    setTranscript("");
    setInterimTranscript("");
  };

  return { listening, transcript, interimTranscript, error, start, stop, reset };
}
