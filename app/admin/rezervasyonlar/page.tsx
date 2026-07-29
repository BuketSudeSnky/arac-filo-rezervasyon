"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "./../../components/ToastProvider";

import {
  cancelReservation,
  getReservations,
  updateReservationStatus,
  type Reservation,
  type ReservationStatus,
} from "../../../api/services/reservationService";

const STATUS_OPTIONS = [
  { value: "Planned", label: "Planlandı" },
  { value: "InProgress", label: "Devam Ediyor" },
  { value: "Completed", label: "Tamamlandı" },
  { value: "Cancelled", label: "İptal Edildi" },
];

export default function AdminReservationsPage() {
  const { showToast } = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);


  useEffect(() => {
    let isCancelled = false;

    getReservations()
      .then((data: Reservation[]) => {
        if (!isCancelled) {
          setReservations(data);
          setError("");
        }
      })
      .catch((error) => {
        console.error(error);

        if (!isCancelled) {
          setError("Rezervasyonlar yüklenirken bir hata oluştu.");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

 const filteredReservations = useMemo(() => {
  return [...reservations]
    .filter((reservation) => {
      const searchableText = `
        ${reservation.username}
        ${reservation.vehicle?.licensePlate ?? ""}
        ${reservation.vehicle?.makeModel ?? ""}
        ${reservation.purpose}
      `.toLocaleLowerCase("tr-TR");

      const matchesSearch = searchableText.includes(
        searchText.toLocaleLowerCase("tr-TR")
      );

      const matchesStatus =
        statusFilter === "Tümü" ||
        reservation.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => b.id - a.id);
}, [reservations, searchText, statusFilter]);

  const handleStatusChange = async (
  reservationId: number,
  newStatus: ReservationStatus
) => {
  try {
    setUpdatingId(reservationId);

    const updatedReservation =
      await updateReservationStatus(
        reservationId,
        newStatus
      );

    setReservations((currentReservations) =>
      currentReservations.map((reservation) =>
        reservation.id === reservationId
          ? updatedReservation
          : reservation
      )
    );

    showToast(
      "Rezervasyon durumu başarıyla güncellendi.",
      "success"
    );
  } catch (error) {
    console.error(
      "Rezervasyon durumu güncelleme hatası:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Rezervasyon durumu güncellenemedi.";

    showToast(message, "error");
  } finally {
    setUpdatingId(null);
  }
};

  const handleCancel = async (
  reservationId: number
) => {
  const confirmed = window.confirm(
    "Bu rezervasyonu iptal etmek istediğinizden emin misiniz?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setUpdatingId(reservationId);

    const updatedReservation =
      await cancelReservation(reservationId);

    setReservations((currentReservations) =>
      currentReservations.map((reservation) =>
        reservation.id === reservationId
          ? updatedReservation
          : reservation
      )
    );

    showToast(
      "Rezervasyon başarıyla iptal edildi.",
      "success"
    );
  } catch (error) {
    console.error(
      "Rezervasyon iptal hatası:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Rezervasyon iptal edilemedi.";

    showToast(message, "error");
  } finally {
    setUpdatingId(null);
  }
};

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Rezervasyon Yönetimi
        </h1>

        <p className="mt-1 text-gray-500">
          Tüm şirket rezervasyonlarını görüntüleyin ve yönetin.
        </p>
      </div>

              <Link
              href="/admin/rezervasyonlar/yeni"
              className="rounded-lg bg-[#0B4EA2] px-5 py-3 font-semibold text-white hover:bg-[#083a79]"
              >
               Yeni Rezervasyon
               </Link>

      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Rezervasyon Ara
            </label>

            <input
              type="text"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              placeholder="Kullanıcı, plaka, araç veya amaç ara"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Durum
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-[#0B4EA2]"
            >
              <option value="Tümü">Tümü</option>

              {STATUS_OPTIONS.map((status) => (
                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {loading && (
          <div className="p-8 text-center text-gray-500">
            Rezervasyonlar yükleniyor...
          </div>
        )}

        {!loading && error && (
          <div className="p-8 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          filteredReservations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Kriterlere uygun rezervasyon bulunamadı.
            </div>
          )}

        {!loading &&
          !error &&
          filteredReservations.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="bg-gray-50 text-sm text-gray-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">
                      Kullanıcı
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Araç
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Başlangıç
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Bitiş
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Amaç
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Durum
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                      İşlemler
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredReservations.map((reservation) => {
  const isExpired = isReservationExpired(reservation.endDate);

  return (
    <tr
      key={reservation.id}
      className={`transition hover:bg-gray-50 ${
        isExpired ? "bg-gray-50 opacity-75" : ""
      }`}
    >
                      <td className="px-6 py-4 text-gray-800">
                        {reservation.username}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">
                          {reservation.vehicle?.licensePlate ??
                            "Araç bilgisi yok"}
                        </p>

                        <p className="text-sm text-gray-500">
                          {reservation.vehicle?.makeModel ?? ""}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {formatDate(reservation.startDate)}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {formatDate(reservation.endDate)}
                        {isExpired && (
    <p className="mt-1 text-xs font-semibold text-red-600">
      Süresi geçti
    </p>
  )}
                      </td>

                      <td className="max-w-[220px] px-6 py-4 text-gray-700">
                        <span className="line-clamp-2">
                          {reservation.purpose}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <ReservationStatusBadge
                          status={reservation.status}
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <select
                            value={reservation.status}
                            disabled={
  isExpired ||
  reservation.status === "Completed" ||
  reservation.status === "Cancelled" ||
  updatingId === reservation.id
}
                            onChange={(event) =>
  handleStatusChange(
    reservation.id,
    event.target.value as ReservationStatus
  )
}
                            className="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#0B4EA2] disabled:opacity-50"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option
                                key={status.value}
                                value={status.value}
                              >
                                {status.label}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              handleCancel(reservation.id)
                            }
                            disabled={
                              isExpired ||
                              reservation.status ===
                                "Cancelled" ||
                              reservation.status ===
                                "Completed" ||
                              updatingId === reservation.id
                            }
                            className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            İptal Et
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
    </section>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR").format(
    new Date(`${date}T00:00:00`)
  );
}

function ReservationStatusBadge({
  status,
}: {
  status: string;
}) {
  const statusText: Record<string, string> = {
    Planned: "Planlandı",
    InProgress: "Devam Ediyor",
    Completed: "Tamamlandı",
    Cancelled: "İptal Edildi",
  };

  const statusStyle: Record<string, string> = {
    Planned: "bg-blue-100 text-blue-700",
    InProgress: "bg-amber-100 text-amber-700",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusStyle[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {statusText[status] ?? status}
    </span>
  );
}

function isReservationExpired(endDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reservationEndDate = new Date(`${endDate}T00:00:00`);

  return reservationEndDate < today;
}