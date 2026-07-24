"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F4F7]">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#0B4EA2]">
            FİLOREZ
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Şirket İçi Araç Rezervasyon Sistemi
          </p>
        </div>

        <form
  className="space-y-5"
  onSubmit={(e) => {
    e.preventDefault();
    router.push("/dashboard");
  }}
>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Kullanıcı Adı
            </label>

            <input
              type="text"
              placeholder="Kullanıcı adınızı giriniz"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Şifre
            </label>

            <input
              type="password"
              placeholder="Şifrenizi giriniz"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#0B4EA2] py-3 font-semibold text-white transition hover:bg-[#083a79]"
          >
            Giriş Yap
          </button>
        </form>

        {/* Ayırıcı */}
        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-300"></div>
          <span className="mx-3 text-sm text-gray-500">veya</span>
          <div className="h-px flex-1 bg-gray-300"></div>
        </div>

        {/* Yönetici Girişi */}
        <Link href="/admin/login">
          <button className="w-full rounded-lg border border-[#0B4EA2] py-3 font-semibold text-[#0B4EA2] transition hover:bg-[#0B4EA2] hover:text-white">
            Yönetici Girişi
          </button>
        </Link>

        <div className="mt-8 text-center text-sm text-gray-500">
          Filo Yönetim Sistemi © 2026
        </div>
      </div>
    </main>
  );
}