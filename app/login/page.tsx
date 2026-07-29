"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "../../api/services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Kullanıcı adı ve şifre zorunludur.");
      return;
    }

    try {
      setLoading(true);

      const data = await login(username.trim(), password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      window.dispatchEvent(new Event("auth-changed"));
      

      if (data.role === "ADMIN") {
        router.replace("/admin");
      } else if (data.role === "USER") {
        router.replace("/dashboard");
      } else {
        setError("Kullanıcı rolü tanınamadı.");
      }
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
    <main className="flex min-h-screen items-center justify-center bg-[#F2F4F7] px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#0B4EA2]">
            FİLOREZ
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Şirket İçi Araç Rezervasyon Sistemi
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium"
            >
              Kullanıcı Adı
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Kullanıcı adınızı giriniz"
              autoComplete="username"
              disabled={loading}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Şifre
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Şifrenizi giriniz"
              autoComplete="current-password"
              disabled={loading}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0B4EA2] py-3 font-semibold text-white transition hover:bg-[#083a79] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="mx-3 text-sm text-gray-500">veya</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <Link
          href="/admin/login"
          className="block w-full rounded-lg border border-[#0B4EA2] py-3 text-center font-semibold text-[#0B4EA2] transition hover:bg-[#0B4EA2] hover:text-white"
        >
          Yönetici Girişi
        </Link>

        <div className="mt-6 text-center text-sm text-gray-600">
          Hesabın yok mu?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#0B4EA2] hover:underline"
          >
            Kayıt Ol
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Filo Yönetim Sistemi © 2026
        </div>
      </div>
    </main>
  );
}