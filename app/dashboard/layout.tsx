"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";




export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const router = useRouter();

useEffect(() => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    router.replace("/login");
    return;
  }

  if (role === "ADMIN") {
    router.replace("/admin");
    return;
  }

  if (role !== "USER") {
    router.replace("/login");
  }

  

}, [router]);

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("user");

  router.push("/login");
}

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-bold text-xl">
      FİLOREZ
    </Link>


          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-gray-700 transition hover:text-blue-700"
            >
              Ana Sayfa
            </Link>

            <Link
              href="/dashboard/araclar"
              className="text-gray-700 transition hover:text-blue-700"
            >
              Araçlar
            </Link>

            <Link
              href="/dashboard/rezervasyonlarim"
              className="text-gray-700 transition hover:text-blue-700"
            >
              Rezervasyonlarım
            </Link>

            <Link
              href="/dashboard/profil"
              className="text-gray-700 transition hover:text-blue-700"
            >
              Profilim
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
            >
              Çıkış Yap
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}