"use client";

import { useEffect, useState } from "react";

import {
  getVehicles,
} from "../../api/services/vehicleService";

import {
  getReservations,
} from "../../api/services/reservationService";

import {
  getUsers,
} from "../../api/services/userService";

export default function AdminDashboardPage() {
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [activeReservations, setActiveReservations] =
    useState(0);
  const [maintenanceVehicles, setMaintenanceVehicles] =
    useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [vehicles, reservations, users] =
          await Promise.all([
            getVehicles(),
            getReservations(),
            getUsers(),
          ]);

        if (isCancelled) {
          return;
        }

        setTotalVehicles(vehicles.length);
        setTotalUsers(users.length);

        const maintenanceCount = vehicles.filter(
          (vehicle) => {
            const status = vehicle.status
              ?.trim()
              .toLocaleLowerCase("tr-TR");

            return (
              status === "bakımda" ||
              status === "maintenance"
            );
          }
        ).length;

        setMaintenanceVehicles(maintenanceCount);

        const activeReservationCount =
          reservations.filter((reservation) => {
            const isActiveStatus =
              reservation.status === "Planned" ||
              reservation.status === "InProgress";

            if (!isActiveStatus) {
              return false;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const endDate = new Date(
              `${reservation.endDate}T00:00:00`
            );

            if (Number.isNaN(endDate.getTime())) {
              return false;
            }

            const isExpired = endDate < today;

            return !isExpired;
          }).length;

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
    <section>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Genel Bakış
        </h1>

        <p className="mt-2 text-gray-500">
          Filo durumunu, rezervasyonları ve kullanıcıları
          buradan takip edebilirsiniz.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Toplam Araç"
          value={totalVehicles}
          loading={loading}
        />

        <DashboardCard
          title="Aktif Rezervasyon"
          value={activeReservations}
          loading={loading}
        />

        <DashboardCard
          title="Bakımdaki Araç"
          value={maintenanceVehicles}
          loading={loading}
        />

        <DashboardCard
          title="Toplam Kullanıcı"
          value={totalUsers}
          loading={loading}
        />
      </div>
    </section>
  );
}

function DashboardCard({
  title,
  value,
  loading,
}: {
  title: string;
  value: number | string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
      <p className="text-gray-500">
        {title}
      </p>

      <p className="mt-4 text-4xl font-bold text-[#0B4EA2]">
        {loading ? "..." : value}
      </p>
    </div>
  );
}