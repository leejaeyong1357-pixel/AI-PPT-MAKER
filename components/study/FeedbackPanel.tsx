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
  onRestart: () => void;
}

export default function FeedbackPanel({
  loading,
  feedback,
  userAnswer,
  sampleAnswer,
  onRestart,
}: Props) {
  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-teczen-navy border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-teczen-gray-700">AI가 답변을 엄격하게 채점하고 있어요...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!feedback) return null;

  const addToVocab = (phrase: string) => {
    const word = phrase.split(/[—:,(]/)[0].trim().slice(0, 60);
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
              <span className="text-5xl font-black text-teczen-navy">
                {feedback.scoreEstimate}
              </span>
              <span className="text-teczen-gray-600">/ 96</span>
              <span className="ml-2 px-3 py-1 bg-teczen-navy/10 text-teczen-navy rounded-full text-sm font-semibold">
                {levelLabel(feedback.estimatedLevel)}
              </span>
            </div>
          </div>
          <Button onClick={onRestart} variant="secondary" size="sm">
            다시 풀기
          </Button>
        </div>

        <div className="w-full bg-teczen-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teczen-navy to-teczen-red h-2 transition-all"
            style={{ width: `${(feedback.scoreEstimate / 96) * 100}%` }}
          />
        </div>
      </Card>

      {feedback.criteria && (
        <Card>
          <h3 className="font-bold text-teczen-gray-900 mb-1">📊 SPA 채점표 (5개 평가영역)</h3>
          <p className="text-xs text-teczen-gray-500 mb-4">
            현대차그룹 공식 SPA 채점 기준. 영역별 만점이 다릅니다.
          </p>
          <div className="space-y-3">
            {[
              { key: "pronunciation", label: "발음", desc: "Pronunciation · 억양·강세·속도", max: 12 },
              { key: "listening", label: "청취·답변", desc: "Listening & Response · 이해·요약·관련성", max: 36 },
              { key: "vocabulary", label: "어휘", desc: "Vocabulary · 어휘 정확도·고급 표현", max: 12 },
              { key: "grammar", label: "문법", desc: "Grammar · 시제·구문·연결사", max: 24 },
              { key: "fluency", label: "유창성", desc: "Fluency · 논리 흐름·자유로운 표현", max: 12 },
            ].map((c) => {
              const v = Math.max(0, Math.min(c.max, (feedback.criteria as any)[c.key] ?? 0));
              const pct = (v / c.max) * 100;
              const color =
                pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-teczen-blue" : pct >= 25 ? "bg-amber-500" : "bg-teczen-red";
              return (
                <div key={c.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm font-bold text-teczen-gray-900">{c.label}</span>
                      <span className="text-xs text-teczen-gray-500 ml-2">{c.desc}</span>
                    </div>
                    <span className="text-sm font-bold tabular-nums">
                      <span className="text-teczen-blue">{v}</span>
                      <span className="text-teczen-gray-400"> / {c.max}</span>
                    </span>
                  </div>
                  <div className="w-full bg-teczen-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${color} h-3 rounded-full transition-all`}
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="border-t border-teczen-gray-200 pt-3 mt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-teczen-ink">총점</span>
              <span className="text-lg font-black text-teczen-navy">
                {feedback.scoreEstimate} <span className="text-sm text-teczen-gray-500">/ 96</span>
              </span>
            </div>
          </div>
        </Card>
      )}

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
    </div>
  );
}
