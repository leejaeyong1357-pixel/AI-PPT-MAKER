"use client";

import { useEffect, useState } from "react";
import { useTTS, useSTT } from "@/lib/speech";
import { storage } from "@/lib/storage";
import { getFeedback } from "@/lib/hchat";
import type { AiFeedback, QuestionType } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FeedbackPanel from "./FeedbackPanel";
import { HoverText } from "./WordHover";

interface Props {
  type: QuestionType;
  questionId: string;
  question: string;
  followUps?: string[];
  sampleAnswer: string;
  passageText?: string;
  visualContent?: React.ReactNode;
  passageRepeats?: number;
}

export default function StudySession({
  type,
  questionId,
  question,
  followUps = [],
  sampleAnswer,
  passageText,
  visualContent,
  passageRepeats = 2,
}: Props) {
  const { speak, stop: stopTTS, speaking } = useTTS();
  const {
    listening,
    transcript,
    interimTranscript,
    error: sttError,
    start: startSTT,
    stop: stopSTT,
    reset: resetSTT,
  } = useSTT();

  const [step, setStep] = useState<"intro" | "answer" | "feedback">("intro");
  const [editedAnswer, setEditedAnswer] = useState("");
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    if (listening) {
      setEditedAnswer((transcript + " " + interimTranscript).trim());
    }
  }, [transcript, interimTranscript, listening]);

  const playQuestion = () => {
    const text = type === 4 && passageText ? passageText : question;
    speak(text, { rate: type === 4 ? 0.9 : 0.95 });
    setPlayCount((c) => c + 1);
  };

  const submitAnswer = async () => {
    if (!editedAnswer.trim()) return;
    stopSTT();
    setLoadingFeedback(true);
    setStep("feedback");

    const settings = storage.getSettings();
    const result = await getFeedback(
      {
        type,
        question: type === 4 && passageText ? passageText : question,
        userAnswer: editedAnswer,
        sampleAnswer,
        targetLevel: settings.targetLevel,
      },
      { endpoint: settings.hchatEndpoint, apiKey: settings.hchatApiKey, model: settings.hchatModel },
    );
    setFeedback(result);
    setLoadingFeedback(false);

    storage.addRecord({
      id: `${questionId}_${Date.now()}`,
      questionId,
      type,
      userAnswer: editedAnswer,
      feedback: result,
      score: result.scoreEstimate,
      bookmarked: false,
      createdAt: Date.now(),
    });
  };

  const restart = () => {
    setStep("intro");
    setEditedAnswer("");
    setFeedback(null);
    setPlayCount(0);
    resetSTT();
    stopTTS();
  };

  return (
    <div className="space-y-4">
      {visualContent && <Card>{visualContent}</Card>}

      <Card>
        <div className="mb-3">
          <div className="text-xs font-semibold text-teczen-red mb-2">
            {type === 4 ? "PASSAGE (영어 단어 위에 마우스 → 한글)" : "QUESTION (영어 단어 위에 마우스 → 한글)"}
          </div>
          <HoverText text={type === 4 && passageText ? passageText : question} />
          {followUps.length > 0 && step !== "intro" && (
            <div className="mt-3 pt-3 border-t border-teczen-gray-100">
              <div className="text-xs font-semibold text-teczen-gray-500 mb-1">FOLLOW-UP</div>
              <div className="text-sm text-teczen-gray-700 space-y-1">
                {followUps.map((q, i) => (
                  <div key={i}>
                    <HoverText text={`• ${q}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Button
            onClick={speaking ? stopTTS : playQuestion}
            variant={speaking ? "danger" : "primary"}
            size="sm"
            disabled={type === 4 && playCount >= passageRepeats && !speaking}
          >
            {speaking ? "■ 정지" : type === 4 ? `▶ 듣기 (${playCount}/${passageRepeats})` : "▶ 문제 듣기"}
          </Button>

          {step === "intro" && (
            <Button onClick={() => setStep("answer")} variant="outline" size="sm">
              답변 시작 →
            </Button>
          )}
        </div>
      </Card>

      {step !== "intro" && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-teczen-red">YOUR ANSWER (실시간 인식)</div>
            <Button
              onClick={listening ? stopSTT : startSTT}
              variant={listening ? "danger" : "primary"}
              size="sm"
            >
              {listening ? "● 녹음 중지" : "🎤 음성 답변 시작"}
            </Button>
          </div>

          {sttError && (
            <div className="mb-3 text-xs text-teczen-red bg-teczen-red/5 p-2 rounded">
              {sttError}
            </div>
          )}

          <textarea
            value={editedAnswer}
            onChange={(e) => setEditedAnswer(e.target.value)}
            placeholder={
              listening
                ? "듣고 있어요... 영어로 말해주세요."
                : "🎤 버튼을 누르고 영어로 답변하거나, 직접 입력하세요."
            }
            className={`w-full min-h-[160px] border-2 rounded-xl p-4 text-base leading-relaxed focus:outline-none resize-y transition-colors ${
              listening ? "border-teczen-red bg-teczen-red/5" : "border-teczen-gray-300 focus:border-teczen-navy"
            }`}
          />
          {listening && interimTranscript && (
            <div className="text-sm text-teczen-navy mt-2 italic">
              <span className="inline-block w-2 h-2 bg-teczen-red rounded-full mr-1 animate-pulse" />
              인식 중: {interimTranscript}
            </div>
          )}
          {editedAnswer && (
            <div className="text-xs text-teczen-gray-500 mt-1">
              {editedAnswer.trim().split(/\s+/).filter(Boolean).length} 단어 ·{" "}
              {editedAnswer.split(/[.!?]+/).filter((s) => s.trim()).length} 문장
            </div>
          )}

          {step === "answer" && (
            <div className="flex gap-2 mt-3">
              <Button onClick={submitAnswer} disabled={!editedAnswer.trim()}>
                AI 채점 받기 →
              </Button>
              <Button onClick={() => { resetSTT(); setEditedAnswer(""); }} variant="ghost" size="sm">
                전체 지우기
              </Button>
            </div>
          )}
        </Card>
      )}

      {step === "feedback" && (
        <FeedbackPanel
          loading={loadingFeedback}
          feedback={feedback}
          userAnswer={editedAnswer}
          sampleAnswer={sampleAnswer}
          onRestart={restart}
        />
      )}
    </div>
  );
}
