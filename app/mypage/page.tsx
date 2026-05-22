"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { storage } from "@/lib/storage";
import { LEVEL_RANGES, getDaysUntil, levelLabel } from "@/lib/scoring";
import type { Level, UserSession, UserSettings } from "@/types";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";

function getPasswordKey(employeeId: string) {
  return `spa.pw.${employeeId}`;
}

export default function MyPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [examDate, setExamDate] = useState("");
  const [targetLevel, setTargetLevel] = useState<Level>(6);
  const [hchatApiKey, setHchatApiKey] = useState("");
  const [hchatModel, setHchatModel] = useState("claude-sonnet-4-6");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const s = storage.getSession();
    if (!s) {
      router.push("/login");
      return;
    }
    if (s.isAdmin) {
      router.push("/admin");
      return;
    }
    setSession(s);
    const cfg = storage.getSettings();
    setSettings(cfg);
    setExamDate(cfg.examDate);
    setTargetLevel(cfg.targetLevel);
    setHchatApiKey(cfg.hchatApiKey);
    if (cfg.hchatModel) setHchatModel(cfg.hchatModel);
  }, [router]);

  if (!session || !settings) return null;

  const saveSettings = () => {
    storage.saveSettings({
      ...settings,
      examDate,
      targetLevel,
      hchatApiKey,
      hchatModel,
    });
    setSaveMsg("✓ 저장되었습니다");
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);

    const stored = localStorage.getItem(getPasswordKey(session.employeeId));
    const expected = stored || session.rrnFront;

    if (currentPw !== expected) {
      setPwMsg({ ok: false, text: "현재 비밀번호가 일치하지 않습니다." });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ ok: false, text: "새 비밀번호는 6자 이상이어야 합니다." });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: "새 비밀번호 확인이 일치하지 않습니다." });
      return;
    }
    if (newPw === currentPw) {
      setPwMsg({ ok: false, text: "기존과 동일한 비밀번호입니다." });
      return;
    }

    localStorage.setItem(getPasswordKey(session.employeeId), newPw);
    storage.saveSession({ ...session, rrnFront: newPw });
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setPwMsg({ ok: true, text: "비밀번호가 변경되었습니다." });
  };

  const dDay = getDaysUntil(examDate);

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/dashboard" className="text-xs text-teczen-gray-600 hover:text-teczen-navy">
            ← 대시보드
          </Link>
          <h1 className="hero-headline text-3xl text-teczen-ink mt-1">마이페이지</h1>
          <p className="text-sm text-teczen-gray-600">내 정보와 학습 설정을 관리하세요</p>
        </div>

        <section className="bg-white rounded-3xl border border-teczen-gray-200 p-6 mb-4">
          <h2 className="font-bold text-lg text-teczen-ink mb-4">내 정보</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="이름" value={session.name} />
            <Info label="사번" value={session.employeeId} mono />
            <Info label="팀" value={session.team || "—"} />
            <Info label="직급" value={session.position || "—"} />
            <Info label="로그인 시각" value={new Date(session.loggedInAt).toLocaleString("ko-KR")} />
            <Info label="시험까지" value={dDay >= 0 ? `D-${dDay}` : "—"} />
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-teczen-gray-200 p-6 mb-4">
          <h2 className="font-bold text-lg text-teczen-ink mb-4">학습 설정</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-teczen-gray-700 mb-1.5">시험 일자</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full border-2 border-teczen-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teczen-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teczen-gray-700 mb-1.5">
                목표 등급: <span className="text-teczen-navy">{levelLabel(targetLevel)}</span>
              </label>
              <div className="grid grid-cols-8 gap-1.5">
                {(Object.keys(LEVEL_RANGES) as unknown as Level[]).map((lvKey) => {
                  const lv = Number(lvKey) as Level;
                  return (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => setTargetLevel(lv)}
                      className={`py-2 rounded-lg text-sm font-bold transition-colors ${
                        targetLevel === lv
                          ? "bg-teczen-navy text-white"
                          : "bg-teczen-gray-100 text-teczen-gray-700 hover:bg-teczen-gray-200"
                      }`}
                    >
                      Lv{lv}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-teczen-gray-700 mb-1.5">모델</label>
              <select
                value={hchatModel}
                onChange={(e) => setHchatModel(e.target.value)}
                className="w-full border-2 border-teczen-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teczen-navy"
              >
                <option value="claude-sonnet-4-6">claude-sonnet-4-6 (권장)</option>
                <option value="claude-haiku-4-5">claude-haiku-4-5 (빠름)</option>
                <option value="gpt-4.1">gpt-4.1 (Azure)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-teczen-gray-700 mb-1.5">개인 API Key</label>
              <input
                type="password"
                value={hchatApiKey}
                onChange={(e) => setHchatApiKey(e.target.value)}
                placeholder="afd5cdc7f6..."
                className="w-full border-2 border-teczen-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-teczen-navy"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {saveMsg && <span className="text-sm text-green-600 font-semibold">{saveMsg}</span>}
              <div className="ml-auto">
                <Button onClick={saveSettings}>저장</Button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-teczen-gray-200 p-6 mb-4">
          <h2 className="font-bold text-lg text-teczen-ink mb-1">비밀번호 변경</h2>
          <p className="text-xs text-teczen-gray-500 mb-4">
            최초 비밀번호는 주민등록번호 앞 6자리입니다.
          </p>
          <form onSubmit={changePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-teczen-gray-700 mb-1.5">현재 비밀번호</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full border-2 border-teczen-gray-200 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:border-teczen-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-teczen-gray-700 mb-1.5">새 비밀번호 (6자 이상)</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full border-2 border-teczen-gray-200 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:border-teczen-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-teczen-gray-700 mb-1.5">새 비밀번호 확인</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full border-2 border-teczen-gray-200 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:border-teczen-navy"
              />
            </div>
            {pwMsg && (
              <div
                className={`text-sm p-3 rounded-xl ${
                  pwMsg.ok
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {pwMsg.text}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="danger">비밀번호 변경</Button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-3xl border border-teczen-gray-200 p-6 mb-4">
          <h2 className="font-bold text-lg text-teczen-ink mb-3">기타</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                storage.saveSettings({ ...settings, onboardingSeen: false, onboardingSkipForever: false });
                router.push("/onboarding");
              }}
              className="block w-full text-left p-3 hover:bg-teczen-gray-50 rounded-xl text-sm text-teczen-gray-700"
            >
              📘 SPA 시험 안내 다시 보기
            </button>
            <button
              onClick={() => {
                if (confirm("학습 기록과 단어장을 모두 삭제합니다. 진행하시겠습니까?")) {
                  storage.clearMyData();
                  localStorage.removeItem("spa.wordCache");
                  alert("초기화되었습니다.");
                  router.push("/dashboard");
                }
              }}
              className="block w-full text-left p-3 hover:bg-red-50 rounded-xl text-sm text-teczen-red"
            >
              🗑 학습 기록 전체 초기화
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-teczen-gray-500">{label}</div>
      <div className={`font-semibold text-teczen-ink ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
