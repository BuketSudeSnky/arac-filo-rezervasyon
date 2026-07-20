"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const ARACLAR = [
  {
    plaka: "34 ABC 123",
    marka: "Ford Focus",
    tur: "Binek",
    durum: "Aktif",
    resim: "/images/fordfocus.jpg",
  },
  {
    plaka: "34 XYZ 456",
    marka: "Fiat Doblo",
    tur: "Ticari",
    durum: "Aktif",
    resim: "/images/fiatdoblo.jpg",
  },
  {
    plaka: "06 KLM 789",
    marka: "Renault Megane",
    tur: "Binek",
    durum: "Bakımda",
    resim: "/images/renaultmegane.jpg",
  },
];


export default function AraclarPage() {

  const [tur, setTur] = useState("Tümü");
  const [durum, setDurum] = useState("Tümü");

  const filtrelenmisAraclar = ARACLAR.filter((arac) => {
  const turUygun = tur === "Tümü" || arac.tur === tur;
  const durumUygun = durum === "Tümü" || arac.durum === durum;

  return turUygun && durumUygun;
});

  return (
    <main className="min-h-screen bg-[#F2F4F7] py-10">
      <div className="mx-auto max-w-6xl px-6">

        {/* Başlık */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              🚗 Araç Filo Rezervasyon
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Araç listesini görüntüleyebilir ve filtreleyebilirsiniz.
            </p>
          </div>

        <Link
           href="/araclar/yeni"
           className="rounded-md bg-[#0B4EA2] px-5 py-3 font-semibold text-white hover:bg-[#093d7f]">
         + Yeni Araç
        </Link>
        </div>

        {/* Filtreler */}
<div className="mb-6 flex items-end gap-6 rounded-lg bg-white p-5 shadow">

  {/* Tür */}
  <div>
    <label className="mb-2 block text-sm font-medium">
      Tür
    </label>

    <select
      value={tur}
      onChange={(e) => setTur(e.target.value)}
      className="w-44 rounded border px-3 py-2"
    >
      <option>Tümü</option>
      <option>Binek</option>
      <option>Ticari</option>
    </select>
  </div>

  {/* Durum */}
  <div>
    <label className="mb-2 block text-sm font-medium">
      Durum
    </label>

    <select
      value={durum}
      onChange={(e) => setDurum(e.target.value)}
      className="w-44 rounded border px-3 py-2"
    >
      <option>Tümü</option>
      <option>Aktif</option>
      <option>Bakımda</option>
    </select>
  </div>

         </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

  {filtrelenmisAraclar.map((arac) => (

    <div
      key={arac.plaka}
      className="overflow-hidden rounded-xl bg-white shadow transition hover:-translate-y-1 hover:shadow-xl"
    >
<div className="relative h-52 w-full">
  <Image
    src={arac.resim}
    alt={arac.marka}
    fill
    className="object-cover"
  />
</div>

      <div className="p-5">

        <h2 className="text-xl font-bold">
          {arac.marka}
        </h2>

        <p className="mt-1 text-gray-500">
          {arac.plaka}
        </p>

        <div className="mt-4 flex items-center justify-between">
  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
    {arac.tur}
  </span>

  <span
    className={`rounded-full px-3 py-1 text-sm font-semibold ${
      arac.durum === "Aktif"
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"
    }`}
  >
    {arac.durum}
  </span>
</div>

<div className="mt-6">
  <Link
    href="/rezervasyon"
    className="inline-block rounded-md bg-[#0B4EA2] px-5 py-2 text-white hover:bg-[#093d7f]"
  >
    Rezervasyon Yap
  </Link>
</div>
      </div>

    </div>

  ))}

</div>

        {/* Tarih Aralığı */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow">

          <h2 className="mb-4 text-lg font-semibold">
            Müsait Araçları Görüntüle
          </h2>

          <div className="flex flex-wrap gap-4">

            <input
              type="date"
              className="rounded border px-3 py-2"
            />

            <input
              type="date"
              className="rounded border px-3 py-2"
            />

            <button className="rounded bg-[#FFC531] px-6 py-2 font-semibold text-[#14181F] hover:bg-[#e9b42d]">
              Müsait Araçları Göster
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}