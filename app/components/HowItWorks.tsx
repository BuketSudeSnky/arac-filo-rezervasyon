const ADIMLAR = [
  {
    no: "01",
    baslik: "Aracını Seç",
    aciklama:
      "Tarih ve lokasyonu gir, uygun araçları görüntüle.",
  },
  {
    no: "02",
    baslik: "Rezervasyonu Onayla",
    aciklama:
      "Rezervasyonunu tek ekrandan tamamla.",
  },
  {
    no: "03",
    baslik: "Teslim Al",
    aciklama:
      "Aracını teslim al ve yolculuğuna başla.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="nasil"
      className="border-y border-[#14181F]/10 bg-white"
    >
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-4xl font-bold uppercase">
          Nasıl Çalışır
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3">
          {ADIMLAR.map((a) => (
            <div key={a.no}>
              <p className="text-5xl font-bold text-[#0B4EA2]/20">
                {a.no}
              </p>

              <h3 className="mt-3 text-lg font-semibold">
                {a.baslik}
              </h3>

              <p className="mt-2 text-sm text-[#14181F]/60">
                {a.aciklama}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}