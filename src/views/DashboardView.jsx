import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineArrowRight,
  HiOutlineArrowTrendingUp,
  HiOutlineBuildingStorefront,
  HiOutlineChartBar,
  HiOutlineChartBarSquare,
  HiOutlineChevronDown,
  HiOutlineCircleStack,
  HiOutlineLightBulb,
  HiOutlineListBullet,
  HiOutlinePlus,
  HiOutlineScale,
  HiOutlineStar,
  HiOutlineTrophy,
  HiOutlineUserGroup,
  HiOutlineUsers,
  HiStar,
} from "react-icons/hi2";
import ChartsSection, { GLASS } from "../components/ChartsSection";
import {
  ANGGOTA,
  APP_TAGLINE,
  KELOMPOK,
  QUADRANTS,
  QUADRANT_ORDER,
  SKALA,
  STUDI_KASUS,
  getQuadrant,
} from "../data/constants";

/* ---------- animasi ---------- */
const page = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

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

function groupByCoordinate(ideas) {
  const map = new Map();
  ideas.forEach((idea) => {
    const key = `${idea.f}-${idea.i}`;
    if (!map.has(key)) map.set(key, { f: idea.f, i: idea.i, items: [] });
    map.get(key).items.push(idea);
  });
  return [...map.values()];
}

/* ---------- popover anggota ---------- */
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
    <div className="relative self-start" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full border border-white/80 bg-white/80 py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
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
        <span className="hidden sm:inline">{KELOMPOK}</span>
        <span className="sm:hidden">Kelompok 3</span>
        <HiOutlineChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:left-auto sm:right-0"
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

/* ---------- ilustrasi kartu unggulan (SVG, tanpa file gambar) ---------- */
function HeroIllustration({ className = "" }) {
  const spark = (x, y, s, o) => (
    <path
      key={`${x}-${y}`}
      d={`M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z`}
      fill="#fff"
      opacity={o}
    />
  );
  return (
    <svg viewBox="0 0 240 170" className={className} fill="none" aria-hidden="true">
      <ellipse cx="116" cy="150" rx="92" ry="9" fill="#042f2e" opacity="0.18" />
      <rect x="34" y="30" width="162" height="102" rx="10" fill="#fff" fillOpacity="0.14" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" />
      <rect x="44" y="40" width="142" height="82" rx="6" fill="#042f2e" fillOpacity="0.28" />
      {[0, 1, 2, 3, 4].map((n) => (
        <rect
          key={n}
          x={58 + n * 24}
          y={108 - (n + 1) * 13}
          width="14"
          height={(n + 1) * 13}
          rx="3"
          fill="#fff"
          fillOpacity={0.45 + n * 0.12}
        />
      ))}
      <path d="M58 92 L88 80 L112 84 L138 62 L170 50" stroke="#5eead4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="170" cy="50" r="4.5" fill="#5eead4" />
      <path d="M14 132 H216 L204 144 H26 Z" fill="#fff" fillOpacity="0.32" />
      <rect x="170" y="8" width="44" height="44" rx="13" fill="#5eead4" transform="rotate(8 192 30)" />
      <path d="M180 31 L189 40 L205 21" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(8 192 30)" />
      {spark(18, 44, 7, 0.9)}
      {spark(222, 92, 5, 0.7)}
      {spark(60, 14, 4, 0.6)}
    </svg>
  );
}

