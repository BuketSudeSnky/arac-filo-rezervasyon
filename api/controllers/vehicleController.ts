import BASE_URL from "../core/api";

export async function getVehicles() {
  const response = await fetch(`${BASE_URL}/api/vehicles`);

  if (!response.ok) {
    throw new Error("Araçlar alınamadı.");
  }

  return response.json();
}