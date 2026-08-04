"use client";

import Link from "next/link";
import {
  type FormEvent,
  type SVGProps,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  DayPicker,
  type DateRange,
} from "react-day-picker";

import "react-day-picker/style.css";

import { tr } from "date-fns/locale";

import {
  createReservation,
  getReservations,
  type Reservation,
  type ReservationRequest,
} from "../../../../api/services/reservationService";

type IconProps = SVGProps<SVGSVGElement>;

function parseApiDate(date: string): Date {
  const [year, month, day] = date
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
}

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(date: string): string {
  return parseApiDate(date).toLocaleDateString(
    "tr-TR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}

export default function YeniRezervasyonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const vehicleId =
    searchParams.get("vehicleId") ?? "";

  const [username] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return (
      localStorage.getItem("username") ?? ""
    );
  });

  const [selectedRange, setSelectedRange] =
    useState<DateRange | undefined>();

  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [
    reservationsLoading,
    setReservationsLoading,
  ] = useState(true);

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [purpose, setPurpose] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadReservations() {
      try {
        setReservationsLoading(true);

        const data = await getReservations();

        if (!isCancelled) {
          setReservations(data);
        }
      } catch (error) {
        console.error(
          "Rezervasyon tarihleri alınamadı:",
          error
        );

        if (!isCancelled) {
          setSubmitError(
            error instanceof Error
              ? error.message
              : "Araç rezervasyon tarihleri yüklenemedi."
          );
        }
      } finally {
        if (!isCancelled) {
          setReservationsLoading(false);
        }
      }
    }

    void loadReservations();

    return () => {
      isCancelled = true;
    };
  }, []);

  const reservedRanges =
    useMemo<DateRange[]>(() => {
      if (!vehicleId) {
        return [];
      }

      return reservations
        .filter((reservation) => {
          const reservationVehicleId =
            reservation.vehicle?.id;

          const isSameVehicle =
            reservationVehicleId ===
            Number(vehicleId);

          const isCancelled =
            reservation.status ===
            "Cancelled";

          return (
            isSameVehicle && !isCancelled
          );
        })
        .map((reservation) => ({
          from: parseApiDate(
            reservation.startDate
          ),

          to: parseApiDate(
            reservation.endDate
          ),
        }));
    }, [reservations, vehicleId]);

  const isFormValid =
    vehicleId !== "" &&
    username.trim() !== "" &&
    startDate !== "" &&
    endDate !== "" &&
    purpose.trim() !== "" &&
    endDate >= startDate;

  function handleRangeSelect(
    range: DateRange | undefined
  ) {
    setSelectedRange(range);
    setSubmitError("");

    if (range?.from) {
      setStartDate(
        formatDateForApi(range.from)
      );
    } else {
      setStartDate("");
    }

    if (range?.to) {
      setEndDate(
        formatDateForApi(range.to)
      );
    } else {
      setEndDate("");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!isFormValid) {
      setSubmitError(
        "Lütfen rezervasyon tarihlerini ve rezervasyon amacını eksiksiz girin."
      );

      return;
    }

    const reservationData: ReservationRequest =
      {
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

      await createReservation(
        reservationData
      );

      router.push(
        "/dashboard/rezervasyonlarim"
      );
    } catch (error) {
  console.error(
    "Rezervasyon oluşturma hatası:",
    error
  );

  const message =
    error instanceof Error
      ? error.message
      : "Rezervasyon oluşturulamadı.";

  setSubmitError(message);

  if (
    message
      .toLocaleLowerCase("tr-TR")
      .includes("bakımda")
  ) {
    setSelectedRange(undefined);
    setStartDate("");
    setEndDate("");

    window.setTimeout(() => {
      router.push("/dashboard/araclar");
      router.refresh();
    }, 1800);
  }
} finally {
  setSaving(false);
}
  }

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <section>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
          Rezervasyon
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Yeni Rezervasyon
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Seçtiğiniz araç için uygun tarih
          aralığını belirleyin ve rezervasyon
          amacınızı girin.
        </p>
      </section>

      {/* Araç seçilmedi uyarısı */}
      {!vehicleId && (
        <section className="flex flex-col gap-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertIcon className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-amber-950">
                Herhangi bir araç seçilmedi
              </h2>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                Rezervasyon oluşturmak için
                önce araçlar sayfasından bir
                araç seçmelisiniz.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/araclar"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <CarIcon className="h-4 w-4" />
            Araçlara Git
          </Link>
        </section>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Tarih seçimi */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
              <CalendarIcon className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Rezervasyon Tarihleri
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Takvimden başlangıç ve bitiş
                tarihini seçin.
              </p>
            </div>
          </div>

          <div className="p-6">
            {reservationsLoading ? (
              <CalendarSkeleton />
            ) : (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                {/* Takvim */}
                <div className="flex min-h-96 items-center justify-center overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                  <DayPicker
                    mode="range"
                    locale={tr}
                    selected={selectedRange}
                    onSelect={
                      handleRangeSelect
                    }
                    disabled={[
                      {
                        before:
                          getStartOfToday(),
                      },

                      ...reservedRanges,
                    ]}
                    excludeDisabled
                    modifiers={{
                      reserved:
                        reservedRanges,
                    }}
                    modifiersClassNames={{
                      reserved:
                        "reserved-day",
                    }}
                    className="reservation-calendar"
                  />
                </div>

                {/* Takvim bilgileri */}
                <aside className="space-y-5">
                  <div className="rounded-2xl bg-slate-950 p-5 text-white">
                    <div className="flex items-center gap-2 text-amber-300">
                      <CalendarCheckIcon className="h-5 w-5" />

                      <p className="text-sm font-semibold">
                        Seçilen Tarihler
                      </p>
                    </div>

                    {startDate ? (
                      <div className="mt-5 space-y-4">
                        <DateInfo
                          label="Başlangıç"
                          value={formatDateForDisplay(
                            startDate
                          )}
                        />

                        <DateInfo
                          label="Bitiş"
                          value={
                            endDate
                              ? formatDateForDisplay(
                                  endDate
                                )
                              : "Bitiş tarihi seçin"
                          }
                        />
                      </div>
                    ) : (
                      <p className="mt-4 text-sm leading-6 text-slate-300">
                        Henüz bir tarih aralığı
                        seçmediniz.
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm font-bold text-slate-950">
                      Takvim Açıklaması
                    </p>

                    <div className="mt-4 space-y-3">
                      <LegendItem
                        className="border border-red-200 bg-red-100"
                        label="Rezerve edilmiş günler"
                      />

                      <LegendItem
                        className="bg-amber-400"
                        label="Seçtiğiniz tarihler"
                      />

                      <LegendItem
                        className="border border-slate-300 bg-white"
                        label="Müsait günler"
                      />
                    </div>
                  </div>

                </aside>
              </div>
            )}
          </div>
        </section>

        {/* Rezervasyon bilgileri */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
              <NoteIcon className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Rezervasyon Bilgileri
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Aracı hangi amaçla
                kullanacağınızı belirtin.
              </p>
            </div>
          </div>

          <div className="p-6">
            <label
              htmlFor="purpose"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Rezervasyon Amacı
            </label>

            <textarea
              id="purpose"
              value={purpose}
              onChange={(event) => {
                setPurpose(
                  event.target.value
                );

                setSubmitError("");
              }}
              disabled={saving || !vehicleId}
              rows={5}
              maxLength={500}
              placeholder="Örneğin: Müşteri ziyareti, şehir dışı toplantısı..."
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-400">
                Rezervasyon amacınızı kısa
                ve açıklayıcı şekilde yazın.
              </p>

              <p className="shrink-0 text-xs font-medium text-slate-400">
                {purpose.length}/500
              </p>
            </div>
          </div>
        </section>

        {/* Hata mesajı */}
        {submitError && (
          <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="text-sm font-bold">
                Rezervasyon oluşturulamadı
              </p>

              <p className="mt-1 text-sm leading-6">
                {submitError}
              </p>
            </div>
          </section>
        )}

        {/* Butonlar */}
        <section className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-400">
            Rezervasyon oluşturulduktan
            sonra rezervasyonlarınız
            sayfasından takip edebilirsiniz.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Link
              href="/dashboard/araclar"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Vazgeç
            </Link>

            <button
              type="submit"
              disabled={
                saving || !isFormValid
              }
              className="inline-flex min-w-52 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {saving ? (
                <>
                  <LoadingIcon className="h-4 w-4 animate-spin" />
                  Kaydediliyor
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Rezervasyonu Oluştur
                </>
              )}
            </button>
          </div>
        </section>
      </form>

      {/* DayPicker renkleri */}
      <style jsx global>{`
        .reservation-calendar {
          --rdp-accent-color: #fbbf24;
          --rdp-accent-background-color: #fef3c7;
          --rdp-day_button-border-radius: 0.75rem;
          color: #0f172a;
        }

        .reservation-calendar
          .rdp-month_caption {
          font-weight: 700;
          color: #0f172a;
        }

        .reservation-calendar
          .rdp-button_previous,
        .reservation-calendar
          .rdp-button_next {
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          background: #ffffff;
          color: #334155;
          transition:
            background-color 150ms ease,
            border-color 150ms ease;
        }

        .reservation-calendar
          .rdp-button_previous:hover,
        .reservation-calendar
          .rdp-button_next:hover {
          border-color: #fbbf24;
          background: #fffbeb;
        }

        .reservation-calendar
          .rdp-weekday {
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .reservation-calendar
          .rdp-day_button {
          font-size: 0.875rem;
          transition:
            background-color 150ms ease,
            color 150ms ease;
        }

        .reservation-calendar
          .rdp-day_button:hover {
          background: #f1f5f9;
        }

        .reservation-calendar
          .rdp-selected
          .rdp-day_button {
          border-color: #fbbf24;
          background: #fbbf24;
          color: #0f172a;
          font-weight: 700;
        }

        .reservation-calendar
          .rdp-range_middle
          .rdp-day_button {
          border-radius: 0;
          background: #fef3c7;
          color: #92400e;
        }

        .reservation-calendar
          .reserved-day
          .rdp-day_button {
          border: 1px solid #fecaca;
          background: #fee2e2;
          color: #b91c1c;
          text-decoration: line-through;
          opacity: 1;
        }

        .reservation-calendar
          .rdp-disabled:not(.reserved-day)
          .rdp-day_button {
          color: #cbd5e1;
          opacity: 0.6;
        }

        .reservation-calendar
          .rdp-today:not(.rdp-selected)
          .rdp-day_button {
          border: 1px solid #fbbf24;
          color: #92400e;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

function getStartOfToday(): Date {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
}

function DateInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function LegendItem({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`h-4 w-4 shrink-0 rounded ${className}`}
      />

      <span className="text-sm text-slate-600">
        {label}
      </span>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="mx-auto h-5 w-40 animate-pulse rounded bg-slate-200" />

        <div className="mt-8 grid grid-cols-7 gap-3">
          {Array.from({
            length: 35,
          }).map((_, index) => (
            <div
              key={index}
              className="aspect-square animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />

        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

function CalendarIcon(
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
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function CalendarCheckIcon(
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
        y="4"
        width="18"
        height="17"
        rx="2"
      />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M3 9h18" />
      <path d="m8 15 2 2 5-5" />
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

function AlertIcon(
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
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M12 8v5" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function InfoIcon(props: IconProps) {
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
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function CheckIcon(
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
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function LoadingIcon(
  props: IconProps
) {
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