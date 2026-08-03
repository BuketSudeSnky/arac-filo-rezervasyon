import { BASE_URL } from "../settings";

export type MaintenanceStatus =
  | "Reported"
  | "InMaintenance"
  | "Completed";

type ApiMaintenanceStatus =
  | "Arıza Bildirildi"
  | "Bakımda"
  | "Tamamlandı";

type ApiVehicle = {
  id: number;
  licensePlate: string;
  makeModel: string;
  type: string;
  status: string;
};

type ApiMaintenanceRecord = {
  id: number;
  vehicle: ApiVehicle;
  title: string;
  description: string;
  reportDate: string;
  status: ApiMaintenanceStatus;
};

export type MaintenanceRecord = {
  id: number;
  vehicleId: number;
  licensePlate: string;
  makeModel: string;
  title: string;
  description: string;
  reportedDate: string;
  status: MaintenanceStatus;
};

export type MaintenanceRequest = {
  vehicleId: number;
  title: string;
  description: string;
  reportedDate: string;
  status: MaintenanceStatus;
};

function getToken(): string {
  if (typeof window === "undefined") {
    throw new Error(
      "Bu işlem yalnızca tarayıcıda yapılabilir."
    );
  }

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın."
    );
  }

  return token;
}

function toFrontendStatus(
  status: ApiMaintenanceStatus
): MaintenanceStatus {
  const statusMap: Record<
    ApiMaintenanceStatus,
    MaintenanceStatus
  > = {
    "Arıza Bildirildi": "Reported",
    Bakımda: "InMaintenance",
    Tamamlandı: "Completed",
  };

  return statusMap[status] ?? "Reported";
}

function toApiStatus(
  status: MaintenanceStatus
): ApiMaintenanceStatus {
  const statusMap: Record<
    MaintenanceStatus,
    ApiMaintenanceStatus
  > = {
    Reported: "Arıza Bildirildi",
    InMaintenance: "Bakımda",
    Completed: "Tamamlandı",
  };

  return statusMap[status];
}

function mapMaintenanceRecord(
  record: ApiMaintenanceRecord
): MaintenanceRecord {
  return {
    id: record.id,
    vehicleId: record.vehicle.id,
    licensePlate: record.vehicle.licensePlate,
    makeModel: record.vehicle.makeModel,
    title: record.title,
    description: record.description,
    reportedDate: record.reportDate,
    status: toFrontendStatus(record.status),
  };
}

async function getErrorMessage(
  response: Response,
  defaultMessage: string
): Promise<string> {
  try {
    const data = await response.json();

    return (
      data.message ||
      data.error ||
      defaultMessage
    );
  } catch {
    return defaultMessage;
  }
}

export async function getMaintenanceRecords():
Promise<MaintenanceRecord[]> {
  const token = getToken();

  const response = await fetch(
    `${BASE_URL}/maintenance`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Bakım ve arıza kayıtları alınamadı."
      )
    );
  }

  const data =
    (await response.json()) as ApiMaintenanceRecord[];

  return data.map(mapMaintenanceRecord);
}

export async function createMaintenanceRecord(
  record: MaintenanceRequest
): Promise<MaintenanceRecord> {
  const token = getToken();

  const response = await fetch(
    `${BASE_URL}/maintenance`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        vehicle: {
          id: record.vehicleId,
        },
        title: record.title,
        description: record.description,
        reportDate: record.reportedDate,
        status: toApiStatus(record.status),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Bakım veya arıza kaydı oluşturulamadı."
      )
    );
  }

  const data =
    (await response.json()) as ApiMaintenanceRecord;

  return mapMaintenanceRecord(data);
}

export async function updateMaintenanceStatus(
  recordId: number,
  status: MaintenanceStatus
): Promise<MaintenanceRecord> {
  const token = getToken();

  const response = await fetch(
    `${BASE_URL}/maintenance/${recordId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: toApiStatus(status),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Bakım kaydının durumu güncellenemedi."
      )
    );
  }

  const data =
    (await response.json()) as ApiMaintenanceRecord;

  return mapMaintenanceRecord(data);
}

export async function deleteMaintenanceRecord(
  recordId: number
): Promise<void> {
  const token = getToken();

  const response = await fetch(
    `${BASE_URL}/maintenance/${recordId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Bakım veya arıza kaydı silinemedi."
      )
    );
  }
}