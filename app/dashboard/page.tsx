"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [username] = useState(() => {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("username") ?? "";
});
  

  useEffect(() => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");


  if (!token) {
    router.replace("/login");
    return;
  }

  if (role === "ADMIN") {
    router.replace("/admin");
    return;
  }

  if (role !== "USER") {
    router.replace("/login");
    return;
  }
}, [router]);


  return (
    <div>
      <section className="mb-8 rounded-2xl bg-blue-700 p-8 text-white shadow-md">
        <p className="mb-2 text-sm font-medium text-blue-100">
          Kullanıcı Paneli
        </p>

        <h1 className="mb-3 text-3xl font-bold">
          Hoş geldiniz{username ? `, ${username}` : ""}!
        </h1>

        <p className="max-w-2xl text-blue-100">
          Müsait araçları inceleyebilir, yeni rezervasyon oluşturabilir ve
          mevcut rezervasyonlarınızı takip edebilirsiniz.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/araclar"
          className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="mb-4 text-4xl">🚗</div>

          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Araçları İncele
          </h2>

          <p className="text-gray-600">
            Sistemde bulunan araçları görüntüleyin ve müsait araçlardan birini
            seçin.
          </p>
        </Link>

        <Link
          href="/dashboard/rezervasyonlarim"
          className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="mb-4 text-4xl">📅</div>

          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Rezervasyonlarım
          </h2>

          <p className="text-gray-600">
            Oluşturduğunuz rezervasyonları görüntüleyin ve durumlarını takip
            edin.
          </p>
        </Link>

        <Link
          href="/dashboard/profil"
          className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="mb-4 text-4xl">👤</div>

          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Profilim
          </h2>

          <p className="text-gray-600">
            Kullanıcı bilgilerinizi görüntüleyin ve hesap ayarlarınızı yönetin.
          </p>
        </Link>
      </section>
    </div>
  );
}