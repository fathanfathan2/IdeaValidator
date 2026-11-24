import { motion } from "framer-motion";
import {
  HiCheckCircle,
  HiOutlineArrowRight,
  HiOutlineExclamationTriangle,
  HiOutlinePrinter,
} from "react-icons/hi2";
import PrintReport from "../components/PrintReport";

const page = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function CheckItem({ ok, label, detail, linkLabel, onLink }) {
  return (
    <li className="flex items-start gap-3">
      {ok ? (
        <HiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
      ) : (
        <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{detail}</p>
        {!ok && onLink && (
          <button
            onClick={onLink}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800"
          >
            {linkLabel} <HiOutlineArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}

export default function ReportView({ store, onGoTab }) {
  const { ideas, selected, isTie, topCandidates, catatan } = store;
  const go = (tab) => (onGoTab ? () => onGoTab(tab) : undefined);

  let decisionDetail = selected ? selected.nama : "";
  if (!selected) {
    if (isTie) decisionDetail = `Masih seri (${topCandidates.length} ide). Pilih salah satu di tab Keputusan.`;
    else if (!ideas.length) decisionDetail = "Belum ada ide yang dinilai.";
    else decisionDetail = "Belum ada ide di kuadran Prioritas Utama.";
  }

  const checks = [
    {
      ok: ideas.length > 0,
      label: "Data ide tersedia",
      detail: ideas.length ? `${ideas.length} ide akan masuk laporan.` : "Tambahkan ide atau muat preset dulu.",
      linkLabel: "Buka Kelola Ide",
      onLink: go("kelola"),
    },
    {
      ok: Boolean(selected),
      label: "Keputusan final ditetapkan",
      detail: decisionDetail,
      linkLabel: "Buka Keputusan",
      onLink: go(ideas.length ? "keputusan" : "kelola"),
    },
    {
      ok: catatan.trim().length > 0,
      label: "Catatan pertimbangan terisi",
      detail: catatan.trim().length ? `${catatan.trim().length} karakter akan dicetak.` : "Kolom catatan masih kosong.",
      linkLabel: "Isi catatan",
      onLink: go("keputusan"),
    },
  ];
  const allReady = checks.every((c) => c.ok);

  return (
    <motion.div variants={page} initial="hidden" animate="show" className="space-y-6">
      <motion.header variants={rise} className="print:hidden">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">Laporan &amp; Cetak PDF</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Pratinjau kertas A4 yang akan dicetak. Isinya selalu mengikuti data terbaru.
        </p>
      </motion.header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] print:block">
        {/* Panel aksi: di atas pada layar kecil, di kanan pada layar lebar */}
        <motion.aside
          variants={rise}
          className="space-y-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 print:hidden"
        >
          <div className="card p-5">
            <button
              onClick={() => window.print()}
              disabled={!ideas.length}
              className="btn-primary w-full !py-3"
            >
              <HiOutlinePrinter className="h-5 w-5" />
              Cetak / Simpan Laporan (PDF)
            </button>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Pada dialog cetak, pilih <span className="font-semibold text-slate-700">Simpan sebagai PDF</span>, ukuran{" "}
              <span className="font-semibold text-slate-700">A4</span>, dan nyalakan{" "}
              <span className="font-semibold text-slate-700">Background graphics</span> agar warna grafik ikut tercetak.
            </p>
          </div>

          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-slate-900">Kesiapan laporan</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${
                  allReady
                    ? "bg-teal-50 text-teal-700 ring-teal-600/20"
                    : "bg-amber-50 text-amber-700 ring-amber-600/20"
                }`}
              >
                {checks.filter((c) => c.ok).length}/{checks.length}
              </span>
            </div>
            <ul className="space-y-4">
              {checks.map((c) => (
                <CheckItem key={c.label} {...c} />
              ))}
            </ul>
          </div>
        </motion.aside>

        {/* Kertas */}
        <motion.div
          variants={rise}
          className="rounded-3xl border border-slate-200 bg-slate-100 p-2 sm:p-6 lg:col-start-1 lg:row-start-1 print:rounded-none print:border-0 print:bg-transparent print:p-0"
        >
          <PrintReport
            ideas={store.ideas}
            ranking={store.ranking}
            stats={store.stats}
            selected={store.selected}
            topCandidates={store.topCandidates}
            isTie={store.isTie}
            catatan={store.catatan}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}