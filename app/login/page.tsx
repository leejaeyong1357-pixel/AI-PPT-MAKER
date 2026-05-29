"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { storage } from "@/lib/storage";
import employeesData from "@/data/employees.json";
import Button from "@/components/ui/Button";

const ADMIN_ID = "82211489";
const ADMIN_PW = "Dlwodyd1357!@";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"user" | "admin">("user");
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [rrnFront, setRrnFront] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !employeeId.trim() || !rrnFront.trim()) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    const employee = employeesData.employees.find(
      (e: any) =>
        e.name === name.trim() &&
        String(e.employeeId).trim() === employeeId.trim(),
    );

    if (!employee) {
      setError("등록되지 않은 사번/이름입니다. 인사팀에 문의하세요.");
      return;
    }

    const stored = localStorage.getItem(`spa.pw.${employeeId.trim()}`);
    const expectedPw = stored || employee.rrnFront;
    if (rrnFront !== expectedPw) {
      setError(
        stored
          ? "비밀번호가 일치하지 않습니다."
          : "최초 로그인은 주민등록번호 앞 6자리(생년월일)로 합니다.",
      );
      return;
    }

    setLoading(true);

    storage.saveSession({
      name: employee.name,
      employeeId: String(employee.employeeId),
      rrnFront,
      team: employee.team,
      position: employee.position,
      loggedInAt: Date.now(),
      isAdmin: false,
    });

    const settings = storage.getSettings();
    if (!settings.onboardingSeen && !settings.onboardingSkipForever) {
      router.push("/onboarding");
    } else if (!settings.setupCompleted) {
      router.push("/setup");
    } else {
      router.push("/dashboard");
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (employeeId.trim() !== ADMIN_ID || adminPw !== ADMIN_PW) {
      setError("관리자 인증 실패. ID 또는 비밀번호를 확인하세요.");
      return;
    }

    setLoading(true);
    storage.saveSession({
      name: "관리자",
      employeeId: ADMIN_ID,
      rrnFront: "",
      team: "관리팀",
      position: "Admin",
      loggedInAt: Date.now(),
      isAdmin: true,
    });

    router.push("/admin");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-white via-blue-50 to-teczen-gray-50">
      <div className="max-w-md w-full">
        <Link href="/landing" className="text-xs text-teczen-gray-600 hover:text-teczen-navy mb-6 inline-block">
          ← 홈으로
        </Link>

        <div className="text-center mb-6">
          <Image
            src="/teczen-logo.webp"
            alt="TECZEN"
            width={100}
            height={24}
            priority
            className="h-6 w-auto mx-auto mb-3"
          />
          <h1 className="font-brand text-3xl text-teczen-navy mb-1">SPEAKZEN</h1>
          <p className="text-sm text-teczen-gray-600">
            {mode === "user" ? "사번과 이름으로 로그인하세요" : "관리자 인증"}
          </p>
        </div>

        <div className="flex bg-teczen-gray-100 rounded-full p-1 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode("user");
              setError("");
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${
              mode === "user" ? "bg-white text-teczen-navy shadow-sm" : "text-teczen-gray-500"
            }`}
          >
            일반 로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("admin");
              setError("");
              setName("");
              setEmployeeId("");
              setRrnFront("");
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${
              mode === "admin" ? "bg-white text-teczen-navy shadow-sm" : "text-teczen-gray-500"
            }`}
          >
            🔐 관리자
          </button>
        </div>

        {mode === "user" ? (
          <form onSubmit={handleUserLogin} className="bg-white rounded-3xl border border-teczen-gray-200 shadow-sm p-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-teczen-gray-700 mb-1.5">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full border-2 border-teczen-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-teczen-navy transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teczen-gray-700 mb-1.5">사번</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="8자리 사원번호"
                className="w-full border-2 border-teczen-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-teczen-navy transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teczen-gray-700 mb-1.5">
                비밀번호
              </label>
              <input
                type="password"
                value={rrnFront}
                onChange={(e) => setRrnFront(e.target.value)}
                placeholder="최초: 주민번호 앞 6자리 (생년월일)"
                className="w-full border-2 border-teczen-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-teczen-navy transition-colors"
              />
              <p className="text-xs text-teczen-gray-500 mt-1">
                ※ 최초 로그인 시 주민번호 앞 6자리. 마이페이지에서 변경 가능.
              </p>
            </div>

            {error && (
              <div className="text-sm text-teczen-red bg-teczen-red/5 border border-teczen-red/20 p-3 rounded-xl">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading} size="lg">
              {loading ? "로그인 중..." : "로그인 →"}
            </Button>

            <div className="text-center text-xs text-teczen-gray-500">
              현대자동차그룹 임직원만 사용 가능합니다.
            </div>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="bg-teczen-navy text-white rounded-3xl shadow-sm p-8 space-y-5">
            <div className="text-center pb-2">
              <div className="text-3xl mb-1">🔐</div>
              <div className="font-bold">관리자 전용</div>
              <div className="text-xs text-blue-200 mt-1">
                학습자 통계 및 운영 데이터 접근
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-200 mb-1.5">관리자 ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="ID"
                className="w-full bg-white/10 border-2 border-white/20 text-white rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-white transition-colors placeholder:text-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-200 mb-1.5">비밀번호</label>
              <input
                type="password"
                value={adminPw}
                onChange={(e) => setAdminPw(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/10 border-2 border-white/20 text-white rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-white transition-colors placeholder:text-white/30"
              />
            </div>

            {error && (
              <div className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-teczen-navy font-bold py-3.5 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {loading ? "인증 중..." : "관리자 로그인 →"}
            </button>

            <div className="text-center text-xs text-blue-300">
              승인된 관리자만 접근 가능합니다.
            </div>
          </form>
        )}

        <div className="mt-6 p-4 bg-white rounded-2xl border border-teczen-gray-200">
          <div className="text-xs font-bold text-teczen-gray-500 mb-1">문의사항</div>
          <div className="text-sm text-teczen-ink">
            미래성장팀 <b>이재용 매니저</b>
          </div>
          <a href="tel:055-280-1741" className="text-sm text-teczen-navy font-mono">
            ☎ 055-280-1741
          </a>
        </div>
      </div>
    </main>
  );
}
