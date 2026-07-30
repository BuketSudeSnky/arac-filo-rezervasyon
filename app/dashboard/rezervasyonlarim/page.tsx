"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type SVGProps,
} from "react";

import ConfirmModal from "../../components/ConfirmModal";
import { useToast } from "./../../components/ToastProvider";

import {
  cancelReservation,
  getReservations,
  type Reservation,
} from "../../../api/services/reservationService";

type IconProps = SVGProps<SVGSVGElement>;

export default function RezervasyonlarimPage() {
  const { showToast } = useToast();

  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancellingId, setCancellingId] =
    useState<number | null>(null);

  const [
  reservationToCancel,
  setReservationToCancel,
] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadReservations() {
      try {
        setLoading(true);
        setError("");

        const username =
          localStorage.getItem("username");

        if (!username) {
          throw new Error(
            "Kullanıcı bilgisi bulunamadı."
          );
        }

        const allReservations =
          await getReservations();

        const userReservations =
          allReservations.filter(
            (reservation) =>
              reservation.username === username
          );

        if (!isCancelled) {
          setReservations(userReservations);
        }
      } catch (error) {
        console.error(
          "Rezervasyonlar alınamadı:",
          error
        );

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

    void loadReservations();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function handleCancel(
  reservationId: number
) {
  setReservationToCancel(reservationId);
}
    async function confirmCancellation() {
  if (reservationToCancel === null) {
    return;
  }

  try {
    setCancellingId(reservationToCancel);

    const updatedReservation =
      await cancelReservation(
        reservationToCancel
      );

    setReservations((current) =>
      current.map((reservation) =>
        reservation.id ===
        reservationToCancel
          ? updatedReservation
          : reservation
      )
    );

    showToast(
      "Rezervasyon başarıyla iptal edildi.",
      "success"
    );
  } catch (error) {
    showToast(
      error instanceof Error
        ? error.message
        : "Rezervasyon iptal edilemedi.",
      "error"
    );
  } finally {
    setReservationToCancel(null);
    setCancellingId(null);
  }
}
  if (loading) {
    return <ReservationSkeleton />;
  }

  if (error) {
    return (
      <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-red-200 bg-white px-6 py-12 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertIcon className="h-7 w-7" />
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-950">
          Rezervasyonlar yüklenemedi
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-red-600">
          {error}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sayfa başlığı */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
            Rezervasyon
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Rezervasyonlarım
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Oluşturduğunuz rezervasyonları
            görüntüleyebilir, durumlarını takip
            edebilir ve uygun olanları iptal
            edebilirsiniz.
          </p>
        </div>

        <Link
          href="/dashboard/araclar"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-amber-300"
        >
          <PlusIcon className="h-4 w-4" />
          Yeni Rezervasyon
        </Link>
      </section>

     
      {/* Boş durum */}
      {reservations.length === 0 ? (
        <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <CalendarIcon className="h-8 w-8" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            Henüz rezervasyonunuz yok
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Müsait araçları inceleyerek ilk
            rezervasyonunuzu oluşturabilirsiniz.
          </p>

          <Link
            href="/dashboard/araclar"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Araçları İncele
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </section>
      ) : (
        <section className="grid gap-5">
          {reservations.map((reservation) => {
            const isExpired =
              isReservationExpired(
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
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                  isExpired
                    ? "border-slate-200 opacity-75"
                    : "border-slate-200 hover:border-amber-300 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
                      <CarIcon className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Araç
                      </p>

                      <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                        {reservation.vehicle
                          ?.makeModel ??
                          "Araç bilgisi yok"}
                      </h2>

                      <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
                        <PlateIcon className="h-4 w-4 text-slate-500" />

                        <span className="text-sm font-semibold tracking-wider text-slate-700">
                          {reservation.vehicle
                            ?.licensePlate ??
                            "Plaka bilgisi yok"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ReservationStatusBadge
                    status={reservation.status}
                    isExpired={isExpired}
                  />
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  <ReservationInfo
                    icon={
                      <CalendarStartIcon className="h-5 w-5" />
                    }
                    label="Başlangıç Tarihi"
                    value={formatDate(
                      reservation.startDate
                    )}
                  />

                  <ReservationInfo
                    icon={
                      <CalendarEndIcon className="h-5 w-5" />
                    }
                    label="Bitiş Tarihi"
                    value={formatDate(
                      reservation.endDate
                    )}
                    warning={
                      isExpired
                        ? "Rezervasyon süresi geçti"
                        : undefined
                    }
                  />

                  <ReservationInfo
                    icon={
                      <NoteIcon className="h-5 w-5" />
                    }
                    label="Rezervasyon Amacı"
                    value={
                      reservation.purpose ||
                      "Amaç belirtilmedi"
                    }
                  />
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                  <button
                    type="button"
                    onClick={() =>
                      void handleCancel(
                        reservation.id
                      )
                    }
                    disabled={cannotCancel}
                    title={getCancelButtonTitle(
                      reservation.status,
                      isExpired
                    )}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {isCancelling ? (
                      <>
                        <LoadingIcon className="h-4 w-4 animate-spin" />
                        İptal ediliyor
                      </>
                    ) : (
                      <>
                        <TrashIcon className="h-4 w-4" />
                        İptal Et
                      </>
                    )}
                  </button>

                  <ConfirmModal
  open={reservationToCancel !== null}
  title="Rezervasyonu İptal Et"
  message="Bu rezervasyonu iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz."
  confirmText="İptal Et"
  cancelText="Vazgeç"
  loading={reservationToCancel === cancellingId}
  onCancel={() =>
    setReservationToCancel(null)
  }
  onConfirm={() => {
    void confirmCancellation();
  }}
/>

                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}


function ReservationInfo({
  icon,
  label,
  value,
  warning,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  warning?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <p className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">
        {value}
      </p>

      {warning && (
        <p className="mt-1 text-xs font-semibold text-red-600">
          {warning}
        </p>
      )}
    </div>
  );
}

function ReservationStatusBadge({
  status,
  isExpired,
}: {
  status: string;
  isExpired: boolean;
}) {
  if (
    isExpired &&
    status !== "Cancelled" &&
    status !== "Completed"
  ) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        Süresi Geçti
      </span>
    );
  }

  const statusText: Record<string, string> = {
    Planned: "Planlandı",
    InProgress: "Devam Ediyor",
    Completed: "Tamamlandı",
    Cancelled: "İptal Edildi",
  };

  const statusStyle: Record<string, string> = {
    Planned:
      "border-amber-200 bg-amber-50 text-amber-700",
    InProgress:
      "border-blue-200 bg-blue-50 text-blue-700",
    Completed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    Cancelled:
      "border-red-200 bg-red-50 text-red-700",
  };

  const dotStyle: Record<string, string> = {
    Planned: "bg-amber-500",
    InProgress: "bg-blue-500",
    Completed: "bg-emerald-500",
    Cancelled: "bg-red-500",
  };

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
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

function ReservationSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-9 w-64 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          )
        )}
      </div>

      <div className="space-y-5">
        {Array.from({ length: 3 }).map(
          (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="h-28 animate-pulse bg-slate-100" />

              <div className="grid gap-4 p-6 sm:grid-cols-3">
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
              </div>
            </div>
          )
        )}
        
      </div>
      
    </div>
  );
}

function getCancelButtonTitle(
  status: string,
  isExpired: boolean
) {
  if (isExpired) {
    return "Süresi geçmiş rezervasyon iptal edilemez.";
  }

  if (status === "Cancelled") {
    return "Bu rezervasyon zaten iptal edilmiş.";
  }

  if (status === "Completed") {
    return "Tamamlanmış rezervasyon iptal edilemez.";
  }

  return undefined;
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
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
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
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function CalendarStartIcon(
  props: IconProps
) {
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
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
      <path d="m13 14-3 3" />
      <path d="M10 14v3h3" />
    </svg>
  );
}

function CalendarEndIcon(
  props: IconProps
) {
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
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
      <path d="m11 17 3-3" />
      <path d="M11 14h3v3" />
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

function ArrowRightIcon(
  props: IconProps
) {
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
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CarIcon(props: IconProps) {
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
      <path d="m5 11 2-5h10l2 5" />
      <path d="M3 13a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5H3Z" />
      <path d="M5 18v2" />
      <path d="M19 18v2" />
      <path d="M7 15h.01" />
      <path d="M17 15h.01" />
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
      <rect
        x="3"
        y="7"
        width="18"
        height="10"
        rx="2"
      />
      <path d="M7 12h.01" />
      <path d="M17 12h.01" />
      <path d="M10 12h4" />
    </svg>
  );
}

function NoteIcon(props: IconProps) {
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
      <path d="M4 4h16v16H4Z" />
      <path d="M8 9h8" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
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
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
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

function LoadingIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.2-8.6" />
    </svg>
  );
}