import Image from "next/image";

export default function Hero() {
  

  return (
    <section className="relative overflow-hidden bg-[#14181F] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[repeating-linear-gradient(90deg,#FFC531_0_40px,transparent_40px_72px)] opacity-60"
      />

      <div className="mx-auto w-full max-w-6xl px-6 pb-14 pt-16 sm:pt-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFC531]">
          Filo kiralama ve rezervasyon
        </p>

        <h1 className="max-w-3xl font-bold text-5xl uppercase leading-[0.95] tracking-tight sm:text-7xl">
          Doğru araç,
          <br />
          doğru saatte kapında.
        </h1>

          <div className="mt-10 lg:absolute lg:right-30 lg:top-8">
               <Image
                src="/images/anaekran.jpg"
                  alt="Filo Araçları"
                  width={450}
                  height={350}
                  className="rounded-xl"/>
          </div>

        <div className="my-8 h-[3px] w-24 bg-yellow-400" />

        <p className="max-w-xl text-base leading-relaxed text-white/70">
          Şirket filonuzdan veya kiralık havuzdan aracı dakikalar içinde
          ayırtın. Müsaitlik gerçek zamanlı, onay süreci tek ekran, teslim
          tutanağı dijital.
        </p>

      </div>
    </section>
  );
}