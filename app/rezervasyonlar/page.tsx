"use client";


const REZERVASYONLAR = [
  {
    plaka: "34 ABC 123",
    kullanici: "Ahmet Y.",
    tarih: "12.07.2026 - 15.07.2026",
    durum: "Planlandı",
  },
  {
    plaka: "34 XYZ 456",
    kullanici: "Merve K.",
    tarih: "07.07.2026 - 09.07.2026",
    durum: "Devam Ediyor",
  },
  {
    plaka: "06 KLM 789",
    kullanici: "Can D.",
    tarih: "01.07.2026 - 03.07.2026",
    durum: "Tamamlandı",
  },
];

export default function RezervasyonlarPage() {
  return (
    <main className="min-h-screen bg-[#F2F4F7] py-10">
      <div className="mx-auto max-w-6xl px-6">

        <h1 className="mb-8 text-3xl font-bold">
          Rezervasyonlar
        </h1>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="w-full">

            <thead className="bg-[#14181F] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Plaka</th>
                <th className="px-4 py-3 text-left">Kullanıcı</th>
                <th className="px-4 py-3 text-left">Tarih</th>
                <th className="px-4 py-3 text-left">Durum</th>
              </tr>
            </thead>

            <tbody>
              {REZERVASYONLAR.map((r) => (
                <tr key={r.plaka} className="border-b">
                  <td className="px-4 py-3">{r.plaka}</td>
                  <td className="px-4 py-3">{r.kullanici}</td>
                  <td className="px-4 py-3">{r.tarih}</td>
                  <td className="px-4 py-3">{r.durum}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </main>
  );
}