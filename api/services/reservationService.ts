import { BASE_URL } from "./vehicleService";

export type ReservationStatus =
  | "Planned"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export type ReservationRequest = {
  vehicle: {
    id: number;
  };
  username: string;
  startDate: string;
  endDate: string;
  purpose: string;
  status: ReservationStatus;
};

export type Reservation = {
  id: number;
  vehicle: {
    id: number;
    licensePlate?: string;
    makeModel?: string;
  };
  username: string;
  startDate: string;
  endDate: string;
  purpose: string;
  status: ReservationStatus;
  createdAt: string;
};

async function getErrorMessage(response: Response) {
  try {
    const data = await response.json();
    return data.message || "İşlem başarısız.";
  } catch {
    return "İşlem başarısız.";
  }
}

// Tüm rezervasyonları getir
export async function getReservations(): Promise<Reservation[]> {
  const response = await fetch(`${BASE_URL}/reservations`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

// Yeni rezervasyon oluştur
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

// Rezervasyon durumunu güncelle
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

// Rezervasyonu iptal et
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