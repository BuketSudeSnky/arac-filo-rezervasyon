"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  createReservation,
  type ReservationRequest,
} from "../../../../api/services/reservationService";

export default function YeniRezervasyonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const vehicleId = searchParams.get("vehicleId") ?? "";

  const [username, setUsername] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [purpose, setPurpose] = useState("");

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const today = new Date().toISOString().split("T")[0];

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
    };

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

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="startDate"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Başlangıç Tarihi
                </label>

                <input
                  id="startDate"
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={(event) => {
                    const selectedDate = event.target.value;

                    setStartDate(selectedDate);
                    setSubmitError("");

                    if (endDate && selectedDate > endDate) {
                      setEndDate("");
                    }
                  }}
                  disabled={saving}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Bitiş Tarihi
                </label>

                <input
                  id="endDate"
                  type="date"
                  min={startDate || today}
                  value={endDate}
                  onChange={(event) => {
                    setEndDate(event.target.value);
                    setSubmitError("");
                  }}
                  disabled={saving}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
                />
              </div>
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