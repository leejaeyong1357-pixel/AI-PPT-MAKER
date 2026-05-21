"use client";

import type { AiFeedback } from "@/types";
import { levelLabel } from "@/lib/scoring";
import { storage } from "@/lib/storage";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface Props {
  loading: boolean;
  feedback: AiFeedback | null;
  userAnswer: string;
  sampleAnswer: string;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onRestart: () => void;
}

export default function FeedbackPanel({
  loading,
  feedback,
  userAnswer,
  sampleAnswer,
  bookmarked,
  onToggleBookmark,
  onRestart,
}: Props) {
  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-teczen-navy border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-teczen-gray-700">AI가 답변을 분석하고 있어요...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!feedback) return null;

  const addToVocab = (phrase: string) => {
    const word = phrase.split(/[—:,]/)[0].trim().slice(0, 50);
    storage.addVocab({
      word,
      meaning: phrase,
      example: userAnswer,
      source: "AI 피드백",
      addedAt: Date.now(),
    });
    alert(`"${word}" 단어장에 추가됨`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-semibold text-teczen-red mb-1">예상 점수</div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-teczen-navy">
                {feedback.scoreEstimate}
              </span>
              <span className="text-teczen-gray-600">/ 96</span>
              <span className="ml-2 px-3 py-1 bg-teczen-navy/10 text-teczen-navy rounded-full text-sm font-semibold">
                {levelLabel(feedback.estimatedLevel)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onToggleBookmark} variant={bookmarked ? "danger" : "outline"} size="sm">
              {bookmarked ? "★ 저장됨" : "☆ 오답노트"}
            </Button>
            <Button onClick={onRestart} variant="secondary" size="sm">
              다시 풀기
            </Button>
          </div>
        </div>

        <div className="w-full bg-teczen-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teczen-navy to-teczen-red h-2 transition-all"
            style={{ width: `${(feedback.scoreEstimate / 96) * 100}%` }}
          />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {feedback.strengths.length > 0 && (
          <Card>
            <h3 className="font-bold text-teczen-gray-900 mb-2 flex items-center gap-2">
              <span className="text-green-600">✓</span> 잘한 점
            </h3>
            <ul className="space-y-1.5 text-sm text-teczen-gray-700">
              {feedback.strengths.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </Card>
        )}

        {feedback.improvements.length > 0 && (
          <Card>
            <h3 className="font-bold text-teczen-gray-900 mb-2 flex items-center gap-2">
              <span className="text-teczen-red">!</span> 개선 포인트
            </h3>
            <ul className="space-y-1.5 text-sm text-teczen-gray-700">
              {feedback.improvements.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {feedback.grammarIssues.length > 0 && (
        <Card>
          <h3 className="font-bold text-teczen-gray-900 mb-2">📝 문법 교정</h3>
          <ul className="space-y-1.5 text-sm text-teczen-gray-700">
            {feedback.grammarIssues.map((s, i) => (
              <li key={i} className="leading-relaxed">• {s}</li>
            ))}
          </ul>
        </Card>
      )}

      {feedback.vocabularySuggestions.length > 0 && (
        <Card>
          <h3 className="font-bold text-teczen-gray-900 mb-2">📚 어휘 제안</h3>
          <ul className="space-y-2 text-sm text-teczen-gray-700">
            {feedback.vocabularySuggestions.map((s, i) => (
              <li key={i} className="flex items-start justify-between gap-3">
                <span>• {s}</span>
                <button
                  onClick={() => addToVocab(s)}
                  className="text-xs text-teczen-navy hover:underline whitespace-nowrap"
                >
                  + 단어장
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {feedback.betterExpressions.length > 0 && (
        <Card>
          <h3 className="font-bold text-teczen-gray-900 mb-2">💡 자연스러운 표현</h3>
          <ul className="space-y-2 text-sm text-teczen-gray-700">
            {feedback.betterExpressions.map((s, i) => (
              <li key={i} className="flex items-start justify-between gap-3">
                <span>• {s}</span>
                <button
                  onClick={() => addToVocab(s)}
                  className="text-xs text-teczen-navy hover:underline whitespace-nowrap"
                >
                  + 단어장
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h3 className="font-bold text-teczen-gray-900 mb-2">⭐ 모범 답안 (목표 등급 기준)</h3>
        <p className="text-sm text-teczen-gray-700 leading-relaxed bg-teczen-navy/5 p-4 rounded-xl">
          {feedback.modelAnswer}
        </p>
      </Card>

      <Card>
        <h3 className="font-bold text-teczen-gray-900 mb-2">📖 참고 모범 답안 (데이터 기본)</h3>
        <p className="text-sm text-teczen-gray-600 leading-relaxed">{sampleAnswer}</p>
      </Card>
    </div>
  );
}
