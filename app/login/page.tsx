"use client";

import Link from "next/link";
import { FormEvent, useState, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../api/services/authService";

type IconProps = SVGProps<SVGSVGElement>;

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Kullanıcı adı ve şifre zorunludur.");
      return;
    }

    try {
      setLoading(true);

      const data = await login(
        username.trim(),
        password
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: data.username,
          role: data.role,
        })
      );

      window.dispatchEvent(new Event("auth-changed"));

      if (data.role === "USER") {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      if (data.role === "ADMIN") {
        router.replace("/admin");
        router.refresh();
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      setError("Kullanıcı rolü tanınamadı.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Giriş sırasında bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-xl font-black text-slate-950 shadow-sm">
              F
            </span>

            <div>
              <h1 className="text-xl font-bold tracking-wide text-slate-950">
                FİLOREZ
              </h1>

              <p className="text-xs text-slate-500">
                Kurumsal Filo Yönetimi
              </p>
            </div>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
              <UserIcon className="h-6 w-6" />
            </div>

            <h2 className="text-2xl font-bold text-slate-950">
              Kullanıcı Girişi
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Şirket hesabınızla giriş yapın.
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Kullanıcı Adı
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="Kullanıcı adınızı giriniz"
                autoComplete="username"
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Şifre
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Şifrenizi giriniz"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Şifreyi gizle"
                      : "Şifreyi göster"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {loading
                ? "Giriş yapılıyor..."
                : "Giriş Yap"}
            </button>
          </form>

          <div className="my-6 h-px bg-slate-200" />

          <div className="space-y-3">
            <Link
              href="/admin/login"
              className="block w-full rounded-xl bg-slate-950 px-5 py-3 text-center font-semibold text-white transition hover:bg-slate-800"
            >
              Yönetici Girişi
            </Link>

            <Link
              href="/"
              className="block w-full rounded-xl border border-slate-300 px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Ana Sayfaya Dön
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-slate-600">
            Hesabın yok mu?{" "}
            <Link
              href="/register"
              className="font-semibold text-slate-950 underline-offset-4 hover:text-amber-600 hover:underline"
            >
              Kayıt Ol
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Filo Yönetim Sistemi © 2026
        </p>
      </div>
    </main>
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

function EyeIcon(props: IconProps) {
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
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props: IconProps) {
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
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.2A11 11 0 0 1 12 4c6.5 0 10 8 10 8a16 16 0 0 1-2.1 3.1" />
      <path d="M6.6 6.6C3.6 8.6 2 12 2 12s3.5 8 10 8a10.5 10.5 0 0 0 4.1-.8" />
    </svg>
  );
}