"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#14181F]/10 bg-white">
  <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

    <Link href="/" className="font-bold text-xl">
      FİLOREZ
    </Link>

    <nav className="flex items-center gap-6">

      <Link
        href="/login"
        className="rounded-lg bg-[#0B4EA2] px-5 py-2 font-semibold text-white hover:bg-[#083a79]"
      >
        Giriş Yap
      </Link>

      <Link
        href="/"
        className={
          pathname === "/"
            ? "font-semibold text-[#0B4EA2]"
            : "text-gray-600 hover:text-[#0B4EA2]"
        }
      >
        Ana Sayfa
      </Link>

      <Link
        href="/araclar"
        className={
          pathname === "/araclar"
            ? "font-semibold text-[#0B4EA2]"
            : "text-gray-600 hover:text-[#0B4EA2]"
        }
      >
        Araçlar
      </Link>

    </nav>

  </div>
</header>
  );
}