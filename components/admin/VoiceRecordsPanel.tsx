"use client";

import { useEffect, useMemo, useState } from "react";
import { listVoiceRecords, deleteVoiceRecord, makeBlobUrl, type VoiceRecord } from "@/lib/voiceStore";

export default function VoiceRecordsPanel() {
  const [records, setRecords] = useState<VoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [urls, setUrls] = useState<Record<string, string>>({});

  const refresh = async () => {
    setLoading(true);
    const r = await listVoiceRecords();
    setRecords(r);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const map: Record<string, string> = {};
    records.forEach((r) => {
      map[r.id] = makeBlobUrl(r.blob);
    });
    setUrls(map);
    return () => {
      Object.values(map).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [records]);

  const teams = useMemo(
    () => Array.from(new Set(records.map((r) => r.team).filter(Boolean))).sort(),
    [records],
  );

  const filtered = records.filter((r) => {
    if (teamFilter && r.team !== teamFilter) return false;
    if (search && !r.name.includes(search) && !r.employeeId.includes(search)) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("이 녹음을 삭제할까요?")) return;
    await deleteVoiceRecord(id);
    refresh();
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-teczen-gray-200">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="font-bold text-lg text-teczen-ink">🎙 학습자 음성 기록</h2>
          <p className="text-xs text-teczen-gray-500 mt-1">
            교육담당자 검토용. 학습자가 답변한 음성을 재생할 수 있습니다.
            (브라우저 IndexedDB에 사용자별 최근 30건 보관)
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="text-sm border border-teczen-gray-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-teczen-navy"
          >
            <option value="">전체 팀</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름/사번"
            className="text-sm border border-teczen-gray-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-teczen-navy"
          />
          <button
            onClick={refresh}
            className="text-xs px-3 py-1.5 bg-teczen-gray-100 hover:bg-teczen-gray-200 rounded-xl font-semibold"
          >
            🔄 새로고침
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-teczen-gray-500 text-sm">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-teczen-gray-500 text-sm">
          아직 저장된 음성 기록이 없어요. 학습자가 음성 답변을 제출하면 여기에 표시됩니다.
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="border border-teczen-gray-200 rounded-2xl p-4 bg-teczen-gray-50"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-teczen-ink">{r.name}</span>
                    <span className="text-xs text-teczen-gray-500">
                      {r.team} · {r.position} · {r.employeeId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-teczen-gray-500 mb-2">
                    <span className="px-2 py-0.5 bg-teczen-red/10 text-teczen-red rounded-md font-bold">
                      유형 {r.type}
                    </span>
                    <span>{new Date(r.createdAt).toLocaleString("ko-KR")}</span>
                    <span>· {r.durationSec}초</span>
                    {r.score !== undefined && (
                      <span className="font-bold text-teczen-blue">{r.score}점</span>
                    )}
                  </div>
                  <p className="text-xs text-teczen-gray-700 mb-1 line-clamp-1">
                    <b>Q.</b> {r.questionText}
                  </p>
                  <p className="text-xs text-teczen-gray-600 line-clamp-2">
                    <b>A.</b> {r.answerText}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-xs text-teczen-gray-400 hover:text-teczen-red whitespace-nowrap"
                >
                  삭제
                </button>
              </div>
              {urls[r.id] && (
                <audio
                  controls
                  src={urls[r.id]}
                  className="w-full mt-2"
                  preload="metadata"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
