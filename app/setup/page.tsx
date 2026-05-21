"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { LEVEL_RANGES, levelDescription } from "@/lib/scoring";
import type { Level } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function SetupPage() {
  const router = useRouter();
  const [examDate, setExamDate] = useState("");
  const [targetLevel, setTargetLevel] = useState<Level>(6);
  const [hchatEndpoint, setHchatEndpoint] = useState("");
  const [hchatApiKey, setHchatApiKey] = useState("");
  const [step, setStep] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const s = storage.getSettings();
    if (s.examDate) setExamDate(s.examDate);
    if (s.targetLevel) setTargetLevel(s.targetLevel);
    if (s.hchatEndpoint) setHchatEndpoint(s.hchatEndpoint);
    if (s.hchatApiKey) setHchatApiKey(s.hchatApiKey);
    setLoaded(true);
  }, []);

  const save = () => {
    storage.saveSettings({
      examDate,
      targetLevel,
      hchatEndpoint,
      hchatApiKey,
      setupCompleted: true,
    });
    router.push("/dashboard");
  };

  if (!loaded) return null;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-teczen-gray-50">
      <div className="max-w-xl w-full">
        <div className="text-center mb-6">
          <div className="font-black text-teczen-navy text-2xl tracking-tight mb-1">
            TECZEN
            <span className="inline-block w-1.5 h-1.5 bg-teczen-red ml-0.5 align-top mt-1" />
          </div>
          <h1 className="text-2xl font-bold text-teczen-gray-900">SPA Trainer 초기 설정</h1>
          <p className="text-sm text-teczen-gray-600 mt-1">단계 {step} / 3</p>
        </div>

        <Card>
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold mb-1 text-teczen-gray-900">시험 일정</h2>
              <p className="text-sm text-teczen-gray-600 mb-4">
                SPA 시험 예정일을 알려주세요. 남은 일수에 맞춰 학습량을 추천합니다.
              </p>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-teczen-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-teczen-navy"
              />
              <div className="flex justify-end mt-6">
                <Button onClick={() => setStep(2)} disabled={!examDate}>
                  다음 →
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold mb-1 text-teczen-gray-900">목표 등급</h2>
              <p className="text-sm text-teczen-gray-600 mb-4">
                도달하고 싶은 SPA 등급을 선택하세요. 난이도와 모범답안 수준이 맞춰집니다.
              </p>
              <div className="space-y-2">
                {(Object.entries(LEVEL_RANGES) as [string, [number, number]][]).map(
                  ([lv, [min, max]]) => {
                    const level = Number(lv) as Level;
                    return (
                      <button
                        key={lv}
                        onClick={() => setTargetLevel(level)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                          targetLevel === level
                            ? "border-teczen-navy bg-teczen-navy/5"
                            : "border-teczen-gray-200 hover:border-teczen-gray-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-teczen-gray-900">
                              Lv {lv} <span className="text-sm text-teczen-gray-600">({min}~{max}점)</span>
                            </div>
                            <div className="text-xs text-teczen-gray-600 mt-0.5">
                              {levelDescription(level)}
                            </div>
                          </div>
                          {targetLevel === level && <span className="text-teczen-red">●</span>}
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
              <div className="flex justify-between mt-6">
                <Button onClick={() => setStep(1)} variant="ghost">
                  ← 이전
                </Button>
                <Button onClick={() => setStep(3)}>다음 →</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold mb-1 text-teczen-gray-900">HChat API 연결 (선택)</h2>
              <p className="text-sm text-teczen-gray-600 mb-4">
                현대차그룹 HChat API 키를 입력하면 실제 AI 피드백을 받습니다.
                <br />
                비워두면 기본 가이드라인 기반 모의 피드백이 제공됩니다.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-teczen-gray-700 mb-1">
                    HChat API Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={hchatEndpoint}
                    onChange={(e) => setHchatEndpoint(e.target.value)}
                    placeholder="https://hchat.example.com/v1/chat/completions"
                    className="w-full border border-teczen-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-teczen-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-teczen-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={hchatApiKey}
                    onChange={(e) => setHchatApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full border border-teczen-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-teczen-navy"
                  />
                </div>
                <p className="text-xs text-teczen-gray-500">
                  ※ API 키는 브라우저 로컬스토리지에만 저장되며 외부로 전송되지 않습니다.
                </p>
              </div>
              <div className="flex justify-between mt-6">
                <Button onClick={() => setStep(2)} variant="ghost">
                  ← 이전
                </Button>
                <Button onClick={save}>설정 완료 →</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
