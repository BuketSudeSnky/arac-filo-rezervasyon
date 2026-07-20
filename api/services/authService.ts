import {BASE_URL} from "../settings";

export async function login(username: string, password: string) {
  const response = await fetch(`${BASE_URL}/api/login`, {
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
    throw new Error("Giriş başarısız.");
  }

  return response.json();
}