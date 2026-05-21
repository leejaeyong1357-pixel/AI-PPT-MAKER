import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white border-b border-teczen-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/teczen-logo.webp"
            alt="TECZEN"
            width={120}
            height={28}
            priority
            className="h-7 w-auto"
          />
          <span className="text-teczen-gray-300">|</span>
          <span className="font-semibold text-teczen-gray-700">SPA Trainer</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavItem href="/dashboard">대시보드</NavItem>
          <NavItem href="/mock">모의고사</NavItem>
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
