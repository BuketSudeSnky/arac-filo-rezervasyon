"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "./../../components/ToastProvider";

import {
  cancelReservation,
  getReservations,
  type Reservation,
} from "../../../api/services/reservationService";

export default function RezervasyonlarimPage() {
  const { showToast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadReservations() {
      try {
        const username = localStorage.getItem("username");

        if (!username) {
          throw new Error("Kullanıcı bilgisi bulunamadı.");
        }

        const allReservations = await getReservations();

        const userReservations = allReservations.filter(
          (reservation: Reservation) =>
            reservation.username === username
        );

        if (!isCancelled) {
          setReservations(userReservations);
        }
      } catch (error) {
        console.error(error);

        if (!isCancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Rezervasyonlar yüklenirken bir hata oluştu."
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadReservations();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function handleCancel(reservationId: number) {
  const confirmed = window.confirm(
    "Bu rezervasyonu iptal etmek istediğinizden emin misiniz?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setCancellingId(reservationId);

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
    console.error(error);

    const message =
      error instanceof Error
        ? error.message
        : "Rezervasyon iptal edilemedi.";

    showToast(message, "error");
  } finally {
    setCancellingId(null);
  }
}

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-gray-500">
          Rezervasyonlarınız yükleniyor...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="font-medium text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Rezervasyonlarım
          </h1>

          <p className="mt-2 text-gray-500">
            Oluşturduğunuz rezervasyonları görüntüleyebilir ve takip
            edebilirsiniz.
          </p>
        </div>

        <Link
          href="/dashboard/araclar"
          className="rounded-lg bg-[#0B4EA2] px-5 py-3 font-semibold text-white transition hover:bg-[#083a79]"
        >
          Yeni Rezervasyon
        </Link>
      </div>

      {reservations.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <div className="text-5xl">📅</div>

          <h2 className="mt-5 text-2xl font-bold text-gray-900">
            Henüz rezervasyonunuz yok
          </h2>

          <p className="mt-3 text-gray-500">
            Müsait araçları inceleyerek ilk rezervasyonunuzu
            oluşturabilirsiniz.
          </p>

          <Link
            href="/dashboard/araclar"
            className="mt-6 inline-block rounded-lg bg-[#0B4EA2] px-5 py-3 font-semibold text-white transition hover:bg-[#083a79]"
          >
            Araçları İncele
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {reservations.map((reservation) => {
            const isExpired = isReservationExpired(
              reservation.endDate
            );

            const isCancelling =
              cancellingId === reservation.id;

            const cannotCancel =
              isExpired ||
              reservation.status === "Cancelled" ||
              reservation.status === "Completed" ||
              isCancelling;

            return (
              <article
                key={reservation.id}
                className={`rounded-2xl border bg-white p-6 shadow-sm ${
                  isExpired ? "opacity-75" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Araç
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-gray-900">
                      {reservation.vehicle?.licensePlate ??
                        "Araç bilgisi yok"}
                    </h2>

                    <p className="mt-1 text-gray-600">
                      {reservation.vehicle?.makeModel ?? ""}
                    </p>
                  </div>

                  <ReservationStatusBadge
                    status={reservation.status}
                  />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Başlangıç tarihi
                    </p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {formatDate(reservation.startDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Bitiş tarihi
                    </p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {formatDate(reservation.endDate)}
                    </p>

                    {isExpired && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        Süresi geçti
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Rezervasyon amacı
                    </p>

                    <p className="mt-1 text-gray-800">
                      {reservation.purpose}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      handleCancel(reservation.id)
                    }
                    disabled={cannotCancel}
                    title={
                      isExpired
                        ? "Süresi geçmiş rezervasyon iptal edilemez."
                        : undefined
                    }
                    className="rounded-lg border border-red-500 px-5 py-2 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isCancelling
                      ? "İptal ediliyor..."
                      : "İptal Et"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

function isReservationExpired(endDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reservationEndDate = new Date(
    `${endDate}T00:00:00`
  );

  return reservationEndDate < today;
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