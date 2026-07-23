export const BASE_URL = "http://localhost:8080/api";

export interface Vehicle {
  id: number;
  licensePlate: string;
  makeModel: string;
  type: string;
  status: string;
}

export type VehicleRequest = Omit<Vehicle, "id">;

export async function getVehicles(): Promise<Vehicle[]> {
  const response = await fetch(`${BASE_URL}/vehicles`);

  if (!response.ok) {
    throw new Error("Araçlar alınamadı.");
  }

  return response.json();
}

export async function createVehicle(
  vehicle: VehicleRequest
): Promise<Vehicle> {
  const response = await fetch(`${BASE_URL}/vehicles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vehicle),
  });

  if (!response.ok) {
    throw new Error("Araç eklenemedi.");
  }

  return response.json();
}

export async function deleteVehicle(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/vehicles/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let message = "Araç silinemedi.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Backend JSON dönmezse varsayılan mesaj kullanılır.
    }

    throw new Error(message);
  }
}

export async function getVehicleById(
  id: number
): Promise<Vehicle> {
  const response = await fetch(`${BASE_URL}/vehicles/${id}`);

  if (!response.ok) {
    throw new Error("Araç bilgisi alınamadı.");
  }

  return response.json();
}

export async function updateVehicle(
  id: number,
  vehicle: VehicleRequest
): Promise<Vehicle> {
  const response = await fetch(`${BASE_URL}/vehicles/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vehicle),
  });

  if (!response.ok) {
    throw new Error("Araç güncellenemedi.");
  }

  return response.json();
}