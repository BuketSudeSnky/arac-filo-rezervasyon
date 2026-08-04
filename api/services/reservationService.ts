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

function getToken(): string {
  if (typeof window === "undefined") {
    throw new Error(
      "Bu işlem yalnızca tarayıcıda yapılabilir."
    );
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
  defaultMessage = "İşlem başarısız."
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

export async function getReservations(): Promise<
  Reservation[]
> {
  const token = getToken();

  const response = await fetch(
    `${BASE_URL}/reservations`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Rezervasyonlar getirilemedi."
      )
    );
  }

  return response.json();
}

export async function createReservation(
  reservation: ReservationRequest
): Promise<Reservation> {
  const token = getToken();

  const response = await fetch(
    `${BASE_URL}/reservations`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reservation),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Rezervasyon oluşturulamadı."
      )
    );
  }

  return response.json();
}

export async function updateReservationStatus(
  id: number,
  status: ReservationStatus
): Promise<Reservation> {
  const token = getToken();

  const response = await fetch(
    `${BASE_URL}/reservations/${id}/status`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Rezervasyon durumu güncellenemedi."
      )
    );
  }

  return response.json();
}

export async function cancelReservation(
  id: number
): Promise<Reservation> {
  const token = getToken();

  const response = await fetch(
    `${BASE_URL}/reservations/${id}/cancel`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Rezervasyon iptal edilemedi."
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
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Müsait araçlar getirilemedi."
      )
    );
  }

  return response.json();
}