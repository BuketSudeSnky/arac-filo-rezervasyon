"use client";

import {
  useEffect,
  useMemo,
  useState,
  type SVGProps,
} from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/chart";

import {
  getVehicles,
  type Vehicle,
} from "../../../api/services/vehicleService";

import {
  getReservations,
  type Reservation,
} from "../../../api/services/reservationService";

import {
  getUsers,
  type User,
} from "../../../api/services/userService";

import {
  getMaintenanceRecords,
  type MaintenanceRecord,
  type MaintenanceStatus,
} from "../../../api/services/maintenanceService";

type IconProps = SVGProps<SVGSVGElement>;

type ReportPeriod =
  | "1month"
  | "3months"
  | "6months"
  | "1year";



const reservationTrendConfig = {
  reservationCount: {
    label: "Rezervasyon",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const reservationStatusConfig = {
  Planned: {
    label: "Planlandı",
    color: "var(--chart-1)",
  },
  InProgress: {
    label: "Devam Ediyor",
    color: "var(--chart-2)",
  },
  Completed: {
    label: "Tamamlandı",
    color: "var(--chart-3)",
  },
  Cancelled: {
    label: "İptal Edildi",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const vehicleUsageConfig = {
  count: {
    label: "Rezervasyon",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const userActivityConfig = {
  count: {
    label: "Rezervasyon",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const maintenanceStatusConfig = {
  Reported: {
    label: "Arıza Bildirildi",
    color: "var(--chart-4)",
  },
  InMaintenance: {
    label: "Bakımda",
    color: "var(--chart-2)",
  },
  Completed: {
    label: "Tamamlandı",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export default function AdminReportsPage() {
  const [period, setPeriod] =
    useState<ReportPeriod>("3months");

  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);

  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [users, setUsers] =
    useState<User[]>([]);
  
  const [maintenanceRecords, setMaintenanceRecords] =
  useState<MaintenanceRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadReportData() {
      try {
        setLoading(true);
        setError("");

        const [
  vehicleData,
  reservationData,
  userData,
  maintenanceData,
] = await Promise.all([
  getVehicles(),
  getReservations(),
  getUsers(),
  getMaintenanceRecords(),
]);

setVehicles(vehicleData);
setReservations(reservationData);
setUsers(userData);
setMaintenanceRecords(maintenanceData);

        if (isCancelled) {
          return;
        }

        setVehicles(vehicleData);
        setReservations(reservationData);
        setUsers(userData);
      } catch (error) {
        console.error(
          "Rapor verileri yüklenemedi:",
          error
        );

        if (!isCancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Rapor verileri yüklenemedi."
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadReportData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const periodStartDate = useMemo(
    () => getPeriodStartDate(period),
    [period]
  );

  const filteredReservations = useMemo(() => {
    return reservations.filter(
      (reservation) => {
        const reservationDate =
          parseApiDate(
            reservation.startDate
          );

        return (
          !Number.isNaN(
            reservationDate.getTime()
          ) &&
          reservationDate >= periodStartDate
        );
      }
    );
  }, [
    reservations,
    periodStartDate,
  ]);

  const filteredMaintenanceRecords =
  useMemo(() => {
    return maintenanceRecords.filter(
      (record) => {
        const reportedDate =
          parseApiDate(record.reportedDate);

        return (
          !Number.isNaN(
            reportedDate.getTime()
          ) &&
          reportedDate >= periodStartDate
        );
      }
    );
  }, [
    maintenanceRecords,
    periodStartDate,
  ]);

  const completedReservations =
    filteredReservations.filter(
      (reservation) =>
        reservation.status === "Completed"
    ).length;

  const cancelledReservations =
    filteredReservations.filter(
      (reservation) =>
        reservation.status === "Cancelled"
    ).length;

  const activeReservations =
    filteredReservations.filter(
      (reservation) =>
        reservation.status === "Planned" ||
        reservation.status === "InProgress"
    ).length;

  const reservationTrendData =
    useMemo(() => {
      return createReservationTrendData(
        filteredReservations,
        period
      );
    }, [
      filteredReservations,
      period,
    ]);

  const reservationStatusData =
    useMemo(() => {
      const statuses = [
        {
          status: "Planned",
          label: "Planlandı",
        },
        {
          status: "InProgress",
          label: "Devam Ediyor",
        },
        {
          status: "Completed",
          label: "Tamamlandı",
        },
        {
          status: "Cancelled",
          label: "İptal Edildi",
        },
      ];

      return statuses.map((item) => ({
        ...item,
        count: filteredReservations.filter(
          (reservation) =>
            reservation.status ===
            item.status
        ).length,
        fill: `var(--color-${item.status})`,
      }));
    }, [filteredReservations]);

  const mostUsedVehicles =
    useMemo(() => {
      const vehicleMap = new Map<
        number,
        {
          vehicleId: number;
          label: string;
          count: number;
        }
      >();

      filteredReservations.forEach(
        (reservation) => {
          const vehicleId =
            reservation.vehicle?.id;

          if (!vehicleId) {
            return;
          }

          const vehicle =
            vehicles.find(
              (item) =>
                item.id === vehicleId
            );

          const licensePlate =
            reservation.vehicle
              ?.licensePlate ??
            vehicle?.licensePlate ??
            `Araç ${vehicleId}`;

          const existing =
            vehicleMap.get(vehicleId);

          if (existing) {
            existing.count += 1;
            return;
          }

          vehicleMap.set(vehicleId, {
            vehicleId,
            label: licensePlate,
            count: 1,
          });
        }
      );

      return Array.from(
        vehicleMap.values()
      )
        .sort(
          (first, second) =>
            second.count - first.count
        )
        .slice(0, 5);
    }, [
      filteredReservations,
      vehicles,
    ]);


  const mostActiveUsers =
    useMemo(() => {
      const userMap =
        new Map<string, number>();

      filteredReservations.forEach(
        (reservation) => {
          const username =
            reservation.username?.trim();

          if (!username) {
            return;
          }

          userMap.set(
            username,
            (userMap.get(username) ?? 0) +
              1
          );
        }
      );

      return Array.from(
        userMap.entries()
      )
        .map(([username, count]) => ({
          username,
          count,
        }))
        .sort(
          (first, second) =>
            second.count - first.count
        )
        .slice(0, 5);
    }, [filteredReservations]);

  const maintenanceStatusData =
    useMemo(() => {
      const statuses: {
        status: MaintenanceStatus;
        label: string;
      }[] = [
        {
          status: "Reported",
          label: "Arıza Bildirildi",
        },
        {
          status: "InMaintenance",
          label: "Bakımda",
        },
        {
          status: "Completed",
          label: "Tamamlandı",
        },
      ];

      return statuses.map((item) => ({
        ...item,
        count:
          filteredMaintenanceRecords.filter(
            (record) =>
              record.status ===
              item.status
          ).length,
        fill: `var(--color-${item.status})`,
      }));
    }, [
      filteredMaintenanceRecords,
    ]);

  if (loading) {
    return <ReportsSkeleton />;
  }

  return (
    <section className="space-y-8">
      {/* Başlık */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
            Analiz ve Raporlar
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Raporlar
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Filo, rezervasyon, kullanıcı ve
            bakım verilerini seçtiğiniz tarih
            aralığına göre inceleyin.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:w-auto">
          <label
            htmlFor="reportPeriod"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Rapor Dönemi
          </label>

          <select
            id="reportPeriod"
            value={period}
            onChange={(event) =>
              setPeriod(
                event.target
                  .value as ReportPeriod
              )
            }
            className="w-full min-w-48 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
          >
            <option value="1month">
              Son 1 Ay
            </option>

            <option value="3months">
              Son 3 Ay
            </option>

            <option value="6months">
              Son 6 Ay
            </option>

            <option value="1year">
              Son 1 Yıl
            </option>
          </select>
        </div>
      </div>

      {/* Hata */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="text-sm font-bold">
              Bazı raporlar yüklenemedi
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Özet kartları */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Toplam Araç"
          value={vehicles.length}
          icon={
            <CarIcon className="h-6 w-6" />
          }
        />

        <SummaryCard
          title="Toplam Kullanıcı"
          value={users.length}
          icon={
            <UsersIcon className="h-6 w-6" />
          }
        />

        <SummaryCard
          title="Rezervasyon"
          value={
            filteredReservations.length
          }
          icon={
            <CalendarIcon className="h-6 w-6" />
          }
        />
       <SummaryCard
  title="Bakım / Arıza"
  value={
    filteredMaintenanceRecords.length
  }
  icon={
    <ToolsIcon className="h-6 w-6" />
  }
/></div>

      {/* Rezervasyon özetleri */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SmallStatCard
          label="Aktif Rezervasyon"
          value={activeReservations}
          type="active"
        />

        <SmallStatCard
          label="Tamamlanan"
          value={completedReservations}
          type="completed"
        />

        <SmallStatCard
          label="İptal Edilen"
          value={cancelledReservations}
          type="cancelled"
        />
      </div>

      {/* Rezervasyon İstatistikleri */}
      <ReportCard
        title="Rezervasyon İstatistikleri"
        description={`${getPeriodLabel(
          period
        )} içindeki rezervasyon sayıları`}
        icon={
          <TrendIcon className="h-5 w-5" />
        }
      >
        {hasChartData(
          reservationTrendData,
          "reservationCount"
        ) ? (
          <ChartContainer
            config={
              reservationTrendConfig
            }
            className="h-[320px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={
                reservationTrendData
              }
              margin={{
                left: 4,
                right: 16,
                top: 16,
              }}
            >
              <CartesianGrid
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={24}
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={30}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent />
                }
              />

              <Line
                dataKey="reservationCount"
                type="monotone"
                stroke="var(--color-reservationCount)"
                strokeWidth={3}
                dot={{
                  fill: "var(--color-reservationCount)",
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <EmptyChartMessage message="Seçilen dönemde rezervasyon bulunamadı." />
        )}
      </ReportCard>

      {/* İki kolon */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Rezervasyon durumları */}
        <ReportCard
          title="Rezervasyon Durumları"
          description="Rezervasyonların durumlara göre dağılımı"
          icon={
            <PieIcon className="h-5 w-5" />
          }
        >
          {hasChartData(
            reservationStatusData,
            "count"
          ) ? (
            <>
              <ChartContainer
                config={
                  reservationStatusConfig
                }
                className="mx-auto h-[280px] w-full"
              >
                <PieChart
                  accessibilityLayer
                >
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="label"
                      />
                    }
                  />

                  <Pie
                    data={
                      reservationStatusData
                    }
                    dataKey="count"
                    nameKey="label"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {reservationStatusData.map(
                      (item) => (
                        <Cell
                          key={
                            item.status
                          }
                          fill={
                            item.fill
                          }
                        />
                      )
                    )}
                  </Pie>
                </PieChart>
              </ChartContainer>

              <ChartLegendList
                data={
                  reservationStatusData
                }
              />
            </>
          ) : (
            <EmptyChartMessage message="Seçilen dönemde rezervasyon bulunamadı." />
          )}
        </ReportCard>

      </div>

      {/* En çok kullanılan araçlar */}
      <ReportCard
        title="En Çok Kullanılan Araçlar"
        description="Seçilen dönemde en fazla rezervasyon yapılan ilk 5 araç"
        icon={
          <CarIcon className="h-5 w-5" />
        }
      >
        {mostUsedVehicles.length > 0 ? (
          <ChartContainer
            config={
              vehicleUsageConfig
            }
            className="h-[340px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={mostUsedVehicles}
              layout="vertical"
              margin={{
                left: 10,
                right: 20,
              }}
            >
              <CartesianGrid
                horizontal={false}
              />

              <XAxis
                type="number"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={95}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent />
                }
              />

              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <EmptyChartMessage message="Seçilen dönemde araç kullanım verisi bulunamadı." />
        )}
      </ReportCard>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Aktif kullanıcılar */}
        <ReportCard
          title="En Aktif Kullanıcılar"
          description="En fazla rezervasyon oluşturan ilk 5 kullanıcı"
          icon={
            <UsersIcon className="h-5 w-5" />
          }
        >
          {mostActiveUsers.length >
          0 ? (
            <ChartContainer
              config={
                userActivityConfig
              }
              className="h-[300px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={
                  mostActiveUsers
                }
                margin={{
                  left: 4,
                  right: 12,
                }}
              >
                <CartesianGrid
                  vertical={false}
                />

                <XAxis
                  dataKey="username"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />

                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />

                <ChartTooltip
                  content={
                    <ChartTooltipContent />
                  }
                />

                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyChartMessage message="Seçilen dönemde kullanıcı aktivitesi bulunamadı." />
          )}
        </ReportCard>

        {/* Bakım */}
        <ReportCard
  title="Bakım ve Arıza Durumları"
  description={`${getPeriodLabel(
    period
  )} içindeki bakım ve arıza kayıtları`}
  icon={
    <ToolsIcon className="h-5 w-5" />
  }
>
          {hasChartData(
            maintenanceStatusData,
            "count"
          ) ? (
            <>
              <ChartContainer
                config={
                  maintenanceStatusConfig
                }
                className="mx-auto h-[250px] w-full"
              >
                <PieChart
                  accessibilityLayer
                >
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="label"
                      />
                    }
                  />

                  <Pie
                    data={
                      maintenanceStatusData
                    }
                    dataKey="count"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {maintenanceStatusData.map(
                      (item) => (
                        <Cell
                          key={
                            item.status
                          }
                          fill={
                            item.fill
                          }
                        />
                      )
                    )}
                  </Pie>
                </PieChart>
              </ChartContainer>

              <ChartLegendList
                data={
                  maintenanceStatusData
                }
              />
            </>
          ) : (
            <EmptyChartMessage message="Seçilen dönemde bakım kaydı bulunamadı." />
          )}
        </ReportCard>
      </div>
    </section>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  mock = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  mock?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
          {icon}
        </div>
      </div>

      {mock && (
        <span className="mt-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          Mock veri
        </span>
      )}
    </article>
  );
}

function SmallStatCard({
  label,
  value,
  type,
}: {
  label: string;
  value: number;
  type:
    | "active"
    | "completed"
    | "cancelled";
}) {
  const styles = {
    active:
      "border-blue-200 bg-blue-50 text-blue-700",
    completed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    cancelled:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <article
      className={`rounded-2xl border p-5 ${styles[type]}`}
    >
      <p className="text-sm font-semibold">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </article>
  );
}

function ReportCard({
  title,
  description,
  icon,
  children,
  mock = false,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  mock?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            {icon}
          </div>

          <div>
            <h2 className="font-bold text-slate-950">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          </div>
        </div>

        {mock && (
          <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Mock veri
          </span>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </article>
  );
}

function ChartLegendList({
  data,
}: {
  data: {
    label: string;
    count: number;
    fill: string;
  }[];
}) {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-3">
      {data.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 text-sm text-slate-600"
        >
          <span
            className="h-3 w-3 rounded-full"
            style={{
              backgroundColor:
                item.fill,
            }}
          />

          <span>{item.label}</span>

          <span className="font-bold text-slate-900">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyChartMessage({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center rounded-xl bg-slate-50 px-6 text-center">
      <ChartIcon className="h-8 w-8 text-slate-400" />

      <p className="mt-3 text-sm font-medium text-slate-500">
        {message}
      </p>
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <section className="space-y-8">
      <div>
        <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />

        <div className="mt-3 h-10 w-52 animate-pulse rounded bg-slate-200" />

        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>

      <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />

        <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </section>
  );
}

function createReservationTrendData(
  reservations: Reservation[],
  period: ReportPeriod
) {
  if (period === "1month") {
    const buckets = Array.from(
      { length: 30 },
      (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(
          date.getDate() -
            (29 - index)
        );

        return {
          key: formatDateKey(date),
          label:
            new Intl.DateTimeFormat(
              "tr-TR",
              {
                day: "2-digit",
                month: "short",
              }
            ).format(date),
          reservationCount: 0,
        };
      }
    );

    const bucketMap = new Map(
      buckets.map((bucket) => [
        bucket.key,
        bucket,
      ])
    );

    reservations.forEach(
      (reservation) => {
        const bucket =
          bucketMap.get(
            reservation.startDate
          );

        if (bucket) {
          bucket.reservationCount += 1;
        }
      }
    );

    return buckets;
  }

  const monthCount =
    period === "3months"
      ? 3
      : period === "6months"
        ? 6
        : 12;

  const buckets = Array.from(
    { length: monthCount },
    (_, index) => {
      const date = new Date();

      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      date.setMonth(
        date.getMonth() -
          (monthCount - 1 - index)
      );

      return {
        key: `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`,
        label:
          new Intl.DateTimeFormat(
            "tr-TR",
            {
              month: "short",
              year:
                period === "1year"
                  ? "2-digit"
                  : undefined,
            }
          ).format(date),
        reservationCount: 0,
      };
    }
  );

  const bucketMap = new Map(
    buckets.map((bucket) => [
      bucket.key,
      bucket,
    ])
  );

  reservations.forEach(
    (reservation) => {
      const date = parseApiDate(
        reservation.startDate
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const bucket =
        bucketMap.get(key);

      if (bucket) {
        bucket.reservationCount += 1;
      }
    }
  );

  return buckets;
}

function getPeriodStartDate(
  period: ReportPeriod
) {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  switch (period) {
    case "1month":
      date.setDate(
        date.getDate() - 30
      );
      break;

    case "3months":
      date.setMonth(
        date.getMonth() - 3
      );
      break;

    case "6months":
      date.setMonth(
        date.getMonth() - 6
      );
      break;

    case "1year":
      date.setFullYear(
        date.getFullYear() - 1
      );
      break;
  }

  return date;
}

function getPeriodLabel(
  period: ReportPeriod
) {
  const labels: Record<
    ReportPeriod,
    string
  > = {
    "1month": "Son 1 ay",
    "3months": "Son 3 ay",
    "6months": "Son 6 ay",
    "1year": "Son 1 yıl",
  };

  return labels[period];
}

function parseApiDate(date: string) {
  const [
    year,
    month,
    day,
  ] = date.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}


function hasChartData<
  T extends Record<string, unknown>,
>(
  data: T[],
  valueKey: keyof T
) {
  return data.some(
    (item) =>
      Number(item[valueKey]) > 0
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

function UsersIcon(props: IconProps) {
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
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21a7 7 0 0 1 14 0" />
      <path d="M16 4.5a4 4 0 0 1 0 7" />
      <path d="M17 14a6 6 0 0 1 5 6" />
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
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ToolsIcon(props: IconProps) {
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

function TrendIcon(props: IconProps) {
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
      <path d="M3 17 9 11l4 4 8-9" />
      <path d="M15 6h6v6" />
    </svg>
  );
}

function PieIcon(props: IconProps) {
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
      <path d="M12 2v10h10A10 10 0 1 1 12 2Z" />
      <path d="M16 2.8A10 10 0 0 1 21.2 8H16Z" />
    </svg>
  );
}

function ChartIcon(props: IconProps) {
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
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
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