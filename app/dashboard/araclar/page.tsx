"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getVehicles,
  getAvailableVehicles,
  type Vehicle,
} from "../../../api/services/vehicleService";


export default function DashboardAraclarPage() {
  const [araclar, setAraclar] = useState<Vehicle[]>([]);
  const [tur, setTur] = useState("Tümü");
  const [durum, setDurum] = useState("Tümü");

  const [baslangicTarihi, setBaslangicTarihi] = useState("");
  const [bitisTarihi, setBitisTarihi] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [musaitAraclarGetirildi, setMusaitAraclarGetirildi] =
  useState(false);

const [musaitAraclarLoading, setMusaitAraclarLoading] =
  useState(false);

  useEffect(() => {
    const araclariGetir = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getVehicles();
        setAraclar(data);
      } catch (error) {
        console.error("Araçlar alınamadı:", error);
        setError("Araçlar alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    araclariGetir();
  }, []);

  const handleMusaitAraclariGoster = async () => {
  if (!baslangicTarihi || !bitisTarihi) {
    setError("Lütfen başlangıç ve bitiş tarihlerini seçin.");
    return;
  }

  if (bitisTarihi < baslangicTarihi) {
    setError(
      "Bitiş tarihi başlangıç tarihinden önce olamaz."
    );
    return;
  }

  try {
    setMusaitAraclarLoading(true);
    setError("");

    const data = await getAvailableVehicles(
      baslangicTarihi,
      bitisTarihi
    );

    setAraclar(data);
    setMusaitAraclarGetirildi(true);
  } catch (error) {
    console.error(
      "Müsait araçlar alınamadı:",
      error
    );

    setAraclar([]);
    setMusaitAraclarGetirildi(false);

    setError(
      error instanceof Error
        ? error.message
        : "Müsait araçlar alınamadı."
    );
  } finally {
    setMusaitAraclarLoading(false);
  }
};

  const filtrelenmisAraclar = araclar.filter((arac) => {
    const turUygun = tur === "Tümü" || arac.type === tur;
    const durumUygun = durum === "Tümü" || arac.status === durum;

    return turUygun && durumUygun;
  });

  return (
    <div>
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          🚗 Araçlar
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Araçları görüntüleyebilir, filtreleyebilir ve uygun araç için
          rezervasyon oluşturabilirsiniz.
        </p>
      </div>

      {/* Tarih aralığı */}
      <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Müsait Araçları Görüntüle
        </h2>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label
              htmlFor="baslangicTarihi"
              className="mb-2 block text-sm font-medium"
            >
              Başlangıç Tarihi
            </label>

            <input
              id="baslangicTarihi"
              type="date"
              min={today}
              value={baslangicTarihi}
              onChange={(event) => {
  const selectedDate = event.target.value;

  setBaslangicTarihi(selectedDate);
  setMusaitAraclarGetirildi(false);
  setError("");

  if (
    bitisTarihi &&
    selectedDate > bitisTarihi
  ) {
    setBitisTarihi("");
  }
}}
              className="rounded-lg border px-3 py-2 outline-none focus:border-[#0B4EA2]"
            />
          </div>

          <div>
            <label
              htmlFor="bitisTarihi"
              className="mb-2 block text-sm font-medium"
            >
              Bitiş Tarihi
            </label>

            <input
              id="bitisTarihi"
              type="date"
              min={baslangicTarihi || today}
              value={bitisTarihi}
              onChange={(event) => {
  setBitisTarihi(event.target.value);
  setMusaitAraclarGetirildi(false);
  setError("");
}}
              className="rounded-lg border px-3 py-2 outline-none focus:border-[#0B4EA2]"
            />
          </div>

          <button
  type="button"
  onClick={handleMusaitAraclariGoster}
  disabled={
    musaitAraclarLoading ||
    !baslangicTarihi ||
    !bitisTarihi
  }
  className="rounded-lg bg-[#FFC531] px-6 py-2 font-semibold text-[#14181F] transition hover:bg-[#e9b42d] disabled:cursor-not-allowed disabled:opacity-50"
>
  {musaitAraclarLoading
    ? "Müsait araçlar aranıyor..."
    : "Müsait Araçları Göster"}
</button>

        </div>
      </section>

      {/* Filtreler */}
      <section className="mb-6 flex flex-wrap items-end gap-6 rounded-xl bg-white p-5 shadow-sm">
        <div>
          <label
            htmlFor="tur"
            className="mb-2 block text-sm font-medium"
          >
            Tür
          </label>

          <select
            id="tur"
            value={tur}
            onChange={(event) => setTur(event.target.value)}
            className="w-44 rounded-lg border px-3 py-2 outline-none focus:border-[#0B4EA2]"
          >
            <option value="Tümü">Tümü</option>
            <option value="Binek">Binek</option>
            <option value="Ticari">Ticari</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="durum"
            className="mb-2 block text-sm font-medium"
          >
            Durum
          </label>

          <select
            id="durum"
            value={durum}
            onChange={(event) => setDurum(event.target.value)}
            className="w-44 rounded-lg border px-3 py-2 outline-none focus:border-[#0B4EA2]"
          >
            <option value="Tümü">Tümü</option>
            <option value="Aktif">Aktif</option>
            <option value="Bakımda">Bakımda</option>
          </select>
        </div>
      </section>

      {/* Yüklenme */}
      {loading && (
        <p className="rounded-lg bg-white p-5 text-gray-600 shadow-sm">
          Araçlar yükleniyor...
        </p>
      )}

      {/* Hata */}
      {error && (
        <p className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </p>
      )}

      {/* Boş liste */}
      {!loading &&
        !error &&
        filtrelenmisAraclar.length === 0 && (
          <p className="rounded-lg bg-white p-5 shadow-sm">
  {musaitAraclarGetirildi
    ? "Seçilen tarihlerde müsait araç bulunamadı."
    : "Seçilen kriterlere uygun araç bulunamadı."}
</p>
        )}

      {/* Araç kartları */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtrelenmisAraclar.map((arac) => (
            <article
              key={arac.id}
              className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
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
                <h2 className="text-xl font-bold text-gray-900">
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

                <div className="mt-6">
                  {arac.status === "Aktif" ? (
                  <Link
    href={`/dashboard/rezervasyon/yeni?vehicleId=${arac.id}`}
    className="rounded-md bg-[#0B4EA2] px-5 py-2 text-white hover:bg-[#093d7f]"
  >
    Rezervasyon Yap
  </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-lg bg-gray-300 px-5 py-2 font-medium text-gray-600"
                    >
                      Rezervasyona Uygun Değil
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}