"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { QuestionType, Difficulty } from "@/types";
import { storage } from "@/lib/storage";
import { recommendedDifficulty } from "@/lib/scoring";
import StudySession from "@/components/study/StudySession";
import ChartRenderer from "@/components/charts/ChartRenderer";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type1 from "@/data/type1_business_casual.json";
import type2 from "@/data/type2_opinion.json";
import type3 from "@/data/type3_visual.json";
import type4 from "@/data/type4_summary.json";

const TYPE_INFO: Record<number, { name: string; desc: string }> = {
  1: { name: "Business Casual", desc: "일상/개인 관련 질문에 자연스럽게 답하기" },
  2: { name: "Opinion", desc: "주제에 대한 의견을 논리적 근거와 함께 표현" },
  3: { name: "Visual Description", desc: "그래프/사진을 보고 분석/묘사하기" },
  4: { name: "Passage Summary", desc: "들은 지문을 60초 내로 요약하기" },
};

export default function StudyPage() {
  const params = useParams<{ type: string }>();
  const type = Number(params?.type) as QuestionType;
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!storage.isSetupComplete()) {
      router.push("/setup");
      return;
    }
    const settings = storage.getSettings();
    setDifficulty(recommendedDifficulty(settings.targetLevel));
    setMounted(true);
  }, [router]);

  if (!mounted || ![1, 2, 3, 4].includes(type)) return null;

  const allItems = (() => {
    if (type === 1) return type1.questions;
    if (type === 2) return type2.questions;
    if (type === 3) return type3.items;
    return type4.passages;
  })();

  const filtered = difficulty === "all" ? allItems : allItems.filter((q: any) => q.difficulty === difficulty);
  const current = filtered[currentIdx % filtered.length];

  if (!current) return null;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-xs text-teczen-gray-600 hover:text-teczen-navy mb-1 inline-block">
              ← 대시보드
            </Link>
            <h1 className="text-2xl font-bold text-teczen-gray-900">
              유형 {type}. {TYPE_INFO[type].name}
            </h1>
            <p className="text-sm text-teczen-gray-600">{TYPE_INFO[type].desc}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-teczen-gray-500">진행</div>
            <div className="text-lg font-bold text-teczen-navy">
              {(currentIdx % filtered.length) + 1} / {filtered.length}
            </div>
          </div>
        </div>

        <Card className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-teczen-gray-600">난이도:</span>
            {(["all", "easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDifficulty(d);
                  setCurrentIdx(0);
                }}
                className={`px-3 py-1 text-xs rounded-lg font-semibold ${
                  difficulty === d
                    ? "bg-teczen-navy text-white"
                    : "bg-teczen-gray-100 text-teczen-gray-700 hover:bg-teczen-gray-200"
                }`}
              >
                {d === "all" ? "전체" : d === "easy" ? "쉬움" : d === "medium" ? "보통" : "어려움"}
              </button>
            ))}
            <span className="ml-auto text-xs text-teczen-gray-500">
              현재: <span className="font-semibold text-teczen-gray-800">{current.difficulty}</span> · {current.category}
            </span>
          </div>
        </Card>

        <StudySessionForType type={type} item={current} key={current.id} />

        <div className="mt-6 flex justify-between">
          <Button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            variant="secondary"
            disabled={currentIdx === 0}
          >
            ← 이전 문제
          </Button>
          <Button onClick={() => setCurrentIdx((i) => i + 1)}>다음 문제 →</Button>
        </div>
      </main>
    </>
  );
}

function StudySessionForType({ type, item }: { type: QuestionType; item: any }) {
  if (type === 3) {
    return (
      <StudySession
        type={3}
        questionId={item.id}
        question={item.question}
        sampleAnswer={item.sample_answer}
        visualContent={
          item.subtype === "photo" ? (
            <div>
              <div className="mb-3">
                <span className="text-xs font-semibold text-teczen-red">PHOTO</span>
                <p className="text-xs text-teczen-gray-600 mt-1">
                  사진 묘사: {item.image_description}
                </p>
              </div>
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.image_description}
                  className="w-full max-h-96 object-cover rounded-xl"
                />
              )}
            </div>
          ) : (
            <ChartRenderer item={item} />
          )
        }
      />
    );
  }

  if (type === 4) {
    return (
      <StudySession
        type={4}
        questionId={item.id}
        question="Listen to the passage and summarize the main points in your own words (60 seconds)."
        passageText={item.passage}
        sampleAnswer={item.sample_summary}
        passageRepeats={2}
      />
    );
  }

  return (
    <StudySession
      type={type}
      questionId={item.id}
      question={item.question}
      followUps={item.follow_ups}
      sampleAnswer={item.sample_answer}
    />
  );
}
