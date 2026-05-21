"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { getDaysUntil, levelLabel, scoreToLevel } from "@/lib/scoring";
import type { UserSettings, StudyRecord, MockExamResult } from "@/types";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";

export default function DashboardPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [mockResults, setMockResults] = useState<MockExamResult[]>([]);

  useEffect(() => {
    if (!storage.isSetupComplete()) {
      router.push("/setup");
      return;
    }
    setSettings(storage.getSettings());
    setRecords(storage.getRecords());
    setMockResults(storage.getMockResults());
  }, [router]);

  if (!settings) return null;

  const dDay = getDaysUntil(settings.examDate);
  const totalScore = records.reduce((sum, r) => sum + (r.score || 0), 0);
  const avgScore = records.length > 0 ? Math.round(totalScore / records.length) : 0;
  const estimatedLevel = avgScore > 0 ? scoreToLevel(avgScore) : 1;

  const typeStats = [1, 2, 3, 4].map((t) => ({
    type: t,
    count: records.filter((r) => r.type === t).length,
    avgScore: (() => {
      const r = records.filter((rec) => rec.type === t);
      return r.length > 0
        ? Math.round(r.reduce((s, x) => s + (x.score || 0), 0) / r.length)
        : 0;
    })(),
  }));

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-teczen-gray-900 mb-1">대시보드</h1>
          <p className="text-teczen-gray-600">학습 현황과 진도를 한눈에 확인하세요.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-xs text-teczen-gray-600 mb-1">시험까지</div>
            <div className="text-3xl font-black text-teczen-red">
              D-{dDay >= 0 ? dDay : "✓"}
            </div>
            <div className="text-xs text-teczen-gray-500 mt-1">{settings.examDate}</div>
          </Card>
          <Card>
            <div className="text-xs text-teczen-gray-600 mb-1">목표 등급</div>
            <div className="text-3xl font-black text-teczen-navy">Lv {settings.targetLevel}</div>
            <div className="text-xs text-teczen-gray-500 mt-1">
              {levelLabel(settings.targetLevel)}
            </div>
          </Card>
          <Card>
            <div className="text-xs text-teczen-gray-600 mb-1">현재 예상</div>
            <div className="text-3xl font-black text-teczen-navy">
              {records.length > 0 ? `Lv ${estimatedLevel}` : "—"}
            </div>
            <div className="text-xs text-teczen-gray-500 mt-1">
              평균 {avgScore || "—"}점
            </div>
          </Card>
          <Card>
            <div className="text-xs text-teczen-gray-600 mb-1">학습 완료</div>
            <div className="text-3xl font-black text-teczen-navy">{records.length}</div>
            <div className="text-xs text-teczen-gray-500 mt-1">모의고사 {mockResults.length}회</div>
          </Card>
        </div>

        <Card className="mb-6">
          <h2 className="font-bold text-teczen-gray-900 mb-3">유형별 학습</h2>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { type: 1, name: "Business Casual", desc: "일상 Q&A" },
              { type: 2, name: "Opinion", desc: "의견 표현" },
              { type: 3, name: "Visual", desc: "그래프/사진 묘사" },
              { type: 4, name: "Summary", desc: "지문 요약" },
            ].map((t) => {
              const stat = typeStats.find((s) => s.type === t.type)!;
              return (
                <Link
                  key={t.type}
                  href={`/study/${t.type}`}
                  className="group block p-4 rounded-xl border-2 border-teczen-gray-200 hover:border-teczen-navy transition-colors"
                >
                  <div className="text-xs text-teczen-red font-semibold mb-1">유형 {t.type}</div>
                  <div className="font-bold text-teczen-gray-900 group-hover:text-teczen-navy">
                    {t.name}
                  </div>
                  <div className="text-xs text-teczen-gray-600 mb-2">{t.desc}</div>
                  <div className="text-xs text-teczen-gray-500">
                    완료 {stat.count}개 · 평균 {stat.avgScore || "—"}점
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/mock">
            <Card className="hover:border-teczen-navy cursor-pointer transition-colors">
              <h2 className="font-bold text-teczen-gray-900 mb-2">📝 모의고사</h2>
              <p className="text-sm text-teczen-gray-600 mb-3">
                실제 시험과 동일한 13분 형식. 점수대별 50회.
              </p>
              <div className="text-xs text-teczen-navy font-semibold">시작하기 →</div>
            </Card>
          </Link>
          <Link href="/vocab">
            <Card className="hover:border-teczen-navy cursor-pointer transition-colors">
              <h2 className="font-bold text-teczen-gray-900 mb-2">📚 단어장</h2>
              <p className="text-sm text-teczen-gray-600 mb-3">
                AI 피드백에서 모은 표현 모음 + TTS 재생.
              </p>
              <div className="text-xs text-teczen-navy font-semibold">보러가기 →</div>
            </Card>
          </Link>
        </div>
      </main>
    </>
  );
}
