import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineArrowDownTray,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineCircleStack,
  HiOutlineCursorArrowRays,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineTrash,
} from "react-icons/hi2";
import ConfirmDialog from "../components/ConfirmDialog";
import { QuadBadge, TargetBadge } from "../components/Badges";
import { KELOMPOK, QUADRANTS, QUADRANT_ORDER, STUDI_KASUS } from "../data/constants";

const page = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/* Skor 1–5 sebagai angka + 5 segmen kecil (teal = Feasibility, rose = Impact) */
function ScoreMeter({ value, color }) {
  return (
    <div className="inline-flex flex-col items-center gap-1.5">
      <span className="font-display text-sm font-bold text-slate-800">{value}</span>
      <span className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`h-1 w-3 rounded-full ${n <= value ? color : "bg-slate-200"}`} />
        ))}
      </span>
    </div>
  );
}

function TotalCell({ x }) {
  return (
    <div className="inline-flex flex-col items-center gap-1.5">
      <span className="font-display text-lg font-extrabold leading-none text-slate-900">
        {x.total}
        <span className="text-[11px] font-semibold text-slate-400">/10</span>
      </span>
      <span className="h-1 w-14 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
        <span className={`block h-full rounded-full ${QUADRANTS[x.q].bar}`} style={{ width: `${x.total * 10}%` }} />
      </span>
    </div>
  );
}

