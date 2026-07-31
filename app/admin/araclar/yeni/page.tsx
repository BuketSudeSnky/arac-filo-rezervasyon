"use client";

import Link from "next/link";
import {
  useState,
  type FormEvent,
  type SVGProps,
} from "react";
import { useRouter } from "next/navigation";

import { useToast } from "../../../components/ToastProvider";

import {
  createVehicle,
  getVehicles,
  type VehicleRequest,
} from "../../../../api/services/vehicleService";

type IconProps = SVGProps<SVGSVGElement>;

export default function YeniAracPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [licensePlate, setLicensePlate] = useState("");
  const [makeModel, setMakeModel] = useState("");
  const [type, setType] = useState("Binek");
  const [status, setStatus] = useState("Aktif");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError("");

    const normalizedLicensePlate = licensePlate
      .trim()
      .toLocaleUpperCase("tr-TR");

      const formattedLicensePlate = licensePlate
  .trim()
  .replace(/\s+/g, " ")
  .toLocaleUpperCase("tr-TR");

const comparableLicensePlate =
  normalizeLicensePlate(licensePlate);

    const normalizedMakeModel = makeModel.trim();

    if (!comparableLicensePlate) {
      setError("Lütfen araç plakasını girin.");
      return;
    }

    if (!normalizedMakeModel) {
      setError("Lütfen marka ve model bilgisini girin.");
      return;
    }

    const newVehicle: VehicleRequest = {
      licensePlate: formattedLicensePlate,
      makeModel: normalizedMakeModel,
      type,
      status,
    };

    try {
      
      setSaving(true);

      const existingVehicles = await getVehicles();

const plateAlreadyExists = existingVehicles.some(
  (vehicle) =>
    normalizeLicensePlate(vehicle.licensePlate) ===
    comparableLicensePlate
);

if (plateAlreadyExists) {
  const message =
    "Bu plakaya sahip bir araç zaten kayıtlı.";

  setError(message);
  showToast(message, "error");
  return;
}

      await createVehicle(newVehicle);

      showToast("Araç başarıyla eklendi.", "success");

      router.replace("/admin/araclar");
      router.refresh();
    } catch (error) {
      console.error("Araç ekleme hatası:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Araç eklenemedi.";

      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  function normalizeLicensePlate(value: string): string {
  return value
    .replace(/\s+/g, "")
    .toLocaleUpperCase("tr-TR");
}



  return (
    <section className="space-y-8">
      {/* Sayfa başlığı */}
      <div>
        <Link
          href="/admin/araclar"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Araç Yönetimine Dön
        </Link>

        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
          Filo İşlemleri
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Yeni Araç Ekle
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Filoya eklenecek aracın plaka, model, tür ve durum
          bilgilerini girin.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,720px)_minmax(260px,1fr)]">
        {/* Form */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
                <VehicleIcon className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Araç Bilgileri
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Zorunlu alanları eksiksiz doldurun.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 sm:p-8"
          >
            <div>
              <label
                htmlFor="licensePlate"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Plaka
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <PlateIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="licensePlate"
                  type="text"
                  value={licensePlate}
                  onChange={(event) =>
                    setLicensePlate(event.target.value)
                  }
                  placeholder="34 ABC 123"
                  autoComplete="off"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Plaka bilgisi büyük harfe çevrilerek kaydedilir.
              </p>
            </div>

            <div>
              <label
                htmlFor="makeModel"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Marka / Model
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <VehicleIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="makeModel"
                  type="text"
                  value={makeModel}
                  onChange={(event) =>
                    setMakeModel(event.target.value)
                  }
                  placeholder="Ford Focus"
                  autoComplete="off"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="type"
                  className="mb-2 block text-sm font-semibold text-slate-700"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="Binek">Binek</option>
                  <option value="Ticari">Ticari</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-slate-700"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Bakımda">Bakımda</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/admin/araclar"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Vazgeç
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-md disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
              >
                {saving ? (
                  <>
                    <SpinnerIcon className="h-5 w-5 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <SaveIcon className="h-5 w-5" />
                    Aracı Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </section>
  );
}


function VehicleIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 17h14" />
      <path d="M6 17l-1-5 2-5h10l2 5-1 5" />
      <path d="M7 12h10" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function PlateIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h10" />
      <path d="M7 14h6" />
    </svg>
  );
}

function SaveIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 3h12l2 2v16H5Z" />
      <path d="M8 3v6h8V3" />
      <path d="M8 21v-7h8v7" />
    </svg>
  );
}

function ArrowLeftIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

function AlertIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 17h.01" />
    </svg>
  );
}


function SpinnerIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />

      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
} 