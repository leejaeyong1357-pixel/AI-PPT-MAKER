"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import mockExams from "@/data/mock_exams.json";
import type { MockExamResult } from "@/types";

export default function MockListPage() {
  const router = useRouter();
  const [results, setResults] = useState<MockExamResult[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!storage.isSetupComplete()) {
      router.push("/setup");
      return;
    }
    setResults(storage.getMockResults());
    setMounted(true);
  }, [router]);

  if (!mounted) return null;

  const exams = mockExams.exams as any[];
  const buckets = {
    easy: exams.filter((e) => e.difficulty === "easy"),
    medium: exams.filter((e) => e.difficulty === "medium"),
    hard: exams.filter((e) => e.difficulty === "hard"),
  };

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/dashboard" className="text-xs text-teczen-gray-600 hover:text-teczen-navy mb-1 inline-block">
            ← 대시보드
          </Link>
          <h1 className="text-3xl font-bold text-teczen-gray-900 mb-1">모의고사</h1>
          <p className="text-teczen-gray-600">
            실제 시험과 동일한 13분, 4가지 유형 연속 진행. 50개 세트 준비됨.
          </p>
        </div>

        {results.length > 0 && (
          <Card className="mb-6">
            <h2 className="font-bold text-teczen-gray-900 mb-3">최근 모의고사 결과</h2>
            <div className="space-y-2">
              {results
                .slice(-5)
                .reverse()
                .map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm p-2 hover:bg-teczen-gray-50 rounded"
                  >
                    <span className="text-teczen-gray-700">{r.examId}</span>
                    <span className="font-bold text-teczen-navy">
                      Lv {r.estimatedLevel} ({r.totalScore}점)
                    </span>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {(["easy", "medium", "hard"] as const).map((diff) => (
          <div key={diff} className="mb-6">
            <h2 className="text-lg font-bold text-teczen-gray-900 mb-3 capitalize flex items-center gap-2">
              {diff === "easy" ? "쉬움" : diff === "medium" ? "보통" : "어려움"}
              <span className="text-xs text-teczen-gray-500 font-normal">
                ({buckets[diff].length}세트)
              </span>
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
              {buckets[diff].map((exam: any) => {
                const done = results.some((r) => r.examId === exam.id);
                return (
                  <Link key={exam.id} href={`/mock/${exam.id}`}>
                    <Card className="hover:border-teczen-navy cursor-pointer transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-teczen-red">
                          {exam.id.replace("mock_", "#")}
                        </span>
                        {done && <span className="text-xs text-green-600">✓</span>}
                      </div>
                      <div className="font-bold text-sm text-teczen-gray-900 mb-1">
                        {exam.title.replace(/Mock Exam \d+ - /, "")}
                      </div>
                      <div className="text-xs text-teczen-gray-500">
                        목표: {exam.target_score}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
