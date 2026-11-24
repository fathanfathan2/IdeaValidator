import { HiOutlineLightBulb } from "react-icons/hi2";
import {
  ANGGOTA,
  APP_NAME,
  APP_TAGLINE,
  KELOMPOK,
  LKPD_TITLE,
  STUDI_KASUS,
  buildConclusion,
} from "../data/constants";
import ChartsSection from "./ChartsSection";
import { QuadBadge, TargetBadge } from "./Badges";

function ReportKpi({ label, value, small }) {
  return (
    <div className="avoid-break border-l-[3px] border-teal-600 pl-3 print:pl-2">
      <p className="text-[11px] font-semibold text-slate-500 print:text-[9px]">{label}</p>
      <p
        className={`mt-1 font-display font-extrabold text-slate-900 ${
          small ? "text-sm leading-snug print:text-[10.5px]" : "text-3xl leading-none print:text-2xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SectionHead({ no, children }) {
  return (
    <h3 className="mb-3 flex items-center gap-2.5 font-display text-[15px] font-bold text-slate-900 print:mb-2 print:text-[12px]">
      <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-900 text-[11px] font-bold text-white print:h-5 print:w-5 print:text-[9px]">
        {no}
      </span>
      {children}
    </h3>
  );
}

export default function PrintReport({ ideas, ranking, stats, selected, topCandidates, isTie, catatan }) {
  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const selectedLabel = selected
    ? selected.nama
    : isTie
    ? `Belum ditetapkan (seri ${topCandidates.length} ide)`
    : "Belum ada";
  const conclusion = buildConclusion({
    total: stats.total,
    counts: stats.counts,
    selected,
    topCandidates,
  });

  return (
    <article
      id="laporan-cetak"
      className="mx-auto w-full max-w-[210mm] rounded-xl bg-white p-6 shadow-md shadow-slate-900/5 ring-1 ring-slate-200 sm:p-12 print:max-w-none print:rounded-none print:p-0 print:shadow-none print:ring-0"
    >
      {/* ===== Kop laporan ===== */}
      <header className="avoid-break">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-600 text-white print:h-8 print:w-8">
              <HiOutlineLightBulb className="h-6 w-6 print:h-4 print:w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-bold text-teal-700 print:text-[10px]">{LKPD_TITLE}</p>
              <p className="mt-0.5 text-xs text-slate-500 print:text-[9px]">{KELOMPOK}</p>
            </div>
          </div>
          <p className="text-right text-xs leading-snug text-slate-500 print:text-[9px]">
            Dicetak pada
            <br />
            <span className="font-semibold text-slate-700">{today}</span>
          </p>
        </div>

        <h2 className="mt-6 font-display text-[26px] font-extrabold leading-tight tracking-tight text-slate-900 print:mt-3 print:text-[18px]">
          {APP_NAME}
          <span className="block text-lg font-bold text-slate-500 print:text-[12px]">{APP_TAGLINE}</span>
        </h2>
        <p className="mt-2 text-sm text-slate-600 print:text-[10.5px]">Studi Kasus: {STUDI_KASUS}</p>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm print:mt-2 print:text-[10.5px]">
          <span className="font-semibold text-slate-800">Anggota:</span>
          {ANGGOTA.map((n, idx) => (
            <span key={n} className="text-slate-600">
              {n}
              {idx < ANGGOTA.length - 1 && ","}
            </span>
          ))}
        </div>
        <div className="mt-5 flex h-[3px] print:mt-3">
          <span className="w-full bg-teal-600" />
          <span className="w-16 bg-rose-500" />
        </div>
      </header>

      {/* ===== Ringkasan KPI ===== */}
      <section className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 print:mt-3 print:grid-cols-4 print:gap-x-3">
        <ReportKpi label="Total Ide" value={stats.total} />
        <ReportKpi label="Prioritas Utama" value={stats.prioritas} />
        <ReportKpi label="Rata-rata Skor" value={`${stats.avg.toFixed(1)}/10`} />
        <ReportKpi label="Ide Terpilih" value={selectedLabel} small />
      </section>

      {/* ===== Grafik ===== */}
      <section className="avoid-break mt-8 print:mt-4">
        <SectionHead no="1">Visualisasi Matriks dan Skor</SectionHead>
        <ChartsSection ideas={ideas} ranking={ranking} />
      </section>

      {/* ===== Tabel peringkat ===== */}
      <section className="mt-8 print:mt-4">
        <SectionHead no="2">Peringkat Ide (Total Score Tertinggi ke Terendah)</SectionHead>
        <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200 print:overflow-visible print:rounded-md">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm print:min-w-0 print:text-[10px]">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold text-slate-600 print:text-[9px]">
                <th className="px-3 py-2.5 print:px-2 print:py-1">Peringkat</th>
                <th className="px-3 py-2.5 print:px-2 print:py-1">Nama Ide</th>
                <th className="px-3 py-2.5 print:px-2 print:py-1">Target</th>
                <th className="px-3 py-2.5 text-center print:px-2 print:py-1">F</th>
                <th className="px-3 py-2.5 text-center print:px-2 print:py-1">I</th>
                <th className="px-3 py-2.5 text-center print:px-2 print:py-1">Total</th>
                <th className="px-3 py-2.5 print:px-2 print:py-1">Kuadran</th>
              </tr>
            </thead>
            <tbody>
              {ranking.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                    Belum ada ide yang divalidasi.
                  </td>
                </tr>
              )}
              {ranking.map((x, idx) => {
                const isSelected = selected?.id === x.id;
                return (
                  <tr key={x.id} className={`border-t border-slate-200 ${isSelected ? "bg-teal-50" : ""}`}>
                    <td className="px-3 py-2.5 print:px-2 print:py-1">
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-md font-display text-xs font-bold print:h-4 print:w-4 print:text-[8px] ${
                          idx < 3 ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900 print:px-2 print:py-1">
                      {x.nama}
                      {isSelected && (
                        <span className="ml-2 rounded bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold text-white print:text-[7px]">
                          TERPILIH
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 print:px-2 print:py-1">
                      <TargetBadge target={x.target} />
                    </td>
                    <td className="px-3 py-2.5 text-center font-semibold text-slate-700 print:px-2 print:py-1">{x.f}</td>
                    <td className="px-3 py-2.5 text-center font-semibold text-slate-700 print:px-2 print:py-1">{x.i}</td>
                    <td className="px-3 py-2.5 text-center font-display font-extrabold text-slate-900 print:px-2 print:py-1">
                      {x.total}
                    </td>
                    <td className="px-3 py-2.5 print:px-2 print:py-1">
                      <QuadBadge q={x.q} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== Kesimpulan + catatan ===== */}
      <section className="avoid-break mt-8 print:mt-4">
        <SectionHead no="3">Kesimpulan dan Catatan Kelompok</SectionHead>
        <div className="rounded-xl border-l-4 border-teal-600 bg-teal-50/50 p-5 print:p-3">
          <p className="text-sm leading-relaxed text-slate-800 print:text-[10.5px]">{conclusion}</p>
        </div>
        <div className="mt-3 rounded-xl border-l-4 border-rose-500 bg-rose-50/50 p-5 print:p-3">
          <h4 className="text-xs font-bold text-slate-700 print:text-[9.5px]">Catatan Pertimbangan Kelompok</h4>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-800 print:text-[10.5px]">
            {catatan.trim() || "—"}
          </p>
        </div>
      </section>

      {/* ===== Kaki laporan ===== */}
      <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-400 print:mt-5 print:text-[8.5px]">
        <span>
          {APP_NAME} · {KELOMPOK}
        </span>
        <span>{LKPD_TITLE}</span>
      </footer>
    </article>
  );
}