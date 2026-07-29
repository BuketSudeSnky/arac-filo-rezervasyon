"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

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

  const authSnapshot = useSyncExternalStore(
    subscribe,
    getAuthSnapshot,
    getServerSnapshot
  );

  const [token, role] = authSnapshot.split("|");
  const isLoggedIn = Boolean(token);

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    window.dispatchEvent(new Event("auth-changed"));

    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#14181F]/10 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold">
          FİLOREZ
        </Link>

        <nav className="flex items-center gap-6">
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

          {(!isLoggedIn || role === "USER") && (
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
)}

          {!isLoggedIn ? (
            <Link
              href="/login"
              className="rounded-lg bg-[#0B4EA2] px-5 py-2 font-semibold text-white hover:bg-[#083a79]"
            >
              Giriş Yap
            </Link>
          ) : (
            <>
              {role === "USER" && (
                <>
                  <Link
                    href="/dashboard/rezervasyonlarim"
                    className="text-gray-600 hover:text-[#0B4EA2]"
                  >
                    Rezervasyonlarım
                  </Link>

                  <Link
                    href="/dashboard/profil"
                    className="text-gray-600 hover:text-[#0B4EA2]"
                  >
                    Profilim
                  </Link>
                </>
              )}

              {role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-[#0B4EA2]"
                >
                  Admin Paneli
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
              >
                Çıkış Yap
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}