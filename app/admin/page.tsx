"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { levelLabel } from "@/lib/scoring";
import Header from "@/components/layout/Header";
import learnersData from "@/data/learners_mock.json";
import type { LearnerProfile } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TECZEN_COLORS, CHART_MONO_NAVY } from "@/lib/colors";

export default function AdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const session = storage.getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    if (!session.isAdmin) {
      alert("관리자 권한이 필요합니다.");
      router.push("/dashboard");
      return;
    }
    setMounted(true);
  }, [router]);

  if (!mounted) return null;

  const learners: LearnerProfile[] = learnersData.learners as any;
  const filtered = learners.filter((l) =>
    search ? l.name.includes(search) || l.team.includes(search) : true,
  );

  const top5 = [...learners]
    .sort((a, b) => b.recentScore - a.recentScore)
    .slice(0, 5);

  const totalLearners = learners.length;
  const activeLearners = learners.filter(
    (l) => Date.now() - l.lastActiveAt < 7 * 86400000,
  ).length;
  const avgScore = Math.round(
    learners.reduce((s, l) => s + l.averageScore, 0) / learners.length,
  );
  const targetReached = learners.filter((l) => l.estimatedLevel >= l.targetLevel).length;

  const byTeam = (() => {
    const map: Record<string, { count: number; sum: number }> = {};
    learners.forEach((l) => {
      if (!map[l.team]) map[l.team] = { count: 0, sum: 0 };
      map[l.team].count++;
      map[l.team].sum += l.averageScore;
    });
    return Object.entries(map).map(([team, { count, sum }]) => ({
      team,
      avg: Math.round(sum / count),
      count,
    }));
  })();

  const byLevel = [1, 2, 3, 4, 5, 6, 7, 8].map((lv) => ({
    level: `Lv${lv}`,
    count: learners.filter((l) => l.targetLevel === lv).length,
  }));

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <Link href="/dashboard" className="text-xs text-teczen-gray-600 hover:text-teczen-navy">
              ← 대시보드
            </Link>
            <h1 className="hero-headline text-3xl text-teczen-ink mt-1">관리자 대시보드</h1>
            <p className="text-sm text-teczen-gray-600">
              전체 학습자 현황 · employees.json 명단 기준
            </p>
          </div>
          <div className="text-xs text-teczen-gray-500">
            데이터: {totalLearners}명 / 최근 갱신:{" "}
            {new Date(Math.max(...learners.map((l) => l.lastActiveAt))).toLocaleString("ko-KR")}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <StatCard label="전체 학습자" value={`${totalLearners}명`} sub={`이번 주 활성 ${activeLearners}명`} />
          <StatCard label="전체 평균 점수" value={`${avgScore}점`} sub="96점 만점 기준" />
          <StatCard label="목표 도달자" value={`${targetReached}명`} sub={`${Math.round((targetReached / totalLearners) * 100)}% 달성`} />
          <StatCard label="평균 학습시간" value={`${Math.round(learners.reduce((s, l) => s + l.totalStudyMinutes, 0) / learners.length / 60)}h`} sub="누적 평균" />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-teczen-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-teczen-ink">🏆 우수 학습자 TOP 5</h2>
            <span className="text-xs text-teczen-gray-500">최근 점수 기준</span>
          </div>
          <div className="space-y-2">
            {top5.map((l, i) => (
              <div
                key={l.employeeId}
                className={`flex items-center gap-4 p-3 rounded-xl ${
                  i === 0 ? "bg-gradient-to-r from-teczen-navy/5 to-transparent border border-teczen-navy/20" : "bg-teczen-gray-50"
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg ${
                  i === 0 ? "bg-teczen-navy text-white" :
                  i === 1 ? "bg-teczen-gray-300 text-teczen-ink" :
                  i === 2 ? "bg-amber-200 text-amber-900" :
                  "bg-teczen-gray-100 text-teczen-gray-600"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teczen-ink">{l.name}</span>
                    <span className="text-xs text-teczen-gray-500">{l.team} · {l.position}</span>
                  </div>
                  <div className="text-xs text-teczen-gray-600">
                    목표 Lv {l.targetLevel} · 학습 {l.totalProblems}문제 · 모의고사 {l.mockExamCount}회
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-brand text-2xl text-teczen-navy">{l.recentScore}</div>
                  <div className="text-xs text-teczen-gray-500">{levelLabel(l.estimatedLevel)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-3xl p-6 border border-teczen-gray-200">
            <h2 className="font-bold text-lg text-teczen-ink mb-3">팀별 평균 점수</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byTeam} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 96]} />
                <YAxis type="category" dataKey="team" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avg" fill={TECZEN_COLORS.navy} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-teczen-gray-200">
            <h2 className="font-bold text-lg text-teczen-ink mb-3">목표 등급 분포</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byLevel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {byLevel.map((_, i) => (
                    <Cell key={i} fill={CHART_MONO_NAVY[i % CHART_MONO_NAVY.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-teczen-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-teczen-ink">전체 학습자 ({filtered.length}명)</h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름/팀 검색..."
              className="text-sm border border-teczen-gray-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-teczen-navy"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-teczen-gray-500 border-b border-teczen-gray-200">
                  <th className="text-left py-2 px-2">이름</th>
                  <th className="text-left py-2 px-2">팀 / 직급</th>
                  <th className="text-center py-2 px-2">목표</th>
                  <th className="text-center py-2 px-2">현재</th>
                  <th className="text-right py-2 px-2">평균</th>
                  <th className="text-right py-2 px-2">최근</th>
                  <th className="text-right py-2 px-2">문제</th>
                  <th className="text-right py-2 px-2">모의고사</th>
                  <th className="text-right py-2 px-2">마지막 접속</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const reachedTarget = l.estimatedLevel >= l.targetLevel;
                  return (
                    <tr key={l.employeeId} className="border-b border-teczen-gray-100 hover:bg-teczen-gray-50">
                      <td className="py-2 px-2">
                        <div className="font-bold text-teczen-ink">{l.name}</div>
                        <div className="text-xs text-teczen-gray-500 font-mono">{l.employeeId}</div>
                      </td>
                      <td className="py-2 px-2 text-teczen-gray-700">
                        {l.team}
                        <div className="text-xs text-teczen-gray-500">{l.position}</div>
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-teczen-navy">Lv {l.targetLevel}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={reachedTarget ? "text-green-600 font-bold" : "text-teczen-gray-700"}>
                          Lv {l.estimatedLevel}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right font-mono">{l.averageScore}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-teczen-navy">{l.recentScore}</td>
                      <td className="py-2 px-2 text-right text-teczen-gray-700">{l.totalProblems}</td>
                      <td className="py-2 px-2 text-right text-teczen-gray-700">{l.mockExamCount}회</td>
                      <td className="py-2 px-2 text-right text-xs text-teczen-gray-500">
                        {new Date(l.lastActiveAt).toLocaleDateString("ko-KR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-teczen-gray-200">
      <div className="text-xs font-bold text-teczen-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="font-brand text-3xl text-teczen-navy mb-1">{value}</div>
      <div className="text-xs text-teczen-gray-500">{sub}</div>
    </div>
  );
}
