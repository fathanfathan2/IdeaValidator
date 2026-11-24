import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiCheckCircle,
  HiOutlineArrowRight,
  HiOutlineChartBar,
  HiOutlineCircleStack,
  HiOutlineLightBulb,
  HiOutlinePlus,
  HiOutlineStar,
  HiOutlineTrophy,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import ChartsSection from "../components/ChartsSection";
import { QuadBadge } from "../components/Badges";
import {
  ANGGOTA,
  APP_TAGLINE,
  KELOMPOK,
  QUADRANTS,
  QUADRANT_ORDER,
  SKALA,
  STUDI_KASUS,
} from "../data/constants";

/* ---------- animasi: satu urutan masuk untuk seluruh halaman ---------- */
const page = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/* Susunan kuadran meniru posisi di grafik: Impact tinggi di atas, Feasibility tinggi di kanan */
const MATRIX_ORDER = ["potensi", "prioritas", "tunda", "pertimbangkan"];

const AVATAR_TONES = [
  "bg-teal-100 text-teal-700",
  "bg-rose-100 text-rose-600",
  "bg-amber-100 text-amber-700",
  "bg-slate-200 text-slate-600",
];

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ---------- popover anggota kelompok ---------- */
function MembersPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <span className="flex -space-x-2">
          {ANGGOTA.map((n, idx) => (
            <span
              key={n}
              className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ring-2 ring-white ${AVATAR_TONES[idx % 4]}`}
            >
              {initials(n)}
            </span>
          ))}
        </span>
        {KELOMPOK}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <HiOutlineUserGroup className="h-4 w-4" /> Anggota kelompok
            </p>
            <ul className="space-y-2.5">
              {ANGGOTA.map((n, idx) => (
                <li key={n} className="flex items-center gap-2.5 text-sm font-medium text-slate-800">
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ${AVATAR_TONES[idx % 4]}`}>
                    {initials(n)}
                  </span>
                  {n}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- judul bagian ---------- */
function SectionTitle({ title, hint, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-slate-500">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- kartu unggulan: ide terpilih (satu-satunya blok berwarna solid) ---------- */
function FeatureCard({ selected, isTie, topCandidates, empty, onGoDecision, onAdd, onPreset }) {
  return (
    <motion.div
      variants={rise}
      className="relative col-span-2 flex flex-col justify-between overflow-hidden rounded-3xl bg-teal-600 p-6 text-white shadow-lg shadow-teal-900/10 sm:p-7 lg:row-span-2"
    >
      <HiOutlineTrophy className="pointer-events-none absolute -bottom-6 -right-4 h-44 w-44 text-white/10" aria-hidden="true" />

      <div className="relative">
        <p className="flex items-center gap-2 text-sm font-semibold text-teal-100">
          <HiOutlineTrophy className="h-4 w-4" /> Ide terpilih
        </p>

        {selected && (
          <>
            <h2 className="mt-3 max-w-md font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-[28px]">
              {selected.nama}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <QuadBadge q={selected.q} />
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">{selected.target}</span>
            </div>
          </>
        )}

        {!selected && isTie && (
          <>
            <h2 className="mt-3 max-w-md font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-[28px]">
              Seri! {topCandidates.length} ide sama-sama {topCandidates[0].total}/10
            </h2>
            <ul className="mt-4 space-y-2">
              {topCandidates.slice(0, 3).map((x) => (
                <li key={x.id} className="flex items-center gap-2 rounded-xl bg-white/12 px-3 py-2 text-sm font-semibold">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                  <span className="truncate">{x.nama}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {!selected && !isTie && (
          <>
            <h2 className="mt-3 max-w-md font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-[28px]">
              {empty ? "Belum ada ide yang dinilai" : "Belum ada ide Prioritas Utama"}
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-teal-50">
              {empty
                ? "Tambahkan ide atau muat 10 ide hasil LKPD 5. Ide terbaik akan muncul di sini."
                : "Ide perlu Feasibility dan Impact minimal 4 untuk masuk kuadran Prioritas Utama."}
            </p>
          </>
        )}
      </div>

      <div className="relative mt-8 flex flex-wrap items-end justify-between gap-4">
        {selected ? (
          <div className="flex items-end gap-5">
            <p className="font-display text-6xl font-extrabold leading-none">
              {selected.total}
              <span className="text-2xl font-bold text-teal-200">/10</span>
            </p>
            <div className="space-y-1 pb-1 text-xs font-semibold text-teal-50">
              <p>
                Feasibility {selected.f} · {SKALA[selected.f]}
              </p>
              <p>
                Impact {selected.i} · {SKALA[selected.i]}
              </p>
            </div>
          </div>
        ) : (
          <span />
        )}

        {(selected || isTie) && (
          <button
            onClick={onGoDecision}
            className="btn bg-white !py-2 text-teal-700 hover:bg-teal-50"
          >
            {selected ? "Lihat keputusan" : "Tetapkan sekarang"}
            <HiOutlineArrowRight className="h-4 w-4" />
          </button>
        )}
        {empty && (
          <div className="flex flex-wrap gap-2">
            <button onClick={onPreset} className="btn bg-white !py-2 text-teal-700 hover:bg-teal-50">
              <HiOutlineCircleStack className="h-4 w-4" /> Muat preset
            </button>
            <button onClick={onAdd} className="btn bg-white/15 !py-2 text-white hover:bg-white/25">
              <HiOutlinePlus className="h-4 w-4" /> Tambah ide
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ---------- kartu KPI kecil ---------- */
function StatCard({ icon: Icon, label, tone, children, className = "" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    teal: "bg-teal-50 text-teal-700",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <motion.div variants={rise} className={`card flex flex-col justify-between p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-5">{children}</div>
    </motion.div>
  );
}

function MiniBar({ label, value, color }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
        <span>{label}</span>
        <span className="text-slate-800">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${(value / 5) * 100}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

/* ---------- peta kuadran 2x2 ---------- */
function QuadrantMap({ ideas, counts, total, onGoManage }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {MATRIX_ORDER.map((key) => {
        const q = QUADRANTS[key];
        const list = ideas.filter((x) => x.q === key);
        const pct = total ? Math.round((list.length / total) * 100) : 0;
        const isMain = key === "prioritas";
        return (
          <motion.button
            key={key}
            variants={rise}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onGoManage(key)}
            aria-label={`Lihat ${counts[key]} ide kuadran ${q.label}`}
            className={`group relative flex min-h-[168px] flex-col rounded-2xl border p-4 text-left transition-colors sm:p-5 ${q.soft} ${q.border} ${
              isMain ? "ring-1 ring-teal-500/30" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={`text-xs font-bold ${q.text}`}>{q.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{q.desc}</p>
              </div>
              <HiOutlineArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
            </div>

            <p className={`mt-3 font-display text-4xl font-extrabold leading-none ${q.text}`}>
              {counts[key]}
              <span className="ml-1.5 text-xs font-semibold text-slate-400">{pct}%</span>
            </p>

            <div className="mt-auto space-y-1 pt-3">
              {list.slice(0, 2).map((x) => (
                <p key={x.id} className="truncate rounded-md bg-white/70 px-2 py-1 text-[11px] font-semibold text-slate-700">
                  {x.nama}
                </p>
              ))}
              {list.length > 2 && <p className="px-1 text-[11px] font-semibold text-slate-500">+{list.length - 2} ide lainnya</p>}
              {list.length === 0 && <p className="px-1 text-[11px] font-medium text-slate-400">Belum ada ide</p>}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ---------- daftar peringkat teratas ---------- */
function TopRanking({ ranking, selected }) {
  const top = ranking.slice(0, 5);
  if (!top.length) {
    return <p className="py-8 text-center text-sm text-slate-400">Peringkat akan muncul setelah ada ide.</p>;
  }
  return (
    <ol className="space-y-4">
      {top.map((x, idx) => (
        <li key={x.id}>
          <div className="mb-1.5 flex items-center gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 font-display text-xs font-bold text-slate-500">
              {idx + 1}
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{x.nama}</p>
            {selected?.id === x.id && <HiCheckCircle className="h-4 w-4 shrink-0 text-teal-600" title="Ide terpilih" />}
            <span className="font-display text-sm font-extrabold text-slate-900">{x.total}</span>
          </div>
          <div className="ml-9 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className={`h-full rounded-full ${QUADRANTS[x.q].bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${x.total * 10}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 + idx * 0.06 }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ---------- empty state dengan ilustrasi matriks ---------- */
function EmptyMatrix({ onPreset, onAdd }) {
  return (
    <motion.section variants={rise} className="card grid items-center gap-8 p-6 sm:p-10 md:grid-cols-2">
      <div className="mx-auto grid w-full max-w-[260px] grid-cols-2 gap-1.5" aria-hidden="true">
        {MATRIX_ORDER.map((key) => (
          <div
            key={key}
            className={`grid h-24 place-items-center rounded-xl border-2 border-dashed text-[10px] font-bold ${QUADRANTS[key].soft} ${QUADRANTS[key].text} border-current/30`}
          >
            {QUADRANTS[key].label}
          </div>
        ))}
      </div>
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-slate-900">Matriks masih kosong</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          Setiap ide akan ditempatkan ke salah satu dari empat kuadran berdasarkan skor Feasibility dan Impact-nya. Muat data
          hasil LKPD 5 untuk langsung melihat hasilnya, atau mulai dari ide kelompokmu sendiri.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={onPreset} className="btn-primary">
            <HiOutlineCircleStack className="h-5 w-5" /> Muat 10 Ide Preset LKPD 5
          </button>
          <button onClick={onAdd} className="btn-soft">
            <HiOutlinePlus className="h-5 w-5" /> Tambah Ide Manual
          </button>
        </div>
      </div>
    </motion.section>
  );
}

export default function DashboardView({ store, onGoManage, onGoDecision, onAdd }) {
  const { stats, counts, selected, isTie, topCandidates, ideas, ranking } = store;
  const empty = ideas.length === 0;

  const avg = useMemo(() => {
    if (!ideas.length) return { f: 0, i: 0 };
    return {
      f: ideas.reduce((s, x) => s + x.f, 0) / ideas.length,
      i: ideas.reduce((s, x) => s + x.i, 0) / ideas.length,
    };
  }, [ideas]);

  return (
    <motion.div variants={page} initial="hidden" animate="show" className="space-y-10">
      {/* ===== Header ringkas, tanpa kotak ===== */}
      <motion.header variants={rise} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700">Studi kasus {STUDI_KASUS}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            {APP_TAGLINE}
          </h1>
        </div>
        <MembersPopover />
      </motion.header>

      {/* ===== Bento: satu kartu unggulan + 3 KPI ===== */}
      <motion.section variants={page} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <FeatureCard
          selected={selected}
          isTie={isTie}
          topCandidates={topCandidates}
          empty={empty}
          onGoDecision={onGoDecision}
          onAdd={onAdd}
          onPreset={store.loadPreset}
        />

        <StatCard icon={HiOutlineLightBulb} label="Total Ide" tone="slate">
          <p className="font-display text-4xl font-extrabold leading-none text-slate-900">{stats.total}</p>
          <div className="mt-4 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
            {QUADRANT_ORDER.map(
              (k) =>
                counts[k] > 0 && (
                  <span key={k} className={QUADRANTS[k].bar} style={{ width: `${(counts[k] / stats.total) * 100}%` }} />
                )
            )}
          </div>
        </StatCard>

        <StatCard icon={HiOutlineStar} label="Prioritas Utama" tone="teal">
          <p className="font-display text-4xl font-extrabold leading-none text-teal-600">{stats.prioritas}</p>
          <p className="mt-4 text-xs font-medium text-slate-500">
            {stats.total ? `${Math.round((stats.prioritas / stats.total) * 100)}% dari seluruh ide` : "Belum ada data"}
          </p>
        </StatCard>

        <StatCard icon={HiOutlineChartBar} label="Rata-rata Skor" tone="rose" className="col-span-2">
          <div className="flex items-end gap-6">
            <p className="font-display text-4xl font-extrabold leading-none text-slate-900">
              {stats.avg.toFixed(1)}
              <span className="text-base font-semibold text-slate-400">/10</span>
            </p>
            <div className="grid flex-1 gap-3">
              <MiniBar label="Feasibility" value={avg.f} color="bg-teal-500" />
              <MiniBar label="Impact" value={avg.i} color="bg-rose-500" />
            </div>
          </div>
        </StatCard>
      </motion.section>

      {/* ===== Kuadran + peringkat / empty state ===== */}
      {empty ? (
        <EmptyMatrix onPreset={store.loadPreset} onAdd={onAdd} />
      ) : (
        <>
          <section>
            <SectionTitle
              title="Sebaran kuadran"
              hint="Posisi kartu sama seperti di grafik. Klik kuadran untuk melihat daftar ide-nya."
            />
            <div className="grid gap-6 lg:grid-cols-5">
              <motion.div variants={page} className="lg:col-span-3">
                <QuadrantMap ideas={ideas} counts={counts} total={stats.total} onGoManage={onGoManage} />
              </motion.div>
              <motion.div variants={rise} className="card flex flex-col p-5 sm:p-6 lg:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-slate-900">5 skor tertinggi</h3>
                  <button
                    onClick={() => onGoManage("semua")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800"
                  >
                    Lihat semua <HiOutlineArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <TopRanking ranking={ranking} selected={selected} />
              </motion.div>
            </div>
          </section>

          <motion.section variants={rise}>
            <SectionTitle
              title="Visualisasi"
              hint="Arahkan kursor ke titik atau batang untuk melihat detail ide."
            />
            <ChartsSection ideas={ideas} ranking={ranking} />
          </motion.section>
        </>
      )}
    </motion.div>
  );
}