"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type SVGProps,
} from "react";

import {
  getAvailableVehicles,
  getVehicles,
  type Vehicle,
} from "../../../api/services/vehicleService";


type IconProps = SVGProps<SVGSVGElement>;
function getVehicleImage(
  licensePlate: string
) {
  if (!licensePlate) {
    return "/images/vehicles/default-car.jpg";
  }

  const plate = licensePlate
    .replace(/\s+/g, "")
    .toUpperCase();

  return `/images/vehicles/${plate}.jpg`;
}

export default function DashboardAraclarPage() {
  const [araclar, setAraclar] = useState<Vehicle[]>([]);

  const [tur, setTur] = useState("Tümü");
  const [durum, setDurum] = useState("Tümü");

  const [baslangicTarihi, setBaslangicTarihi] =
    useState("");
  const [bitisTarihi, setBitisTarihi] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [
    musaitAraclarGetirildi,
    setMusaitAraclarGetirildi,
  ] = useState(false);

  const [
    musaitAraclarLoading,
    setMusaitAraclarLoading,
  ] = useState(false);

  const today = new Date()
    .toISOString()
    .split("T")[0];

    function VehicleImage({
  vehicle,
}: {
  vehicle: Vehicle;
}) {
  const [imageSrc, setImageSrc] =
    useState(
      getVehicleImage(vehicle.licensePlate)
    );

  return (
    <Image
      src={imageSrc}
      alt={vehicle.makeModel}
      fill
      sizes="(max-width: 768px) 100vw,
             (max-width: 1280px) 50vw,
             33vw"
      className="object-cover transition duration-300 group-hover:scale-105"
      onError={() =>
        setImageSrc(
          "/images/vehicles/default-car.jpg"
        )
      }
    />
  );
}

  useEffect(() => {
    let isCancelled = false;

    async function araclariGetir() {
      try {
        setLoading(true);
        setError("");

        const data = await getVehicles();

        if (!isCancelled) {
  setAraclar(data);
}
      } catch (error) {
        console.error("Araçlar alınamadı:", error);

        if (!isCancelled) {
          setAraclar([]);

          setError(
            error instanceof Error
              ? error.message
              : "Araçlar alınamadı."
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void araclariGetir();

    return () => {
      isCancelled = true;
    };
  }, []);

  const filtrelenmisAraclar = useMemo(() => {
    return araclar.filter((arac) => {
      const turUygun =
        tur === "Tümü" || arac.type === tur;

      const durumUygun =
        durum === "Tümü" ||
        arac.status === durum;

      return turUygun && durumUygun;
    });
  }, [araclar, tur, durum]);

  async function handleMusaitAraclariGoster() {
    if (!baslangicTarihi || !bitisTarihi) {
      setError(
        "Lütfen başlangıç ve bitiş tarihlerini seçin."
      );
      return;
    }

    if (bitisTarihi < baslangicTarihi) {
      setError(
        "Bitiş tarihi başlangıç tarihinden önce olamaz."
      );
      return;
    }

    try {
      setMusaitAraclarLoading(true);
      setError("");

      const data = await getAvailableVehicles(
        baslangicTarihi,
        bitisTarihi
      );

      setAraclar(data);
      
      setMusaitAraclarGetirildi(true);
    } catch (error) {
      console.error(
        "Müsait araçlar alınamadı:",
        error
      );

      setAraclar([]);
      setMusaitAraclarGetirildi(false);

      setError(
        error instanceof Error
          ? error.message
          : "Müsait araçlar alınamadı."
      );
    } finally {
      setMusaitAraclarLoading(false);
    }
  }

  async function handleTumAraclariGoster() {
    try {
      setLoading(true);
      setError("");

      const data = await getVehicles();

      setAraclar(data);
      setMusaitAraclarGetirildi(false);
      setBaslangicTarihi("");
      setBitisTarihi("");
    } catch (error) {
      console.error(
        "Araçlar yeniden alınamadı:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Araçlar alınamadı."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleBaslangicTarihiDegistir(
    selectedDate: string
  ) {
    setBaslangicTarihi(selectedDate);
    setMusaitAraclarGetirildi(false);
    setError("");

    if (
      bitisTarihi &&
      selectedDate > bitisTarihi
    ) {
      setBitisTarihi("");
    }
  }

  function handleBitisTarihiDegistir(
    selectedDate: string
  ) {
    setBitisTarihi(selectedDate);
    setMusaitAraclarGetirildi(false);
    setError("");
  }

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <section>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
          Filo
        </p>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Araçlar
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Araçları görüntüleyebilir,
              filtreleyebilir ve seçtiğiniz tarih
              aralığına göre müsait araçları
              listeleyebilirsiniz.
            </p>
          </div>
        </div>
      </section>

      {/* Tarih aralığı */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
                <CalendarSearchIcon className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Müsait Araçları Görüntüle
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Rezervasyon tarihlerinizi seçerek
                  uygun araçları listeleyin.
                </p>
              </div>
            </div>
          </div>

          {musaitAraclarGetirildi && (
            <button
              type="button"
              onClick={() =>
                void handleTumAraclariGoster()
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshIcon className="h-4 w-4" />
              Tüm Araçları Göster
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div>
            <label
              htmlFor="baslangicTarihi"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Başlangıç Tarihi
            </label>

            <input
              id="baslangicTarihi"
              type="date"
              min={today}
              value={baslangicTarihi}
              onChange={(event) =>
                handleBaslangicTarihiDegistir(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </div>

          <div>
            <label
              htmlFor="bitisTarihi"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Bitiş Tarihi
            </label>

            <input
              id="bitisTarihi"
              type="date"
              min={baslangicTarihi || today}
              value={bitisTarihi}
              onChange={(event) =>
                handleBitisTarihiDegistir(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              void handleMusaitAraclariGoster()
            }
            disabled={
              musaitAraclarLoading ||
              !baslangicTarihi ||
              !bitisTarihi
            }
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {musaitAraclarLoading ? (
              <>
                <LoadingIcon className="h-4 w-4 animate-spin" />
                Araçlar aranıyor
              </>
            ) : (
              <>
                <SearchIcon className="h-4 w-4" />
                Müsait Araçları Göster
              </>
            )}
          </button>
        </div>
      </section>

      {/* Filtreler */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="grid flex-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="tur"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Araç Türü
              </label>

              <select
                id="tur"
                value={tur}
                onChange={(event) =>
                  setTur(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              >
                <option value="Tümü">Tüm Türler</option>
                <option value="Binek">Binek</option>
                <option value="Ticari">Ticari</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="durum"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Araç Durumu
              </label>

              <select
                id="durum"
                value={durum}
                onChange={(event) =>
                  setDurum(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              >
                <option value="Tümü">
                  Tüm Durumlar
                </option>
                <option value="Aktif">Aktif</option>
                <option value="Bakımda">
                  Bakımda
                </option>
              </select>
            </div>
          </div>

          {(tur !== "Tümü" ||
            durum !== "Tümü") && (
            <button
              type="button"
              onClick={() => {
                setTur("Tümü");
                setDurum("Tümü");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <CloseIcon className="h-4 w-4" />
              Filtreleri Temizle
            </button>
          )}
        </div>
      </section>

      {/* Hata */}
      {error && (
        <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />

          <p className="text-sm font-medium">
            {error}
          </p>
        </section>
      )}

      {/* Yüklenme */}
      {loading && <VehicleCardSkeleton />}

      {/* Boş liste */}
      {!loading &&
        !error &&
        filtrelenmisAraclar.length === 0 && (
          <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <CarIcon className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-950">
              Araç bulunamadı
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {musaitAraclarGetirildi
                ? "Seçtiğiniz tarih aralığında müsait araç bulunmuyor."
                : "Seçilen filtrelere uygun araç bulunmuyor."}
            </p>
          </section>
        )}

      {/* Araç kartları */}
      {!loading &&
        !error &&
        filtrelenmisAraclar.length > 0 && (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtrelenmisAraclar.map((arac) => {
              const isActive =
                normalizeValue(arac.status) ===
                "aktif";

              return (
                <article
                  key={arac.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
                >
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={getVehicleImage(arac.licensePlate)}
                      alt={arac.makeModel}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/70 to-transparent" />

                    <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm backdrop-blur">
                      {arac.type}
                    </span>

                    <span
                      className={`absolute right-4 top-4 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur ${
                        isActive
                          ? "border-emerald-200 bg-emerald-50/95 text-emerald-700"
                          : "border-amber-200 bg-amber-50/95 text-amber-800"
                      }`}
                    >
                      {arac.status}
                    </span>

                    <p className="absolute bottom-4 left-4 text-sm font-semibold tracking-wider text-white">
                      {arac.licensePlate}
                    </p>
                  </div>

                  <div className="p-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                        Araç
                      </p>

                      <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                        {arac.makeModel}
                      </h2>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <VehicleInfo
                        label="Tür"
                        value={arac.type}
                      />

                      <VehicleInfo
                        label="Durum"
                        value={arac.status}
                      />
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-5">
                      {isActive ? (
                        <Link
                          href={`/dashboard/rezervasyon/yeni?vehicleId=${arac.id}`}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 hover:text-slate-950"
                        >
                          Rezervasyon Yap
                          <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-400"
                        >
                          <LockIcon className="h-4 w-4" />
                          Rezervasyona Uygun Değil
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
    </div>
  );
}

function VehicleInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function VehicleCardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="h-52 animate-pulse bg-slate-200" />

            <div className="p-6">
              <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />

              <div className="mt-3 h-6 w-40 animate-pulse rounded bg-slate-200" />

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
              </div>

              <div className="mt-6 h-12 animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

function normalizeValue(value: string) {
  return value
    ?.trim()
    .toLocaleLowerCase("tr-TR");
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

function CalendarSearchIcon(
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
        width="15"
        height="16"
        rx="2"
      />
      <path d="M8 2v4" />
      <path d="M13 2v4" />
      <path d="M3 9h15" />
      <circle cx="18" cy="17" r="3" />
      <path d="m20.5 19.5 2 2" />
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

function LockIcon(props: IconProps) {
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
        x="4"
        y="10"
        width="16"
        height="11"
        rx="2"
      />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
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