"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "./../../../components/ToastProvider";

import {
  getVehicleById,
  updateVehicle,
  type VehicleRequest,
} from "../../../../api/services/vehicleService";

export default function AdminAracDuzenlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const vehicleId = Number(searchParams.get("id"));

  const [licensePlate, setLicensePlate] = useState("");
  const [makeModel, setMakeModel] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadVehicle = async () => {
      if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
        setError("Geçerli bir araç seçilmedi.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const vehicle = await getVehicleById(vehicleId);

        setLicensePlate(vehicle.licensePlate);
        setMakeModel(vehicle.makeModel);
        setType(vehicle.type);
        setStatus(vehicle.status);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Araç bilgileri yüklenemedi."
        );
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [vehicleId]);

  const handleUpdate = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
      setError("Geçerli bir araç seçilmedi.");
      return;
    }

    if (!licensePlate.trim()) {
      setError("Plaka alanı boş bırakılamaz.");
      return;
    }

    if (!makeModel.trim()) {
      setError("Marka / model alanı boş bırakılamaz.");
      return;
    }

    if (!type) {
      setError("Araç türünü seçin.");
      return;
    }

    if (!status) {
      setError("Araç durumunu seçin.");
      return;
    }

    const updatedVehicle: VehicleRequest = {
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

      await updateVehicle(vehicleId, updatedVehicle);

showToast("Araç başarıyla güncellendi.", "success");

router.push("/admin/araclar");
router.refresh();
    } catch (error) {
  console.error(error);

  const message =
    error instanceof Error
      ? error.message
      : "Araç güncellenemedi.";

  setError(message);
  showToast(message, "error");
} finally {
  setSaving(false);
}
  };

  if (loading) {
    return (
      <section>
        <div className="max-w-2xl rounded-xl bg-white p-8 shadow-sm">
          <p className="text-gray-500">
            Araç bilgileri yükleniyor...
          </p>
        </div>
      </section>
    );
  }

  if (error && !licensePlate) {
    return (
      <section>
        <div className="max-w-2xl rounded-xl bg-white p-8 shadow-sm">
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
          </div>

          <Link
            href="/admin/araclar"
            className="mt-5 inline-block rounded-lg border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Araç Yönetimine Dön
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Aracı Düzenle
        </h1>

        <p className="mt-1 text-gray-500">
          Araç bilgilerini güncelleyin.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl bg-white p-8 shadow-sm">
        <form
          onSubmit={handleUpdate}
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
                setLicensePlate(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-lg border px-4 py-3 uppercase outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
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
              disabled={saving}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
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
              disabled={saving}
              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
            >
              <option value="">Tür seçin</option>
              <option value="Binek">Binek</option>
              <option value="Ticari">Ticari</option>
              <option value="SUV">SUV</option>
              <option value="Minibüs">Minibüs</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Araç Durumu
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-[#0B4EA2] disabled:bg-gray-100"
            >
              <option value="">Durum seçin</option>
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
              className="rounded-lg bg-[#0B4EA2] px-5 py-3 font-semibold text-white hover:bg-[#083a79] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Güncelleniyor..."
                : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}