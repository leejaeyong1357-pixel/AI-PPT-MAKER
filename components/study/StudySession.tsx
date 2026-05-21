"use client";

import { useEffect, useState } from "react";
import { useTTS, useSTT } from "@/lib/speech";
import { storage } from "@/lib/storage";
import { getFeedback } from "@/lib/hchat";
import type { AiFeedback, QuestionType, Level } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FeedbackPanel from "./FeedbackPanel";

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
  const [bookmarked, setBookmarked] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    setEditedAnswer((transcript + " " + interimTranscript).trim());
  }, [transcript, interimTranscript]);

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
      { endpoint: settings.hchatEndpoint, apiKey: settings.hchatApiKey },
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

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    const records = storage.getRecords();
    const last = records.filter((r) => r.questionId === questionId).pop();
    if (last) storage.updateRecord(last.id, { bookmarked: !bookmarked });
  };

  const restart = () => {
    setStep("intro");
    setEditedAnswer("");
    setFeedback(null);
    setPlayCount(0);
    setBookmarked(false);
    resetSTT();
    stopTTS();
  };

  return (
    <div className="space-y-4">
      {visualContent && <Card>{visualContent}</Card>}

      <Card>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="text-xs font-semibold text-teczen-red mb-1">
              {type === 4 ? "PASSAGE" : "QUESTION"}
            </div>
            <p className="text-lg font-semibold text-teczen-gray-900 leading-relaxed">
              {type === 4 && passageText ? passageText : question}
            </p>
            {followUps.length > 0 && step !== "intro" && (
              <div className="mt-3 pt-3 border-t border-teczen-gray-100">
                <div className="text-xs font-semibold text-teczen-gray-500 mb-1">FOLLOW-UP</div>
                <ul className="text-sm text-teczen-gray-700 space-y-1">
                  {followUps.map((q, i) => (
                    <li key={i}>• {q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
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
            <div className="text-xs font-semibold text-teczen-red">YOUR ANSWER</div>
            <div className="flex gap-2">
              <Button
                onClick={listening ? stopSTT : startSTT}
                variant={listening ? "danger" : "primary"}
                size="sm"
              >
                {listening ? "● 녹음 정지" : "🎤 음성 답변"}
              </Button>
            </div>
          </div>

          {sttError && (
            <div className="mb-3 text-xs text-teczen-red bg-teczen-red/5 p-2 rounded">
              {sttError} - 텍스트로 직접 입력하셔도 됩니다.
            </div>
          )}

          <textarea
            value={editedAnswer}
            onChange={(e) => setEditedAnswer(e.target.value)}
            placeholder={
              listening
                ? "듣고 있어요... 영어로 말해주세요."
                : "음성 답변을 시작하거나 직접 입력하세요."
            }
            className="w-full min-h-[140px] border border-teczen-gray-300 rounded-xl p-4 text-sm leading-relaxed focus:outline-none focus:border-teczen-navy resize-y"
          />
          {interimTranscript && (
            <div className="text-xs text-teczen-gray-500 mt-1 italic">
              인식 중: {interimTranscript}
            </div>
          )}

          {step === "answer" && (
            <div className="flex gap-2 mt-3">
              <Button onClick={submitAnswer} disabled={!editedAnswer.trim()}>
                AI 피드백 받기 →
              </Button>
              <Button onClick={resetSTT} variant="ghost" size="sm">
                지우기
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
          bookmarked={bookmarked}
          onToggleBookmark={toggleBookmark}
          onRestart={restart}
        />
      )}
    </div>
  );
}
