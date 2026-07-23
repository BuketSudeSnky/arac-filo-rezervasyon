"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  deleteVehicle,
  getVehicles,
} from "../../api/services/vehicleService";

type Vehicle = {
  id: number;
  licensePlate: string;
  makeModel: string;
  type: string;
  status: string;
};

export default function AraclarPage() {
  const [araclar, setAraclar] = useState<Vehicle[]>([]);
  const [tur, setTur] = useState("Tümü");
  const [durum, setDurum] = useState("Tümü");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const araclariGetir = async () => {
      try {
        const data = await getVehicles();
        setAraclar(data);
      } catch (error) {
        console.error(error);
        setError("Araçlar alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    araclariGetir();
  }, []);

  const handleDelete = async (id: number) => {
  const onay = window.confirm(
    "Bu aracı silmek istediğinizden emin misiniz?"
  );

  if (!onay) {
    return;
  }

  try {
    await deleteVehicle(id);

    setAraclar((oncekiAraclar) =>
      oncekiAraclar.filter((arac) => arac.id !== id)
    );

    alert("Araç başarıyla silindi.");
  } catch (error) {
    console.error(error);
    alert("Araç silinemedi.");
  }
};

  const filtrelenmisAraclar = araclar.filter((arac) => {
    const turUygun = tur === "Tümü" || arac.type === tur;
    const durumUygun = durum === "Tümü" || arac.status === durum;

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
            className="rounded-md bg-[#0B4EA2] px-5 py-3 font-semibold text-white hover:bg-[#093d7f]"
          >
            + Yeni Araç
          </Link>
        </div>

        {/* Filtreler */}
        <div className="mb-6 flex items-end gap-6 rounded-lg bg-white p-5 shadow">
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

        {loading && (
          <p className="text-gray-600">
            Araçlar yükleniyor...
          </p>
        )}

        {error && (
          <p className="rounded bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && filtrelenmisAraclar.length === 0 && (
          <p className="rounded bg-white p-5 shadow">
            Araç bulunamadı.
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtrelenmisAraclar.map((arac) => (
            <div
              key={arac.id}
              className="overflow-hidden rounded-xl bg-white shadow transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-52 w-full">
                <Image
                  src="/images/default-car.jpg"
                  alt={arac.makeModel}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-5">
                <h2 className="text-xl font-bold">
                  {arac.makeModel}
                </h2>

                <p className="mt-1 text-gray-500">
                  {arac.licensePlate}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {arac.type}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      arac.status === "Aktif"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {arac.status}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
  <Link
    href={`/rezervasyon/yeni?vehicleId=${arac.id}`}
    className="rounded-md bg-[#0B4EA2] px-5 py-2 text-white hover:bg-[#093d7f]"
  >
    Rezervasyon Yap
  </Link>

  <Link
    href={`/araclar/duzenle?id=${arac.id}`}
    className="rounded-md border border-[#0B4EA2] px-5 py-2 text-[#0B4EA2] hover:bg-blue-50"
  >
    Düzenle
  </Link>

  <button
    type="button"
    onClick={() => handleDelete(arac.id)}
    className="rounded-md bg-red-600 px-5 py-2 text-white hover:bg-red-700"
  >
    Sil
  </button>
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