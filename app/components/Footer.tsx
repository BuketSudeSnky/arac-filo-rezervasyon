export default function Footer() {
  return (
    <footer
      id="iletisim"
      className="bg-[#14181F] text-white/60"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">

        <div>
          <h2 className="text-white text-xl font-bold">
            FİLOREZ
          </h2>

          <p className="mt-4 text-sm">
            Kurumsal filo kiralama ve araç rezervasyon platformu.
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-white">
            Hizmetler
          </h3>

          <ul className="space-y-2 text-sm">
            <li>Araç Kiralama</li>
            <li>Kurumsal Filo</li>
            <li>Uzun Dönem</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-white">
            Şirket
          </h3>

          <ul className="space-y-2 text-sm">
            <li>Hakkımızda</li>
            <li>SSS</li>
            <li>Sözleşme</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-white">
            İletişim
          </h3>

          <ul className="space-y-2 text-sm">
            <li>0850 000 00 00</li>
            <li>destek@filorez.com</li>
            <li>7/24 Yol Yardım</li>
          </ul>
        </div>

      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-6 py-5 text-xs">
          © 2026 FİLOREZ
        </p>
      </div>
    </footer>
  );
}