function RowActions({ x, canPick, isSelected, onPick, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {canPick &&
        (isSelected ? (
          <span className="mr-1 rounded-lg bg-teal-600 px-2.5 py-1.5 text-xs font-bold text-white">Terpilih</span>
        ) : (
          <button
            onClick={onPick}
            className="mr-1 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-700 ring-1 ring-inset ring-teal-600/20 transition hover:bg-teal-100"
          >
            Jadikan Terpilih
          </button>
        ))}
      <button
        onClick={onEdit}
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label={`Edit ${x.nama}`}
        title="Edit"
      >
        <HiOutlinePencilSquare className="h-5 w-5" />
      </button>
      <button
        onClick={onDelete}
        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
        aria-label={`Hapus ${x.nama}`}
        title="Hapus"
      >
        <HiOutlineTrash className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function ManageView({ store, filter, onFilter, onAdd, onEdit, notify }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("input"); // 'input' | 'skor'
  const [confirm, setConfirm] = useState(null); // { type: 'delete' | 'preset' | 'reset', idea? }
  const { ideas, counts, isTie, topCandidates, selected } = store;

  const candidateIds = useMemo(() => new Set(topCandidates.map((x) => x.id)), [topCandidates]);

  const rows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const list = ideas
      .map((x, idx) => ({ ...x, no: idx + 1 }))
      .filter((x) => (filter === "semua" ? true : x.q === filter))
      .filter((x) => (keyword ? x.nama.toLowerCase().includes(keyword) : true));
    return sort === "skor" ? [...list].sort((a, b) => b.total - a.total || a.no - b.no) : list;
  }, [ideas, filter, search, sort]);

  const exportJson = () => {
    const payload = {
      aplikasi: "IdeaValidator",
      studiKasus: STUDI_KASUS,
      kelompok: KELOMPOK,
      diekspor: new Date().toISOString(),
      ideaTerpilih: selected ? selected.nama : null,
      catatan: store.catatan,
      ideas: ideas.map((x, idx) => ({
        no: idx + 1,
        nama: x.nama,
        target: x.target,
        feasibility: x.f,
        impact: x.i,
        total: x.total,
        kuadran: QUADRANTS[x.q].label,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "validasi-ide-kelompok3.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify("Data diekspor ke validasi-ide-kelompok3.json");
  };

  const handlePreset = () => {
    if (ideas.length) setConfirm({ type: "preset" });
    else {
      store.loadPreset();
      notify("10 ide preset LKPD 5 dimuat");
    }
  };

  const pick = (x) => {
    store.setSelectedId(x.id);
    notify(`“${x.nama}” dijadikan ide terpilih`);
  };

  const runConfirm = () => {
    if (confirm.type === "delete") {
      store.deleteIdea(confirm.idea.id);
      notify(`“${confirm.idea.nama}” dihapus`);
    } else if (confirm.type === "preset") {
      store.loadPreset();
      notify("10 ide preset LKPD 5 dimuat");
    } else if (confirm.type === "reset") {
      store.resetAll();
      onFilter("semua");
      setSearch("");
      notify("Semua data direset");
    }
    setConfirm(null);
  };

  const confirmCfg = {
    delete: {
      title: "Hapus ide ini?",
      message: confirm?.idea ? `“${confirm.idea.nama}” akan dihapus dari daftar validasi.` : "",
      confirmLabel: "Hapus",
      danger: true,
    },
    preset: {
      title: "Muat 10 ide preset?",
      message: "Data ide yang sekarang akan diganti dengan 10 ide preset hasil LKPD 5. Pilihan ide terpilih juga direset.",
      confirmLabel: "Ya, muat preset",
      danger: false,
    },
    reset: {
      title: "Reset semua data?",
      message: "Seluruh ide, ide terpilih, dan catatan kelompok akan dihapus dan dikembalikan ke awal. Tindakan ini tidak bisa dibatalkan.",
      confirmLabel: "Ya, reset",
      danger: true,
    },
  };

  const pills = [{ key: "semua", label: "Semua", count: ideas.length }].concat(
    QUADRANT_ORDER.map((k) => ({ key: k, label: QUADRANTS[k].label, count: counts[k] }))
  );

  const filtering = filter !== "semua" || search.trim() !== "";

  return (
    <motion.div variants={page} initial="hidden" animate="show" className="space-y-6">
      {/* ===== Header ===== */}
      <motion.header variants={rise}>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">Kelola Ide</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          {ideas.length
            ? `${ideas.length} ide divalidasi, ${counts.prioritas} di antaranya masuk Prioritas Utama.`
            : "Tambah, ubah, dan validasi ide solusi beserta skor Feasibility dan Impact."}
        </p>
      </motion.header>

      {/* ===== Toolbar (di luar kartu tabel) ===== */}
      <motion.div variants={rise} className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama ide…"
              className="input !pl-10"
              aria-label="Cari nama ide"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handlePreset} className="btn-soft !py-2.5">
              <HiOutlineCircleStack className="h-4 w-4" /> Muat 10 Preset
            </button>
            <button onClick={exportJson} disabled={!ideas.length} className="btn-soft !py-2.5">
              <HiOutlineArrowDownTray className="h-4 w-4" /> Export JSON
            </button>
            <button
              onClick={() => setConfirm({ type: "reset" })}
              className="btn !py-2.5 text-rose-600 hover:bg-rose-50"
            >
              <HiOutlineArrowPath className="h-4 w-4" /> Reset Data
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter pill */}
          <div
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
            role="tablist"
            aria-label="Filter kuadran"
          >
            {pills.map((p) => {
              const active = filter === p.key;
              return (
                <button
                  key={p.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => onFilter(p.key)}
                  className={`relative shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    active
                      ? "border-transparent text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 rounded-full bg-slate-900"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {p.key !== "semua" && <span className={`h-2 w-2 rounded-full ${QUADRANTS[p.key].dot}`} />}
                    {p.label}
                    <span className={active ? "text-slate-300" : "text-slate-400"}>{p.count}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Urutan */}
          <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-500">
            Urutkan
            <div className="flex rounded-lg bg-slate-100 p-0.5">
              {[
                { key: "input", label: "Urutan input" },
                { key: "skor", label: "Skor tertinggi" },
              ].map((o) => (
                <button
                  key={o.key}
                  onClick={() => setSort(o.key)}
                  aria-pressed={sort === o.key}
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    sort === o.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== Info seri ===== */}
      {isTie && (
        <motion.div
          variants={rise}
          className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <HiOutlineCursorArrowRays className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <span className="font-bold">{topCandidates.length} ide Prioritas Utama seri di skor {topCandidates[0].total}/10.</span>{" "}
            Tekan “Jadikan Terpilih” pada salah satunya, atau tentukan lewat tab Keputusan.
          </p>
        </motion.div>
      )}

      {/* ===== Daftar ide ===== */}
      <motion.section variants={rise}>
        {rows.length > 0 && (
          <>
            {/* Tabel (tablet ke atas) */}
            <div className="card hidden overflow-hidden md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-500">
                    <th className="py-3 pl-6 pr-2">No</th>
                    <th className="px-3 py-3">Nama Ide</th>
                    <th className="px-3 py-3">Target</th>
                    <th className="px-3 py-3 text-center">Feasibility</th>
                    <th className="px-3 py-3 text-center">Impact</th>
                    <th className="px-3 py-3 text-center">Total Score</th>
                    <th className="px-3 py-3">Kuadran</th>
                    <th className="py-3 pl-3 pr-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((x, idx) => {
                    const isSelected = selected?.id === x.id;
                    const canPick = isTie && candidateIds.has(x.id);
                    return (
                      <motion.tr
                        key={x.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: Math.min(idx, 10) * 0.03 }}
                        className={`border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 ${
                          isSelected ? "bg-teal-50/60" : ""
                        }`}
                      >
                        <td className="relative py-4 pl-6 pr-2 font-display font-bold text-slate-400">
                          <span className={`absolute inset-y-0 left-0 w-1 ${QUADRANTS[x.q].bar}`} aria-hidden="true" />
                          {x.no}
                        </td>
                        <td className="max-w-[300px] px-3 py-4 font-semibold text-slate-900">
                          <span className="flex items-center gap-2">
                            <span className="leading-snug">{x.nama}</span>
                            {isSelected && (
                              <HiOutlineCheckCircle className="h-5 w-5 shrink-0 text-teal-600" title="Ide terpilih" />
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <TargetBadge target={x.target} />
                        </td>
                        <td className="px-3 py-4 text-center">
                          <ScoreMeter value={x.f} color="bg-teal-500" />
                        </td>
                        <td className="px-3 py-4 text-center">
                          <ScoreMeter value={x.i} color="bg-rose-500" />
                        </td>
                        <td className="px-3 py-4 text-center">
                          <TotalCell x={x} />
                        </td>
                        <td className="px-3 py-4">
                          <QuadBadge q={x.q} />
                        </td>
                        <td className="py-4 pl-3 pr-4">
                          <RowActions
                            x={x}
                            canPick={canPick}
                            isSelected={isSelected}
                            onPick={() => pick(x)}
                            onEdit={() => onEdit(x)}
                            onDelete={() => setConfirm({ type: "delete", idea: x })}
                          />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Kartu (mobile) */}
            <div className="space-y-3 md:hidden">
              {rows.map((x, idx) => {
                const isSelected = selected?.id === x.id;
                const canPick = isTie && candidateIds.has(x.id);
                return (
                  <motion.article
                    key={x.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(idx, 8) * 0.04 }}
                    className={`card relative overflow-hidden p-4 pl-5 ${isSelected ? "border-teal-300 bg-teal-50/50" : ""}`}
                  >
                    <span className={`absolute inset-y-0 left-0 w-1 ${QUADRANTS[x.q].bar}`} aria-hidden="true" />
                    <div className="flex items-start justify-between gap-3">
                      <p className="flex-1 font-display text-[15px] font-bold leading-snug text-slate-900">
                        <span className="mr-1.5 text-slate-400">{x.no}.</span>
                        {x.nama}
                      </p>
                      {isSelected && <HiOutlineCheckCircle className="h-5 w-5 shrink-0 text-teal-600" />}
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <TargetBadge target={x.target} />
                      <QuadBadge q={x.q} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 rounded-xl bg-slate-50 py-3 text-center">
                      <div>
                        <p className="mb-1 text-[10px] font-bold text-slate-400">Feasibility</p>
                        <ScoreMeter value={x.f} color="bg-teal-500" />
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-bold text-slate-400">Impact</p>
                        <ScoreMeter value={x.i} color="bg-rose-500" />
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-bold text-slate-400">Total</p>
                        <TotalCell x={x} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <RowActions
                        x={x}
                        canPick={canPick}
                        isSelected={isSelected}
                        onPick={() => pick(x)}
                        onEdit={() => onEdit(x)}
                        onDelete={() => setConfirm({ type: "delete", idea: x })}
                      />
                    </div>
                  </motion.article>
                );
              })}
            </div>

            <p className="mt-3 px-1 text-xs font-medium text-slate-400">
              {filtering ? `Menampilkan ${rows.length} dari ${ideas.length} ide` : `${ideas.length} ide`}
            </p>
          </>
        )}

        {/* Kosong */}
        {rows.length === 0 && (
          <div className="card px-6 py-16 text-center">
            {ideas.length === 0 ? (
              <>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                  <HiOutlineCircleStack className="h-7 w-7" />
                </div>
                <p className="mt-4 font-display text-lg font-bold text-slate-900">Belum ada ide</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                  Tambahkan ide pertama atau muat 10 ide preset hasil LKPD 5.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button onClick={handlePreset} className="btn-primary">
                    <HiOutlineCircleStack className="h-5 w-5" /> Muat 10 Preset
                  </button>
                  <button onClick={onAdd} className="btn-soft">
                    <HiOutlinePlus className="h-5 w-5" /> Tambah Ide
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                  <HiOutlineMagnifyingGlass className="h-7 w-7" />
                </div>
                <p className="mt-4 font-display text-lg font-bold text-slate-900">Tidak ada ide yang cocok</p>
                <p className="mt-1 text-sm text-slate-500">Ubah kata kunci pencarian atau pilih filter kuadran lain.</p>
                <button
                  onClick={() => {
                    setSearch("");
                    onFilter("semua");
                  }}
                  className="btn-soft mt-5"
                >
                  Hapus filter
                </button>
              </>
            )}
          </div>
        )}
      </motion.section>

      <AnimatePresence>
        {confirm && (
          <ConfirmDialog
            key={confirm.type}
            {...confirmCfg[confirm.type]}
            onConfirm={runConfirm}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}