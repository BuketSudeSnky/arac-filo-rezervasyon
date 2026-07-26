import Link from "next/link";

export default function RezervasyonlarimPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-sm">
        <div className="text-5xl">🚧</div>

        <h1 className="mt-5 text-3xl font-bold text-gray-900">
          Bu Sayfa Hazırlanıyor
        </h1>

        <p className="mt-3 text-gray-500">
          Rezervasyonunuz başarıyla oluşturuldu. Rezervasyonlarınız yakında
          burada listelenecek.
        </p>

        <Link
          href="/dashboard/araclar"
          className="mt-6 inline-block rounded-lg bg-[#0B4EA2] px-5 py-3 font-semibold text-white transition hover:bg-[#083a79]"
        >
          Araçlara Dön
        </Link>
      </div>
    </main>
  );
}