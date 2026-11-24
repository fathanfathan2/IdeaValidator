import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiCheckCircle,
  HiOutlineArrowPath,
  HiOutlineCheck,
  HiOutlineCursorArrowRays,
  HiOutlineLightBulb,
  HiOutlinePlus,
  HiOutlineTrophy,
} from "react-icons/hi2";
import { QuadBadge, TargetBadge } from "../components/Badges";
import { DEFAULT_CATATAN, SKALA, buildReason } from "../data/constants";

const page = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/* Meter 5 segmen untuk skor 1–5 */
function Meter({ label, value }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs font-semibold">
        <span className="text-teal-100">{label}</span>
        <span className="text-white">
          {value} · {SKALA[value]}
        </span>
      </div>
      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.span
            key={n}
            initial={{ scaleX: 0.4, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.15 + n * 0.05, duration: 0.25 }}
            className={`h-2 flex-1 origin-left rounded-full ${n <= value ? "bg-white" : "bg-white/25"}`}
          />
        ))}
      </div>
    </div>
  );
}

function StatusChip({ ideas, selected, isTie, noPriority }) {
  if (!ideas.length) return null;
  let cls = "bg-slate-100 text-slate-600 ring-slate-500/20";
  let text = "Belum ada kandidat";
  if (selected) {
    cls = "bg-teal-50 text-teal-700 ring-teal-600/20";
    text = "Keputusan ditetapkan";
  } else if (isTie) {
    cls = "bg-amber-50 text-amber-700 ring-amber-600/20";
    text = "Menunggu keputusan kelompok";
  } else if (!noPriority) {
    return null;
  }
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${cls}`}>{text}</span>
  );
}

export default function DecisionView({ store, onAdd, notify }) {
  const { ideas, topCandidates, isTie, selected, catatan } = store;
  const [saving, setSaving] = useState(false);
  const prev = useRef(catatan);

  // Indikator "tersimpan otomatis": menyala sebentar setiap isi catatan berubah
  useEffect(() => {
    if (prev.current === catatan) return undefined;
    prev.current = catatan;
    setSaving(true);
    const t = setTimeout(() => setSaving(false), 700);
    return () => clearTimeout(t);
  }, [catatan]);

  const reason = buildReason(selected, topCandidates, ideas.length);
  const empty = ideas.length === 0;
  const noPriority = !empty && topCandidates.length === 0;

  return (
    <motion.div variants={page} initial="hidden" animate="show" className="space-y-8">
      {/* ===== Header ===== */}
      <motion.header variants={rise} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">Keputusan Final</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500">
            Ide terpilih adalah ide di kuadran Prioritas Utama dengan total score tertinggi. Jika ada yang seri, kelompok
            menentukan sendiri.
          </p>
        </div>
        <StatusChip ideas={ideas} selected={selected} isTie={isTie} noPriority={noPriority} />
      </motion.header>

      {/* ===== Belum ada data ===== */}
      {empty && (
        <motion.div variants={rise} className="card flex flex-col items-center px-6 py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <HiOutlineLightBulb className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-slate-900">Belum ada ide untuk diputuskan</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Tambahkan ide atau muat 10 ide preset agar kandidat keputusan bisa dihitung.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={store.loadPreset} className="btn-primary">
              Muat 10 Ide Preset LKPD 5
            </button>
            <button onClick={onAdd} className="btn-soft">
              <HiOutlinePlus className="h-5 w-5" /> Tambah Ide
            </button>
          </div>
        </motion.div>
      )}

      {!empty && (
        <div className="grid items-start gap-6 lg:grid-cols-5">
          {/* ===== Kolom kiri: kandidat + keputusan ===== */}
          <div className="min-w-0 space-y-6 lg:col-span-3">
            {noPriority && (
              <motion.div variants={rise} className="card p-6">
                <p className="font-display text-lg font-bold text-slate-900">Belum ada ide Prioritas Utama</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  Ide masuk kuadran Prioritas Utama jika Feasibility dan Impact sama-sama minimal 4. Ubah skor ide di tab Kelola
                  Ide untuk memunculkan kandidat keputusan.
                </p>
              </motion.div>
            )}

            {/* Pilihan saat seri */}
            {isTie && (
              <motion.section variants={rise}>
                <div className="mb-4">
                  <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">Pilih keputusan final</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                    <HiOutlineCursorArrowRays className="h-4 w-4 shrink-0" />
                    {topCandidates.length} ide sama-sama bernilai {topCandidates[0].total}/10. Klik satu untuk menetapkannya.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {topCandidates.map((x) => {
                    const active = selected?.id === x.id;
                    return (
                      <motion.button
                        key={x.id}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          store.setSelectedId(x.id);
                          notify(`“${x.nama}” ditetapkan sebagai ide terpilih`);
                        }}
                        aria-pressed={active}
                        className={`flex flex-col rounded-2xl border-2 p-5 text-left transition-colors ${
                          active
                            ? "border-teal-500 bg-teal-50/60 shadow-sm"
                            : "border-slate-200 bg-white hover:border-teal-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <TargetBadge target={x.target} />
                          {active ? (
                            <HiCheckCircle className="h-6 w-6 shrink-0 text-teal-600" />
                          ) : (
                            <span className="block h-6 w-6 shrink-0 rounded-full border-2 border-slate-300" />
                          )}
                        </div>
                        <p className="mt-3 font-display text-base font-bold leading-snug text-slate-900">{x.nama}</p>
                        <div className="mt-auto flex items-end justify-between pt-5">
                          <p className="text-xs font-semibold text-slate-500">
                            F <span className="text-slate-900">{x.f}</span> · I <span className="text-slate-900">{x.i}</span>
                          </p>
                          <p className="font-display text-2xl font-extrabold text-teal-600">
                            {x.total}
                            <span className="text-sm font-semibold text-slate-400">/10</span>
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* Keputusan final */}
            {topCandidates.length > 0 && (
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.section
                    key={selected.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden rounded-3xl bg-teal-600 p-6 text-white shadow-lg shadow-teal-900/10 sm:p-8"
                  >
                    <HiOutlineTrophy
                      className="pointer-events-none absolute -right-6 -top-6 h-48 w-48 text-white/10"
                      aria-hidden="true"
                    />
                    <div className="relative">
                      <p className="flex items-center gap-2 text-sm font-semibold text-teal-100">
                        <HiOutlineTrophy className="h-4 w-4" /> Keputusan final kelompok
                      </p>
                      <h2 className="mt-3 max-w-xl font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-[32px]">
                        {selected.nama}
                      </h2>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <QuadBadge q={selected.q} />
                        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
                          {selected.target}
                        </span>
                      </div>

                      <div className="mt-8 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-end">
                        <p className="font-display text-7xl font-extrabold leading-none">
                          {selected.total}
                          <span className="text-3xl font-bold text-teal-200">/10</span>
                        </p>
                        <div className="grid gap-4">
                          <Meter label="Feasibility" value={selected.f} />
                          <Meter label="Impact" value={selected.i} />
                        </div>
                      </div>

                      <div className="mt-8 rounded-2xl bg-white/12 p-4 sm:p-5">
                        <p className="text-xs font-bold text-teal-100">Alasan pemilihan</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-white">{reason}</p>
                      </div>
                    </div>
                  </motion.section>
                ) : (
                  <motion.section
                    key="belum-dipilih"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid place-items-center rounded-3xl border-2 border-dashed border-slate-300 px-6 py-14 text-center"
                  >
                    <HiOutlineTrophy className="h-9 w-9 text-slate-300" />
                    <p className="mt-3 font-display text-base font-bold text-slate-700">Keputusan belum ditetapkan</p>
                    <p className="mt-1 max-w-xs text-sm text-slate-500">
                      Pilih salah satu kandidat di atas, lalu hasilnya akan muncul di sini.
                    </p>
                  </motion.section>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* ===== Kolom kanan: catatan (menempel saat scroll di layar lebar) ===== */}
          <motion.section variants={rise} className="card p-5 sm:p-6 lg:sticky lg:top-24 lg:col-span-2">
            <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">Catatan pertimbangan</h2>
            <p className="mt-0.5 text-sm text-slate-500">Alasan tambahan kelompok. Ikut tercetak di laporan.</p>

            <textarea
              value={catatan}
              onChange={(e) => store.setCatatan(e.target.value)}
              rows={9}
              placeholder="Tulis catatan pertimbangan kelompok di sini…"
              className="input mt-4 resize-y leading-relaxed"
              aria-label="Catatan pertimbangan kelompok"
            />

            <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold" aria-live="polite">
              <span className={`inline-flex items-center gap-1.5 ${saving ? "text-amber-600" : "text-teal-700"}`}>
                {saving ? (
                  <>
                    <HiOutlineArrowPath className="h-3.5 w-3.5 animate-spin" /> Menyimpan…
                  </>
                ) : (
                  <>
                    <HiOutlineCheck className="h-3.5 w-3.5" /> Tersimpan otomatis
                  </>
                )}
              </span>
              <span className="text-slate-400">{catatan.length} karakter</span>
            </div>

            <button
              onClick={() => {
                store.restoreCatatan();
                notify("Teks default dipulihkan");
              }}
              disabled={catatan === DEFAULT_CATATAN}
              className="btn-soft mt-4 w-full !py-2"
            >
              <HiOutlineArrowPath className="h-4 w-4" /> Pulihkan Teks Default (User Persona LKPD 4)
            </button>
          </motion.section>
        </div>
      )}
    </motion.div>
  );
}