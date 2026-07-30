"use client";


interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Onayla",
  cancelText = "Vazgeç",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-950">
            {title}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-3 p-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading
              ? "İşleniyor..."
              : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}