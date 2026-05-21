"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    if (storage.isSetupComplete()) {
      router.replace("/dashboard");
    } else {
      router.replace("/setup");
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="font-black text-teczen-navy text-3xl tracking-tight mb-2">
          TECZEN
          <span className="inline-block w-2 h-2 bg-teczen-red ml-0.5 align-top mt-1" />
        </div>
        <div className="text-teczen-gray-600">로딩 중...</div>
      </div>
    </main>
  );
}