/* ---------- kartu unggulan: ide terpilih ---------- */
function FeatureCard({ selected, isTie, topCandidates, empty, onGoDecision, onAdd, onPreset }) {
  const q = selected ? QUADRANTS[selected.q] : null;
  return (
    <motion.div
      variants={rise}
      className="relative col-span-2 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-6 text-white shadow-xl shadow-teal-900/20 sm:p-8 lg:row-span-2"
    >
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-teal-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <HeroIllustration className="pointer-events-none absolute right-3 top-5 hidden w-[200px] sm:block md:w-[250px] lg:w-[210px] xl:w-[270px]" />

      <div className="relative flex h-full min-h-[320px] flex-col justify-between gap-8">
        <div className="sm:max-w-[56%]">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
            <HiOutlineTrophy className="h-4 w-4 text-amber-300" /> Ide terpilih
          </span>

          {selected && (
            <>
              <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-[30px]">
                {selected.nama}
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-800">
                  <span className={`h-2 w-2 rounded-full ${q.dot}`} />
                  {q.label}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-800">
                  <HiOutlineBuildingStorefront className="h-3.5 w-3.5 text-teal-700" />
                  {selected.target}
                </span>
              </div>
            </>
          )}

          {!selected && isTie && (
            <>
              <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-[30px]">
                Seri! {topCandidates.length} ide sama-sama {topCandidates[0].total}/10
              </h2>
              <ul className="mt-4 space-y-2">
                {topCandidates.slice(0, 3).map((x) => (
                  <li key={x.id} className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                    <span className="truncate">{x.nama}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {!selected && !isTie && (
            <>
              <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-[30px]">
                {empty ? "Belum ada ide yang dinilai" : "Belum ada ide Prioritas Utama"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-teal-50">
                {empty
                  ? "Tambahkan ide atau muat 10 ide hasil LKPD 5. Ide terbaik akan muncul di sini."
                  : "Ide perlu Feasibility dan Impact minimal 4 untuk masuk kuadran Prioritas Utama."}
              </p>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          {selected && (
            <>
              <p className="font-display text-6xl font-extrabold leading-none sm:text-7xl">
                {selected.total}
                <span className="text-2xl font-bold text-teal-200 sm:text-3xl">/10</span>
              </p>
              <span className="hidden h-14 w-px bg-white/25 sm:block" />
              <ul className="space-y-2 text-sm font-semibold">
                <li className="flex items-center gap-2">
                  <HiOutlineArrowTrendingUp className="h-4 w-4 text-teal-200" />
                  Feasibility {selected.f} · {SKALA[selected.f]}
                </li>
                <li className="flex items-center gap-2">
                  <HiOutlineArrowTrendingUp className="h-4 w-4 text-teal-200" />
                  Impact {selected.i} · {SKALA[selected.i]}
                </li>
              </ul>
            </>
          )}

          <div className="flex flex-wrap gap-2 sm:ml-auto">
            {(selected || isTie) && (
              <button
                onClick={onGoDecision}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-teal-700 shadow-sm transition hover:bg-teal-50"
              >
                {selected ? "Lihat Keputusan" : "Tetapkan sekarang"}
                <HiOutlineArrowRight className="h-4 w-4" />
              </button>
            )}
            {empty && (
              <>
                <button
                  onClick={onPreset}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-teal-700 shadow-sm transition hover:bg-teal-50"
                >
                  <HiOutlineCircleStack className="h-4 w-4" /> Muat preset
                </button>
                <button
                  onClick={onAdd}
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/25"
                >
                  <HiOutlinePlus className="h-4 w-4" /> Tambah ide
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- KPI ---------- */
function KpiHead({ icon: Icon, label, tone = "teal", right }) {
  const tones = { teal: "bg-teal-50 text-teal-600", rose: "bg-rose-50 text-rose-500", slate: "bg-slate-100 text-slate-600" };
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <span className={`grid h-10 w-10 place-items-center rounded-2xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <p className="text-sm font-bold text-slate-700">{label}</p>
      </div>
      {right}
    </div>
  );
}

function QuadMiniBars({ counts }) {
  const max = Math.max(1, ...QUADRANT_ORDER.map((k) => counts[k]));
  return (
    <div className="flex h-9 items-end gap-1" aria-hidden="true">
      {QUADRANT_ORDER.map((k) => (
        <span
          key={k}
          className={`w-1.5 rounded-full ${QUADRANTS[k].bar}`}
          style={{ height: `${Math.max(14, (counts[k] / max) * 100)}%`, opacity: counts[k] ? 1 : 0.25 }}
        />
      ))}
    </div>
  );
}

function Donut({ pct }) {
  const R = 26;
  const C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" aria-hidden="true">
      <circle cx="32" cy="32" r={R} fill="none" stroke="#ccfbf1" strokeWidth="8" />
      <motion.circle
        cx="32"
        cy="32"
        r={R}
        fill="none"
        stroke="#14b8a6"
        strokeWidth="8"
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
        initial={{ strokeDasharray: `0 ${C}` }}
        animate={{ strokeDasharray: `${(pct / 100) * C} ${C}` }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
      />
    </svg>
  );
}

function MiniBar({ label, value, color }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
        <span>{label}</span>
        <span className="text-slate-800">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
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

/* ---------- peta kuadran mini (interaktif) ---------- */
const SPLIT_X = (3.5 / 6) * 100; // garis Feasibility 3,5 → 58,33% dari kiri
const SPLIT_Y = 100 - SPLIT_X; // garis Impact 3,5 → 41,67% dari atas
const CELLS = {
  potensi: { left: 0, top: 0, width: SPLIT_X, height: SPLIT_Y, label: "left-2 top-1.5" },
  prioritas: { left: SPLIT_X, top: 0, width: 100 - SPLIT_X, height: SPLIT_Y, label: "right-2 top-1.5" },
  tunda: { left: 0, top: SPLIT_Y, width: SPLIT_X, height: 100 - SPLIT_Y, label: "bottom-1.5 left-2" },
  pertimbangkan: { left: SPLIT_X, top: SPLIT_Y, width: 100 - SPLIT_X, height: 100 - SPLIT_Y, label: "bottom-1.5 right-2" },
};

function MiniMatrix({ groups, active, onSelect }) {
  return (
    <div>
      <div className="flex gap-2">
        {/* tick Impact */}
        <div className="relative w-4 shrink-0" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((v) => (
            <span
              key={v}
              className="absolute right-0 translate-y-1/2 text-[10px] font-semibold text-slate-400"
              style={{ bottom: `${(v / 6) * 100}%` }}
            >
              {v}
            </span>
          ))}
        </div>

        <div className="relative aspect-[5/4] min-w-0 flex-1 overflow-hidden rounded-2xl bg-white/60 ring-1 ring-slate-200">
          {Object.entries(CELLS).map(([key, c]) => {
            const q = QUADRANTS[key];
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                aria-pressed={isActive}
                aria-label={`Kuadran ${q.label}`}
                className="absolute transition-all focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-teal-500"
                style={{
                  left: `${c.left}%`,
                  top: `${c.top}%`,
                  width: `${c.width}%`,
                  height: `${c.height}%`,
                  background: `${q.color}${isActive ? "33" : "14"}`,
                  boxShadow: isActive ? `inset 0 0 0 2px ${q.color}` : "none",
                }}
              >
                <span className={`absolute ${c.label} text-[9px] font-bold sm:text-[10px]`} style={{ color: q.dark }}>
                  {q.label}
                </span>
              </button>
            );
          })}

          {/* garis pembatas */}
          <span className="pointer-events-none absolute inset-y-0 border-l border-dashed border-slate-400/70" style={{ left: `${SPLIT_X}%` }} />
          <span className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate-400/70" style={{ top: `${SPLIT_Y}%` }} />

          {/* titik ide */}
          {groups.map((g) => {
            const qk = getQuadrant(g.f, g.i);
            const size = g.items.length > 1 ? 18 + g.items.length * 4 : 12;
            return (
              <span
                key={`${g.f}-${g.i}`}
                className="pointer-events-none absolute grid -translate-x-1/2 translate-y-1/2 place-items-center rounded-full font-display text-[10px] font-extrabold text-white shadow ring-2 ring-white transition-opacity"
                style={{
                  left: `${(g.f / 6) * 100}%`,
                  bottom: `${(g.i / 6) * 100}%`,
                  width: size,
                  height: size,
                  background: QUADRANTS[qk].color,
                  opacity: active && active !== qk ? 0.45 : 1,
                }}
              >
                {g.items.length > 1 ? g.items.length : ""}
              </span>
            );
          })}
        </div>
      </div>

      {/* tick Feasibility */}
      <div className="ml-6 mt-1.5">
        <div className="relative h-4" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((v) => (
            <span
              key={v}
              className="absolute -translate-x-1/2 text-[10px] font-semibold text-slate-400"
              style={{ left: `${(v / 6) * 100}%` }}
            >
              {v}
            </span>
          ))}
        </div>
        <p className="text-center text-[11px] font-semibold text-slate-500">Feasibility (X) · Impact (Y)</p>
      </div>
    </div>
  );
}

function QuadDetail({ ideas, active, onGoManage }) {
  const q = QUADRANTS[active];
  const list = ideas.filter((x) => x.q === active).sort((a, b) => b.total - a.total);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className={`flex h-full flex-col rounded-2xl border border-white/80 p-5 shadow-sm ${q.soft}`}
      >
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <HiOutlineListBullet className={`h-5 w-5 ${q.text}`} />
            {q.label}
          </p>
          <HiOutlineStar className={`h-5 w-5 ${q.text}`} />
        </div>
        <div className="mt-3 flex items-end gap-3">
          <p className={`font-display text-5xl font-extrabold leading-none ${q.text}`}>{list.length}</p>
          <p className="pb-1 text-xs font-semibold text-slate-500">{q.desc}</p>
        </div>

        <ul className="mt-4 space-y-2">
          {list.slice(0, 3).map((x) => (
            <li key={x.id} className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[11px] font-bold shadow-sm ${q.text}`}>
                {x.total}
              </span>
              <span className="truncate">{x.nama}</span>
            </li>
          ))}
          {list.length > 3 && <li className="pl-8 text-xs font-semibold text-slate-500">+{list.length - 3} ide lainnya</li>}
          {list.length === 0 && <li className="text-sm text-slate-500">Belum ada ide di kuadran ini.</li>}
        </ul>

        <button
          onClick={() => onGoManage(active)}
          className="mt-5 inline-flex items-center justify-center gap-1.5 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:mt-auto"
        >
          Lihat Semua Ide <HiOutlineArrowRight className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- 5 skor tertinggi ---------- */
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
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 font-display text-xs font-bold text-slate-600">
              {idx + 1}
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{x.nama}</p>
            {selected?.id === x.id && <HiStar className="h-4 w-4 shrink-0 text-amber-400" title="Ide terpilih" />}
            <span className="font-display text-sm font-extrabold text-slate-900">{x.total}</span>
          </div>
          <div className="ml-10 h-2 overflow-hidden rounded-full bg-slate-100">
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

/* ---------- empty state ---------- */
function EmptyMatrix({ onPreset, onAdd }) {
  const cells = ["potensi", "prioritas", "tunda", "pertimbangkan"];
  return (
    <motion.section variants={rise} className={`${GLASS} grid items-center gap-8 p-6 sm:p-10 md:grid-cols-2`}>
      <div className="mx-auto grid w-full max-w-[260px] grid-cols-2 gap-1.5" aria-hidden="true">
        {cells.map((key) => (
          <div
            key={key}
            className={`grid h-24 place-items-center rounded-xl border-2 border-dashed border-current/30 text-[10px] font-bold ${QUADRANTS[key].soft} ${QUADRANTS[key].text}`}
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
  const [activeQ, setActiveQ] = useState("prioritas");

  const groups = useMemo(() => groupByCoordinate(ideas), [ideas]);

  const avg = useMemo(() => {
    if (!ideas.length) return { f: 0, i: 0 };
    return {
      f: ideas.reduce((s, x) => s + x.f, 0) / ideas.length,
      i: ideas.reduce((s, x) => s + x.i, 0) / ideas.length,
    };
  }, [ideas]);

  const pct = stats.total ? Math.round((stats.prioritas / stats.total) * 100) : 0;
  const filledQuads = QUADRANT_ORDER.filter((k) => counts[k] > 0).length;

  return (
    <motion.div variants={page} initial="hidden" animate="show" className="space-y-8">
      {/* ===== Header ===== */}
      <motion.header variants={rise} className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">
            <HiOutlineChartBarSquare className="h-4 w-4 text-teal-600" />
            Studi Kasus {STUDI_KASUS}
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[44px]">
            {APP_TAGLINE}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Analisis untuk menentukan ide terbaik berdasarkan kelayakan dan dampaknya.
          </p>
        </div>
        <MembersPopover />
      </motion.header>

      {/* ===== Bento ===== */}
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

        <motion.div variants={rise} className={`${GLASS} flex flex-col justify-between p-4 sm:p-5`}>
          <KpiHead icon={HiOutlineLightBulb} label="Total Ide" right={<QuadMiniBars counts={counts} />} />
          <div className="mt-5">
            <p className="font-display text-5xl font-extrabold leading-none text-slate-900">{stats.total}</p>
            <p className="mt-2 text-xs font-medium text-slate-500">
              {stats.total ? `tersebar di ${filledQuads} kuadran` : "belum ada data"}
            </p>
            <div className="mt-3 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
              {QUADRANT_ORDER.map(
                (k) =>
                  counts[k] > 0 && (
                    <span key={k} className={QUADRANTS[k].bar} style={{ width: `${(counts[k] / stats.total) * 100}%` }} />
                  )
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={rise} className={`${GLASS} flex flex-col justify-between p-4 sm:p-5`}>
          <KpiHead icon={HiOutlineStar} label="Prioritas Utama" />
          <div className="mt-5 flex items-end justify-between gap-2">
            <div>
              <p className="font-display text-5xl font-extrabold leading-none text-teal-600">{stats.prioritas}</p>
              <p className="mt-2 text-xs font-bold text-teal-600">{pct}% dari seluruh ide</p>
            </div>
            <Donut pct={pct} />
          </div>
        </motion.div>

        <motion.div variants={rise} className={`${GLASS} col-span-2 p-4 sm:p-5`}>
          <KpiHead icon={HiOutlineScale} label="Rata-rata Skor" tone="rose" />
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8">
            <p className="font-display text-5xl font-extrabold leading-none text-slate-900">
              {stats.avg.toFixed(1)}
              <span className="text-xl font-semibold text-slate-400">/10</span>
            </p>
            <div className="grid flex-1 gap-3">
              <MiniBar label="Feasibility" value={avg.f} color="bg-teal-500" />
              <MiniBar label="Impact" value={avg.i} color="bg-rose-500" />
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ===== Sebaran + peringkat / empty ===== */}
      {empty ? (
        <EmptyMatrix onPreset={store.loadPreset} onAdd={onAdd} />
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-5">
            <motion.div variants={rise} className={`${GLASS} p-5 sm:p-6 lg:col-span-3`}>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-teal-600">
                  <HiOutlineChartBar className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">Sebaran Kuadran</h2>
                  <p className="text-xs text-slate-500 sm:text-sm">Klik sebuah kuadran untuk melihat daftar ide-nya.</p>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <MiniMatrix groups={groups} active={activeQ} onSelect={setActiveQ} />
                <QuadDetail ideas={ideas} active={activeQ} onGoManage={onGoManage} />
              </div>
            </motion.div>

            <motion.div variants={rise} className={`${GLASS} flex flex-col p-5 sm:p-6 lg:col-span-2`}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-500">
                    <HiOutlineTrophy className="h-5 w-5" />
                  </span>
                  <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">5 Skor Tertinggi</h2>
                </div>
                <button
                  onClick={() => onGoManage("semua")}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800"
                >
                  Lihat Semua <HiOutlineArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <TopRanking ranking={ranking} selected={selected} />
            </motion.div>
          </section>

          <motion.section variants={rise}>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-teal-600">
                <HiOutlineUsers className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">Visualisasi</h2>
                <p className="text-xs text-slate-500 sm:text-sm">Ketuk titik pada matriks untuk melihat ide-nya.</p>
              </div>
            </div>
            <ChartsSection ideas={ideas} ranking={ranking} variant="screen" />
          </motion.section>
        </>
      )}
    </motion.div>
  );
}