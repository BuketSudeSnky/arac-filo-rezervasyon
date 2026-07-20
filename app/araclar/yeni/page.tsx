"use client";

import Link from "next/link";

export default function YeniAracPage() {
  return (
    <main className="min-h-screen bg-[#F2F4F7] py-10">
      <div className="mx-auto max-w-xl rounded-lg bg-white shadow">

        <div className="border-b p-6">
          <h1 className="text-2xl font-bold text-center">
            🚗 Yeni Araç Ekle
          </h1>
        </div>

        <form className="space-y-5 p-8">

          <div>
            <label className="mb-2 block font-medium">
              Plaka
            </label>

            <input
              type="text"
              placeholder="34 ABC 123"
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Marka / Model
            </label>

            <input
              type="text"
              placeholder="Ford Focus"
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Tür
            </label>

            <select className="w-full rounded border px-3 py-2">
              <option>Binek</option>
              <option>Ticari</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Durum
            </label>

            <select className="w-full rounded border px-3 py-2">
              <option>Aktif</option>
              <option>Bakımda</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-4">

            <Link
              href="/araclar"
              className="rounded border px-5 py-2"
            >
              İptal
            </Link>

            <button
              className="rounded bg-[#0B4EA2] px-5 py-2 text-white"
            >
              Kaydet
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}