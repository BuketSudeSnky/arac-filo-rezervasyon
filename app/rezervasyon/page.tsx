"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const ARACLAR = [
  "34 ABC 123 - Ford Focus",
  "34 XYZ 456 - Fiat Doblo",
  "06 KLM 789 - Renault Megane",
];


export default function RezervasyonPage() {
    const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F2F4F7] py-10">
      <div className="mx-auto max-w-xl rounded-lg bg-white shadow">

        <div className="border-b p-6">
          <h1 className="text-2xl font-bold text-center">
            Yeni Rezervasyon
          </h1>
        </div>

        <form className="space-y-5 p-8">

          {/* Araç */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="font-medium">Araç</label>

            <select className="rounded border px-3 py-2">
              {ARACLAR.map((arac) => (
                <option key={arac}>{arac}</option>
              ))}
            </select>
          </div>

          {/* Kullanıcı */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="font-medium">Kullanıcı</label>

            <input
              type="text"
              placeholder="Ahmet Yılmaz"
              className="rounded border px-3 py-2"
            />
          </div>

          {/* Başlangıç */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="font-medium">Başlangıç</label>

            <input
              type="date"
              className="rounded border px-3 py-2"
            />
          </div>

          {/* Bitiş */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="font-medium">Bitiş</label>

            <input
              type="date"
              className="rounded border px-3 py-2"
            />
          </div>

          {/* Amaç */}
          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <label className="font-medium">Amaç</label>

            <textarea
              rows={3}
              placeholder="Rezervasyon amacı..."
              className="rounded border px-3 py-2"
            />
          </div>

          {/* Uyarı */}
          <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
            ⚠️ Seçilen araç bu tarihlerde müsait değilse kullanıcıya uyarı gösterilecektir.
          </div>

          {/* Butonlar */}
          <div className="flex justify-center gap-4 pt-4">

            <Link
              href="/araclar"
              className="rounded border px-6 py-2 hover:bg-gray-100"
            >
              Vazgeç
            </Link>

            <button
        type="button"
        onClick={() => router.push("/rezervasyonlar")}
        className="rounded bg-[#0B4EA2] px-6 py-2 text-white hover:bg-[#083a79]">
        Kaydet
        </button>

          </div>

        </form>
      </div>
    </main>
  );
}

