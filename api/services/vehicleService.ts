import {BASE_URL} from "../settings";

export async function getVehicles() {
  const response = await fetch(`${BASE_URL}/vehicles`);

  if (!response.ok) {
    throw new Error("Araçlar alınamadı.");
  }

  return response.json();
}