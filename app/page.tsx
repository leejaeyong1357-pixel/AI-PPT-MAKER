import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl border border-teczen-gray-200 p-10 shadow-sm">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="text-3xl font-black tracking-tight text-teczen-navy">
                TECZEN
                <span className="inline-block w-2 h-2 bg-teczen-red ml-0.5 align-top mt-1" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-teczen-gray-900 mb-3">
              SPA Trainer
            </h1>
            <p className="text-teczen-gray-600">
              현대자동차그룹 SPA 영어시험을 AI와 함께 준비하세요.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-teczen-gray-50 rounded-xl p-4">
              <div className="text-sm text-teczen-gray-600 mb-1">총 문제</div>
              <div className="text-2xl font-bold text-teczen-navy">400+</div>
            </div>
            <div className="bg-teczen-gray-50 rounded-xl p-4">
              <div className="text-sm text-teczen-gray-600 mb-1">모의고사</div>
              <div className="text-2xl font-bold text-teczen-navy">50세트</div>
            </div>
            <div className="bg-teczen-gray-50 rounded-xl p-4">
              <div className="text-sm text-teczen-gray-600 mb-1">유형</div>
              <div className="text-2xl font-bold text-teczen-navy">4가지</div>
            </div>
            <div className="bg-teczen-gray-50 rounded-xl p-4">
              <div className="text-sm text-teczen-gray-600 mb-1">등급</div>
              <div className="text-2xl font-bold text-teczen-navy">Lv 1~8</div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/chart-demo"
              className="block w-full bg-teczen-navy hover:bg-teczen-navy-dark text-white font-semibold py-4 px-6 rounded-xl text-center transition-colors"
            >
              차트 렌더링 데모 보기 →
            </Link>
            <div className="block w-full bg-teczen-gray-100 text-teczen-gray-500 font-semibold py-4 px-6 rounded-xl text-center cursor-not-allowed">
              학습 시작 (개발 예정)
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-teczen-gray-500 mt-4">
          Powered by HChat · Teczen, Hyundai Motor Group
        </p>
      </div>
    </main>
  );
}
