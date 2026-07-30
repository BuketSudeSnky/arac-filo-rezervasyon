"use client";

import Link from "next/link";
import {
  useState,
  type SVGProps,
} from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

type IconProps = SVGProps<SVGSVGElement>;

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);

const [username] = useState(() => {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("username") ?? "";
});



  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    router.push("/login");
  }

  function isActive(path: string) {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(path);
  }

  function linkClass(path: string) {
    const active = isActive(path);

    return [
      "inline-flex items-center gap-2 rounded-xl px-4 py-2.5",
      "text-sm font-semibold transition",
      active
        ? "bg-amber-100 text-amber-800"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
    ].join(" ");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex min-h-20 items-center justify-between gap-6">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-lg font-bold text-amber-400 shadow-sm">
                F
              </div>

              <div>
                <p className="text-xl font-bold tracking-tight text-slate-950">
                  FİLOREZ
                </p>

                <p className="hidden text-xs text-slate-500 sm:block">
                  Araç Rezervasyon Sistemi
                </p>
              </div>
            </Link>

            {/* Masaüstü menü */}
            <nav className="hidden items-center gap-1 xl:flex">
              <Link
                href="/dashboard"
                className={linkClass("/dashboard")}
              >
                <HomeIcon className="h-4 w-4" />
                Ana Sayfa
              </Link>

              <Link
                href="/dashboard/araclar"
                className={linkClass(
                  "/dashboard/araclar"
                )}
              >
                <CarIcon className="h-4 w-4" />
                Araçlar
              </Link>

              <Link
                href="/dashboard/rezervasyonlarim"
                className={linkClass(
                  "/dashboard/rezervasyonlarim"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                Rezervasyonlarım
              </Link>

              <Link
                href="/dashboard/profil"
                className={linkClass(
                  "/dashboard/profil"
                )}
              >
                <UserIcon className="h-4 w-4" />
                Profilim
              </Link>
            </nav>

            {/* Sağ taraf */}
            <div className="hidden items-center gap-4 xl:flex">
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <UserIcon className="h-5 w-5" />
                </div>

                <div className="max-w-36">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {username || "Kullanıcı"}
                  </p>

                  <p className="text-xs text-slate-500">
                    Kullanıcı
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100"
              >
                <LogoutIcon className="h-4 w-4" />
                Çıkış Yap
              </button>
            </div>

            {/* Mobil menü butonu */}
            <button
              type="button"
              onClick={() =>
                setMenuOpen((current) => !current)
              }
              aria-label={
                menuOpen
                  ? "Menüyü kapat"
                  : "Menüyü aç"
              }
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 xl:hidden"
            >
              {menuOpen ? (
                <CloseIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobil menü */}
          {menuOpen && (
            <div className="border-t border-slate-200 pb-5 pt-4 xl:hidden">
              <nav className="flex flex-col gap-2">
                <Link
  href="/dashboard"
  onClick={() => setMenuOpen(false)}
  className={linkClass("/dashboard")}
>
  <HomeIcon className="h-4 w-4" />
  Ana Sayfa
</Link>

                <Link
                  href="/dashboard/araclar"
                  onClick={() => setMenuOpen(false)}
                  className={linkClass(
                    "/dashboard/araclar"
                  )}
                >
                  <CarIcon className="h-4 w-4" />
                  Araçlar
                </Link>

                <Link
                  href="/dashboard/rezervasyonlarim"
                  onClick={() => setMenuOpen(false)}
                  className={linkClass(
                    "/dashboard/rezervasyonlarim"
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                  Rezervasyonlarım
                </Link>

                <Link
                  href="/dashboard/profil"
                  onClick={() => setMenuOpen(false)}
                  className={linkClass(
                    "/dashboard/profil"
                  )}
                >
                  <UserIcon className="h-4 w-4" />
                  Profilim
                </Link>
              </nav>

              <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <UserIcon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {username || "Kullanıcı"}
                    </p>

                    <p className="text-xs text-slate-500">
                      Kullanıcı
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <LogoutIcon className="h-4 w-4" />
                  Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-9">
        {children}
      </main>
    </div>
  );
}

function HomeIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v11h14V10" />
      <path d="M9 21v-7h6v7" />
    </svg>
  );
}

function CarIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m5 11 2-5h10l2 5" />
      <path d="M3 13a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5H3Z" />
      <path d="M5 18v2" />
      <path d="M19 18v2" />
      <path d="M7 15h.01" />
      <path d="M17 15h.01" />
    </svg>
  );
}

function CalendarIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function UserIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function LogoutIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
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
      strokeLinecap="round"
      {...props}
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
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
      strokeLinecap="round"
      {...props}
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}