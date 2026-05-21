"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { levelLabel } from "@/lib/scoring";
import type { StudyRecord } from "@/types";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function NotesPage() {
  const router = useRouter();
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [filter, setFilter] = useState<"bookmarked" | "all" | "low">("bookmarked");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!storage.isSetupComplete()) {
      router.push("/setup");
      return;
    }
    setRecords(storage.getRecords());
    setMounted(true);
  }, [router]);

  if (!mounted) return null;

  const filtered = (() => {
    if (filter === "bookmarked") return records.filter((r) => r.bookmarked);
    if (filter === "low") return records.filter((r) => (r.score || 0) < 60);
    return records;
  })().sort((a, b) => b.createdAt - a.createdAt);

  const toggleBookmark = (id: string) => {
    const r = records.find((x) => x.id === id);
    if (!r) return;
    storage.updateRecord(id, { bookmarked: !r.bookmarked });
    setRecords(storage.getRecords());
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/dashboard" className="text-xs text-teczen-gray-600 hover:text-teczen-navy">
            ← 대시보드
          </Link>
          <h1 className="text-3xl font-bold text-teczen-gray-900 mt-1">오답노트</h1>
          <p className="text-teczen-gray-600">즐겨찾기한 문제와 점수가 낮았던 문제를 다시 확인하세요.</p>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter("bookmarked")}
            className={`px-3 py-1.5 text-sm rounded-lg font-semibold ${
              filter === "bookmarked" ? "bg-teczen-navy text-white" : "bg-teczen-gray-100"
            }`}
          >
            ★ 즐겨찾기
          </button>
          <button
            onClick={() => setFilter("low")}
            className={`px-3 py-1.5 text-sm rounded-lg font-semibold ${
              filter === "low" ? "bg-teczen-navy text-white" : "bg-teczen-gray-100"
            }`}
          >
            낮은 점수 (60점 미만)
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-sm rounded-lg font-semibold ${
              filter === "all" ? "bg-teczen-navy text-white" : "bg-teczen-gray-100"
            }`}
          >
            전체 학습 기록
          </button>
        </div>

        {filtered.length === 0 ? (
          <Card className="text-center py-12 text-teczen-gray-600">
            아직 기록이 없어요. 학습을 시작해보세요.
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-teczen-red">
                        유형 {r.type}
                      </span>
                      <span className="text-xs text-teczen-gray-500">{r.questionId}</span>
                      <span className="text-xs text-teczen-gray-500">
                        {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <p className="text-sm text-teczen-gray-700 mb-2 line-clamp-3">
                      {r.userAnswer}
                    </p>
                    {r.feedback && (
                      <div className="text-xs text-teczen-gray-600 mt-2 p-2 bg-teczen-gray-50 rounded">
                        <strong>핵심 개선점:</strong> {r.feedback.improvements[0] || "—"}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-teczen-navy">
                      {r.score || "—"}
                    </div>
                    {r.feedback && (
                      <div className="text-xs text-teczen-gray-500">
                        {levelLabel(r.feedback.estimatedLevel)}
                      </div>
                    )}
                    <Button
                      onClick={() => toggleBookmark(r.id)}
                      variant={r.bookmarked ? "danger" : "outline"}
                      size="sm"
                      className="mt-2"
                    >
                      {r.bookmarked ? "★" : "☆"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
