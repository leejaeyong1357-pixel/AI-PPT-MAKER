"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import Button from "@/components/ui/Button";

export default function SetPasswordPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = storage.getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    if (s.isAdmin) {
      router.replace("/admin");
      return;
    }
    // 이미 비번 설정한 사용자는 dashboard로 바로
    const existing = localStorage.getItem(`spa.pw.${s.employeeId}`);
    if (existing) {
      router.replace("/dashboard");
      return;
    }
    setSession(s);
  }, [router]);

  if (!session) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPw.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (newPw !== confirmPw) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    setSaving(true);
    localStorage.setItem(`spa.pw.${session.employeeId}`, newPw);
    storage.saveSession({ ...session, rrnFront: newPw });
    router.replace("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-white via-blue-50 to-teczen-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 bg-teczen-red/10 text-teczen-red text-xs font-bold rounded-full mb-3">
            🔒 보안을 위한 비밀번호 설정
          </div>
          <h1 className="text-2xl font-black text-teczen-ink mb-2">
            본인만의 비밀번호를 정해주세요
          </h1>
          <p className="text-sm text-teczen-gray-600">
            다음 로그인부터 사번·이름과 함께 이 비밀번호로 들어옵니다.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-white rounded-3xl border border-teczen-gray-200 shadow-sm p-8 space-y-5"
        >
          <div className="bg-teczen-blue/5 border border-teczen-blue/30 rounded-xl p-3 text-xs text-teczen-gray-700">
            <div className="font-bold text-teczen-blue mb-1">{session.name} 님</div>
            <div>{session.team} · {session.position} · 사번 {session.employeeId}</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-teczen-gray-700 mb-1.5">
              새 비밀번호 (6자 이상)
            </label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="영문·숫자·특수문자 조합 권장"
              className="w-full border-2 border-teczen-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-teczen-navy transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-teczen-gray-700 mb-1.5">
              비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="다시 한 번 입력"
              className="w-full border-2 border-teczen-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-teczen-navy transition-colors"
            />
          </div>

          {error && (
            <div className="text-sm text-teczen-red bg-teczen-red/5 border border-teczen-red/20 p-3 rounded-xl">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth disabled={saving || !newPw || !confirmPw} size="lg">
            {saving ? "저장 중..." : "비밀번호 설정 완료 →"}
          </Button>

          <p className="text-xs text-teczen-gray-500 text-center">
            ※ 마이페이지에서 언제든 다시 변경할 수 있습니다.
          </p>
        </form>
      </div>
    </main>
  );
}
