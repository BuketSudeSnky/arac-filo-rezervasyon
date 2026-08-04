"use client";

import {
  useState,
  type FormEvent,
  type SVGProps,
} from "react";

import { useRouter } from "next/navigation";

import {
  changeCurrentUserPassword,
} from "../../../../api/services/userService";

type IconProps = SVGProps<SVGSVGElement>;

export default function SifreDegistirPage() {
  const router = useRouter();

  const [oldPassword, setOldPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmNewPassword,
    setConfirmNewPassword,
  ] = useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (
      !oldPassword ||
      !newPassword ||
      !confirmNewPassword
    ) {
      setError(
        "Lütfen tüm şifre alanlarını doldurun."
      );

      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Yeni şifre en az 6 karakter olmalıdır."
      );

      return;
    }

    if (
      newPassword !== confirmNewPassword
    ) {
      setError(
        "Yeni şifre ile şifre tekrarı eşleşmiyor."
      );

      return;
    }

    if (oldPassword === newPassword) {
      setError(
        "Yeni şifre, mevcut şifreyle aynı olamaz."
      );

      return;
    }

    try {
      setSaving(true);

      await changeCurrentUserPassword({
        oldPassword,
        newPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      setSuccessMessage(
        "Şifreniz başarıyla değiştirildi."
      );

      window.setTimeout(() => {
        router.push("/dashboard/profil");
        router.refresh();
      }, 1200);
    } catch (error) {
      console.error(
        "Şifre değiştirilemedi:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Şifre değiştirilemedi."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
          Hesap Güvenliği
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Şifre Değiştir
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Hesabınızın güvenliği için mevcut
          şifrenizi doğrulayarak yeni bir şifre
          belirleyin.
        </p>
      </div>

      {error && (
        <MessageBox
          type="error"
          title="İşlem gerçekleştirilemedi"
          message={error}
        />
      )}

      {successMessage && (
        <MessageBox
          type="success"
          title="İşlem başarılı"
          message={successMessage}
        />
      )}

      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
                <LockIcon className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Güvenlik Bilgileri
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Mevcut şifrenizi ve yeni şifrenizi
                  girin.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <PasswordField
              label="Mevcut şifre"
              value={oldPassword}
              onChange={setOldPassword}
              placeholder="Mevcut şifrenizi girin"
              autoComplete="current-password"
              disabled={saving}
            />

            <PasswordField
              label="Yeni şifre"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Yeni şifrenizi girin"
              autoComplete="new-password"
              disabled={saving}
            />

            <PasswordField
              label="Yeni şifre tekrarı"
              value={confirmNewPassword}
              onChange={setConfirmNewPassword}
              placeholder="Yeni şifrenizi tekrar girin"
              autoComplete="new-password"
              disabled={saving}
            />

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

                <p className="text-sm leading-6 text-amber-800">
                  Yeni şifrenizin en az 6 karakter
                  olması ve mevcut şifrenizden farklı
                  olması gerekir.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/profil"
                )
              }
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
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <LockIcon className="h-5 w-5" />
                  Şifreyi Güncelle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete:
    | "current-password"
    | "new-password";
  disabled: boolean;
}) {
  const [showPassword, setShowPassword] =
    useState(false);

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-14 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(
              (current) => !current
            )
          }
          disabled={disabled}
          aria-label={
            showPassword
              ? "Şifreyi gizle"
              : "Şifreyi göster"
          }
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
        >
          {showPassword ? (
            <EyeOffIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

function MessageBox({
  type,
  title,
  message,
}: {
  type: "error" | "success";
  title: string;
  message: string;
}) {
  const styles = {
    error: {
      container:
        "border-red-200 bg-red-50 text-red-700",
      icon: "bg-red-100",
    },
    success: {
      container:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: "bg-emerald-100",
    },
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${styles[type].container}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles[type].icon}`}
      >
        {type === "error" ? (
          <AlertIcon className="h-5 w-5" />
        ) : (
          <CheckIcon className="h-5 w-5" />
        )}
      </div>

      <div>
        <p className="text-sm font-bold">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6">
          {message}
        </p>
      </div>
    </div>
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

function EyeIcon(props: IconProps) {
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
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props: IconProps) {
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
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.1 3.2" />
      <path d="M6.6 6.6C3.7 8.5 2 12 2 12s3.5 8 10 8a9.6 9.6 0 0 0 4-.8" />
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