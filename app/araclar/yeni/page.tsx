"use client";

import Link from "next/link";
import { useState } from "react";
import { createVehicle } from "../../../api/services/vehicleService";

export default function YeniAracPage() {

  

  const [licensePlate, setLicensePlate] = useState("");  
  const [makeModel, setMakeModel] = useState("");
  const [type, setType] = useState("Binek");
  const [status, setStatus] = useState("Aktif");
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await createVehicle({
      licensePlate,
      makeModel,
      type,
      status,
    });

    alert("Araç başarıyla eklendi!");

    // Formu temizle
    setLicensePlate("");
    setMakeModel("");
    setType("Binek");
    setStatus("Aktif");

  } catch (error) {
    console.error(error);
    alert("Araç eklenemedi.");
  }


};



  return (
    <main className="min-h-screen bg-[#F2F4F7] py-10">
      <div className="mx-auto max-w-xl rounded-lg bg-white shadow">

        <div className="border-b p-6">
          <h1 className="text-2xl font-bold text-center">
            🚗 Yeni Araç Ekle
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-8">

          <div>
            <label className="mb-2 block font-medium">
              Plaka
            </label>

            <input
              type="text"
              placeholder="34 ABC 123"
               value={licensePlate}
               onChange={(e) => setLicensePlate(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Marka / Model
            </label>

            <input
              type="text"
              placeholder="Ford Focus"
               value={makeModel}
               onChange={(e) => setMakeModel(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Tür
            </label>

            <select 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded border px-3 py-2">
              <option>Binek</option>
              <option>Ticari</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Durum
            </label>

            <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border px-3 py-2">
              <option>Aktif</option>
              <option>Bakımda</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-4">

            <Link
              href="/araclar"
              className="rounded border px-5 py-2"
            >
              İptal
            </Link>

            <button
            type="submit"
            className="rounded bg-[#0B4EA2] px-5 py-2 text-white">
            Kaydet
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}