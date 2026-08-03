import { BASE_URL } from "../settings";

export interface User {
  id: number;
  username: string;
  role: "ADMIN" | "USER";
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
      "Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın."
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

    return (
      data.message ||
      data.error ||
      defaultMessage
    );
  } catch {
    return defaultMessage;
  }
}

export async function getUsers(): Promise<User[]> {
  const token = getToken();

  const response = await fetch(
    `${BASE_URL}/users`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Kullanıcılar getirilemedi."
    );

    throw new Error(message);
  }

  return response.json();
}

export async function getCurrentUser(): Promise<User> {
  const token = getToken();

  const response = await fetch(
    `${BASE_URL}/users/me`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Profil bilgileri getirilemedi."
    );

    throw new Error(message);
  }

  return response.json();
}