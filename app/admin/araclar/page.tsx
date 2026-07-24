"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  deleteVehicle,
  getVehicles,
  type Vehicle,
} from "../../../api/services/vehicleService";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] =
  useState<number | null>(null);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error(error);
      setError("Araçlar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  let isCancelled = false;

  getVehicles()
    .then((data: Vehicle[]) => {
      if (!isCancelled) {
        setVehicles(data);
        setError("");
      }
    })
    .catch((error) => {
      console.error(error);

      if (!isCancelled) {
        setError("Araçlar yüklenirken bir hata oluştu.");
      }
    })
    .finally(() => {
      if (!isCancelled) {
        setLoading(false);
      }
    });

  return () => {
    isCancelled = true;
  };
}, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const searchableText =
        `${vehicle.licensePlate} ${vehicle.makeModel} ${vehicle.type}`
          .toLocaleLowerCase("tr-TR");

      const matchesSearch = searchableText.includes(
        searchText.toLocaleLowerCase("tr-TR")
      );

      const matchesStatus =
        statusFilter === "Tümü" || vehicle.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchText, statusFilter]);

  

  const handleDelete = async (id: number) => {
  const confirmed = window.confirm(
    "Bu aracı silmek istediğinizden emin misiniz?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeletingId(id);

    await deleteVehicle(id);

    setVehicles((currentVehicles) =>
      currentVehicles.filter(
        (vehicle) => vehicle.id !== id
      )
    );

    alert("Araç başarıyla silindi.");
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "Araç silinemedi."
    );
  } finally {
    setDeletingId(null);
  }
};

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Araç Yönetimi
          </h1>

          <p className="mt-1 text-gray-500">
            Filodaki araçları görüntüleyin, düzenleyin ve yönetin.
          </p>
        </div>

        <Link
          href="/admin/araclar/yeni"
          className="rounded-lg bg-[#0B4EA2] px-5 py-3 font-semibold text-white transition hover:bg-[#083a79]"
        >
          + Yeni Araç Ekle
        </Link>
      </div>

      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Araç Ara
            </label>

            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Plaka, marka/model veya tür ara"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Durum
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-[#0B4EA2]"
            >
              <option value="Tümü">Tümü</option>
              <option value="Aktif">Aktif</option>
              <option value="Bakımda">Bakımda</option>
              <option value="Pasif">Pasif</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {loading && (
          <div className="p-8 text-center text-gray-500">
            Araçlar yükleniyor...
          </div>
        )}

        {!loading && error && (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>

            <button
              type="button"
              onClick={loadVehicles}
              className="mt-4 rounded-lg bg-[#0B4EA2] px-4 py-2 font-semibold text-white"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {!loading && !error && filteredVehicles.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Kriterlere uygun araç bulunamadı.
          </div>
        )}

        {!loading && !error && filteredVehicles.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Plaka</th>
                  <th className="px-6 py-4 font-semibold">Marka / Model</th>
                  <th className="px-6 py-4 font-semibold">Tür</th>
                  <th className="px-6 py-4 font-semibold">Durum</th>
                  <th className="px-6 py-4 font-semibold">
                    Son Rezervasyon
                  </th>
                  <th className="px-6 py-4 text-right font-semibold">
                    İşlemler
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredVehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {vehicle.licensePlate}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {vehicle.makeModel}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {vehicle.type}
                    </td>

                    <td className="px-6 py-4">
                      <VehicleStatusBadge status={vehicle.status} />
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      Henüz eklenmedi
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/araclar/duzenle?id=${vehicle.id}`}
                          className="rounded-lg border border-[#0B4EA2] px-4 py-2 text-sm font-semibold text-[#0B4EA2] transition hover:bg-blue-50"
                        >
                          Düzenle
                        </Link>

                        <button
  type="button"
  onClick={() => handleDelete(vehicle.id)}
  disabled={deletingId === vehicle.id}
  className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
>
  {deletingId === vehicle.id
    ? "Siliniyor..."
    : "Sil"}
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

function VehicleStatusBadge({ status }: { status: string }) {
  const statusStyle: Record<string, string> = {
    Aktif: "bg-green-100 text-green-700",
    Bakımda: "bg-amber-100 text-amber-700",
    Pasif: "bg-gray-200 text-gray-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusStyle[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}