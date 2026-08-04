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
async function refreshVehicles() {
  try {
    const data = await getVehicles();

    if (!Array.isArray(data)) {
      throw new Error(
        "Backend araç listesini beklenen formatta döndürmedi."
      );
    }

    setVehicles(data);
    setVehiclesError("");
  } catch (error) {
    console.error(
      "Araç listesi yenilenemedi:",
      error
    );

    setVehiclesError(
      error instanceof Error
        ? error.message
        : "Araç listesi yenilenemedi."
    );
  }
}

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

  if (currentRecord.status === newStatus) {
    return;
  }

  try {
    const updatedRecord =
      await updateMaintenanceStatus(
        recordId,
        newStatus
      );

    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === recordId
          ? updatedRecord
          : record
      )
    );

    // PATCH işleminden sonra backend araç
    // durumunu da otomatik değiştirdi.
    await refreshVehicles();

    if (newStatus === "Completed") {
      showToast(
        "Bakım tamamlandı. Araç aktif duruma geçirildi.",
        "success"
      );
    } else {
      showToast(
        "Bakım kaydı güncellendi. Araç bakım durumuna geçirildi.",
        "success"
      );
    }
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
    <section className="space-y-8">
      {/* Başlık */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
            Filo Bakım Yönetimi
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Bakım ve Arıza
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Araçların bakım ve arıza süreçlerini yönetin, yeni kayıt
            oluşturun ve mevcut kayıtların durumlarını takip edin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-100"
        >
          <span className="text-lg leading-none">+</span>
          Yeni Kayıt Oluştur
        </button>
      </div>

      {/* Özet kartları */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Toplam Kayıt"
          value={records.length}
          type="total"
        />

        <SummaryCard
          title="Arıza Bildirildi"
          value={reportedCount}
          type="reported"
        />

        <SummaryCard
          title="Bakımda"
          value={inMaintenanceCount}
          type="maintenance"
        />

        <SummaryCard
          title="Tamamlandı"
          value={completedCount}
          type="completed"
        />
      </div>

      {/* Arama ve filtre */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-bold text-slate-950">
              Kayıtları Filtrele
            </h2>
          </div>

          <p className="text-sm font-medium text-slate-500">
            {filteredRecords.length} / {records.length} kayıt gösteriliyor
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Kayıt Ara
            </label>

            <input
              type="text"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              placeholder="Plaka, araç veya arıza bilgisi ara"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Durum
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            >
              <option value="Tümü">Tüm Durumlar</option>

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
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {recordsLoading ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-10 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Bakım ve arıza kayıtları yükleniyor...
            </p>
          </div>
        ) : recordsError ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              !
            </div>

            <p className="mt-4 font-semibold text-red-700">
              Kayıtlar yüklenemedi
            </p>

            <p className="mt-2 max-w-lg text-sm text-red-600">
              {recordsError}
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-600">
              ⌕
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              Kayıt bulunamadı
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Kriterlere uygun bakım veya arıza kaydı bulunamadı.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
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

              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => {
                  const isCompleted =
                    record.status === "Completed";

                  return (
                    <tr
                      key={record.id}
                      className={`transition ${
                        isCompleted
                          ? "bg-slate-50/70"
                          : "hover:bg-amber-50/40"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
                            <CarIcon className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="font-bold text-slate-900">
                              {record.licensePlate}
                            </p>

                            <p className="mt-0.5 text-sm text-slate-500">
                              {record.makeModel}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="max-w-[310px] px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {record.title}
                        </p>

                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                          {record.description}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {formatDate(record.reportedDate)}
                      </td>

                      <td className="px-6 py-4">
                        <MaintenanceStatusBadge
                          status={record.status}
                        />

                        {isCompleted && (
                          <p className="mt-2 text-xs font-semibold text-slate-400">
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
                            className={`min-w-40 rounded-xl border px-3 py-2 text-sm font-medium outline-none transition ${
                              isCompleted
                                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                : "border-slate-300 bg-white text-slate-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
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
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                          >
                            Detay
                          </button>

                          <button
                            type="button"
                            disabled={isCompleted}
                            onClick={() =>
                              void handleDelete(record.id)
                            }
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                              isCompleted
                                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                : "border border-red-200 bg-white text-red-600 hover:bg-red-50"
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

type SummaryCardType =
  | "total"
  | "reported"
  | "maintenance"
  | "completed";

function SummaryCard({
  title,
  value,
  type,
}: {
  title: string;
  value: number;
  type: SummaryCardType;
}) {
  const iconStyles: Record<SummaryCardType, string> = {
  total: "bg-slate-950 text-amber-400",
  reported: "bg-slate-950 text-amber-400",
  maintenance: "bg-slate-950 text-amber-400",
  completed: "bg-slate-950 text-amber-400",
};

  const iconContent: Record<SummaryCardType, React.ReactNode> = {
    total: <ListIcon className="h-6 w-6" />,
    reported: <AlertIcon className="h-6 w-6" />,
    maintenance: <ToolsIcon className="h-6 w-6" />,
    completed: <CheckIcon className="h-6 w-6" />,
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconStyles[type]}`}
        >
          {iconContent[type]}
        </div>
      </div>
    </article>
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
    Reported:
      "border-red-200 bg-red-50 text-red-700",
    InMaintenance:
      "border-amber-200 bg-amber-50 text-amber-800",
    Completed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  const dotStyle: Record<MaintenanceStatus, string> = {
    Reported: "bg-red-500",
    InMaintenance: "bg-amber-500",
    Completed: "bg-emerald-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyle[status]}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${dotStyle[status]}`}
      />

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-600">
              Kayıt Detayı
            </p>

            <h2 className="text-xl font-bold text-slate-950">
              Bakım ve Arıza Detayı
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {record.licensePlate} — {record.makeModel}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 p-6">
          <DetailRow
            label="Başlık"
            value={record.title}
          />

          <DetailRow
            label="Açıklama"
            value={record.description}
          />

          <DetailRow
            label="Bildirim Tarihi"
            value={formatDate(record.reportedDate)}
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Durum
            </p>

            <MaintenanceStatusBadge
              status={record.status}
            />
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-100"
          >
            Kapat
          </button>
        </div>
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
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-800">
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

  const inputClassName =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-600">
              Yeni Kayıt
            </p>

            <h2 className="text-xl font-bold text-slate-950">
              Bakım veya Arıza Kaydı
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Araçla ilgili bakım veya arıza bilgilerini girin.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Kapat"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 p-6"
        >
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
                className={inputClassName}
              />

              {newRecord.vehicleId && (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div>
                    <p className="font-bold text-slate-900">
                      {newRecord.licensePlate}
                    </p>

                    <p className="mt-0.5 text-sm text-slate-500">
                      {newRecord.makeModel}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Seçildi
                  </span>
                </div>
              )}

              {showVehicleResults &&
                !newRecord.vehicleId && (
                  <div className="absolute left-0 right-0 z-30 mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                    {vehiclesLoading ? (
                      <p className="px-4 py-4 text-sm text-slate-500">
                        Araçlar yükleniyor...
                      </p>
                    ) : vehiclesError ? (
                      <p className="px-4 py-4 text-sm text-red-600">
                        {vehiclesError}
                      </p>
                    ) : filteredVehicles.length === 0 ? (
                      <p className="px-4 py-4 text-sm text-slate-500">
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
                          className="block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-amber-50"
                        >
                          <p className="font-bold text-slate-900">
                            {vehicle.licensePlate}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {vehicle.makeModel}
                          </p>

                          <div className="mt-1.5 flex gap-2 text-xs text-slate-400">
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
              className={inputClassName}
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
              className={`${inputClassName} resize-none`}
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
                className={inputClassName}
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
                className={inputClassName}
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

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={!newRecord.vehicleId}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
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
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}

function CarIcon(
  props: React.SVGProps<SVGSVGElement>
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

function ListIcon(
  props: React.SVGProps<SVGSVGElement>
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
      <path d="M9 6h11" />
      <path d="M9 12h11" />
      <path d="M9 18h11" />
      <path d="M4 6h.01" />
      <path d="M4 12h.01" />
      <path d="M4 18h.01" />
    </svg>
  );
}

function AlertIcon(
  props: React.SVGProps<SVGSVGElement>
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
      <path d="M10.3 3.7 2.5 17.2A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.8L13.7 3.7a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function ToolsIcon(
  props: React.SVGProps<SVGSVGElement>
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

function CheckIcon(
  props: React.SVGProps<SVGSVGElement>
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