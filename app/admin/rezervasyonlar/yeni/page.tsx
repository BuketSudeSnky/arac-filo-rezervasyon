"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createReservation,
  getAvailableVehicles,
  type ReservationRequest,
} from "../../../../api/services/reservationService";

import {
  DayPicker,
  type DateRange,
} from "react-day-picker";
import "react-day-picker/style.css";
import { tr } from "date-fns/locale";

import type { Vehicle } from "../../../../api/services/vehicleService";

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(date: string): string {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString("tr-TR");
}

export default function YeniRezervasyonPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [selectedRange, setSelectedRange] =
  useState<DateRange | undefined>();

  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);

  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleDateSelect = (
  range: DateRange | undefined
) => {
  setSelectedRange(range);
  setError("");
  setSuccessMessage("");

  // Tarih değiştiğinde daha önce getirilen araçlar geçersiz olur.
  setAvailableVehicles([]);
  setVehicleId("");

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
};

  const handleFindAvailableVehicles = async () => {
    if (!startDate || !endDate) {
      setError("Başlangıç ve bitiş tarihlerini seçin.");
      return;
    }

    if (endDate < startDate) {
      setError("Bitiş tarihi başlangıç tarihinden önce olamaz.");
      return;
    }

    try {
      setLoadingVehicles(true);
      setError("");
      setSuccessMessage("");
      setVehicleId("");

      const vehicles = await getAvailableVehicles(
        startDate,
        endDate
      );

      setAvailableVehicles(vehicles);

      if (vehicles.length === 0) {
        setError(
          "Seçilen tarihler arasında müsait araç bulunamadı."
        );
      }
    } catch (error) {
      console.error(error);

      setAvailableVehicles([]);

      setError(
        error instanceof Error
          ? error.message
          : "Müsait araçlar alınamadı."
      );
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!username.trim()) {
      setError("Kullanıcı adı boş bırakılamaz.");
      return;
    }

    if (!startDate) {
      setError("Başlangıç tarihi seçin.");
      return;
    }

    if (!endDate) {
      setError("Bitiş tarihi seçin.");
      return;
    }

    if (endDate < startDate) {
      setError("Bitiş tarihi başlangıç tarihinden önce olamaz.");
      return;
    }

    if (!vehicleId) {
      setError("Müsait araçlardan birini seçin.");
      return;
    }

    if (!purpose.trim()) {
      setError("Rezervasyon amacını girin.");
      return;
    }

    const newReservation: ReservationRequest = {
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
      setError("");
      setSuccessMessage("");

      await createReservation(newReservation);

      setSuccessMessage("Rezervasyon başarıyla oluşturuldu.");

      setTimeout(() => {
        router.push("/admin/rezervasyonlar");
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Rezervasyon oluşturulamadı."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Yeni Rezervasyon
        </h1>

        <p className="mt-1 text-gray-500">
          Tarihleri seçin, müsait aracı bulun ve rezervasyonu
          oluşturun.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl bg-white p-8 shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
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
              onChange={(event) =>
                setUsername(event.target.value)
              }
              disabled={saving}
              placeholder="Örneğin: Ahmet Yılmaz"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
            />
          </div>

<div>
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Rezervasyon Tarihleri
  </label>

  <div className="rounded-xl border p-4">
    <DayPicker
      mode="range"
      locale={tr}
      selected={selectedRange}
      onSelect={handleDateSelect}
      disabled={{
        before: new Date(),
      }}
      resetOnSelect
    />

    <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
      {!startDate && (
        <p>Başlangıç ve bitiş tarihini takvimden seçin.</p>
      )}

      {startDate && !endDate && (
        <p>
          <span className="font-semibold">Başlangıç:</span>{" "}
          {formatDateForDisplay(startDate)}
          <span className="ml-2 text-gray-500">
            Şimdi bitiş tarihini seçin.
          </span>
        </p>
      )}

      {startDate && endDate && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <p>
            <span className="font-semibold">Başlangıç:</span>{" "}
            {formatDateForDisplay(startDate)}
          </p>

          <p>
            <span className="font-semibold">Bitiş:</span>{" "}
            {formatDateForDisplay(endDate)}
          </p>
        </div>
      )}
    </div>
  </div>
</div>

          <button
            type="button"
            onClick={handleFindAvailableVehicles}
            disabled={
              loadingVehicles ||
              saving ||
              !startDate ||
              !endDate
            }
            className="w-full rounded-lg border border-[#0B4EA2] px-5 py-3 font-semibold text-[#0B4EA2] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingVehicles
              ? "Müsait araçlar aranıyor..."
              : "Müsait Araçları Getir"}
          </button>

          <div>
            <label
              htmlFor="vehicle"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Araç
            </label>

            <select
              id="vehicle"
              value={vehicleId}
              onChange={(event) =>
                setVehicleId(event.target.value)
              }
              disabled={
                saving ||
                loadingVehicles ||
                availableVehicles.length === 0
              }
              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
            >
              <option value="">
                {availableVehicles.length === 0
                  ? "Önce müsait araçları getirin"
                  : "Araç seçin"}
              </option>

              {availableVehicles.map((vehicle) => (
                <option
                  key={vehicle.id}
                  value={vehicle.id}
                >
                  {vehicle.licensePlate} - {vehicle.makeModel}
                </option>
              ))}
            </select>
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
              onChange={(event) =>
                setPurpose(event.target.value)
              }
              disabled={saving}
              rows={4}
              placeholder="Rezervasyonun amacını yazın"
              className="w-full resize-none rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Link
              href="/admin/rezervasyonlar"
              className="rounded-lg border px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Vazgeç
            </Link>

            <button
              type="submit"
              disabled={
                saving ||
                loadingVehicles ||
                !vehicleId
              }
              className="rounded-lg bg-[#0B4EA2] px-5 py-3 font-semibold text-white transition hover:bg-[#083a79] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Kaydediliyor..."
                : "Rezervasyonu Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}