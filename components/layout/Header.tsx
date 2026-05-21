import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-teczen-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-black text-teczen-navy text-xl tracking-tight">
            TECZEN
            <span className="inline-block w-1.5 h-1.5 bg-teczen-red ml-0.5 align-top mt-1" />
          </span>
          <span className="text-teczen-gray-400">|</span>
          <span className="font-semibold text-teczen-gray-700">SPA Trainer</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavItem href="/dashboard">대시보드</NavItem>
          <NavItem href="/notes">오답노트</NavItem>
          <NavItem href="/vocab">단어장</NavItem>
          <NavItem href="/stats">통계</NavItem>
          <NavItem href="/setup">설정</NavItem>
        </nav>
      </div>
    </header>
  );
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-teczen-gray-700 hover:text-teczen-navy hover:bg-teczen-gray-100"
    >
      {children}
    </Link>
  );
}
