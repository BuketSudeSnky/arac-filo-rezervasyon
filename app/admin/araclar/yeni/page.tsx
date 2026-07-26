"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createVehicle,
  getVehicles,
  type VehicleRequest,
} from "../../../../api/services/vehicleService";

function normalizeLicensePlate(plate: string): string {
  return plate
    .trim()
    .toLocaleUpperCase("tr-TR")
    .replace(/\s+/g, "");
}

  function formatLicensePlate(value: string): string {
  const plate = value
    .toLocaleUpperCase("tr-TR")
    .replace(/[^A-Z0-9]/g, "");

  if (plate.length <= 2) {
    return plate;
  }

  const cityCode = plate.slice(0, 2);
  const rest = plate.slice(2);

  const letters = rest.match(/^[A-Z]+/)?.[0] ?? "";
  const numbers = rest.slice(letters.length);

  let formatted = cityCode;

  if (letters) {
    formatted += " " + letters;
  }

  if (numbers) {
    formatted += " " + numbers;
  }

  return formatted;
}


export default function YeniAracPage() {
  const router = useRouter();

  const [licensePlate, setLicensePlate] = useState("");
  const [makeModel, setMakeModel] = useState("");
  const [type, setType] = useState("Binek");
  const [status, setStatus] = useState("Aktif");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (!licensePlate.trim()) {
      setError("Lütfen araç plakasını girin.");
      return;
    }

    if (!makeModel.trim()) {
      setError("Lütfen marka ve model bilgisini girin.");
      return;
    }

    const normalizedPlate = normalizeLicensePlate(licensePlate);

const newVehicle: VehicleRequest = {
  licensePlate: licensePlate
    .trim()
    .toLocaleUpperCase("tr-TR"),
  makeModel: makeModel.trim(),
  type,
  status,
};

    try {
      setSaving(true);
      setError("");

      const existingVehicles = await getVehicles();

const plateAlreadyExists = existingVehicles.some(
  (vehicle) =>
    normalizeLicensePlate(vehicle.licensePlate) ===
    normalizedPlate
);

if (plateAlreadyExists) {
  setError("Bu plakaya sahip bir araç zaten kayıtlı.");
  return;
}

      await createVehicle(newVehicle);

      alert("Araç başarıyla eklendi.");

      router.push("/admin/araclar");
      router.refresh();
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Araç eklenemedi.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Yeni Araç Ekle
        </h1>

        <p className="mt-1 text-gray-500">
          Filoya yeni bir araç ekleyin.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl bg-white p-8 shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="licensePlate"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Plaka
            </label>

            <input
              id="licensePlate"
              type="text"
              value={licensePlate}
              onChange={(event) =>
  setLicensePlate(
    formatLicensePlate(event.target.value)
  )
}
              placeholder="34 ABC 123"
              className="w-full rounded-lg border px-4 py-3 uppercase outline-none focus:border-[#0B4EA2]"
            />
          </div>

          <div>
            <label
              htmlFor="makeModel"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Marka / Model
            </label>

            <input
              id="makeModel"
              type="text"
              value={makeModel}
              onChange={(event) =>
                setMakeModel(event.target.value)
              }
              placeholder="Ford Focus"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2]"
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Araç Türü
            </label>

            <select
              id="type"
              value={type}
              onChange={(event) =>
                setType(event.target.value)
              }
              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-[#0B4EA2]"
            >
              <option value="Binek">Binek</option>
              <option value="Ticari">Ticari</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Durum
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-[#0B4EA2]"
            >
              <option value="Aktif">Aktif</option>
              <option value="Bakımda">Bakımda</option>
              <option value="Pasif">Pasif</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Link
              href="/admin/araclar"
              className="rounded-lg border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Vazgeç
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#0B4EA2] px-5 py-3 font-semibold text-white transition hover:bg-[#083a79] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Aracı Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}