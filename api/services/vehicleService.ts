export const BASE_URL = "http://localhost:8080/api";

export interface Vehicle {
  id: number;
  licensePlate: string;
  makeModel: string;
  type: string;
  status: string;
}

export type VehicleRequest = Omit<Vehicle, "id">;

type VehicleListResponse =
  | Vehicle[]
  | {
      content?: Vehicle[];
      vehicles?: Vehicle[];
      data?: Vehicle[];
    };

function getToken(): string {
  if (typeof window === "undefined") {
    throw new Error("Bu işlem yalnızca tarayıcıda yapılabilir.");
  }

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Oturum bulunamadı. Lütfen tekrar giriş yapın."
    );
  }

  return token;
}

async function getErrorMessage(
  response: Response,
  defaultMessage: string
): Promise<string> {
  try {
    const data = await response.json();

    return data.message || data.error || defaultMessage;
  } catch {
    return defaultMessage;
  }
}

function extractVehicleList(
  data: VehicleListResponse
): Vehicle[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.content)) {
    return data.content;
  }

  if (Array.isArray(data.vehicles)) {
    return data.vehicles;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  console.error("Beklenmeyen araç API cevabı:", data);

  throw new Error(
    "Backend araç listesini beklenen formatta döndürmedi."
  );
}

export async function createVehicle(
  vehicle: VehicleRequest
): Promise<Vehicle> {
  const token = getToken();

  const response = await fetch(`${BASE_URL}/vehicles`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(vehicle),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Araç eklenemedi.")
    );
  }

  return response.json();
}

export async function deleteVehicle(
  id: number
): Promise<void> {
  const token = getToken();

  const response = await fetch(
    `${BASE_URL}/vehicles/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Araç silinemedi.")
    );
  }
}

export async function getVehicles(): Promise<Vehicle[]> {
  const response = await fetch(`${BASE_URL}/vehicles`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Araçlar alınamadı.")
    );
  }

  const data = (await response.json()) as VehicleListResponse;

  return extractVehicleList(data);
}

export async function getVehicleById(
  id: number
): Promise<Vehicle> {
  const token = getToken();

  const response = await fetch(
    `${BASE_URL}/vehicles/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Araç bilgisi alınamadı."
      )
    );
  }

  return response.json();
}


export async function updateVehicle(
  id: number,
  vehicle: VehicleRequest
): Promise<Vehicle> {
  const token = getToken();

  const response = await fetch(
    `${BASE_URL}/vehicles/${id}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(vehicle),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Araç güncellenemedi."
      )
    );
  }

  return response.json();
}

export async function getAvailableVehicles(
  startDate: string,
  endDate: string
): Promise<Vehicle[]> {
  const token = getToken();

  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const response = await fetch(
    `${BASE_URL}/vehicles/available?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Müsait araçlar alınamadı."
      )
    );
  }

  const data = (await response.json()) as VehicleListResponse;

  return extractVehicleList(data);
}