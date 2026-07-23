export const BASE_URL = "http://localhost:8080/api";


export async function getVehicles() {
  const response = await fetch(`${BASE_URL}/vehicles`);

  if (!response.ok) {
    throw new Error("Araçlar alınamadı.");
  }

  return response.json();
}

export async function createVehicle(vehicle: any) {   /* any de sıkıntı var ama şuanlık bu sıkıntı değil */ 
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


export async function deleteVehicle(id: number) {
  const response = await fetch(`${BASE_URL}/vehicles/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Araç silinemedi.");
  }
}


export async function getVehicleById(id: number) {
  const response = await fetch(`${BASE_URL}/vehicles/${id}`);

  if (!response.ok) {
    throw new Error("Araç bilgisi alınamadı.");
  }

  return response.json();
}

export async function updateVehicle(
  id: number,
  vehicle: {
    licensePlate: string;
    makeModel: string;
    type: string;
    status: string;
  }
) {
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