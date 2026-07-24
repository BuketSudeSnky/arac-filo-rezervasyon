import { BASE_URL } from "./vehicleService";
import type { Vehicle } from "./vehicleService";

export type ReservationStatus =
  | "Planned"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export interface Reservation {
  id: number;
  vehicle: Vehicle;
  username: string;
  startDate: string;
  endDate: string;
  purpose: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface ReservationRequest {
  vehicle: {
    id: number;
  };
  username: string;
  startDate: string;
  endDate: string;
  purpose: string;
  status: ReservationStatus;
}

async function getErrorMessage(
  response: Response
): Promise<string> {
  try {
    const data = await response.json();

    return data.message || data.error || "İşlem başarısız.";
  } catch {
    return "İşlem başarısız.";
  }
}

export async function getReservations(): Promise<Reservation[]> {
  const response = await fetch(`${BASE_URL}/reservations`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function createReservation(
  reservation: ReservationRequest
): Promise<Reservation> {
  const response = await fetch(`${BASE_URL}/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reservation),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function updateReservationStatus(
  id: number,
  status: ReservationStatus
): Promise<Reservation> {
  const response = await fetch(
    `${BASE_URL}/reservations/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function cancelReservation(
  id: number
): Promise<Reservation> {
  const response = await fetch(
    `${BASE_URL}/reservations/${id}/cancel`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function getAvailableVehicles(
  startDate: string,
  endDate: string
): Promise<Vehicle[]> {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const response = await fetch(
    `${BASE_URL}/vehicles/available?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}