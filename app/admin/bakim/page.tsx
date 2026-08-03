"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "./../../components/ToastProvider";

import {
  getVehicles,
  type Vehicle,
} from "../../../api/services/vehicleService";

import {
  createMaintenanceRecord,
  deleteMaintenanceRecord,
  getMaintenanceRecords,
  updateMaintenanceStatus,
  type MaintenanceRecord,
  type MaintenanceStatus,
} from "../../../api/services/maintenanceService";

import {
  clearLocalVehicleStatus,
  setLocalVehicleStatus,
} from "../../utils/VehicleStatus";

const STATUS_OPTIONS: {
  value: MaintenanceStatus;
  label: string;
  
}[] = [
  {
    value: "Reported",
    label: "Arıza Bildirildi",
  },
  {
    value: "InMaintenance",
    label: "Bakımda",
  },
  {
    value: "Completed",
    label: "Tamamlandı",
  },
];

function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, "")
    .trim();
}

export default function AdminMaintenancePage() {
const { showToast } = useToast();

const [showCreateForm, setShowCreateForm] = useState(false);

const [newRecord, setNewRecord] = useState({
  vehicleId: "",
  licensePlate: "",
  makeModel: "",
  title: "",
  description: "",
  reportedDate: "",
  status: "Reported" as MaintenanceStatus,
});

  const [records, setRecords] =
  useState<MaintenanceRecord[]>([]);

const [recordsLoading, setRecordsLoading] =
  useState(true);

const [recordsError, setRecordsError] =
  useState("");

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [selectedRecord, setSelectedRecord] =
    useState<MaintenanceRecord | null>(null);

const [vehicles, setVehicles] = useState<Vehicle[]>([]);
const [vehiclesLoading, setVehiclesLoading] = useState(true);
const [vehiclesError, setVehiclesError] = useState("");

  const filteredRecords = useMemo(() => {
  return records
    .filter((record) => {
      const normalizedSearch =
        normalizeSearchText(searchText);

      const matchesSearch =
        normalizedSearch === "" ||
        normalizeSearchText(record.licensePlate).includes(
          normalizedSearch
        ) ||
        normalizeSearchText(record.makeModel).includes(
          normalizedSearch
        ) ||
        normalizeSearchText(record.title).includes(
          normalizedSearch
        ) ||
        normalizeSearchText(record.description).includes(
          normalizedSearch
        );

      const matchesStatus =
        statusFilter === "Tümü" ||
        record.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort(
      (a, b) =>
        new Date(b.reportedDate).getTime() -
        new Date(a.reportedDate).getTime()
    );
}, [records, searchText, statusFilter]);

  const reportedCount = records.filter(
    (record) => record.status === "Reported"
  ).length;

  const inMaintenanceCount = records.filter(
    (record) => record.status === "InMaintenance"
  ).length;

  const completedCount = records.filter(
    (record) => record.status === "Completed"
  ).length;

  useEffect(() => {
  let isCancelled = false;

  async function loadVehicles() {
    try {
      setVehiclesLoading(true);
      setVehiclesError("");

      const data = await getVehicles();

      if (!isCancelled) {
        setVehicles(data);
      }
    } catch (error) {
      console.error(
        "Araçlar yüklenemedi:",
        error
      );

      if (!isCancelled) {
        setVehiclesError(
          error instanceof Error
            ? error.message
            : "Araçlar yüklenemedi."
        );
      }
    } finally {
      if (!isCancelled) {
        setVehiclesLoading(false);
      }
    }
  }

  void loadVehicles();

  return () => {
    isCancelled = true;
  };
}, []);

useEffect(() => {
  let isCancelled = false;

  async function loadMaintenanceRecords() {
    try {
      setRecordsLoading(true);
      setRecordsError("");

      const data =
        await getMaintenanceRecords();

      if (!isCancelled) {
        setRecords(data);
      }
    } catch (error) {
      console.error(
        "Bakım kayıtları yüklenemedi:",
        error
      );

      if (!isCancelled) {
        setRecordsError(
          error instanceof Error
            ? error.message
            : "Bakım kayıtları yüklenemedi."
        );
      }
    } finally {
      if (!isCancelled) {
        setRecordsLoading(false);
      }
    }
  }

  void loadMaintenanceRecords();

  return () => {
    isCancelled = true;
  };
}, []);

const handleCreateRecord = async (
  event: React.FormEvent<HTMLFormElement>
) => {
    event.preventDefault();

  if (!newRecord.vehicleId) {
    showToast(
      "Lütfen mevcut araçlardan birini seçin.",
      "error"
    );
    return;
  }

  if (
    !newRecord.title.trim() ||
    !newRecord.description.trim() ||
    !newRecord.reportedDate
  ) {
    showToast(
      "Lütfen tüm alanları doldurun.",
      "error"
    );
    return;
  }

  try {
    const createdRecord =
      await createMaintenanceRecord({
        vehicleId: Number(
          newRecord.vehicleId
        ),
        title: newRecord.title.trim(),
        description:
          newRecord.description.trim(),
        reportedDate:
          newRecord.reportedDate,
        status: newRecord.status,
      });

      setLocalVehicleStatus(
  Number(newRecord.vehicleId),
  "Bakımda"
);

    setRecords((currentRecords) => [
      createdRecord,
      ...currentRecords,
    ]);

    setNewRecord({
      vehicleId: "",
      licensePlate: "",
      makeModel: "",
      title: "",
      description: "",
      reportedDate: "",
      status: "Reported",
    });

    setShowCreateForm(false);

    showToast(
      "Bakım kaydı başarıyla oluşturuldu.",
      "success"
    );
  } catch (error) {
    console.error(
      "Bakım kaydı oluşturulamadı:",
      error
    );

    showToast(
      error instanceof Error
        ? error.message
        : "Bakım kaydı oluşturulamadı.",
      "error"
    );
  }
};

  const handleStatusChange = async (
  recordId: number,
  newStatus: MaintenanceStatus
) => {
  const currentRecord = records.find(
    (record) => record.id === recordId
  );

  if (!currentRecord) {
    showToast(
      "Bakım kaydı bulunamadı.",
      "error"
    );
    return;
  }

  if (currentRecord.status === "Completed") {
    showToast(
      "Tamamlanan kayıt yeniden düzenlenemez.",
      "error"
    );
    return;
  }

  try {
    const updatedRecord =
      await updateMaintenanceStatus(
        recordId,
        newStatus
      );

      if (newStatus === "Completed") {
  clearLocalVehicleStatus(
    currentRecord.vehicleId
  );

  setVehicles((currentVehicles) =>
    currentVehicles.map((vehicle) =>
      vehicle.id === currentRecord.vehicleId
        ? {
            ...vehicle,
            status: "Aktif",
          }
        : vehicle
    )
  );
} else {
  setLocalVehicleStatus(
    currentRecord.vehicleId,
    "Bakımda"
  );

  setVehicles((currentVehicles) =>
    currentVehicles.map((vehicle) =>
      vehicle.id === currentRecord.vehicleId
        ? {
            ...vehicle,
            status: "Bakımda",
          }
        : vehicle
    )
  );
}

    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === recordId
          ? updatedRecord
          : record
      )
    );

    showToast(
      "Kayıt durumu güncellendi.",
      "success"
    );
  } catch (error) {
    console.error(
      "Bakım durumu güncellenemedi:",
      error
    );

    showToast(
      error instanceof Error
        ? error.message
        : "Kayıt durumu güncellenemedi.",
      "error"
    );
  }
};
 const handleDelete = async (
  recordId: number
) => {
  const record = records.find(
    (item) => item.id === recordId
  );

  if (!record) {
    showToast(
      "Bakım kaydı bulunamadı.",
      "error"
    );
    return;
  }

  if (record.status === "Completed") {
    showToast(
      "Tamamlanan kayıt silinemez.",
      "error"
    );
    return;
  }

  const confirmed = window.confirm(
    "Bu bakım veya arıza kaydını silmek istediğinizden emin misiniz?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteMaintenanceRecord(recordId);

    setRecords((currentRecords) =>
      currentRecords.filter(
        (item) => item.id !== recordId
      )
    );

    showToast(
      "Kayıt başarıyla silindi.",
      "success"
    );
  } catch (error) {
    console.error(
      "Bakım kaydı silinemedi:",
      error
    );

    showToast(
      error instanceof Error
        ? error.message
        : "Bakım kaydı silinemedi.",
      "error"
    );
  }
};

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Bakım ve Arıza Yönetimi
          </h1>

          <p className="mt-1 text-gray-500">
            Araç arızalarını ve bakım süreçlerini takip edin.
          </p>
        </div>

        <button
  type="button"
  onClick={() => setShowCreateForm(true)}
  className="rounded-lg bg-[#0B4EA2] px-5 py-3 font-semibold text-white transition hover:bg-[#083a79]"
>
  + Yeni Kayıt Oluştur
</button>
      </div>

      {/* Özet kartları */}
      <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Toplam Kayıt"
          value={records.length}
        />

        <SummaryCard
          title="Arıza Bildirildi"
          value={reportedCount}
        />

        <SummaryCard
          title="Bakımda"
          value={inMaintenanceCount}
        />

        <SummaryCard
          title="Tamamlandı"
          value={completedCount}
        />
      </div>

      {/* Arama ve filtre */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Kayıt Ara
            </label>

            <input
              type="text"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              placeholder="Plaka, araç veya arıza bilgisi ara"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Durum
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-[#0B4EA2]"
            >
              <option value="Tümü">Tümü</option>

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
        </div>
      </div>

      {/* Tablo */}
      {/* Tablo */}
<div className="overflow-hidden rounded-xl bg-white shadow-sm">
  {recordsLoading ? (
    <div className="p-10 text-center text-gray-500">
      Bakım ve arıza kayıtları yükleniyor...
    </div>
  ) : recordsError ? (
    <div className="p-10 text-center text-red-600">
      {recordsError}
    </div>
  ) : filteredRecords.length === 0 ? (
    <div className="p-8 text-center text-gray-500">
      Kriterlere uygun bakım veya arıza kaydı
      bulunamadı.
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] text-left">
        <thead className="bg-gray-50 text-sm text-gray-600">
          <tr>
            <th className="px-6 py-4 font-semibold">
              Araç
            </th>

            <th className="px-6 py-4 font-semibold">
              Kayıt
            </th>

            <th className="px-6 py-4 font-semibold">
              Bildirim Tarihi
            </th>

            <th className="px-6 py-4 font-semibold">
              Durum
            </th>

            <th className="px-6 py-4 text-right font-semibold">
              İşlemler
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {filteredRecords.map((record) => {
            const isCompleted =
              record.status === "Completed";

            return (
              <tr
                key={record.id}
                className={`transition ${
                  isCompleted
                    ? "bg-gray-50 opacity-75"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-800">
                    {record.licensePlate}
                  </p>

                  <p className="text-sm text-gray-500">
                    {record.makeModel}
                  </p>
                </td>

                <td className="max-w-[280px] px-6 py-4">
                  <p className="font-medium text-gray-800">
                    {record.title}
                  </p>

                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                    {record.description}
                  </p>
                </td>

                <td className="px-6 py-4 text-gray-700">
                  {formatDate(record.reportedDate)}
                </td>

                <td className="px-6 py-4">
                  <MaintenanceStatusBadge
                    status={record.status}
                  />

                  {isCompleted && (
                    <p className="mt-2 text-xs font-semibold text-gray-500">
                      Kayıt kapatıldı
                    </p>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <select
                      value={record.status}
                      onChange={(event) =>
                        void handleStatusChange(
                          record.id,
                          event.target
                            .value as MaintenanceStatus
                        )
                      }
                      disabled={isCompleted}
                      className={`rounded-lg border px-3 py-2 text-sm outline-none ${
                        isCompleted
                          ? "cursor-not-allowed bg-gray-100 text-gray-500"
                          : "bg-white focus:border-[#0B4EA2]"
                      }`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option
                          key={status.value}
                          value={status.value}
                        >
                          {status.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRecord(record)
                      }
                      className="rounded-lg border border-[#0B4EA2] px-3 py-2 text-sm font-semibold text-[#0B4EA2] transition hover:bg-blue-50"
                    >
                      Detay
                    </button>

                    <button
                      type="button"
                      disabled={isCompleted}
                      onClick={() =>
                        void handleDelete(record.id)
                      }
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        isCompleted
                          ? "cursor-not-allowed bg-gray-200 text-gray-500"
                          : "border border-red-500 text-red-600 hover:bg-red-50"
                      }`}
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</div>

      {selectedRecord && (
        <MaintenanceDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {showCreateForm && (

  <CreateMaintenanceModal
  newRecord={newRecord}
  setNewRecord={setNewRecord}
  vehicles={vehicles}
  vehiclesLoading={vehiclesLoading}
  vehiclesError={vehiclesError}
  onSubmit={handleCreateRecord}
  onClose={() => setShowCreateForm(false)}
/>
)}

    </section>
  );
}

function SummaryCard({
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

function MaintenanceStatusBadge({
  status,
}: {
  status: MaintenanceStatus;
}) {
  const statusText: Record<MaintenanceStatus, string> = {
    Reported: "Arıza Bildirildi",
    InMaintenance: "Bakımda",
    Completed: "Tamamlandı",
  };

  const statusStyle: Record<MaintenanceStatus, string> = {
    Reported: "bg-red-100 text-red-700",
    InMaintenance: "bg-amber-100 text-amber-700",
    Completed: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[status]}`}
    >
      {statusText[status]}
    </span>
  );
}


function MaintenanceDetailModal({
  record,
  onClose,
}: {
  record: MaintenanceRecord;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Bakım ve Arıza Detayı
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {record.licensePlate} — {record.makeModel}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <DetailRow
            label="Başlık"
            value={record.title}
          />

          <DetailRow
            label="Açıklama"
            value={record.description}
          />

          <DetailRow
            label="Bildirim tarihi"
            value={formatDate(record.reportedDate)}
          />


          <div>
            <p className="mb-2 text-sm font-medium text-gray-500">
              Durum
            </p>

            <MaintenanceStatusBadge
              status={record.status}
            />
          </div>

        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#0B4EA2] py-3 font-semibold text-white transition hover:bg-[#083a79]"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-gray-800">
        {value}
      </p>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR").format(
    new Date(`${date}T00:00:00`)
  );
}

type NewMaintenanceRecord = {
  vehicleId: string;
  licensePlate: string;
  makeModel: string;
  title: string;
  description: string;
  reportedDate: string;
  status: MaintenanceStatus;
};

function CreateMaintenanceModal({
  newRecord,
  setNewRecord,
  vehicles,
  vehiclesLoading,
  vehiclesError,
  onSubmit,
  onClose,
}: {
  newRecord: NewMaintenanceRecord;
  setNewRecord: React.Dispatch<
    React.SetStateAction<NewMaintenanceRecord>
  >;
  vehicles: Vehicle[];
  vehiclesLoading: boolean;
  vehiclesError: string;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>
  ) => void;
  onClose: () => void;
}) {
  const [vehicleSearch, setVehicleSearch] = useState(
    newRecord.vehicleId
      ? `${newRecord.licensePlate} - ${newRecord.makeModel}`
      : ""
  );

  const [showVehicleResults, setShowVehicleResults] =
    useState(false);

  const filteredVehicles = useMemo(() => {
    const search = normalizeSearchText(vehicleSearch);

    if (!search || newRecord.vehicleId) {
      return vehicles;
    }

    return vehicles.filter((vehicle) => {
      const plate = normalizeSearchText(
        vehicle.licensePlate
      );

      const makeModel = normalizeSearchText(
        vehicle.makeModel
      );

      const combined = normalizeSearchText(
        `${vehicle.licensePlate}${vehicle.makeModel}`
      );

      const searchWords = vehicleSearch
        .toLocaleLowerCase("tr-TR")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      const searchableText =
        `${vehicle.licensePlate} ${vehicle.makeModel}`
          .toLocaleLowerCase("tr-TR");

      const matchesEveryWord = searchWords.every(
        (word) =>
          searchableText.includes(word) ||
          normalizeSearchText(searchableText).includes(
            normalizeSearchText(word)
          )
      );

      return (
        plate.includes(search) ||
        makeModel.includes(search) ||
        combined.includes(search) ||
        matchesEveryWord
      );
    });
  }, [vehicleSearch, vehicles, newRecord.vehicleId]);

  const handleVehicleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setVehicleSearch(value);
    setShowVehicleResults(true);

    setNewRecord((current) => ({
      ...current,
      vehicleId: "",
      licensePlate: "",
      makeModel: "",
    }));
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setNewRecord((current) => ({
      ...current,
      vehicleId: String(vehicle.id),
      licensePlate: vehicle.licensePlate,
      makeModel: vehicle.makeModel,
    }));

    setVehicleSearch(
      `${vehicle.licensePlate} - ${vehicle.makeModel}`
    );

    setShowVehicleResults(false);
  };

  const handleClose = () => {
    setNewRecord({
      vehicleId: "",
      licensePlate: "",
      makeModel: "",
      title: "",
      description: "",
      reportedDate: "",
      status: "Reported",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Yeni Bakım veya Arıza Kaydı
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Araçla ilgili bakım veya arıza bilgilerini
              girin.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <FormField label="Araç Ara ve Seç">
            <div className="relative">
              <input
                type="text"
                value={vehicleSearch}
                onChange={handleVehicleSearchChange}
                onFocus={() =>
                  setShowVehicleResults(true)
                }
                placeholder="Plaka veya marka/model ara"
                autoComplete="off"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2]"
              />

              {newRecord.vehicleId && (
                <div className="mt-2 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {newRecord.licensePlate}
                    </p>

                    <p className="text-sm text-gray-500">
                      {newRecord.makeModel}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-green-700">
                    Seçildi
                  </span>
                </div>
              )}

              {showVehicleResults &&
                !newRecord.vehicleId && (
                  <div className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border bg-white shadow-lg">
                    {vehiclesLoading ? (
                      <p className="px-4 py-4 text-sm text-gray-500">
                        Araçlar yükleniyor...
                      </p>
                    ) : vehiclesError ? (
                      <p className="px-4 py-4 text-sm text-red-600">
                        {vehiclesError}
                      </p>
                    ) : filteredVehicles.length === 0 ? (
                      <p className="px-4 py-4 text-sm text-gray-500">
                        Aramanızla eşleşen araç bulunamadı.
                      </p>
                    ) : (
                      filteredVehicles.map((vehicle) => (
                        <button
                          key={vehicle.id}
                          type="button"
                          onClick={() =>
                            handleVehicleSelect(vehicle)
                          }
                          className="block w-full border-b px-4 py-3 text-left transition last:border-b-0 hover:bg-blue-50"
                        >
                          <p className="font-semibold text-gray-800">
                            {vehicle.licensePlate}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {vehicle.makeModel}
                          </p>

                          <div className="mt-1 flex gap-2 text-xs text-gray-400">
                            <span>{vehicle.type}</span>
                            <span>•</span>
                            <span>{vehicle.status}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
            </div>
          </FormField>

          <FormField label="Kayıt Başlığı">
            <input
              type="text"
              value={newRecord.title}
              onChange={(event) =>
                setNewRecord((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Örneğin motor arıza lambası"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2]"
            />
          </FormField>

          <FormField label="Açıklama">
            <textarea
              value={newRecord.description}
              onChange={(event) =>
                setNewRecord((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Bakım veya arıza detaylarını girin"
              rows={4}
              className="w-full resize-none rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2]"
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Bildirim Tarihi">
              <input
                type="date"
                value={newRecord.reportedDate}
                onChange={(event) =>
                  setNewRecord((current) => ({
                    ...current,
                    reportedDate: event.target.value,
                  }))
                }
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2]"
              />
            </FormField>

            <FormField label="Durum">
              <select
                value={newRecord.status}
                onChange={(event) =>
                  setNewRecord((current) => ({
                    ...current,
                    status:
                      event.target
                        .value as MaintenanceStatus,
                  }))
                }
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-[#0B4EA2]"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={!newRecord.vehicleId}
              className="rounded-lg bg-[#0B4EA2] px-5 py-3 font-semibold text-white hover:bg-[#083a79] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Kaydı Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      {children}
    </div>
  );
}
