import { useEffect } from "react";
import { motion } from "framer-motion";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Ya, lanjutkan",
  danger = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4 print:hidden" role="alertdialog" aria-modal="true" aria-label={title}>
      <motion.div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />
      <motion.div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
      >
        <div
          className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${
            danger ? "bg-rose-50 text-rose-600" : "bg-teal-50 text-teal-600"
          }`}
        >
          <HiOutlineExclamationTriangle className="h-6 w-6" />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="btn-soft">
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={danger ? "btn bg-rose-600 text-white hover:bg-rose-700" : "btn-primary"}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
