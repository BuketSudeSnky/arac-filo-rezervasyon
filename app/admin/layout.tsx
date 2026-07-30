"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type ReactNode,
  type SVGProps,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type AdminLayoutProps = {
  children: ReactNode;
};

type IconProps = SVGProps<SVGSVGElement>;

type MenuItem = {
  label: string;
  href: string;
  icon: (props: IconProps) => ReactNode;
};

const menuItems: MenuItem[] = [
  {
    label: "Genel Bakış",
    href: "/admin",
    icon: DashboardIcon,
  },
  {
    label: "Araç Yönetimi",
    href: "/admin/araclar",
    icon: VehicleIcon,
  },
  {
    label: "Rezervasyonlar",
    href: "/admin/rezervasyonlar",
    icon: CalendarIcon,
  },
  {
    label: "Kullanıcılar",
    href: "/admin/kullanicilar",
    icon: UsersIcon,
  },
  {
    label: "Bakım ve Arıza",
    href: "/admin/bakim",
    icon: MaintenanceIcon,
  },
  {
    label: "Raporlar",
    href: "/admin/raporlar",
    icon: ReportIcon,
  },
];

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
  const frameId = requestAnimationFrame(() => {
    if (pathname === "/admin/login") {
      setAuthChecked(true);
      return;
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (role !== "ADMIN") {
      router.replace("/login");
      return;
    }

    setAuthChecked(true);
  });

  return () => cancelAnimationFrame(frameId);
}, [pathname, router]);



  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    router.replace("/admin/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Yetki kontrol ediliyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobil arka plan */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Menüyü kapat"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      {/* Sol menü */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-lg font-black text-slate-950 shadow-lg shadow-amber-400/20">
              F
            </span>

            <div>
              <h1 className="text-xl font-bold tracking-wide">
                FİLOREZ
              </h1>

              <p className="text-xs text-slate-400">
                Yönetici Paneli
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Menüyü kapat"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Menü */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Yönetim
          </p>

          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/10"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      active
                        ? "text-slate-950"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                  />

                  <span>{item.label}</span>

                  {active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-slate-950" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Yönetici ve çıkış */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 font-bold text-amber-400">
              Y
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                Yönetici
              </p>

              <p className="text-xs text-slate-400">
                ADMIN
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogoutIcon className="h-5 w-5" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Sağ bölüm */}
      <div className="min-h-screen lg:pl-72">
        {/* Üst bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Menüyü aç"
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-900 md:text-xl">
                Yönetici Paneli
              </h2>

              <p className="hidden text-sm text-slate-500 sm:block">
                Kurumsal araç filosunu tek noktadan yönetin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                Yönetici
              </p>

              <p className="text-xs font-medium text-slate-500">
                ADMIN
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 font-bold text-amber-400 shadow-sm">
              Y
            </div>
          </div>
        </header>

        {/* Sayfa içeriği */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/* İkonlar */

function DashboardIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

function VehicleIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M5 17h14" />
      <path d="M6 17l-1-5 2-5h10l2 5-1 5" />
      <path d="M7 12h10" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function CalendarIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function UsersIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <circle cx="9" cy="8" r="4" />
      <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
      <path d="M16 4a4 4 0 0 1 0 8" />
      <path d="M17 15a6 6 0 0 1 4 6" />
    </svg>
  );
}

function MaintenanceIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 8.4 7.2 6.1 4.9a4 4 0 0 0 5 5L18 16.8a2 2 0 1 1-2.8 2.8L8.3 12.7" />
    </svg>
  );
}

function ReportIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
    </svg>
  );
}

function LogoutIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
    </svg>
  );
}

function MenuIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}