"use client";

import Link from "next/link";

export default function DuzenleAracPage() {
  return (
    <main className="min-h-screen bg-[#F2F4F7] py-10">
      <div className="mx-auto max-w-xl rounded-lg bg-white shadow">

        <div className="border-b p-6">
          <h1 className="text-2xl font-bold text-center">
            ✏️ Araç Düzenle
          </h1>
        </div>

        <form className="space-y-5 p-8">

          <input
            defaultValue="34 ABC 123"
            className="w-full rounded border px-3 py-2"
          />

          <input
            defaultValue="Ford Focus"
            className="w-full rounded border px-3 py-2"
          />

          <select
            defaultValue="Binek"
            className="w-full rounded border px-3 py-2"
          >
            <option>Binek</option>
            <option>Ticari</option>
          </select>

          <select
            defaultValue="Aktif"
            className="w-full rounded border px-3 py-2"
          >
            <option>Aktif</option>
            <option>Bakımda</option>
          </select>

          <div className="flex justify-end gap-4">

            <Link
              href="/araclar"
              className="rounded border px-5 py-2"
            >
              Vazgeç
            </Link>

            <button
              className="rounded bg-[#0B4EA2] px-5 py-2 text-white"
            >
              Güncelle
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}