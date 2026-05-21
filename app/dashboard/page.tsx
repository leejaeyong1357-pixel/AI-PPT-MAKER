"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { getDaysUntil, levelLabel, scoreToLevel } from "@/lib/scoring";
import type { UserSettings, StudyRecord, MockExamResult, UserSession } from "@/types";
import Header from "@/components/layout/Header";

const TYPE_INFO = [
  { type: 1, name: "Business Casual", desc: "일상 Q&A", icon: "💬" },
  { type: 2, name: "Opinion", desc: "의견 표현", icon: "💭" },
  { type: 3, name: "Visual", desc: "그래프/사진 묘사", icon: "📊" },
  { type: 4, name: "Summary", desc: "지문 요약", icon: "📝" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [mockResults, setMockResults] = useState<MockExamResult[]>([]);

  useEffect(() => {
    if (!storage.isLoggedIn()) {
      router.push("/login");
      return;
    }
    if (!storage.isSetupComplete()) {
      router.push("/setup");
      return;
    }
    setSession(storage.getSession());
    setSettings(storage.getSettings());
    setRecords(storage.getRecords());
    setMockResults(storage.getMockResults());
  }, [router]);

  if (!session || !settings) return null;

  const dDay = getDaysUntil(settings.examDate);
  const totalScore = records.reduce((sum, r) => sum + (r.score || 0), 0);
  const avgScore = records.length > 0 ? Math.round(totalScore / records.length) : 0;
  const estimatedLevel = avgScore > 0 ? scoreToLevel(avgScore) : 1;

  const typeStats = TYPE_INFO.map((t) => {
    const rs = records.filter((r) => r.type === t.type);
    return {
      ...t,
      count: rs.length,
      avg: rs.length > 0 ? Math.round(rs.reduce((s, x) => s + (x.score || 0), 0) / rs.length) : 0,
    };
  });

  const recentRecords = [...records].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="text-sm text-teczen-gray-500 mb-1">
            안녕하세요, <span className="font-bold text-teczen-ink">{session.name}</span>님
          </div>
          <h1 className="hero-headline text-4xl text-teczen-ink">
            오늘도 <span className="text-teczen-navy">한 단계 위로</span>.
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-teczen-navy to-teczen-navy-dark text-white rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-8xl opacity-10 font-black">D</div>
            <div className="text-xs font-bold text-blue-200 mb-2 uppercase tracking-wider">시험까지</div>
            <div className="font-brand text-6xl mb-1">
              D-{dDay >= 0 ? dDay : "—"}
            </div>
            <div className="text-sm text-blue-100">{settings.examDate}</div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-teczen-gray-200">
            <div className="text-xs font-bold text-teczen-red mb-2 uppercase tracking-wider">목표 → 현재</div>
            <div className="flex items-baseline gap-2 mb-1">
              <div className="font-brand text-5xl text-teczen-navy">Lv{settings.targetLevel}</div>
              <div className="text-2xl text-teczen-gray-400">←</div>
              <div className="font-brand text-3xl text-teczen-gray-600">
                {records.length > 0 ? `Lv${estimatedLevel}` : "—"}
              </div>
            </div>
            <div className="text-sm text-teczen-gray-600">
              {records.length > 0 ? `평균 ${avgScore}점` : "학습을 시작하면 예상 등급이 표시됩니다"}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-teczen-gray-200">
            <div className="text-xs font-bold text-teczen-gray-500 mb-2 uppercase tracking-wider">누적 학습</div>
            <div className="flex items-baseline gap-3 mb-1">
              <div className="font-brand text-5xl text-teczen-navy">{records.length}</div>
              <div className="text-base text-teczen-gray-500">문제</div>
            </div>
            <div className="text-sm text-teczen-gray-600">모의고사 {mockResults.length}회 완료</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-teczen-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-teczen-ink">유형별 학습</h2>
            <span className="text-xs text-teczen-gray-500">목표 Lv {settings.targetLevel} 기준 난이도 자동 적용</span>
          </div>
          <div className="grid md:grid-cols-4 gap-3">
            {typeStats.map((t) => (
              <Link
                key={t.type}
                href={`/study/${t.type}`}
                className="group block p-5 rounded-2xl border-2 border-teczen-gray-100 hover:border-teczen-navy hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{t.icon}</div>
                  <div className="text-xs font-bold text-teczen-red">유형 {t.type}</div>
                </div>
                <div className="font-bold text-teczen-ink group-hover:text-teczen-navy mb-1">{t.name}</div>
                <div className="text-xs text-teczen-gray-600 mb-3">{t.desc}</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-brand text-2xl text-teczen-navy">{t.count}</span>
                  <span className="text-xs text-teczen-gray-500">/ 평균 {t.avg || "—"}점</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Link href="/mock" className="md:col-span-2 bg-gradient-to-br from-teczen-red to-teczen-red-dark text-white rounded-3xl p-6 hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 font-black">M</div>
            <div className="relative">
              <div className="text-xs font-bold text-red-200 mb-1 uppercase tracking-wider">실전 모의고사</div>
              <h3 className="font-brand text-3xl mb-2">13분, 4유형 연속</h3>
              <p className="text-sm text-red-100 mb-4">점수대별 50회. 실제 시험 환경 그대로.</p>
              <div className="inline-flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all">
                시작하기 <span>→</span>
              </div>
            </div>
          </Link>

          <Link href="/vocab" className="bg-white border border-teczen-gray-200 rounded-3xl p-6 hover:border-teczen-navy hover:shadow-md transition-all">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="font-bold text-lg text-teczen-ink mb-1">단어장</h3>
            <p className="text-sm text-teczen-gray-600">AI 피드백에서 모은 표현</p>
          </Link>
        </div>

        {recentRecords.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-teczen-gray-200">
            <h2 className="font-bold text-lg text-teczen-ink mb-3">최근 학습</h2>
            <div className="space-y-2">
              {recentRecords.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-teczen-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-teczen-red">유형 {r.type}</span>
                      <span className="text-xs text-teczen-gray-500">
                        {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <p className="text-sm text-teczen-gray-700 truncate">{r.userAnswer}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="font-brand text-2xl text-teczen-navy">{r.score || "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
