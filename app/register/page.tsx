"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "../../api/services/authService";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedUsername = username.trim();

    if (!trimmedUsername || !password || !passwordAgain) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    if (password !== passwordAgain) {
      setError("Şifreler birbiriyle eşleşmiyor.");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    try {
      setLoading(true);

      const newUser = await register(trimmedUsername, password);

      setSuccess(
        `${newUser.username} kullanıcısı başarıyla oluşturuldu.`
      );

      setUsername("");
      setPassword("");
      setPasswordAgain("");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Kayıt sırasında bir hata oluştu."
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
            Yeni Kullanıcı Kaydı
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
              autoComplete="new-password"
              disabled={loading}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="passwordAgain"
              className="mb-2 block text-sm font-medium"
            >
              Şifre Tekrar
            </label>

            <input
              id="passwordAgain"
              type="password"
              value={passwordAgain}
              onChange={(event) =>
                setPasswordAgain(event.target.value)
              }
              placeholder="Şifrenizi tekrar giriniz"
              autoComplete="new-password"
              disabled={loading}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0B4EA2] py-3 font-semibold text-white transition hover:bg-[#083a79] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Zaten hesabın var mı?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#0B4EA2] hover:underline"
          >
            Giriş Yap
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Filo Yönetim Sistemi © 2026
        </div>
      </div>
    </main>
  );
}