"use client";

import { useMemo, useState } from "react";

type ReportPeriod = "Bu Ay" | "Son 3 Ay" | "Bu Yıl";

const REPORT_DATA = [
  {
    id: 1,
    licensePlate: "34 ABC 123",
    makeModel: "Ford Focus",
    reservationCount: 12,
    completedCount: 9,
    cancelledCount: 3,
  },
  {
    id: 2,
    licensePlate: "34 XYZ 456",
    makeModel: "Fiat Doblo",
    reservationCount: 8,
    completedCount: 7,
    cancelledCount: 1,
  },
  {
    id: 3,
    licensePlate: "06 KLM 789",
    makeModel: "Renault Megane",
    reservationCount: 5,
    completedCount: 4,
    cancelledCount: 1,
  },
];

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("Bu Ay");

  const totals = useMemo(() => {
    return REPORT_DATA.reduce(
      (accumulator, item) => {
        accumulator.reservations += item.reservationCount;
        accumulator.completed += item.completedCount;
        accumulator.cancelled += item.cancelledCount;

        return accumulator;
      },
      {
        reservations: 0,
        completed: 0,
        cancelled: 0,
      }
    );
  }, []);

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Raporlar
          </h1>

          <p className="mt-1 text-gray-500">
            Araç ve rezervasyon kullanım bilgilerini inceleyin.
          </p>
        </div>

        <select
          value={period}
          onChange={(event) =>
            setPeriod(event.target.value as ReportPeriod)
          }
          className="rounded-lg border bg-white px-4 py-3 outline-none focus:border-[#0B4EA2]"
        >
          <option value="Bu Ay">Bu Ay</option>
          <option value="Son 3 Ay">Son 3 Ay</option>
          <option value="Bu Yıl">Bu Yıl</option>
        </select>
      </div>

      <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard
          title="Toplam Rezervasyon"
          value={totals.reservations}
        />

        <ReportCard
          title="Tamamlanan"
          value={totals.completed}
        />

        <ReportCard
          title="İptal Edilen"
          value={totals.cancelled}
        />

        <ReportCard
          title="Araç Sayısı"
          value={REPORT_DATA.length}
        />
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Araç Kullanım Raporu
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Seçili dönem: {period}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="px-6 py-4 font-semibold">
                  Araç
                </th>

                <th className="px-6 py-4 font-semibold">
                  Toplam Rezervasyon
                </th>

                <th className="px-6 py-4 font-semibold">
                  Tamamlanan
                </th>

                <th className="px-6 py-4 font-semibold">
                  İptal Edilen
                </th>

                <th className="px-6 py-4 font-semibold">
                  Tamamlanma Oranı
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {REPORT_DATA.map((item) => {
                const completionRate =
                  item.reservationCount === 0
                    ? 0
                    : Math.round(
                        (item.completedCount /
                          item.reservationCount) *
                          100
                      );

                return (
                  <tr
                    key={item.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {item.licensePlate}
                      </p>

                      <p className="text-sm text-gray-500">
                        {item.makeModel}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {item.reservationCount}
                    </td>

                    <td className="px-6 py-4 text-green-700">
                      {item.completedCount}
                    </td>

                    <td className="px-6 py-4 text-red-600">
                      {item.cancelledCount}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full bg-[#0B4EA2]"
                            style={{
                              width: `${completionRate}%`,
                            }}
                          />
                        </div>

                        <span className="text-sm font-semibold text-gray-700">
                          %{completionRate}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ReportCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-[#0B4EA2]">
        {value}
      </p>
    </div>
  );
}