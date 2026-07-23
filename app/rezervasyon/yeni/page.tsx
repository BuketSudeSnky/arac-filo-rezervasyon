"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getVehicles } from "../../../api/services/vehicleService";
import {
  createReservation,
  type ReservationRequest,
} from "../../../api/services/reservationService";

type Vehicle = {
  id: number;
  licensePlate: string;
  makeModel: string;
  type: string;
  status: string;
};

export default function RezervasyonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const vehicleIdFromUrl = searchParams.get("vehicleId");

  const [araclar, setAraclar] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [username, setUsername] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [purpose, setPurpose] = useState("");

  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const araclariGetir = async () => {
      try {
        const data: Vehicle[] = await getVehicles();

        setAraclar(data);

        if (vehicleIdFromUrl) {
          setVehicleId(vehicleIdFromUrl);
        } else if (data.length > 0) {
          setVehicleId(String(data[0].id));
        }
      } catch (error) {
        console.error(error);
        setError("Araçlar alınamadı.");
      } finally {
        setVehiclesLoading(false);
      }
    };

    araclariGetir();
  }, [vehicleIdFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (!vehicleId) {
      alert("Lütfen bir araç seçin.");
      return;
    }

    if (!username.trim()) {
      alert("Lütfen kullanıcı adını girin.");
      return;
    }

    if (!startDate || !endDate) {
      alert("Lütfen başlangıç ve bitiş tarihlerini seçin.");
      return;
    }

    if (!purpose.trim()) {
      alert("Lütfen rezervasyon amacını girin.");
      return;
    }

    const reservation: ReservationRequest = {
      vehicle: {
        id: Number(vehicleId),
      },
      username: username.trim(),
      startDate,
      endDate,
      purpose: purpose.trim(),
      status: "Planned",
    };

    try {
      setLoading(true);

      await createReservation(reservation);

      alert("Rezervasyon başarıyla oluşturuldu.");
      router.push("/rezervasyon");

      
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Rezervasyon oluşturulamadı.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F2F4F7] py-10">
      <div className="mx-auto max-w-xl rounded-lg bg-white shadow">
        <div className="border-b p-6">
          <h1 className="text-center text-2xl font-bold">
            Yeni Rezervasyon
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-8"
        >
          {/* Araç */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label
              htmlFor="vehicle"
              className="font-medium"
            >
              Araç
            </label>

            <select
              id="vehicle"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              disabled={vehiclesLoading}
              className="rounded border px-3 py-2 disabled:bg-gray-100"
            >
              {vehiclesLoading && (
                <option value="">
                  Araçlar yükleniyor...
                </option>
              )}

              {!vehiclesLoading && araclar.length === 0 && (
                <option value="">
                  Araç bulunamadı
                </option>
              )}

              {araclar.map((arac) => (
                <option
                  key={arac.id}
                  value={arac.id}
                >
                  {arac.licensePlate} - {arac.makeModel}
                </option>
              ))}
            </select>
          </div>

          {/* Kullanıcı */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label
              htmlFor="username"
              className="font-medium"
            >
              Kullanıcı
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ahmet Yılmaz"
              className="rounded border px-3 py-2"
            />
          </div>

          {/* Başlangıç */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label
              htmlFor="startDate"
              className="font-medium"
            >
              Başlangıç
            </label>

            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded border px-3 py-2"
            />
          </div>

          {/* Bitiş */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label
              htmlFor="endDate"
              className="font-medium"
            >
              Bitiş
            </label>

            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              className="rounded border px-3 py-2"
            />
          </div>

          {/* Amaç */}
          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <label
              htmlFor="purpose"
              className="font-medium"
            >
              Amaç
            </label>

            <textarea
              id="purpose"
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Rezervasyon amacı..."
              className="rounded border px-3 py-2"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
            ⚠️ Araç seçilen tarihlerde daha önce rezerve edilmişse
            rezervasyon oluşturulmaz.
          </div>

          {/* Butonlar */}
          <div className="flex justify-center gap-4 pt-4">
            <Link
  href="/rezervasyon"
  className="rounded border px-6 py-2 hover:bg-gray-100"
>
  Vazgeç
</Link>

            <button
              type="submit"
              disabled={
                loading ||
                vehiclesLoading ||
                araclar.length === 0
              }
              className="rounded bg-[#0B4EA2] px-6 py-2 text-white hover:bg-[#083a79] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}