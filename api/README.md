# API Katmanı — Kurulum ve Kullanım

## Klasör yapısı

```
api/
├── http/
│   ├── httpClient.js      # Interceptor destekli fetch client (çekirdek)
│   └── index.js           # Yapılandırılmış tekil instance + varsayılan interceptor'lar
├── core/
│   └── BaseController.js  # Tüm controller'ların miras aldığı temel sınıf
└── controllers/
    ├── vehicleController.js
    └── reservationController.js
```

## Ortam değişkeni

`.env.local` dosyana ekle:

```
NEXT_PUBLIC_API_URL=https://api.senin-backend.com/api
```

## Client component'te kullanım

```jsx
"use client";
import { useState } from "react";
import { vehicleController } from "@/api/controllers/vehicleController";
import { HttpError } from "@/api/http";

export default function AvailableVehicles() {
  const [vehicles, setVehicles] = useState([]);

  async function search() {
    try {
      const data = await vehicleController.getAvailable({
        pickupDate: "2026-07-15",
        returnDate: "2026-07-18",
        class: "sedan",
      });
      setVehicles(data);
    } catch (err) {
      if (err instanceof HttpError) {
        console.error(err.status, err.data); // backend'in hata gövdesi
      }
    }
  }

  return <button onClick={search}>Müsait araçları getir</button>;
}
```

## Server component'te kullanım

```jsx
import { vehicleController } from "@/api/controllers/vehicleController";

export default async function VehiclesPage() {
  // Next.js cache seçenekleri options üzerinden geçilebilir:
  const vehicles = await vehicleController.getAll(
    { page: 1 },
    { next: { revalidate: 60 } } // 60 sn'de bir yenile
  );

  return <pre>{JSON.stringify(vehicles, null, 2)}</pre>;
}
```

## Yeni controller ekleme

Backend'e yeni bir resource geldiğinde tek yapman gereken:

```js
import { BaseController } from "../core/BaseController";

class DriverController extends BaseController {
  constructor() {
    super("drivers");
  }
  // Özel endpoint gerekirse this.request(...) ile ekle
}

export const driverController = new DriverController();
```

CRUD (getAll, getById, create, update, patch, remove) otomatik gelir;
tüm interceptor'lar (token, log, 401 yönlendirmesi) otomatik uygulanır.

## Endpoint değiştiğinde

- Resource yolu değişti (ör. `reservations` → `v2/reservations`):
  sadece ilgili controller'ın `super("...")` satırı güncellenir.
- Tüm API'nin base URL'i değişti: sadece `.env.local` güncellenir.
- Auth/hata davranışı değişti: sadece `api/http/index.js` içindeki
  interceptor'lar güncellenir — controller'lara dokunulmaz.
