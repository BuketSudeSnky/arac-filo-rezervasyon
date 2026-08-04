"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
  type SVGProps,
} from "react";

import {
  getCurrentUser,
  updateCurrentUserProfile,
  changeCurrentUserPassword,
  type User,
} from "../../../api/services/userService";


type IconProps = SVGProps<SVGSVGElement>;

export default function ProfilPage() {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const data = await getCurrentUser();

        if (!isCancelled) {
          setUser(data);
        }
      } catch (error) {
        console.error(
          "Profil bilgileri alınamadı:",
          error
        );

        if (!isCancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Profil bilgileri alınamadı."
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
          Hesap Bilgileri
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Profilim
        </h1>

      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
            <AlertIcon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-bold">
              Profil bilgileri yüklenemedi
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        </div>
      )}

      {user && (
        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <ProfileSummaryCard user={user} />

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-950">
                Kullanıcı Bilgileri
              </h2>
            </div>
           <Link
    href="/dashboard/profil/duzenle"
    className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-100"
  >
    Bilgileri Düzenle
  </Link>
  
           <div className="grid gap-5 p-6 sm:grid-cols-2">

  <ProfileField
    label="Kullanıcı Adı"
    value={user.username}
    icon={<UserIcon className="h-5 w-5" />}
  />

  <ProfileField
    label="Rol"
    value={formatRole(user.role)}
    icon={<ShieldIcon className="h-5 w-5" />}
  />

  <ProfileField
    label="E-posta"
    value={user.email ?? "Belirtilmedi"}
    icon={<MailIcon className="h-5 w-5" />}
  />

  <ProfileField
    label="Telefon"
    value={user.phoneNumber ?? "Belirtilmedi"}
    icon={<PhoneIcon className="h-5 w-5" />}
  />

  <ProfileField
    label="Kullanıcı No"
    value={String(user.id)}
    icon={<IdIcon className="h-5 w-5" />}
  />

  <ProfileField
    label="Kayıt Tarihi"
    value={formatDate(user.createdAt)}
    icon={<CalendarIcon className="h-5 w-5" />}
  />

</div>
          </div>

        </div>
      )}
    </section>
  );
}

function ProfileSummaryCard({
  user,
}: {
  user: User;
}) {
  const initial =
    user.username?.trim().charAt(0)
      .toLocaleUpperCase("tr-TR") || "K";

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-400 text-3xl font-bold text-slate-950">
        {initial}
      </div>

      <h2 className="mt-6 text-2xl font-bold">
        {user.username}
      </h2>

      <div className="mt-2 space-y-1">

</div>

     <div className="mt-10">
  <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
        <LockIcon className="h-5 w-5" />
      </div>

      <div>
        <h3 className="text-sm font-bold text-white">
          Hesap Güvenliği
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Şifrenizi güvenli şekilde güncelleyin.
        </p>
      </div>
    </div>

    <Link
      href="/dashboard/profil/sifre"
      className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
    >
      Şifreyi Değiştir
    </Link>
  </div>

  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1.5 text-xs font-semibold text-emerald-300">
    <span className="h-2 w-2 rounded-full bg-emerald-400" />
    Aktif hesap
  </div>
</div>
    </article>
  );
}

function ProfileField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words font-semibold text-slate-900">
            {value || "Belirtilmedi"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <section className="space-y-8">
      <div>
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-10 w-44 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </section>
  );
}

function formatDate(date: string | null) {
  if (!date) return "Belirtilmedi";

  return new Date(date).toLocaleDateString(
    "tr-TR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}

function formatRole(role: string) {
  const normalizedRole =
    role?.replace("ROLE_", "");

  const roleLabels: Record<string, string> = {
    USER: "Kullanıcı",
    ADMIN: "Yönetici",
  };

  return (
    roleLabels[normalizedRole] ??
    normalizedRole ??
    "Kullanıcı"
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

function ShieldIcon(props: IconProps) {
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
      <path d="M12 3 4 6v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6Z" />
    </svg>
  );
}

function IdIcon(props: IconProps) {
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
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16c.8-1.5 1.8-2 3-2s2.2.5 3 2" />
      <path d="M14 10h4" />
      <path d="M14 14h4" />
    </svg>
  );
}

function AlertIcon(props: IconProps) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 17h.01" />
    </svg>
  );
}
function MailIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function PhoneIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>
    </svg>
  );
}
function CalendarIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M16 3v4" />

      <path d="M8 3v4" />

      <path d="M3 10h18" />
    </svg>
  );
}
function LockIcon(props: IconProps) {
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
      <rect
        x="4"
        y="10"
        width="16"
        height="11"
        rx="2"
      />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
