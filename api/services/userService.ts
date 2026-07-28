import { BASE_URL } from "../settings";

export interface User {
  id: number;
  username: string;
  role: "ADMIN" | "USER";
}

export async function getUsers(): Promise<User[]> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Oturum bilgisi bulunamadı.");
  }

  const response = await fetch(`${BASE_URL}/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = "Kullanıcılar getirilemedi.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Backend JSON dönmezse varsayılan mesaj kullanılır.
    }

    throw new Error(message);
  }

  return response.json();
}