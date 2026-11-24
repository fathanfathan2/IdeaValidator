import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineXMark } from "react-icons/hi2";
import { QUADRANTS, SKALA, getQuadrant } from "../data/constants";
import { QuadBadge } from "./Badges";

function ScorePicker({ label, value, onChange, accent, error, id }) {
  const active = accent === "teal" ? "bg-teal-600 text-white shadow-teal-600/30" : "bg-rose-500 text-white shadow-rose-500/30";
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {label}
        </label>
        <span className="text-xs font-semibold text-slate-500">
          {value ? `${value} — ${SKALA[value]}` : "Pilih 1–5"}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={label} id={id}>
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            whileTap={{ scale: 0.93 }}
            onClick={() => onChange(n)}
            className={`rounded-xl border py-2.5 font-display text-base font-bold shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 ${
              value === n ? `${active} border-transparent shadow-md` : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {n}
          </motion.button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10.5px] font-medium text-slate-400">
        <span>Sangat Rendah</span>
        <span>Sangat Tinggi</span>
      </div>
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

export default function IdeaModal({ idea, onClose, onSave }) {
  const editing = Boolean(idea);
  const [nama, setNama] = useState(idea?.nama ?? "");
  const [target, setTarget] = useState(idea?.target ?? "");
  const [f, setF] = useState(idea?.f ?? 0);
  const [i, setI] = useState(idea?.i ?? 0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const errors = {};
  if (!nama.trim()) errors.nama = "Nama ide tidak boleh kosong.";
  else if (nama.trim().length > 80) errors.nama = "Nama ide maksimal 80 karakter.";
  if (!target) errors.target = "Pilih target pengguna: Penjual atau Pembeli.";
  if (!(f >= 1 && f <= 5)) errors.f = "Pilih skor Feasibility 1–5.";
  if (!(i >= 1 && i <= 5)) errors.i = "Pilih skor Impact 1–5.";
  const show = (key) => (submitted ? errors[key] : undefined);

  const ready = f >= 1 && i >= 1;
  const q = ready ? getQuadrant(f, i) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) return;
    onSave({ nama: nama.trim(), target, f, i }, idea?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 print:hidden" role="dialog" aria-modal="true" aria-label={editing ? "Edit ide" : "Tambah ide"}>
      <motion.div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.form
        onSubmit={handleSubmit}
        noValidate
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {editing ? "Edit Ide Solusi" : "Tambah Ide Solusi"}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">Nilai ide dengan skala 1–5 untuk Feasibility dan Impact.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup">
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
          {/* Nama */}
          <div>
            <label htmlFor="idea-nama" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Nama Ide Solusi
            </label>
            <input
              id="idea-nama"
              autoFocus
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="mis. Transparent Checkout Breakdown"
              className={`input ${show("nama") ? "!border-rose-400 focus:!ring-rose-500/15" : ""}`}
            />
            {show("nama") && <p className="mt-1 text-xs font-medium text-rose-600">{errors.nama}</p>}
          </div>

          {/* Target */}
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-slate-800">Target Pengguna</span>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="Target pengguna">
              {["Penjual", "Pembeli"].map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={target === t}
                  onClick={() => setTarget(t)}
                  className={`relative rounded-lg py-2 text-sm font-semibold transition-colors ${
                    target === t ? "text-teal-700" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {target === t && (
                    <motion.span
                      layoutId="target-pill"
                      className="absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10">{t}</span>
                </button>
              ))}
            </div>
            {show("target") && <p className="mt-1 text-xs font-medium text-rose-600">{errors.target}</p>}
          </div>

          <ScorePicker id="score-f" label="Feasibility (kemudahan dibuat)" value={f} onChange={setF} accent="teal" error={show("f")} />
          <ScorePicker id="score-i" label="Impact (dampak bagi pengguna)" value={i} onChange={setI} accent="rose" error={show("i")} />

          {/* Preview real-time */}
          <div
            className={`rounded-2xl border p-4 transition-colors ${
              q ? `${QUADRANTS[q].soft} border-transparent` : "border-dashed border-slate-300 bg-slate-50"
            }`}
            aria-live="polite"
          >
            {q ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Pratinjau kuadran</p>
                  <div className="mt-1.5">
                    <QuadBadge q={q} />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600">{QUADRANTS[q].desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500">Total skor</p>
                  <p className="font-display text-3xl font-extrabold leading-none text-slate-900">
                    {f + i}
                    <span className="text-base font-semibold text-slate-400">/10</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500">
                Pilih skor Feasibility dan Impact untuk melihat pratinjau kuadran dan total skor.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <button type="button" onClick={onClose} className="btn-soft">
            Batal
          </button>
          <button type="submit" className="btn-primary">
            {editing ? "Simpan Perubahan" : "Simpan Ide"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
