"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/giris");

    const timer = window.setTimeout(() => {
      router.replace("/giris");
    }, 1350);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="splash-screen">
      <div className="splash-background-glow" />

      <div className="splash-logo-area">
        <div className="splash-ring splash-ring-one" />
        <div className="splash-ring splash-ring-two" />

        <Image
          src="/forumfenomen-icon-256.png"
          alt="ForumFenomen"
          width={1254}
          height={1254}
          priority
          unoptimized
          className="splash-logo"
        />
      </div>
    </main>
  );
}




