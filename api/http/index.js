import { HttpClient, HttpError } from "./httpClient";

/**
 * Uygulama genelinde kullanılacak tek HTTP client instance'ı.
 * Tüm controller'lar bu instance üzerinden istek atar,
 * dolayısıyla buraya eklenen interceptor'lar her API çağrısına uygulanır.
 */
export const http = new HttpClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

/* ---------------------------------------------------------------- */
/* REQUEST INTERCEPTOR: Auth token ekleme                            */
/* ---------------------------------------------------------------- */
http.useRequestInterceptor(async (config) => {
  // Client tarafında localStorage'dan; server tarafında cookie'den okumak istersen
  // burada headers().get("cookie") vb. ile genişletebilirsin.
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* ---------------------------------------------------------------- */
/* REQUEST INTERCEPTOR: Geliştirme ortamında loglama                 */
/* ---------------------------------------------------------------- */
if (process.env.NODE_ENV === "development") {
  http.useRequestInterceptor((config) => {
    console.log(`→ [${config.method}] ${config.url}`, config.params ?? "");
    return config;
  });
}

/* ---------------------------------------------------------------- */
/* RESPONSE INTERCEPTOR: Zarf açma + hata yönetimi                   */
/* ---------------------------------------------------------------- */
http.useResponseInterceptor(
  // Başarı: backend { success, data, message } zarfı dönüyorsa data'yı aç
  (data) => {
    if (data && typeof data === "object" && "data" in data && "success" in data) {
      return data.data;
    }
    return data;
  },

  // Hata: merkezi hata yönetimi
  async (error /*, client */) => {
    if (error.status === 401 && typeof window !== "undefined") {
      // Token geçersiz — oturumu temizle, girişe yönlendir.
      // Refresh token akışın varsa burada token yenileyip
      // `return client.request(error.config.url, error.config)` ile retry yapabilirsin.
      localStorage.removeItem("access_token");
      window.location.href = "/giris";
      return; // undefined dönmek hatayı fırlatmaya devam ettirir; burada yönlendirme yeterli
    }

    if (process.env.NODE_ENV === "development") {
      console.error(`✗ [${error.config?.method}] ${error.config?.url} → ${error.status}`, error.data);
    }

    // undefined döndür: hata çağıran tarafa fırlatılır (try/catch ile yakalanır)
  }
);

export { HttpError };
