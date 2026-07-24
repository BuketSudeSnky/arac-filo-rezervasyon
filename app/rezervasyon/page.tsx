"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  cancelReservation,
  getReservations,
  type Reservation,
} from "../../api/services/reservationService";

const durumMetinleri = {
  Planned: "Planlandı",
  InProgress: "Devam Ediyor",
  Completed: "Tamamlandı",
  Cancelled: "İptal Edildi",
};

const durumSiniflari = {
  Planned: "bg-blue-100 text-blue-700",
  InProgress: "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function RezervasyonlarPage() {
  const [rezervasyonlar, setRezervasyonlar] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    const rezervasyonlariGetir = async () => {
      try {
        setError("");

        const data = await getReservations();

        setRezervasyonlar(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Rezervasyonlar alınamadı.");
        }
      } finally {
        setLoading(false);
      }
    };

    rezervasyonlariGetir();
  }, []);

  
    
  

  const handleCancel = async (id: number) => {
  const onay = window.confirm(
    "Bu rezervasyonu iptal etmek istediğinizden emin misiniz?"
  );

  if (!onay) {
    return;
  }

  try {
    setCancellingId(id);

    await cancelReservation(id);

setRezervasyonlar((oncekiRezervasyonlar) =>
  oncekiRezervasyonlar.map((rezervasyon) =>
    rezervasyon.id === id
      ? {
          ...rezervasyon,
          status: "Cancelled",
        }
      : rezervasyon
  )
);

    alert("Rezervasyon başarıyla iptal edildi.");
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "Rezervasyon iptal edilemedi."
    );
  } finally {
    setCancellingId(null);
  }
};


  return (
    <main className="min-h-screen bg-[#F2F4F7] py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Rezervasyonlar
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Araç rezervasyonlarını görüntüleyebilir ve
              yönetebilirsiniz.
            </p>
          </div>

          <Link
            href="/rezervasyon/yeni"
            className="rounded-md bg-[#0B4EA2] px-5 py-3 font-semibold text-white hover:bg-[#093d7f]"
          >
            + Yeni Rezervasyon
          </Link>
        </div>

        {loading && (
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-gray-600">
              Rezervasyonlar yükleniyor...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && rezervasyonlar.length === 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-gray-600">
              Henüz rezervasyon bulunmuyor.
            </p>
          </div>
        )}

        {!loading && !error && rezervasyonlar.length > 0 && (
          <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-gray-100 text-sm text-gray-700">
                <tr>
                  <th className="p-4">Araç</th>
                  <th className="p-4">Kullanıcı</th>
                  <th className="p-4">Başlangıç</th>
                  <th className="p-4">Bitiş</th>
                  <th className="p-4">Amaç</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">Oluşturulma</th>
                  <th className="p-4">İşlemler</th>
                </tr>
              </thead>

              <tbody>
                {rezervasyonlar.map((rezervasyon) => {
                  const iptalEdildi =
                    rezervasyon.status === "Cancelled";

                  const isCancelling =
                    cancellingId === rezervasyon.id;

                  return (
                    <tr
                      key={rezervasyon.id}
                      className="border-t align-top hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <p className="font-semibold">
                          {rezervasyon.vehicle?.makeModel ||
                            "Araç bilgisi yok"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {rezervasyon.vehicle?.licensePlate ||
                            `Araç ID: ${rezervasyon.vehicle?.id}`}
                        </p>
                      </td>

                      <td className="p-4">
                        {rezervasyon.username}
                      </td>

                      <td className="p-4">
                        {rezervasyon.startDate}
                      </td>

                      <td className="p-4">
                        {rezervasyon.endDate}
                      </td>

                      <td className="max-w-xs p-4">
                        <p className="whitespace-pre-wrap">
                          {rezervasyon.purpose}
                        </p>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                            durumSiniflari[rezervasyon.status]
                          }`}
                        >
                          {durumMetinleri[rezervasyon.status]}
                        </span>
                      </td>

                      <td className="p-4 text-sm text-gray-600">
                        {rezervasyon.createdAt
                          ? new Date(
                              rezervasyon.createdAt
                            ).toLocaleString("tr-TR")
                          : "-"}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {iptalEdildi ? (
  <button
    type="button"
    disabled
    className="cursor-not-allowed rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-400 opacity-60"
  >
    Düzenlenemez
  </button>
) : (
  <Link
    href={`/rezervasyon/duzenle?id=${rezervasyon.id}`}
    className="rounded-md border border-[#0B4EA2] px-4 py-2 text-sm font-medium text-[#0B4EA2] hover:bg-blue-50"
  >
    Düzenle
  </Link>
)}

                          <button
  type="button"
  onClick={() => handleCancel(rezervasyon.id)}
  disabled={
    iptalEdildi ||
    rezervasyon.status === "Completed" ||
    isCancelling
  }
  className="rounded border border-red-500 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
>
  {isCancelling
    ? "İptal ediliyor..."
    : iptalEdildi
      ? "İptal Edildi"
      : "İptal Et"}
</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}