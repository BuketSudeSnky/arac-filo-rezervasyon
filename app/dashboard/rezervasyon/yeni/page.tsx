"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { tr } from "date-fns/locale";

import {
  createReservation,
  getReservations,
  type Reservation,
  type ReservationRequest,
} from "../../../../api/services/reservationService";

function parseApiDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function YeniRezervasyonPage() {

  const [selectedRange, setSelectedRange] =
  useState<DateRange | undefined>();

const [reservations, setReservations] =
  useState<Reservation[]>([]);

const [reservationsLoading, setReservationsLoading] =
  useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const vehicleId = searchParams.get("vehicleId") ?? "";

  const [username, setUsername] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [purpose, setPurpose] = useState("");

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
  let isCancelled = false;

  getReservations()
    .then((data) => {
      if (!isCancelled) {
        setReservations(data);
      }
    })
    .catch((error) => {
      console.error(
        "Rezervasyon tarihleri alınamadı:",
        error
      );

      if (!isCancelled) {
        setSubmitError(
          "Araç rezervasyon tarihleri yüklenemedi."
        );
      }
    })
    .finally(() => {
      if (!isCancelled) {
        setReservationsLoading(false);
      }
    });

  return () => {
    isCancelled = true;
  };
}, []);



const reservedRanges = useMemo<DateRange[]>(() => {
  if (!vehicleId) {
    return [];
  }

  return reservations
    .filter(
      (reservation) =>
        reservation.vehicle?.id === Number(vehicleId) &&
        reservation.status !== "Cancelled"
    )
    .map((reservation) => ({
      from: parseApiDate(reservation.startDate),
      to: parseApiDate(reservation.endDate),
    }));
}, [reservations, vehicleId]);

  const isFormValid =
    vehicleId !== "" &&
    username.trim() !== "" &&
    startDate !== "" &&
    endDate !== "" &&
    purpose.trim() !== "" &&
    endDate >= startDate;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    const reservationData: ReservationRequest = {
      vehicle: {
        id: Number(vehicleId),
      },
      username: username.trim(),
      startDate,
      endDate,
      purpose: purpose.trim(),
      status: "Planned",
    }
    ;

   try {
  setSaving(true);
  setSubmitError("");

  await createReservation(reservationData);

  router.push("/dashboard/rezervasyonlarim");
} catch (error) {
  console.error(error);

  setSubmitError(
    error instanceof Error
      ? error.message
      : "Rezervasyon oluşturulamadı."
  );
} finally {
  setSaving(false);
}
  };

  return (
    <main className="min-h-screen bg-[#F2F4F7] py-10">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Yeni Rezervasyon
          </h1>

          <p className="mt-2 text-gray-500">
            Seçtiğiniz araç için rezervasyon bilgilerini doldurun.
          </p>
        </div>

        {!vehicleId && (
          <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
            <p className="font-medium">
              Herhangi bir araç seçilmedi.
            </p>

            <p className="mt-1 text-sm">
              Rezervasyon oluşturmak için önce araçlar sayfasından bir araç
              seçmelisiniz.
            </p>

            <Link
              href="/dashboard/araclar"
              className="mt-3 inline-block rounded-lg bg-[#0B4EA2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#083a79]"
            >
              Araçlara Git
            </Link>
          </div>
        )}

        <div className="rounded-xl bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Kullanıcı
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setSubmitError("");
                }}
                disabled={saving}
                placeholder="Örneğin: Ahmet Demir"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
              />
            </div>

           <div>
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Rezervasyon Tarihleri
  </label>

  {reservationsLoading ? (
    <div className="rounded-lg border p-6 text-center text-gray-500">
      Rezerve tarihler yükleniyor...
    </div>
  ) : (
    <div className="rounded-xl border p-4">
      <DayPicker
        mode="range"
        locale={tr}
        selected={selectedRange}
        onSelect={(range) => {
          setSelectedRange(range);
          setSubmitError("");

          if (range?.from) {
            setStartDate(formatDateForApi(range.from));
          } else {
            setStartDate("");
          }

          if (range?.to) {
            setEndDate(formatDateForApi(range.to));
          } else {
            setEndDate("");
          }
        }}
        disabled={[
          { before: new Date() },
          ...reservedRanges,
        ]}
        excludeDisabled
        modifiers={{
          reserved: reservedRanges,
        }}
        modifiersClassNames={{
          reserved: "reserved-day",
        }}
      />

      <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-red-100" />
          Rezerve edilmiş günler
        </div>

        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-blue-100" />
          Seçtiğiniz tarihler
        </div>
      </div>

      {startDate && (
        <p className="mt-4 text-sm text-gray-700">
          <span className="font-semibold">Başlangıç:</span>{" "}
          {parseApiDate(startDate).toLocaleDateString("tr-TR")}

          {endDate && (
            <>
              {" — "}
              <span className="font-semibold">Bitiş:</span>{" "}
              {parseApiDate(endDate).toLocaleDateString("tr-TR")}
            </>
          )}
        </p>
      )}
    </div>
  )}
</div>

            <div>
              <label
                htmlFor="purpose"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Rezervasyon Amacı
              </label>

              <textarea
                id="purpose"
                value={purpose}
                onChange={(event) => {
                  setPurpose(event.target.value);
                  setSubmitError("");
                }}
                disabled={saving}
                rows={4}
                placeholder="Rezervasyonun amacını yazın"
                className="w-full resize-none rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <Link
                href="/dashboard/araclar"
                className="rounded-lg border px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Vazgeç
              </Link>

              <button
                type="submit"
                disabled={saving || !isFormValid}
                className="rounded-lg bg-[#0B4EA2] px-5 py-3 font-semibold text-white transition hover:bg-[#083a79] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Kaydediliyor..."
                  : "Rezervasyonu Oluştur"}
              </button>
            </div>

            {submitError && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                Bu araç seçilen tarihlerde rezerve edilmiştir.
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}