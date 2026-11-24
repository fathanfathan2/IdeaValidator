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
    <div className="avoid-break rounded-xl border border-slate-200 border-l-4 border-l-teal-600 bg-white px-3 py-2.5 print:rounded-md print:px-2 print:py-1.5">
      <p className="text-[11px] font-semibold text-slate-500 print:text-[9px]">{label}</p>
      <p
        className={`mt-0.5 font-display font-extrabold text-slate-900 ${
          small ? "text-[13px] leading-snug print:text-[10px]" : "text-2xl print:text-lg"
        }`}
      >
        {value}
      </p>
    </div>
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
      className="mx-auto w-full max-w-[210mm] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
    >
      {/* Header */}
      <header className="avoid-break border-b-2 border-slate-900 pb-4 print:pb-2">
        <p className="text-xs font-semibold text-teal-700 print:text-[10px]">{LKPD_TITLE}</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900 print:text-[17px]">
          {APP_NAME} — {APP_TAGLINE}
        </h2>
        <p className="mt-1 text-sm text-slate-600 print:text-[11px]">
          Studi Kasus: {STUDI_KASUS} · {KELOMPOK}
        </p>
        <p className="mt-1 text-sm text-slate-600 print:text-[11px]">
          <span className="font-semibold text-slate-800">Anggota:</span> {ANGGOTA.join(", ")}
        </p>
        <p className="mt-1 text-xs text-slate-400 print:text-[9px]">Dicetak pada {today}</p>
      </header>

      {/* KPI */}
      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 print:mt-3 print:grid-cols-4 print:gap-2">
        <ReportKpi label="Total Ide" value={stats.total} />
        <ReportKpi label="Prioritas Utama" value={stats.prioritas} />
        <ReportKpi label="Rata-rata Skor" value={stats.avg.toFixed(1)} />
        <ReportKpi label="Ide Terpilih" value={selectedLabel} small />
      </section>

      {/* Grafik */}
      <section className="mt-5 print:mt-3 avoid-break">
        <ChartsSection ideas={ideas} ranking={ranking} />
      </section>

      {/* Tabel peringkat */}
      <section className="mt-6 print:mt-3">
        <h3 className="mb-2 font-display text-[15px] font-bold text-slate-900 print:text-[12px]">
          Tabel Peringkat Ide (Total Score Tertinggi → Terendah)
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 print:overflow-visible print:rounded-md">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm print:min-w-0 print:text-[10px]">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold text-slate-600 print:text-[9px]">
                <th className="px-3 py-2 print:px-2 print:py-1">Peringkat</th>
                <th className="px-3 py-2 print:px-2 print:py-1">Nama Ide</th>
                <th className="px-3 py-2 print:px-2 print:py-1">Target</th>
                <th className="px-3 py-2 text-center print:px-2 print:py-1">F</th>
                <th className="px-3 py-2 text-center print:px-2 print:py-1">I</th>
                <th className="px-3 py-2 text-center print:px-2 print:py-1">Total</th>
                <th className="px-3 py-2 print:px-2 print:py-1">Kuadran</th>
              </tr>
            </thead>
            <tbody>
              {ranking.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    Belum ada ide yang divalidasi.
                  </td>
                </tr>
              )}
              {ranking.map((x, idx) => (
                <tr key={x.id} className="border-t border-slate-200">
                  <td className="px-3 py-2 font-display font-bold text-slate-500 print:px-2 print:py-1">{idx + 1}</td>
                  <td className="px-3 py-2 font-semibold text-slate-900 print:px-2 print:py-1">
                    {x.nama}
                    {selected?.id === x.id && (
                      <span className="ml-2 rounded bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold text-white print:text-[8px]">
                        TERPILIH
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 print:px-2 print:py-1">
                    <TargetBadge target={x.target} />
                  </td>
                  <td className="px-3 py-2 text-center print:px-2 print:py-1">{x.f}</td>
                  <td className="px-3 py-2 text-center print:px-2 print:py-1">{x.i}</td>
                  <td className="px-3 py-2 text-center font-display font-extrabold text-slate-900 print:px-2 print:py-1">
                    {x.total}
                  </td>
                  <td className="px-3 py-2 print:px-2 print:py-1">
                    <QuadBadge q={x.q} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Kesimpulan + catatan */}
      <section className="avoid-break mt-6 rounded-xl border-l-4 border-rose-500 bg-rose-50/60 p-4 print:mt-3 print:p-3">
        <h3 className="font-display text-[15px] font-bold text-slate-900 print:text-[12px]">Kesimpulan</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-700 print:text-[10.5px]">{conclusion}</p>
        <div className="mt-3 border-t border-dashed border-rose-300 pt-3">
          <h4 className="text-xs font-bold text-slate-800 print:text-[10px]">Catatan Pertimbangan Kelompok</h4>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700 print:text-[10.5px]">
            {catatan.trim() || "—"}
          </p>
        </div>
      </section>
    </article>
  );
}
