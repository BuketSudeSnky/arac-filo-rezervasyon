"use client";

import { useMemo, useState } from "react";

type MaintenanceStatus =
  | "Reported"
  | "InMaintenance"
  | "Completed";


type MaintenanceRecord = {
  id: number;
  vehicleId: number;
  licensePlate: string;
  makeModel: string;
  title: string;
  description: string;
  reportedDate: string;
  completedDate?: string;
  status: MaintenanceStatus;
};

const INITIAL_MAINTENANCE_RECORDS: MaintenanceRecord[] = [
  {
    id: 1,
    vehicleId: 1,
    licensePlate: "34 ABC 123",
    makeModel: "Ford Focus",
    title: "Motor arıza lambası",
    description:
      "Gösterge panelinde motor arıza lambası yanıyor.",
    reportedDate: "2026-07-20",
    status: "Reported",
  },
  {
    id: 2,
    vehicleId: 2,
    licensePlate: "34 XYZ 456",
    makeModel: "Fiat Doblo",
    title: "Periyodik bakım",
    description:
      "Yağ, filtre ve genel araç kontrolleri yapılacak.",
    reportedDate: "2026-07-18",
    status: "InMaintenance",
  },
  {
    id: 3,
    vehicleId: 3,
    licensePlate: "06 KLM 789",
    makeModel: "Renault Megane",
    title: "Lastik değişimi",
    description:
      "Ön lastiklerde aşınma tespit edildi.",
    reportedDate: "2026-07-10",
    completedDate: "2026-07-12",
    status: "Completed",
  },
];

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

export default function AdminMaintenancePage() {


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

  const [records, setRecords] = useState<MaintenanceRecord[]>(
    INITIAL_MAINTENANCE_RECORDS
  );

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [selectedRecord, setSelectedRecord] =
    useState<MaintenanceRecord | null>(null);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchableText = `
        ${record.licensePlate}
        ${record.makeModel}
        ${record.title}
        ${record.description}
      `.toLocaleLowerCase("tr-TR");

      const matchesSearch = searchableText.includes(
        searchText.toLocaleLowerCase("tr-TR")
      );

      const matchesStatus =
        statusFilter === "Tümü" ||
        record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
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

   const handleCreateRecord = (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  if (
    !newRecord.licensePlate.trim() ||
    !newRecord.makeModel.trim() ||
    !newRecord.title.trim() ||
    !newRecord.description.trim() ||
    !newRecord.reportedDate
  ) {
    alert("Lütfen tüm alanları doldurun.");
    return;
  }

  const record: MaintenanceRecord = {
    id: Date.now(),
    vehicleId: Number(newRecord.vehicleId) || Date.now(),
    licensePlate: newRecord.licensePlate.trim(),
    makeModel: newRecord.makeModel.trim(),
    title: newRecord.title.trim(),
    description: newRecord.description.trim(),
    reportedDate: newRecord.reportedDate,
    status: newRecord.status,
  };

  setRecords((currentRecords) => [
    record,
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
};

  const handleStatusChange = (
    recordId: number,
    newStatus: MaintenanceStatus
  ) => {
    setRecords((currentRecords) =>
      currentRecords.map((record) => {
        if (record.id !== recordId) {
          return record;
        }


        return {
          ...record,
          status: newStatus,
          completedDate:
            newStatus === "Completed"
              ? new Date().toISOString().split("T")[0]
              : undefined,
        };
      })
    );
  };

  const handleDelete = (recordId: number) => {
    const confirmed = window.confirm(
      "Bu bakım veya arıza kaydını silmek istediğinizden emin misiniz?"
    );

    if (!confirmed) {
      return;
    }

    setRecords((currentRecords) =>
      currentRecords.filter(
        (record) => record.id !== recordId
      )
    );
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
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Kriterlere uygun bakım veya arıza kaydı bulunamadı.
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
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="transition hover:bg-gray-50"
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
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <select
                          value={record.status}
                          onChange={(event) =>
                            handleStatusChange(
                              record.id,
                              event.target
                                .value as MaintenanceStatus
                            )
                          }
                          className="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#0B4EA2]"
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
                          onClick={() =>
                            handleDelete(record.id)
                          }
                          className="rounded-lg border border-red-500 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Sil
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
  onSubmit,
  onClose,
}: {
  newRecord: NewMaintenanceRecord;
  setNewRecord: React.Dispatch<
    React.SetStateAction<NewMaintenanceRecord>
  >;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>
  ) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Yeni Bakım veya Arıza Kaydı
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Araçla ilgili bakım veya arıza bilgilerini girin.
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

        <form
          onSubmit={onSubmit}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Plaka">
              <input
                type="text"
                value={newRecord.licensePlate}
                onChange={(event) =>
                  setNewRecord((current) => ({
                    ...current,
                    licensePlate: event.target.value,
                  }))
                }
                placeholder="34 ABC 123"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2]"
              />
            </FormField>

            <FormField label="Marka / Model">
              <input
                type="text"
                value={newRecord.makeModel}
                onChange={(event) =>
                  setNewRecord((current) => ({
                    ...current,
                    makeModel: event.target.value,
                  }))
                }
                placeholder="Ford Focus"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#0B4EA2]"
              />
            </FormField>
          </div>

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
              onClick={onClose}
              className="rounded-lg border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              className="rounded-lg bg-[#0B4EA2] px-5 py-3 font-semibold text-white hover:bg-[#083a79]"
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
