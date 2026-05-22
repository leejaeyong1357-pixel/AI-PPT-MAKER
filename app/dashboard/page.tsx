"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { getDaysUntil, scoreToLevel } from "@/lib/scoring";
import type { UserSettings, StudyRecord, MockExamResult, UserSession } from "@/types";
import Header from "@/components/layout/Header";

const TYPE_INFO = [
  { type: 1, name: "Business Casual", desc: "일상 Q&A" },
  { type: 2, name: "Opinion", desc: "의견 표현" },
  { type: 3, name: "Visual", desc: "그래프·사진 묘사" },
  { type: 4, name: "Summary", desc: "지문 요약" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [mockResults, setMockResults] = useState<MockExamResult[]>([]);
  const [activeTab, setActiveTab] = useState<"home" | "study" | "mock" | "stats">("home");

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
  const reachedTarget = estimatedLevel >= settings.targetLevel;

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-2 text-sm text-teczen-gray-500">
          안녕하세요, <span className="font-bold text-teczen-ink">{session.name}</span>님
        </div>
        <h1 className="headline-xl text-teczen-ink mb-2">
          언제 어디서든,
          <br />
          <span className="highlight-blue">목표 등급</span>까지.
        </h1>
        <p className="text-teczen-gray-600 mb-8">
          시간·장소 구애받지 않아요. 본인 등급에 맞춘 SPA 학습.
        </p>

        <div className="flex gap-1 border-b border-teczen-gray-200 mb-8 overflow-x-auto">
          <TabBtn active={activeTab === "home"} onClick={() => setActiveTab("home")}>
            홈
          </TabBtn>
          <TabBtn active={activeTab === "study"} onClick={() => setActiveTab("study")}>
            학습
          </TabBtn>
          <TabBtn active={activeTab === "mock"} onClick={() => setActiveTab("mock")}>
            모의고사
          </TabBtn>
          <TabBtn active={activeTab === "stats"} onClick={() => setActiveTab("stats")}>
            분석
          </TabBtn>
        </div>

        {activeTab === "home" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <MetricCard
                label="시험까지"
                value={dDay >= 0 ? `D-${dDay}` : "—"}
                sub={settings.examDate}
                accent="red"
              />
              <MetricCard
                label="목표 등급"
                value={`Lv ${settings.targetLevel}`}
                sub="우측 상단에서 변경"
                accent="blue"
              />
              <MetricCard
                label="현재 예상"
                value={records.length > 0 ? `Lv ${estimatedLevel}` : "—"}
                sub={records.length > 0 ? `평균 ${avgScore}점 / 96` : "학습 시작 전"}
                accent={reachedTarget ? "green" : "gray"}
              />
            </div>

            <div className="bg-white rounded-2xl border border-teczen-gray-200 p-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="text-xs font-bold text-teczen-blue mb-1">QUICK START</div>
                  <h2 className="text-2xl font-black text-teczen-ink">
                    오늘 <span className="highlight-blue">한 문제</span>만이라도.
                  </h2>
                </div>
                <Link
                  href="/study/1"
                  className="px-5 py-2.5 bg-teczen-blue text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  바로 시작 →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                {TYPE_INFO.map((t) => {
                  const rs = records.filter((r) => r.type === t.type);
                  const a = rs.length > 0 ? Math.round(rs.reduce((s, x) => s + (x.score || 0), 0) / rs.length) : 0;
                  return (
                    <Link
                      key={t.type}
                      href={`/study/${t.type}`}
                      className="block p-4 rounded-xl bg-teczen-gray-50 hover:bg-teczen-blue/10 transition-colors"
                    >
                      <div className="text-xs font-bold text-teczen-red mb-1">유형 {t.type}</div>
                      <div className="font-bold text-teczen-ink text-sm mb-1">{t.name}</div>
                      <div className="text-xs text-teczen-gray-500 mb-2">{t.desc}</div>
                      <div className="text-xs text-teczen-gray-700">
                        <b className="text-teczen-blue">{rs.length}</b>문제 · 평균 <b>{a || "—"}</b>점
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/mock"
                className="block bg-teczen-blue text-white rounded-2xl p-6 hover:bg-blue-700 transition-colors relative overflow-hidden"
              >
                <div className="absolute -right-6 -bottom-6 text-[10rem] font-black opacity-10">M</div>
                <div className="relative">
                  <div className="text-xs font-bold text-blue-200 mb-1">실전 시험 환경</div>
                  <div className="text-2xl font-black mb-2">13분, 4유형 연속</div>
                  <p className="text-sm text-blue-100 mb-3">점수대별 50회 세트</p>
                  <div className="text-sm font-bold">모의고사 시작 →</div>
                </div>
              </Link>
              <Link
                href="/vocab"
                className="block bg-white border border-teczen-gray-200 rounded-2xl p-6 hover:border-teczen-blue transition-colors"
              >
                <div className="text-xs font-bold text-teczen-blue mb-1">VOCAB</div>
                <div className="text-2xl font-black text-teczen-ink mb-2">내 단어장</div>
                <p className="text-sm text-teczen-gray-600 mb-3">AI 피드백에서 모은 표현 + TTS</p>
                <div className="text-sm font-bold text-teczen-blue">보러가기 →</div>
              </Link>
            </div>

            {records.length > 0 && (
              <div className="bg-white rounded-2xl border border-teczen-gray-200 p-6">
                <h3 className="font-bold text-teczen-ink mb-3">최근 학습</h3>
                <div className="space-y-2">
                  {[...records]
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .slice(0, 3)
                    .map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-teczen-gray-50 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-teczen-red mb-0.5">유형 {r.type}</div>
                          <p className="text-sm text-teczen-gray-700 truncate">{r.userAnswer}</p>
                        </div>
                        <div className="ml-3 text-right">
                          <div className="font-black text-2xl text-teczen-blue">{r.score || "—"}</div>
                          <div className="text-xs text-teczen-gray-500">/ 96</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "study" && (
          <div className="grid md:grid-cols-2 gap-4">
            {TYPE_INFO.map((t) => (
              <Link
                key={t.type}
                href={`/study/${t.type}`}
                className="block bg-white border-2 border-teczen-gray-200 hover:border-teczen-blue rounded-2xl p-6 transition-colors"
              >
                <div className="text-xs font-bold text-teczen-red mb-2">유형 {t.type}</div>
                <h3 className="text-2xl font-black text-teczen-ink mb-2">{t.name}</h3>
                <p className="text-sm text-teczen-gray-600 mb-4">{t.desc}</p>
                <div className="text-sm font-bold text-teczen-blue">학습 시작 →</div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === "mock" && (
          <div className="bg-white rounded-2xl border border-teczen-gray-200 p-8 text-center">
            <h3 className="text-2xl font-black text-teczen-ink mb-2">
              <span className="highlight-blue">실전</span> 모의고사
            </h3>
            <p className="text-teczen-gray-600 mb-6">점수대별 50회 세트. 13분 4유형 연속.</p>
            <Link
              href="/mock"
              className="inline-block px-8 py-3.5 bg-teczen-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              모의고사 목록 보기 →
            </Link>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="bg-white rounded-2xl border border-teczen-gray-200 p-8 text-center">
            <h3 className="text-2xl font-black text-teczen-ink mb-2">학습 분석</h3>
            <p className="text-teczen-gray-600 mb-6">유형별 강약점·점수 추이·모의고사 히스토리</p>
            <Link
              href="/stats"
              className="inline-block px-8 py-3.5 bg-teczen-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              통계 보러가기 →
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-base font-bold transition-colors relative ${
        active ? "text-teczen-blue" : "text-teczen-gray-500 hover:text-teczen-ink"
      }`}
    >
      {children}
      {active && (
        <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-teczen-blue rounded-full" />
      )}
    </button>
  );
}

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "red" | "blue" | "green" | "gray";
}) {
  const colors = {
    red: "text-teczen-red",
    blue: "text-teczen-blue",
    green: "text-green-600",
    gray: "text-teczen-gray-700",
  };
  return (
    <div className="bg-white border border-teczen-gray-200 rounded-2xl p-5">
      <div className="text-xs font-bold text-teczen-gray-500 uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className={`font-black text-4xl ${colors[accent]} mb-1`}>{value}</div>
      <div className="text-xs text-teczen-gray-500">{sub}</div>
    </div>
  );
}
