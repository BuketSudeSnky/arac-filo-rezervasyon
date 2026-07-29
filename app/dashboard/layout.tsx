"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    router.push("/login");
  };

  const linkClass = (path: string) => {
    const active =
      path === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(path);

    return `transition hover:text-[#0B4EA2] ${
      active
        ? "font-semibold text-[#0B4EA2]"
        : "text-gray-800"
    }`;
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="sticky top-0 z-50 border-b border-gray-300 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/dashboard"
            className="text-2xl font-bold text-gray-900"
          >
            FİLOREZ
          </Link>

          <nav className="flex items-center gap-8">
            <Link
    href="/"
    className={linkClass("/")}
>
    Ana Sayfa
</Link>

            <Link
              href="/dashboard/araclar"
              className={linkClass("/dashboard/araclar")}
            >
              Araçlar
            </Link>

            <Link
              href="/dashboard/rezervasyonlarim"
              className={linkClass(
                "/dashboard/rezervasyonlarim"
              )}
            >
              Rezervasyonlarım
            </Link>

            <Link
              href="/dashboard/profil"
              className={linkClass("/dashboard/profil")}
            >
              Profilim
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              Çıkış Yap
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-9">
        {children}
      </main>
    </div>
  );
}