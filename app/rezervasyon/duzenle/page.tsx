"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  getReservations,
  updateReservationStatus,
  type Reservation,
  type ReservationStatus,
} from "../../../api/services/reservationService";

const durumSecenekleri: {
  value: ReservationStatus;
  label: string;
}[] = [
  {
    value: "Planned",
    label: "Planlandı",
  },
  {
    value: "InProgress",
    label: "Devam Ediyor",
  },
  {
    value: "Completed",
    label: "Tamamlandı",
  },
  {
    value: "Cancelled",
    label: "İptal Edildi",
  },
];

export default function RezervasyonDuzenlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const idParam = searchParams.get("id");
  const reservationId = idParam ? Number(idParam) : null;

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [status, setStatus] =
    useState<ReservationStatus>("Planned");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const rezervasyonuGetir = async () => {
      if (!reservationId || Number.isNaN(reservationId)) {
        setError("Geçersiz rezervasyon numarası.");
        setLoading(false);
        return;
      }

      try {
        setError("");

        const rezervasyonlar = await getReservations();

        const bulunanRezervasyon = rezervasyonlar.find(
          (item) => item.id === reservationId
        );

        if (!bulunanRezervasyon) {
          setError("Rezervasyon bulunamadı.");
          return;
        }

        setReservation(bulunanRezervasyon);
        setStatus(bulunanRezervasyon.status);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Rezervasyon alınamadı.");
        }
      } finally {
        setLoading(false);
      }
    };

    rezervasyonuGetir();
  }, [reservationId]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!reservationId || saving) {
      return;
    }

    try {
      setSaving(true);

      await updateReservationStatus(reservationId, status);

      alert("Rezervasyon durumu başarıyla güncellendi.");

      router.push("/rezervasyon");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Rezervasyon güncellenemedi.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F2F4F7] py-10">
        <div className="mx-auto max-w-xl rounded-lg bg-white p-8 shadow">
          <p className="text-gray-600">
            Rezervasyon yükleniyor...
          </p>
        </div>
      </main>
    );
  }

  if (error || !reservation) {
    return (
      <main className="min-h-screen bg-[#F2F4F7] py-10">
        <div className="mx-auto max-w-xl rounded-lg bg-white p-8 shadow">
          <p className="rounded bg-red-100 p-4 text-red-700">
            {error || "Rezervasyon bulunamadı."}
          </p>

          <Link
            href="/rezervasyon"
            className="mt-5 inline-block rounded border px-5 py-2 hover:bg-gray-100"
          >
            Geri Dön
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F4F7] py-10">
      <div className="mx-auto max-w-xl rounded-lg bg-white shadow">
        <div className="border-b p-6">
          <h1 className="text-center text-2xl font-bold">
            Rezervasyon Düzenle
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-8"
        >
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <span className="font-medium">Araç</span>

            <div className="rounded border bg-gray-50 px-3 py-2">
              <p className="font-semibold">
                {reservation.vehicle?.makeModel ||
                  "Araç bilgisi yok"}
              </p>

              <p className="text-sm text-gray-500">
                {reservation.vehicle?.licensePlate ||
                  `Araç ID: ${reservation.vehicle?.id}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <span className="font-medium">Kullanıcı</span>

            <div className="rounded border bg-gray-50 px-3 py-2">
              {reservation.username}
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <span className="font-medium">Başlangıç</span>

            <div className="rounded border bg-gray-50 px-3 py-2">
              {reservation.startDate}
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <span className="font-medium">Bitiş</span>

            <div className="rounded border bg-gray-50 px-3 py-2">
              {reservation.endDate}
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <span className="font-medium">Amaç</span>

            <div className="min-h-20 rounded border bg-gray-50 px-3 py-2">
              {reservation.purpose}
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label
              htmlFor="status"
              className="font-medium"
            >
              Durum
            </label>

            <select
              id="status"
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as ReservationStatus
                )
              }
              className="rounded border px-3 py-2"
            >
              {durumSecenekleri.map((secenek) => (
                <option
                  key={secenek.value}
                  value={secenek.value}
                >
                  {secenek.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/rezervasyon"
              className="rounded border px-6 py-2 hover:bg-gray-100"
            >
              Vazgeç
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[#0B4EA2] px-6 py-2 text-white hover:bg-[#083a79] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Güncelleniyor..." : "Güncelle"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}