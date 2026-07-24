"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  getAvailableVehicles,
  type Vehicle,
} from "../../../api/services/vehicleService";

import {
  createReservation,
  type ReservationRequest,
} from "../../../api/services/reservationService";

export default function RezervasyonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const vehicleIdFromUrl = searchParams.get("vehicleId");

  const [availableVehicles, setAvailableVehicles] = useState<
    Vehicle[]
  >([]);

  const [vehicleId, setVehicleId] = useState("");
  const [username, setUsername] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [purpose, setPurpose] = useState("");

  const [loading, setLoading] = useState(false);
  const [
    loadingAvailableVehicles,
    setLoadingAvailableVehicles,
  ] = useState(false);

  const [availableError, setAvailableError] =
    useState("");

  useEffect(() => {
    const loadAvailableVehicles = async () => {
      if (!startDate || !endDate) {
        setAvailableVehicles([]);
        setAvailableError("");
        setVehicleId("");
        return;
      }

      if (endDate < startDate) {
        setAvailableVehicles([]);
        setAvailableError(
          "Bitiş tarihi başlangıç tarihinden önce olamaz."
        );
        setVehicleId("");
        return;
      }

      try {
        setLoadingAvailableVehicles(true);
        setAvailableError("");

        const vehicles = await getAvailableVehicles(
          startDate,
          endDate
        );

        setAvailableVehicles(vehicles);

        if (
          vehicleIdFromUrl &&
          vehicles.some(
            (vehicle) =>
              String(vehicle.id) === vehicleIdFromUrl
          )
        ) {
          setVehicleId(vehicleIdFromUrl);
        } else {
          setVehicleId((currentVehicleId) => {
            const currentVehicleIsAvailable =
              vehicles.some(
                (vehicle) =>
                  String(vehicle.id) === currentVehicleId
              );

            return currentVehicleIsAvailable
              ? currentVehicleId
              : "";
          });
        }
      } catch (error) {
        console.error(error);

        setAvailableVehicles([]);
        setVehicleId("");

        if (error instanceof Error) {
          setAvailableError(error.message);
        } else {
          setAvailableError(
            "Müsait araçlar alınamadı."
          );
        }
      } finally {
        setLoadingAvailableVehicles(false);
      }
    };

    loadAvailableVehicles();
  }, [startDate, endDate, vehicleIdFromUrl]);

  const isFormValid =
  username.trim() !== "" &&
  startDate !== "" &&
  endDate !== "" &&
  purpose.trim() !== "" &&
  vehicleId !== "" &&
  availableVehicles.length > 0 &&
  !loading &&
  !loadingAvailableVehicles &&
  endDate >= startDate;

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (!startDate || !endDate) {
      alert(
        "Lütfen başlangıç ve bitiş tarihlerini seçin."
      );
      return;
    }

    if (endDate < startDate) {
      alert(
        "Bitiş tarihi başlangıç tarihinden önce olamaz."
      );
      return;
    }

    if (!vehicleId) {
      alert("Lütfen müsait bir araç seçin.");
      return;
    }

    if (!username.trim()) {
      alert("Lütfen kullanıcı adını girin.");
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

      alert(
        "Rezervasyon başarıyla oluşturuldu."
      );

      router.push("/rezervasyon");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Rezervasyon oluşturulamadı."
      );
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
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label
              htmlFor="username"
              className="font-medium"
            >
              Kullanıcı<span className="text-red-500">*</span>
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Ahmet Yılmaz"
              className="rounded border px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label
              htmlFor="startDate"
              className="font-medium" 
            >
              Başlangıç<span className="text-red-500">*</span>
            </label>

            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setVehicleId("");
              }}
              className="rounded border px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label
              htmlFor="endDate"
              className="font-medium"
            >
              Bitiş<span className="text-red-500">*</span>
            </label>

            <input
              id="endDate"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => {
                setEndDate(e.target.value);
                setVehicleId("");
              }}
              className="rounded border px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <label
              htmlFor="vehicle"
              className="pt-2 font-medium"
            >
              Araç<span className="text-red-500">*</span>
            </label>

            <div>
              <select
                id="vehicle"
                value={vehicleId}
                onChange={(e) =>
                  setVehicleId(e.target.value)
                }
                disabled={
                  !startDate ||
                  !endDate ||
                  loadingAvailableVehicles ||
                  availableVehicles.length === 0
                }
                className="w-full rounded border px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">
                  {loadingAvailableVehicles
                    ? "Müsait araçlar yükleniyor..."
                    : !startDate || !endDate
                      ? "Önce tarih seçiniz"
                      : availableVehicles.length === 0
                        ? "Müsait araç bulunamadı"
                        : "Araç seçiniz"}
                </option>

                {availableVehicles.map((vehicle) => (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
                  >
                    {vehicle.licensePlate} -{" "}
                    {vehicle.makeModel}
                  </option>
                ))}
              </select>

              {availableError && (
                <p className="mt-2 text-sm text-red-600">
                  {availableError}
                </p>
              )}

              {!loadingAvailableVehicles &&
                startDate &&
                endDate &&
                !availableError &&
                availableVehicles.length === 0 && (
                  <p className="mt-2 text-sm text-yellow-700">
                    Seçilen tarihlerde müsait araç
                    bulunamadı.
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <label
              htmlFor="purpose"
              className="font-medium"
            >
              Amaç<span className="text-red-500">*</span>
            </label>

            <textarea
              id="purpose"
              rows={3}
              value={purpose}
              onChange={(e) =>
                setPurpose(e.target.value)
              }
              placeholder="Rezervasyon amacı..."
              className="rounded border px-3 py-2"
            />
          </div>

          <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
            Araç seçilen tarihlerde daha önce rezerve
            edilmişse müsait araçlar listesinde
            görünmez.
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/rezervasyon"
              className="rounded border px-6 py-2 hover:bg-gray-100"
            >
              Vazgeç
            </Link>

            <button
  type="submit"
  disabled={!isFormValid}
  className="rounded bg-[#0B4EA2] px-6 py-2 text-white transition hover:bg-[#083a79] disabled:cursor-not-allowed disabled:opacity-50"
>
  {loading ? "Kaydediliyor..." : "Kaydet"}
</button>
</div>
        </form>
      </div>
    </main>
  );
}