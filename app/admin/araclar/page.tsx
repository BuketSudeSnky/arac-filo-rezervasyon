"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type SVGProps,
} from "react";

import { useToast } from "../../components/ToastProvider";

import {
  deleteVehicle,
  getVehicles,
  type Vehicle,
} from "../../../api/services/vehicleService";

import {
  applyLocalVehicleStatus,
} from "../../utils/VehicleStatus";

type IconProps = SVGProps<SVGSVGElement>;

function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, "")
    .trim();
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState<
    number | null
  >(null);

  const { showToast } = useToast();

  useEffect(() => {
    let isCancelled = false;

    async function fetchVehicles() {
      try {
        setLoading(true);
        setError("");

        const data = await getVehicles();

        if (!Array.isArray(data)) {
          throw new Error(
            "Backend araç listesini beklenen formatta döndürmedi."
          );
        }

        if (!isCancelled) {
          setVehicles(
  data.map(applyLocalVehicleStatus)
);
        }
      } catch (error) {
        console.error("Araç yükleme hatası:", error);

        if (!isCancelled) {
          setVehicles([]);

          setError(
            error instanceof Error
              ? error.message
              : "Araçlar yüklenirken bir hata oluştu."
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void fetchVehicles();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function reloadVehicles() {
    try {
      setLoading(true);
      setError("");

      const data = await getVehicles();

      if (!Array.isArray(data)) {
        throw new Error(
          "Backend araç listesini beklenen formatta döndürmedi."
        );
      }

      setVehicles(
  data.map(applyLocalVehicleStatus)
);
    } catch (error) {
      console.error("Araç yükleme hatası:", error);

      setVehicles([]);

      setError(
        error instanceof Error
          ? error.message
          : "Araçlar yüklenirken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredVehicles = useMemo(() => {
  const normalizedSearch =
    normalizeSearchText(searchText);

  const normalizedStatusFilter =
    statusFilter
      .trim()
      .toLocaleLowerCase("tr-TR");

  return vehicles.filter((vehicle) => {
    const normalizedLicensePlate =
      normalizeSearchText(
        vehicle.licensePlate ?? ""
      );

    const normalizedMakeModel =
      normalizeSearchText(
        vehicle.makeModel ?? ""
      );

    const normalizedType =
      normalizeSearchText(
        vehicle.type ?? ""
      );

    const matchesSearch =
      normalizedSearch === "" ||
      normalizedLicensePlate.includes(
        normalizedSearch
      ) ||
      normalizedMakeModel.includes(
        normalizedSearch
      ) ||
      normalizedType.includes(
        normalizedSearch
      );

    const normalizedVehicleStatus =
      vehicle.status
        ?.trim()
        .toLocaleLowerCase("tr-TR");

    const matchesStatus =
      statusFilter === "Tümü" ||
      normalizedVehicleStatus ===
        normalizedStatusFilter;

    return matchesSearch && matchesStatus;
  });
}, [vehicles, searchText, statusFilter]);



  async function handleDelete(id: number) {
    const vehicle = vehicles.find(
      (currentVehicle) => currentVehicle.id === id
    );

    const confirmed = window.confirm(
      vehicle
        ? `${vehicle.licensePlate} plakalı aracı silmek istediğinizden emin misiniz?`
        : "Bu aracı silmek istediğinizden emin misiniz?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteVehicle(id);

      setVehicles((currentVehicles) =>
        currentVehicles.filter(
          (currentVehicle) => currentVehicle.id !== id
        )
      );

      showToast("Araç başarıyla silindi.", "success");
    } catch (error) {
      console.error("Araç silme hatası:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Araç silinemedi.";

      showToast(message, "error");
    } finally {
      setDeletingId(null);
    }
  }

  function clearFilters() {
    setSearchText("");
    setStatusFilter("Tümü");
  }

  const filtersAreActive =
    searchText.trim() !== "" || statusFilter !== "Tümü";

  return (
    <section className="space-y-8">
      {/* Sayfa başlığı */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
            Filo İşlemleri
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Araç Yönetimi
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Filoya kayıtlı araçları görüntüleyin,
            filtreleyin, düzenleyin veya yeni araç ekleyin.
          </p>
        </div>

        <Link
          href="/admin/araclar/yeni"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-md"
        >
          <PlusIcon className="h-5 w-5" />
          Yeni Araç Ekle
        </Link>
      </div>


      {/* Arama ve filtre alanı */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label
              htmlFor="vehicle-search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Araç Ara
            </label>

            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                id="vehicle-search"
                type="search"
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
                placeholder="Plaka, marka/model veya tür ara"
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </div>
          </div>

          <div className="w-full lg:w-60">
            <label
              htmlFor="status-filter"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Araç Durumu
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            >
              <option value="Tümü">Tüm Durumlar</option>
              <option value="Aktif">Aktif</option>
              <option value="Bakımda">Bakımda</option>
              <option value="Pasif">Pasif</option>
            </select>
          </div>

          {filtersAreActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
            >
              <CloseIcon className="h-4 w-4" />
              Filtreleri Temizle
            </button>
          )}
        </div>

        {!loading && !error && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
            <p className="text-slate-500">
              Toplam{" "}
              <span className="font-semibold text-slate-900">
                {vehicles.length}
              </span>{" "}
              araçtan{" "}
              <span className="font-semibold text-slate-900">
                {filteredVehicles.length}
              </span>{" "}
              tanesi gösteriliyor.
            </p>

            {filtersAreActive && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Filtre uygulanıyor
              </span>
            )}
          </div>
        )}
      </div>

      {/* Araç tablosu */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && <VehiclesTableSkeleton />}

        {!loading && error && (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertIcon className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-950">
              Araçlar yüklenemedi
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void reloadVehicles()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <RefreshIcon className="h-4 w-4" />
              Tekrar Dene
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredVehicles.length === 0 && (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <VehicleIcon className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-950">
                {vehicles.length === 0
                  ? "Henüz araç bulunmuyor"
                  : "Araç bulunamadı"}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {vehicles.length === 0
                  ? "Filo yönetimine başlamak için ilk aracınızı ekleyin."
                  : "Arama metnini veya seçtiğiniz durum filtresini değiştirin."}
              </p>

              {vehicles.length === 0 ? (
                <Link
                  href="/admin/araclar/yeni"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
                >
                  <PlusIcon className="h-5 w-5" />
                  Yeni Araç Ekle
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          )}

        {!loading &&
          !error &&
          filteredVehicles.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr className="text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-semibold">
                      Araç
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Marka / Model
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Tür
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Durum
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Son Rezervasyon
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                      İşlemler
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredVehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
                            <VehicleIcon className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="font-bold text-slate-950">
                              {vehicle.licensePlate ||
                                "Plaka belirtilmedi"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Araç No: {vehicle.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">
                          {vehicle.makeModel || "Belirtilmedi"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                          {vehicle.type || "Belirtilmedi"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <VehicleStatusBadge
                          status={vehicle.status}
                        />
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        Henüz eklenmedi
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/araclar/duzenle?id=${vehicle.id}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-slate-950"
                          >
                            <EditIcon className="h-4 w-4" />
                            Düzenle
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDelete(vehicle.id)
                            }
                            disabled={
                              deletingId === vehicle.id
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === vehicle.id ? (
                              <>
                                <SpinnerIcon className="h-4 w-4 animate-spin" />
                                Siliniyor
                              </>
                            ) : (
                              <>
                                <TrashIcon className="h-4 w-4" />
                                Sil
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </section>
  );
}



function VehicleStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus = status?.trim() ?? "";

  const normalizedLowerStatus =
    normalizedStatus.toLocaleLowerCase("tr-TR");

  let badgeClassName =
    "border-slate-200 bg-slate-100 text-slate-700";

  let dotClassName = "bg-slate-400";

  if (
    normalizedLowerStatus === "aktif" ||
    normalizedLowerStatus === "active"
  ) {
    badgeClassName =
      "border-emerald-200 bg-emerald-50 text-emerald-700";

    dotClassName = "bg-emerald-500";
  }

  if (
    normalizedLowerStatus === "bakımda" ||
    normalizedLowerStatus === "maintenance"
  ) {
    badgeClassName =
      "border-amber-200 bg-amber-50 text-amber-700";

    dotClassName = "bg-amber-500";
  }

  if (
    normalizedLowerStatus === "pasif" ||
    normalizedLowerStatus === "passive"
  ) {
    badgeClassName =
      "border-slate-200 bg-slate-100 text-slate-600";

    dotClassName = "bg-slate-400";
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${badgeClassName}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${dotClassName}`}
      />

      {normalizedStatus || "Belirsiz"}
    </span>
  );
}

function VehiclesTableSkeleton() {
  return (
    <div>
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="divide-y divide-slate-100">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-5 px-6 py-5"
          >
            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />

            <div className="flex-1">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="hidden h-4 w-32 animate-pulse rounded bg-slate-200 md:block" />
            <div className="hidden h-7 w-20 animate-pulse rounded-full bg-slate-200 lg:block" />
            <div className="hidden h-9 w-40 animate-pulse rounded-lg bg-slate-200 xl:block" />
          </div>
        ))}
      </div>
    </div>
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

function PlusIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function SearchIcon(props: IconProps) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function EditIcon(props: IconProps) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon(props: IconProps) {
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
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}


function RefreshIcon(props: IconProps) {
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
      <path d="M20 7v5h-5" />
      <path d="M4 17v-5h5" />
      <path d="M6.1 9a7 7 0 0 1 11.5-2L20 12" />
      <path d="M17.9 15a7 7 0 0 1-11.5 2L4 12" />
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

function CloseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
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