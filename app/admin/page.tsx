"use client";

import {
  useEffect,
  useState,
  type SVGProps,
} from "react";

import {
  getVehicles,
} from "../../api/services/vehicleService";

import {
  getReservations,
} from "../../api/services/reservationService";

import {
  getUsers,
} from "../../api/services/userService";

import {
  applyLocalVehicleStatus,
} from "../utils/VehicleStatus";

type IconProps = SVGProps<SVGSVGElement>;

export default function AdminDashboardPage() {
  const [totalVehicles, setTotalVehicles] =
    useState(0);

  const [
    activeReservations,
    setActiveReservations,
  ] = useState(0);

  const [
    maintenanceVehicles,
    setMaintenanceVehicles,
  ] = useState(0);

  const [totalUsers, setTotalUsers] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [
          vehicleData,
          reservationData,
          userData,
        ] = await Promise.all([
          getVehicles(),
          getReservations(),
          getUsers(),
        ]);

        if (isCancelled) {
          return;
        }

        const vehiclesWithLocalStatus =
          vehicleData.map(
            applyLocalVehicleStatus
          );

        setTotalVehicles(
          vehiclesWithLocalStatus.length
        );

        setTotalUsers(userData.length);

        const maintenanceCount =
          vehiclesWithLocalStatus.filter(
            (vehicle) => {
              const normalizedStatus =
                vehicle.status
                  ?.trim()
                  .toLocaleLowerCase(
                    "tr-TR"
                  );

              return (
                normalizedStatus ===
                  "bakımda" ||
                normalizedStatus ===
                  "bakimda" ||
                normalizedStatus ===
                  "maintenance"
              );
            }
          ).length;

        setMaintenanceVehicles(
          maintenanceCount
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeReservationCount =
          reservationData.filter(
            (reservation) => {
              const hasActiveStatus =
                reservation.status ===
                  "Planned" ||
                reservation.status ===
                  "InProgress";

              if (!hasActiveStatus) {
                return false;
              }

              const endDate = new Date(
                `${reservation.endDate}T00:00:00`
              );

              if (
                Number.isNaN(
                  endDate.getTime()
                )
              ) {
                return false;
              }

              return endDate >= today;
            }
          ).length;

        setActiveReservations(
          activeReservationCount
        );
      } catch (error) {
        console.error(
          "Admin dashboard verileri yüklenemedi:",
          error
        );

        if (!isCancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Dashboard bilgileri yüklenemedi."
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <section className="space-y-8">
      {/* Başlık */}
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
          Yönetim Özeti
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Genel Bakış
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Filo durumunu, aktif rezervasyonları,
          bakımdaki araçları ve kullanıcı
          sayılarını tek ekrandan takip edin.
        </p>
      </div>

      {/* Hata */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
            <AlertIcon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-bold">
              Dashboard verileri yüklenemedi
            </p>

            <p className="mt-1 text-sm leading-6">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Özet kartları */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Toplam Araç"
          value={totalVehicles}
          description="Sistemde kayıtlı araç"
          loading={loading}
          icon={
            <CarIcon className="h-6 w-6" />
          }
        />

        <DashboardCard
          title="Aktif Rezervasyon"
          value={activeReservations}
          description="Devam eden ve planlanan"
          loading={loading}
          icon={
            <CalendarIcon className="h-6 w-6" />
          }
        />

        <DashboardCard
          title="Bakımdaki Araç"
          value={maintenanceVehicles}
          description="Rezervasyona kapalı araç"
          loading={loading}
          icon={
            <ToolsIcon className="h-6 w-6" />
          }
        />

        <DashboardCard
          title="Toplam Kullanıcı"
          value={totalUsers}
          description="Sisteme kayıtlı kullanıcı"
          loading={loading}
          icon={
            <UsersIcon className="h-6 w-6" />
          }
        />
      </div>
    </section>
  );
}

function DashboardCard({
  title,
  value,
  description,
  loading,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  loading: boolean;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          {loading ? (
            <div className="mt-4 h-9 w-16 animate-pulse rounded-lg bg-slate-200" />
          ) : (
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              {value}
            </p>
          )}

          <p className="mt-2 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
          {icon}
        </div>
      </div>
    </article>
  );
}

function CarIcon(
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
      <path d="m5 11 2-5h10l2 5" />
      <path d="M3 13a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5H3Z" />
      <path d="M5 18v2" />
      <path d="M19 18v2" />
      <path d="M7 15h.01" />
      <path d="M17 15h.01" />
    </svg>
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

      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ToolsIcon(
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
      <path d="m14.7 6.3 3-3a4 4 0 0 1-5 5l-7.4 7.4a2.1 2.1 0 0 0 3 3l7.4-7.4a4 4 0 0 1 5-5l-3 3" />
      <path d="m5 5 4 4" />
    </svg>
  );
}

function UsersIcon(
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
        cx="9"
        cy="8"
        r="4"
      />

      <path d="M2 21a7 7 0 0 1 14 0" />
      <path d="M16 4.5a4 4 0 0 1 0 7" />
      <path d="M17 14a6 6 0 0 1 5 6" />
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