"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

type AdminLayoutProps = {
  children: ReactNode;
};

const menuItems = [
  {
    label: "Genel Bakış",
    href: "/admin",
  },
  {
    label: "Araç Yönetimi",
    href: "/admin/araclar",
  },
  {
    label: "Rezervasyonlar",
    href: "/admin/rezervasyonlar",
  },
  {
    label: "Kullanıcılar",
    href: "/admin/kullanicilar",
  },
  {
    label: "Bakım ve Arıza",
    href: "/admin/bakim",
  },
  {
    label: "Raporlar",
    href: "/admin/raporlar",
  },
];

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    router.replace("/admin/login");
    return;
  }

  if (role !== "ADMIN") {
    router.replace("/login");
  }
}, [router]);

  // Admin giriş sayfasında sol menü görünmesin.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    router.push("/admin/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };


  return (
    <div className="flex min-h-screen bg-[#F2F4F7]">
      {/* Sol menü */}
      <aside className="flex w-64 flex-col bg-[#0B4EA2] text-white">
        {/* Logo */}
        <div className="border-b border-white/20 px-6 py-6">
          <h1 className="text-2xl font-bold">FİLOREZ</h1>

          <p className="mt-1 text-sm text-blue-100">
            Yönetici Paneli
          </p>
        </div>

        {/* Menü bağlantıları */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-[#FFC531] text-[#14181F]"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Çıkış */}
        <div className="border-t border-white/20 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-white/40 px-4 py-3 text-sm font-semibold transition hover:bg-white hover:text-[#0B4EA2]"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Sağ içerik */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Üst bar */}
        <header className="flex h-20 items-center justify-between border-b bg-white px-8 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Yönetici Paneli
            </h2>

            <p className="text-sm text-gray-500">
              Kurumsal araç filosunu yönetin
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold text-gray-800">
              Yönetici
            </p>

            <p className="text-sm text-gray-500">
              ADMIN
            </p>
          </div>
        </header>

        {/* Sayfa içeriği */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}