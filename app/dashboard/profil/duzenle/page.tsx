"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type SVGProps,
} from "react";

import { useRouter } from "next/navigation";

import {
  getCurrentUser,
  updateCurrentUserProfile,
} from "../../../../api/services/userService";

type IconProps = SVGProps<SVGSVGElement>;

export default function ProfilDuzenlePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const user = await getCurrentUser();

        if (!isCancelled) {
          setEmail(user.email ?? "");
          setPhoneNumber(
            user.phoneNumber ?? ""
          );
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

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const normalizedEmail = email.trim();
    const normalizedPhoneNumber =
      phoneNumber.trim();

    if (
      normalizedEmail &&
      !isValidEmail(normalizedEmail)
    ) {
      setError(
        "Lütfen geçerli bir e-posta adresi girin."
      );

      return;
    }

    if (
      normalizedPhoneNumber &&
      !isValidPhoneNumber(
        normalizedPhoneNumber
      )
    ) {
      setError(
        "Telefon numarası yalnızca rakam, boşluk, parantez, artı ve tire içerebilir."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      await updateCurrentUserProfile({
        email: normalizedEmail,
        phoneNumber:
          normalizedPhoneNumber,
      });

      setSuccessMessage(
        "Profil bilgileriniz başarıyla güncellendi."
      );

      window.setTimeout(() => {
        router.push("/dashboard/profil");
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error(
        "Profil bilgileri güncellenemedi:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Profil bilgileri güncellenemedi."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/profil");
  };

  if (loading) {
    return <EditProfileSkeleton />;
  }

  return (
    <section className="space-y-8">
      {/* Sayfa başlığı */}
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
          Hesap Ayarları
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Profil Bilgilerini Düzenle
        </h1>

      </div>

      {/* Hata mesajı */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
            <AlertIcon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-bold">
              İşlem gerçekleştirilemedi
            </p>

            <p className="mt-1 text-sm leading-6">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Başarı mesajı */}
      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <CheckIcon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-bold">
              İşlem başarılı
            </p>

            <p className="mt-1 text-sm leading-6">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Form başlığı */}
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
                <EditIcon className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  İletişim Bilgileri
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Güncel e-posta adresinizi ve
                  telefon numaranızı girin.
                </p>
              </div>
            </div>
          </div>

          {/* Form alanları */}
          <div className="space-y-6 p-6">
            <FormField
              label="E-posta adresi"
              description="Hesabınızla ilişkilendirilecek e-posta adresi."
              icon={
                <MailIcon className="h-5 w-5" />
              }
            >
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value
                  );
                  setError("");
                  setSuccessMessage("");
                }}
                placeholder="ornek@firma.com"
                autoComplete="email"
                disabled={saving}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              />
            </FormField>

            <FormField
              label="Telefon numarası"
              description="Size ulaşılabilecek güncel telefon numarası."
              icon={
                <PhoneIcon className="h-5 w-5" />
              }
            >
              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) => {
                  setPhoneNumber(
                    event.target.value
                  );
                  setError("");
                  setSuccessMessage("");
                }}
                placeholder="05XX XXX XX XX"
                autoComplete="tel"
                disabled={saving}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              />
            </FormField>

          </div>

          {/* Butonlar */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <LoadingIcon className="h-5 w-5 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <SaveIcon className="h-5 w-5" />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function FormField({
  label,
  description,
  icon,
  children,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
          {icon}
        </div>

        <div>
          <label className="font-semibold text-slate-900">
            {label}
          </label>

          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
}

function EditProfileSkeleton() {
  return (
    <section className="space-y-8">
      <div>
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

        <div className="mt-3 h-10 w-80 max-w-full animate-pulse rounded bg-slate-200" />

        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />
      </div>

      <div className="mx-auto h-[470px] max-w-3xl animate-pulse rounded-2xl bg-slate-200" />
    </section>
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function isValidPhoneNumber(
  phoneNumber: string
): boolean {
  return /^[0-9+\-()\s]{7,20}$/.test(
    phoneNumber
  );
}

function MailIcon(props: IconProps) {
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
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

function EditIcon(props: IconProps) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function SaveIcon(props: IconProps) {
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
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}

function InfoIcon(props: IconProps) {
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
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
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

function LoadingIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.2-8.6" />
    </svg>
  );
}