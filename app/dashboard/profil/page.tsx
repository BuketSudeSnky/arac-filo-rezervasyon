"use client";

import {
  useEffect,
  useState,
  type SVGProps,
} from "react";

import {
  getCurrentUser,
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

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Hesabınıza ait kullanıcı bilgilerini
          görüntüleyin.
        </p>
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

              <p className="mt-1 text-sm text-slate-500">
                Hesabınıza kayıtlı temel bilgiler.
              </p>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <ProfileField
                label="Kullanıcı adı"
                value={user.username}
                icon={
                  <UserIcon className="h-5 w-5" />
                }
              />

              <ProfileField
                label="Kullanıcı rolü"
                value={formatRole(user.role)}
                icon={
                  <ShieldIcon className="h-5 w-5" />
                }
              />

              <ProfileField
                label="Kullanıcı numarası"
                value={String(user.id)}
                icon={
                  <IdIcon className="h-5 w-5" />
                }
              />

              <ProfileField
                label="Hesap durumu"
                value="Aktif"
                icon={
                  <CheckIcon className="h-5 w-5" />
                }
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

      <p className="mt-2 text-sm text-slate-400">
        {formatRole(user.role)}
      </p>

      <div className="mt-6 border-t border-slate-800 pt-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1.5 text-xs font-semibold text-emerald-300">
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

function CheckIcon(props: IconProps) {
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
      <path d="m5 12 4 4L19 6" />
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