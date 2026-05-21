"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
        <Image
          src="/teczen-logo.webp"
          alt="TECZEN"
          width={200}
          height={48}
          priority
          className="h-12 w-auto mx-auto mb-3"
        />
        <div className="text-teczen-gray-600">로딩 중...</div>
      </div>
    </main>
  );
}
