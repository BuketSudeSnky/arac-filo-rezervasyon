"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../../api/services/authService";

interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Kullanıcı adı ve şifre zorunludur.");
      return;
    }

    try {
      setLoading(true);

      const data: LoginResponse = await login(
        username.trim(),
        password
      );

      if (data.role !== "ADMIN") {
        setError("Bu sayfaya yalnızca yöneticiler giriş yapabilir.");
        return;
      }

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

      router.push("/admin");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Giriş sırasında bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F4F7]">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🔐</div>

          <h1 className="text-3xl font-bold text-[#0B4EA2]">
            FİLOREZ
          </h1>

          <p className="mt-2 text-lg font-semibold text-gray-700">
            Yönetici Paneli
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Yönetici hesabınız ile giriş yapınız.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium"
            >
              Yönetici Kullanıcı Adı
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
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-[#0B4EA2] disabled:bg-gray-100"
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
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Şifrenizi giriniz"
              autoComplete="current-password"
              disabled={loading}
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-[#0B4EA2] disabled:bg-gray-100"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0B4EA2] py-3 font-semibold text-white transition hover:bg-[#083a79] disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Giriş yapılıyor..." : "Yönetici Girişi"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-300" />

          <span className="mx-3 text-sm text-gray-500">
            veya
          </span>

          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <Link
          href="/"
          className="block w-full rounded-lg border border-gray-300 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          Ana Sayfaya Dön
        </Link>

        <div className="mt-8 text-center text-sm text-gray-500">
          Filo Yönetim Sistemi © 2026
        </div>
      </div>
    </main>
  );
}