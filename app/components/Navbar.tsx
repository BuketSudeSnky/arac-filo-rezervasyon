"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useState,
  useSyncExternalStore,
  type SVGProps,
} from "react";

type IconProps = SVGProps<SVGSVGElement>;

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("auth-changed", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("auth-changed", callback);
  };
}

function getAuthSnapshot() {
  const token = localStorage.getItem("token") ?? "";
  const role = localStorage.getItem("role") ?? "";

  return `${token}|${role}`;
}

function getServerSnapshot() {
  return "|";
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const authSnapshot = useSyncExternalStore(
    subscribe,
    getAuthSnapshot,
    getServerSnapshot
  );

  const [token, role] = authSnapshot.split("|");
  const isLoggedIn = Boolean(token);

  // Dashboard ve admin sayfalarının kendi menüleri var.
  if (
  pathname.startsWith("/dashboard") ||
  (pathname.startsWith("/admin") &&
    pathname !== "/admin/login")
) {
  return null;
}

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("auth-changed"));

    setIsMobileMenuOpen(false);

    router.push("/");
    router.refresh();
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  const linkClassName = (href: string) =>
    `relative rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
      isActive(href)
        ? "bg-amber-400 text-slate-950"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950 text-white shadow-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={handleLinkClick}
          className="flex items-center gap-3"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-lg font-black text-slate-950 shadow-lg shadow-amber-400/20">
            F
          </span>

          <div>
            <p className="text-xl font-bold tracking-wide">
              FİLOREZ
            </p>

            <p className="hidden text-xs text-slate-400 sm:block">
              Araç Filo Rezervasyon Sistemi
            </p>
          </div>
        </Link>

        {/* Masaüstü menü */}
        <nav className="hidden items-center gap-2 lg:flex">
          <Link
            href="/"
            className={linkClassName("/")}
          >
            Ana Sayfa
          </Link>

          {(!isLoggedIn || role === "USER") && (
            <Link
  href={isLoggedIn ? "/dashboard/araclar" : "/araclar"}
  className={linkClassName(
    isLoggedIn ? "/dashboard/araclar" : "/araclar"
  )}
>
  Araçlar
</Link>
          )}

          {!isLoggedIn ? (
            <Link
              href="/login"
              className="ml-2 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-400/20 transition hover:-translate-y-0.5 hover:bg-amber-300"
            >
              <LoginIcon className="h-4 w-4" />
              Giriş Yap
            </Link>
          ) : (
            <>
              {role === "USER" && (
                <>
                  <Link
                    href="/dashboard/rezervasyonlarim"
                    className={linkClassName(
                      "/dashboard/rezervasyonlarim"
                    )}
                  >
                    Rezervasyonlarım
                  </Link>

                  <Link
                    href="/dashboard/profil"
                    className={linkClassName(
                      "/dashboard/profil"
                    )}
                  >
                    Profilim
                  </Link>
                </>
              )}

              {role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  Admin Paneli
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="ml-2 inline-flex items-center gap-2 rounded-xl border border-red-400/40 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
              >
                <LogoutIcon className="h-4 w-4" />
                Çıkış Yap
              </button>
            </>
          )}
        </nav>

        {/* Mobil menü butonu */}
        <button
          type="button"
          onClick={() =>
            setIsMobileMenuOpen((current) => !current)
          }
          className="rounded-xl border border-white/10 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label={
            isMobileMenuOpen
              ? "Menüyü kapat"
              : "Menüyü aç"
          }
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <CloseIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobil menü */}
      {isMobileMenuOpen && (
        <nav className="border-t border-white/10 bg-slate-950 px-4 py-4 shadow-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            <Link
              href="/"
              onClick={handleLinkClick}
              className={linkClassName("/")}
            >
              Ana Sayfa
            </Link>

            {(!isLoggedIn || role === "USER") && (
              <Link
                href="/araclar"
                onClick={handleLinkClick}
                className={linkClassName("/araclar")}
              >
                Araçlar
              </Link>
            )}

            {!isLoggedIn ? (
              <Link
                href="/login"
                onClick={handleLinkClick}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
              >
                <LoginIcon className="h-5 w-5" />
                Giriş Yap
              </Link>
            ) : (
              <>
                {role === "USER" && (
                  <>
                    <Link
                      href="/dashboard/rezervasyonlarim"
                      onClick={handleLinkClick}
                      className={linkClassName(
                        "/dashboard/rezervasyonlarim"
                      )}
                    >
                      Rezervasyonlarım
                    </Link>

                    <Link
                      href="/dashboard/profil"
                      onClick={handleLinkClick}
                      className={linkClassName(
                        "/dashboard/profil"
                      )}
                    >
                      Profilim
                    </Link>
                  </>
                )}

                {role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={handleLinkClick}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Admin Paneli
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/40 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                >
                  <LogoutIcon className="h-5 w-5" />
                  Çıkış Yap
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

function LoginIcon(props: IconProps) {
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
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
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
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
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
      <path d="M18 6L6 18" />
    </svg>
  );
}