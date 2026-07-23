"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  getVehicleById,
  updateVehicle,
} from "../../../api/services/vehicleService";

export default function DuzenleAracPage() {

  const searchParams = useSearchParams();
const router = useRouter();

const id = Number(searchParams.get("id"));

const [licensePlate, setLicensePlate] = useState("");
const [makeModel, setMakeModel] = useState("");
const [type, setType] = useState("Binek");
const [status, setStatus] = useState("Aktif");

useEffect(() => {




  const loadVehicle = async () => {
    try {
      const vehicle = await getVehicleById(id);

      setLicensePlate(vehicle.licensePlate);
      setMakeModel(vehicle.makeModel);
      setType(vehicle.type);
      setStatus(vehicle.status);
    } catch (error) {
      console.error(error);
      alert("Araç bilgisi alınamadı.");
    }
  };

  if (id) {
    loadVehicle();
  }
}, [id]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await updateVehicle(id, {
      licensePlate,
      makeModel,
      type,
      status,
    });

    alert("Araç başarıyla güncellendi.");

    router.push("/araclar");
  } catch (error) {
    console.error(error);
    alert("Araç güncellenemedi.");
  }
};

  return (
    <main className="min-h-screen bg-[#F2F4F7] py-10">
      <div className="mx-auto max-w-xl rounded-lg bg-white shadow">

        <div className="border-b p-6">
          <h1 className="text-2xl font-bold text-center">
            ✏️ Araç Düzenle
          </h1>
        </div>

        <form 
        onSubmit={handleSubmit}
        className="space-y-5 p-8">

          <input
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />

          <input
            value={makeModel}
            onChange={(e) => setMakeModel(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded border px-3 py-2"
          >
            <option>Binek</option>
            <option>Ticari</option>
          </select>

          <select
             value={status}
             onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border px-3 py-2"
          >
            <option>Aktif</option>
            <option>Bakımda</option>
          </select>

          <div className="flex justify-end gap-4">

            <Link
              href="/araclar"
              className="rounded border px-5 py-2"
            >
              Vazgeç
            </Link>

            <button
            type="submit"
              className="rounded bg-[#0B4EA2] px-5 py-2 text-white"
            >
              Güncelle
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}