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
  cancelReservation,
  getReservations,
  updateReservationStatus,
  type Reservation,
  type ReservationStatus,
} from "../../../api/services/reservationService";

type IconProps = SVGProps<SVGSVGElement>;

const STATUS_OPTIONS: {
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

export default function AdminReservationsPage() {
  const { showToast } = useToast();

  const [reservations, setReservations] = useState<
    Reservation[]
  >([]);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("Tümü");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState<
    number | null
  >(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadReservations() {
      try {
        setLoading(true);
        setError("");

        const data = await getReservations();

        if (!Array.isArray(data)) {
          throw new Error(
            "Backend rezervasyon listesini beklenen formatta döndürmedi."
          );
        }

        if (!isCancelled) {
          setReservations(data);
        }
      } catch (error) {
        console.error(
          "Rezervasyon yükleme hatası:",
          error
        );

        if (!isCancelled) {
          setReservations([]);

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

    void loadReservations();

    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredReservations = useMemo(() => {
    const normalizedSearchText = searchText
      .trim()
      .toLocaleLowerCase("tr-TR");

    return [...reservations]
      .filter((reservation) => {
        const searchableText = [
          reservation.username,
          reservation.vehicle?.licensePlate,
          reservation.vehicle?.makeModel,
          reservation.purpose,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("tr-TR");

        const matchesSearch =
          normalizedSearchText === "" ||
          searchableText.includes(
            normalizedSearchText
          );

        const matchesStatus =
          statusFilter === "Tümü" ||
          reservation.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((firstReservation, secondReservation) => {
        return (
          secondReservation.id - firstReservation.id
        );
      });
  }, [reservations, searchText, statusFilter]);

  async function reloadReservations() {
    try {
      setLoading(true);
      setError("");

      const data = await getReservations();

      if (!Array.isArray(data)) {
        throw new Error(
          "Backend rezervasyon listesini beklenen formatta döndürmedi."
        );
      }

      setReservations(data);
    } catch (error) {
      console.error(
        "Rezervasyon yükleme hatası:",
        error
      );

      setReservations([]);

      setError(
        error instanceof Error
          ? error.message
          : "Rezervasyonlar yüklenirken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    reservationId: number,
    newStatus: ReservationStatus
  ) {
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
  }

  async function handleCancel(
    reservationId: number
  ) {
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
  }

  function clearFilters() {
    setSearchText("");
    setStatusFilter("Tümü");
  }

  const filtersAreActive =
    searchText.trim() !== "" ||
    statusFilter !== "Tümü";

  return (
    <section className="space-y-8">
      {/* Başlık alanı */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
            Rezervasyon İşlemleri
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Rezervasyon Yönetimi
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Şirket rezervasyonlarını görüntüleyin,
            filtreleyin, durumlarını güncelleyin veya
            iptal edin.
          </p>
        </div>

        <Link
          href="/admin/rezervasyonlar/yeni"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-md"
        >
          <PlusIcon className="h-5 w-5" />
          Yeni Rezervasyon
        </Link>
      </div>

      {/* Filtre alanı */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label
              htmlFor="reservation-search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Rezervasyon Ara
            </label>

            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                id="reservation-search"
                type="search"
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
                placeholder="Kullanıcı, plaka, araç veya amaç ara"
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </div>
          </div>

          <div className="w-full lg:w-64">
            <label
              htmlFor="status-filter"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Rezervasyon Durumu
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            >
              <option value="Tümü">
                Tüm Durumlar
              </option>

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
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">
              Toplam{" "}
              <span className="font-semibold text-slate-950">
                {reservations.length}
              </span>{" "}
              rezervasyondan{" "}
              <span className="font-semibold text-slate-950">
                {filteredReservations.length}
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

      {/* Rezervasyon tablosu */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && <ReservationTableSkeleton />}

        {!loading && error && (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertIcon className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-950">
              Rezervasyonlar yüklenemedi
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void reloadReservations()
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <RefreshIcon className="h-4 w-4" />
              Tekrar Dene
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredReservations.length === 0 && (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <CalendarIcon className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-950">
                Rezervasyon bulunamadı
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {reservations.length === 0
                  ? "Sistemde henüz kayıtlı bir rezervasyon bulunmuyor."
                  : "Arama metnini veya seçtiğiniz durum filtresini değiştirin."}
              </p>

              {filtersAreActive && (
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
          filteredReservations.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr className="text-xs uppercase tracking-wider text-slate-500">
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

                <tbody className="divide-y divide-slate-100">
                  {filteredReservations.map(
                    (reservation) => {
                      const isExpired =
                        isReservationExpired(
                          reservation.endDate
                        );

                      const actionsAreDisabled =
                        isExpired ||
                        reservation.status ===
                          "Completed" ||
                        reservation.status ===
                          "Cancelled" ||
                        updatingId === reservation.id;

                      return (
                        <tr
                          key={reservation.id}
                          className={`transition hover:bg-slate-50/80 ${
                            isExpired
                              ? "bg-slate-50/70"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
                                <UserIcon className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-950">
                                  {reservation.username ||
                                    "Kullanıcı bilgisi yok"}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  Rezervasyon No:{" "}
                                  {reservation.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800">
                              {reservation.vehicle
                                ?.licensePlate ??
                                "Araç bilgisi yok"}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {reservation.vehicle
                                ?.makeModel ??
                                "Model bilgisi yok"}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-slate-400" />

                              {formatDate(
                                reservation.startDate
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-slate-400" />

                              {formatDate(
                                reservation.endDate
                              )}
                            </div>

                            {isExpired && (
                              <span className="mt-2 inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                                Süresi geçti
                              </span>
                            )}
                          </td>

                          <td className="max-w-[240px] px-6 py-4">
                            <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                              {reservation.purpose ||
                                "Amaç belirtilmedi"}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <ReservationStatusBadge
                              status={
                                reservation.status
                              }
                            />
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <select
                                aria-label="Rezervasyon durumunu güncelle"
                                value={
                                  reservation.status
                                }
                                disabled={
                                  actionsAreDisabled
                                }
                                onChange={(event) =>
                                  void handleStatusChange(
                                    reservation.id,
                                    event.target
                                      .value as ReservationStatus
                                  )
                                }
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                {STATUS_OPTIONS.map(
                                  (status) => (
                                    <option
                                      key={
                                        status.value
                                      }
                                      value={
                                        status.value
                                      }
                                    >
                                      {status.label}
                                    </option>
                                  )
                                )}
                              </select>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleCancel(
                                    reservation.id
                                  )
                                }
                                disabled={
                                  actionsAreDisabled
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {updatingId ===
                                reservation.id ? (
                                  <>
                                    <SpinnerIcon className="h-4 w-4 animate-spin" />
                                    İşleniyor
                                  </>
                                ) : (
                                  <>
                                    <CloseIcon className="h-4 w-4" />
                                    İptal Et
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </section>
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
    Planned:
      "border-blue-200 bg-blue-50 text-blue-700",
    InProgress:
      "border-amber-200 bg-amber-50 text-amber-700",
    Completed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    Cancelled:
      "border-red-200 bg-red-50 text-red-700",
  };

  const dotStyle: Record<string, string> = {
    Planned: "bg-blue-500",
    InProgress: "bg-amber-500",
    Completed: "bg-emerald-500",
    Cancelled: "bg-red-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        statusStyle[status] ??
        "border-slate-200 bg-slate-100 text-slate-700"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          dotStyle[status] ?? "bg-slate-400"
        }`}
      />

      {statusText[status] ?? status}
    </span>
  );
}

function ReservationTableSkeleton() {
  return (
    <div>
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="h-4 w-52 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="divide-y divide-slate-100">
        {Array.from({ length: 5 }).map(
          (_, index) => (
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

              <div className="hidden h-7 w-24 animate-pulse rounded-full bg-slate-200 lg:block" />

              <div className="hidden h-9 w-44 animate-pulse rounded-lg bg-slate-200 xl:block" />
            </div>
          )
        )}
      </div>
    </div>
  );
}

function formatDate(date: string) {
  if (!date) {
    return "Tarih belirtilmedi";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

function isReservationExpired(endDate: string) {
  if (!endDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reservationEndDate = new Date(
    `${endDate}T00:00:00`
  );

  if (
    Number.isNaN(reservationEndDate.getTime())
  ) {
    return false;
  }

  return reservationEndDate < today;
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

function UserIcon(props: IconProps) {
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
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function CalendarIcon(props: IconProps) {
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
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
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