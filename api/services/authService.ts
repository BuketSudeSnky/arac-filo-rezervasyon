import { BASE_URL } from "../settings";

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}


export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    let message = "Kullanıcı adı veya şifre hatalı.";

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

export interface RegisterResponse {
  id: number;
  username: string;
  role: string;
}

export async function register(
  username: string,
  password: string
): Promise<RegisterResponse> {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    let message = "Kayıt işlemi başarısız oldu.";

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