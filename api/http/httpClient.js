/**
 * Fetch tabanlı, interceptor destekli HTTP client.
 * Hem server component'lerde hem client component'lerde çalışır (ek bağımlılık yok).
 */

export class HttpError extends Error {
  constructor(message, { status, data, config }) {
    super(message);
    this.name = "HttpError";
    this.status = status; // HTTP status kodu (network hatasında 0)
    this.data = data;     // Backend'in döndüğü hata gövdesi
    this.config = config; // İsteğin konfigürasyonu (retry için kullanışlı)
  }
}

export class HttpClient {
  constructor({ baseURL = "", timeout = 30000, headers = {} } = {}) {
    this.baseURL = baseURL.replace(/\/+$/, "");
    this.timeout = timeout;
    this.defaultHeaders = headers;

    this.interceptors = {
      request: [],  // async (config) => config
      response: [], // { onSuccess: async (response, config) => response, onError: async (error) => ... }
    };
  }

  /** İstek interceptor'ı ekler. Kaldırmak için dönen fonksiyonu çağır. */
  useRequestInterceptor(fn) {
    this.interceptors.request.push(fn);
    return () => {
      this.interceptors.request = this.interceptors.request.filter((f) => f !== fn);
    };
  }

  /** Yanıt interceptor'ı ekler. onSuccess parse edilmiş yanıtı, onError HttpError'ı alır. */
  useResponseInterceptor(onSuccess, onError) {
    const entry = { onSuccess, onError };
    this.interceptors.response.push(entry);
    return () => {
      this.interceptors.response = this.interceptors.response.filter((e) => e !== entry);
    };
  }

  buildURL(url, params) {
    const full = url.startsWith("http") ? url : `${this.baseURL}/${url.replace(/^\/+/, "")}`;
    if (!params) return full;

    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
      else qs.append(key, value);
    });
    const query = qs.toString();
    return query ? `${full}?${query}` : full;
  }

  async request(url, { method = "GET", params, body, headers = {}, signal, ...rest } = {}) {
    // 1) Konfigürasyonu hazırla
    let config = {
      url,
      method: method.toUpperCase(),
      params,
      body,
      headers: { ...this.defaultHeaders, ...headers },
      signal,
      ...rest,
    };

    // 2) Request interceptor'larını sırayla çalıştır
    for (const interceptor of this.interceptors.request) {
      config = (await interceptor(config)) ?? config;
    }

    // 3) Body'i hazırla (FormData ise dokunma, obje ise JSON'a çevir)
    const isFormData = typeof FormData !== "undefined" && config.body instanceof FormData;
    let finalBody = config.body;
    if (finalBody !== undefined && finalBody !== null && !isFormData && typeof finalBody === "object") {
      finalBody = JSON.stringify(finalBody);
      config.headers["Content-Type"] ??= "application/json";
    }

    // 4) Timeout kontrolü
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout ?? this.timeout);
    if (config.signal) {
      config.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    let response;
    try {
      response = await fetch(this.buildURL(config.url, config.params), {
        method: config.method,
        headers: config.headers,
        body: finalBody,
        signal: controller.signal,
        cache: config.cache,             // Next.js fetch cache seçenekleri
        next: config.next,               // { revalidate, tags } — server tarafında
        credentials: config.credentials,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      const error = new HttpError(
        err.name === "AbortError" ? "İstek zaman aşımına uğradı" : "Sunucuya ulaşılamadı",
        { status: 0, data: null, config }
      );
      return this.#runErrorInterceptors(error);
    }
    clearTimeout(timeoutId);

    // 5) Yanıtı parse et
    const contentType = response.headers.get("content-type") ?? "";
    let data = null;
    if (response.status !== 204) {
      data = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => null);
    }

    // 6) Hata durumu
    if (!response.ok) {
      const error = new HttpError(data?.message ?? `HTTP ${response.status}`, {
        status: response.status,
        data,
        config,
      });
      return this.#runErrorInterceptors(error);
    }

    // 7) Response interceptor'ları (başarı)
    let result = data;
    for (const { onSuccess } of this.interceptors.response) {
      if (onSuccess) result = (await onSuccess(result, config, response)) ?? result;
    }
    return result;
  }

  async #runErrorInterceptors(error) {
    let current = error;
    for (const { onError } of this.interceptors.response) {
      if (!onError) continue;
      // onError bir değer döndürürse hata "kurtarılmış" sayılır (ör. token yenileyip retry)
      const recovered = await onError(current, this);
      if (recovered !== undefined) return recovered;
    }
    throw current;
  }

  // Kısayollar
  get(url, options)          { return this.request(url, { ...options, method: "GET" }); }
  post(url, body, options)   { return this.request(url, { ...options, method: "POST", body }); }
  put(url, body, options)    { return this.request(url, { ...options, method: "PUT", body }); }
  patch(url, body, options)  { return this.request(url, { ...options, method: "PATCH", body }); }
  delete(url, options)       { return this.request(url, { ...options, method: "DELETE" }); }
}
