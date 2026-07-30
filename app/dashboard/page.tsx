"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type SVGProps,
} from "react";
import { useRouter } from "next/navigation";

type IconProps = SVGProps<SVGSVGElement>;

export default function DashboardPage() {
  const router = useRouter();

  const [username] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return localStorage.getItem("username") ?? "";
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (role === "ADMIN") {
      router.replace("/admin");
      return;
    }

    if (role !== "USER") {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="space-y-8">
      {/* Karşılama alanı */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-lg sm:px-10">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-white/5 blur-3xl" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <DashboardIcon className="h-4 w-4" />
            Kullanıcı Paneli
          </div>

          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            Hoş geldiniz
            {username ? `, ${username}` : ""}!
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Müsait araçları inceleyebilir, yeni rezervasyon
            oluşturabilir ve mevcut rezervasyonlarınızı tek
            panel üzerinden takip edebilirsiniz.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">

          </div>
        </div>
      </section>

      {/* Sayfa başlığı */}
      <section>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
          Hızlı İşlemler
        </p>

        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
          Ne yapmak istersiniz?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sık kullandığınız işlemlere aşağıdaki kartlardan
          ulaşabilirsiniz.
        </p>
      </section>

      {/* İşlem kartları */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          href="/dashboard/araclar"
          title="Araçları İncele"
          description="Sistemde bulunan araçları görüntüleyin ve müsait araçlardan birini seçin."
          icon={<CarIcon className="h-7 w-7" />}
        />

        <DashboardCard
          href="/dashboard/rezervasyonlarim"
          title="Rezervasyonlarım"
          description="Oluşturduğunuz rezervasyonları görüntüleyin ve durumlarını takip edin."
          icon={<CalendarIcon className="h-7 w-7" />}
        />

        <DashboardCard
          href="/dashboard/profil"
          title="Profilim"
          description="Kullanıcı bilgilerinizi görüntüleyin ve hesap ayarlarınızı yönetin."
          icon={<UserIcon className="h-7 w-7" />}
        />
      </section>
    </div>
  );
}

function DashboardCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 transition group-hover:bg-amber-400 group-hover:text-slate-950">
          {icon}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition group-hover:border-amber-300 group-hover:bg-amber-50 group-hover:text-amber-700">
          <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold tracking-tight text-slate-950">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          {description}
        </p>
      </div>

      <div className="mt-auto pt-6">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition group-hover:text-amber-700">
          Sayfaya Git
          <ArrowRightIcon className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function DashboardIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

function CarIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m5 11 2-5h10l2 5" />
      <path d="M3 13a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5H3Z" />
      <path d="M5 18v2" />
      <path d="M19 18v2" />
      <path d="M7 15h.01" />
      <path d="M17 15h.01" />
    </svg>
  );
}

function CalendarIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function UserIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function ArrowRightIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}