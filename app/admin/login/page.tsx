"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {

    const router = useRouter();

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  localStorage.setItem(
    "user",
    JSON.stringify({
      name: "Yönetici",
      role: "ADMIN",
    })
  );

  router.push("/admin");
};


  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F4F7]">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        {/* Logo */}
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
            <label className="mb-2 block text-sm font-medium">
              Yönetici Kullanıcı Adı
            </label>

            <input
              type="text"
              placeholder="Kullanıcı adınızı giriniz"
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-[#0B4EA2]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Şifre
            </label>

            <input
              type="password"
              placeholder="Şifrenizi giriniz"
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-[#0B4EA2]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#0B4EA2] py-3 font-semibold text-white transition hover:bg-[#083a79]"
          >
            Yönetici Girişi
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-300"></div>
          <span className="mx-3 text-sm text-gray-500">veya</span>
          <div className="h-px flex-1 bg-gray-300"></div>
        </div>

        <Link href="/login">
          <button className="w-full rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-100">
            Giriş Yap
          </button>
        </Link>

        <div className="mt-8 text-center text-sm text-gray-500">
          Filo Yönetim Sistemi © 2026
        </div>
      </div>
    </main>
  );
}