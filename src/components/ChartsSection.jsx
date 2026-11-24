import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Scatter } from "react-chartjs-2";
import { HiOutlineCursorArrowRays, HiOutlineInformationCircle } from "react-icons/hi2";
import { BATAS_GARIS, QUADRANTS, getQuadrant } from "../data/constants";

ChartJS.register(LinearScale, CategoryScale, PointElement, BarElement, Tooltip, Legend);
ChartJS.defaults.font.family = '"Plus Jakarta Sans", ui-sans-serif, sans-serif';
ChartJS.defaults.color = "#64748b";

/* Gaya kartu kaca yang dipakai tema Dashboard */
export const GLASS =
  "rounded-3xl border border-white/70 bg-white/80 shadow-[0_10px_40px_-12px_rgba(13,148,136,0.18)] backdrop-blur";

/* ---------- Plugin kustom: garis putus-putus pembatas kuadran + label 4 kuadran ---------- */
export const quadPlugin = {
  id: "quadPlugin",
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea: a, scales } = chart;
    if (!a || !scales.x || !scales.y) return;
    const cx = scales.x.getPixelForValue(BATAS_GARIS);
    const cy = scales.y.getPixelForValue(BATAS_GARIS);

    ctx.save();

    const tint = (x0, y0, x1, y1, color) => {
      ctx.fillStyle = `${color}14`;
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    };
    tint(cx, a.top, a.right, cy, QUADRANTS.prioritas.color);
    tint(a.left, a.top, cx, cy, QUADRANTS.potensi.color);
    tint(cx, cy, a.right, a.bottom, QUADRANTS.pertimbangkan.color);
    tint(a.left, cy, cx, a.bottom, QUADRANTS.tunda.color);

    ctx.setLineDash([6, 5]);
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = "#94a3b8";
    ctx.beginPath();
    ctx.moveTo(cx, a.top);
    ctx.lineTo(cx, a.bottom);
    ctx.moveTo(a.left, cy);
    ctx.lineTo(a.right, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '700 10.5px "Plus Jakarta Sans", sans-serif';
    const pad = 9;
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillStyle = QUADRANTS.prioritas.dark;
    ctx.fillText(QUADRANTS.prioritas.label, a.right - pad, a.top + pad);
    ctx.textAlign = "left";
    ctx.fillStyle = QUADRANTS.potensi.dark;
    ctx.fillText(QUADRANTS.potensi.label, a.left + pad, a.top + pad);
    ctx.textBaseline = "bottom";
    ctx.textAlign = "right";
    ctx.fillStyle = QUADRANTS.pertimbangkan.dark;
    ctx.fillText(QUADRANTS.pertimbangkan.label, a.right - pad, a.bottom - pad);
    ctx.textAlign = "left";
    ctx.fillStyle = QUADRANTS.tunda.dark;
    ctx.fillText(QUADRANTS.tunda.label, a.left + pad, a.bottom - pad);

    ctx.restore();
  },
};

/* ---------- Plugin: angka jumlah ide di tengah titik gabungan ---------- */
const countPlugin = {
  id: "countPlugin",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const raw = chart.data.datasets[0].data;
    ctx.save();
    ctx.font = '800 12px Sora, "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    meta.data.forEach((el, idx) => {
      if (raw[idx] && raw[idx].count > 1) ctx.fillText(String(raw[idx].count), el.x, el.y + 0.5);
    });
    ctx.restore();
  },
};

/* ---------- Plugin: nilai total di ujung batang ---------- */
const valuePlugin = {
  id: "valuePlugin",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const values = chart.data.datasets[0].data;
    ctx.save();
    ctx.font = '700 11px Sora, "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = "#334155";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    meta.data.forEach((bar, idx) => ctx.fillText(String(values[idx]), bar.x + 6, bar.y));
    ctx.restore();
  },
};

const tooltipBase = {
  backgroundColor: "#0f172a",
  titleColor: "#fff",
  bodyColor: "#e2e8f0",
  footerColor: "#5eead4",
  padding: 12,
  cornerRadius: 12,
  boxPadding: 4,
  displayColors: false,
};

function groupByCoordinate(ideas) {
  const map = new Map();
  ideas.forEach((idea) => {
    const key = `${idea.f}-${idea.i}`;
    if (!map.has(key)) map.set(key, { f: idea.f, i: idea.i, items: [] });
    map.get(key).items.push(idea);
  });
  return [...map.values()];
}

/* ---------- Tombol "Catatan": isi catatan hanya muncul saat ditekan ---------- */
function NoteButton({ text }) {
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
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Tampilkan catatan grafik"
        className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition ${
          open
            ? "border-teal-300 bg-teal-50 text-teal-700"
            : "border-slate-200 bg-white/80 text-slate-500 hover:bg-white hover:text-slate-700"
        }`}
      >
        <HiOutlineInformationCircle className="h-4 w-4" />
        Catatan
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-20 mt-2 w-72 max-w-[calc(100vw-3rem)] rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600 shadow-xl"
            role="note"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Panel detail titik: berada DI BAWAH grafik, tidak menutupi apa pun ---------- */
function PointDetail({ group }) {
  if (!group) {
    return (
      <div className="mt-4 flex min-h-[92px] items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-500">
        <HiOutlineCursorArrowRays className="h-5 w-5 shrink-0 text-slate-400" />
        Arahkan kursor atau ketuk sebuah titik untuk melihat ide di koordinat tersebut.
      </div>
    );
  }
  const q = QUADRANTS[getQuadrant(group.f, group.i)];
  return (
    <div className={`mt-4 min-h-[92px] rounded-2xl px-4 py-3 ${q.soft}`} aria-live="polite">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-bold">
        <span className={`h-2 w-2 rounded-full ${q.dot}`} />
        <span className={q.text}>{q.label}</span>
        <span className="text-slate-500">
          Feasibility {group.f} · Impact {group.i}
        </span>
      </div>
      <ul className="mt-2 max-h-24 space-y-1 overflow-y-auto">
        {group.items.map((x) => (
          <li key={x.id} className="truncate text-sm font-semibold text-slate-800">
            {x.nama}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartCard({ screen, title, subtitle, action, note, children, footer }) {
  const shell = screen
    ? `${GLASS} flex h-full flex-col p-5 sm:p-6`
    : "card avoid-break flex h-full flex-col p-5 print:rounded-lg print:p-3 print:shadow-none";
  return (
    <div className={shell}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
      {footer}
      {note && <p className="mt-3 text-xs leading-relaxed text-slate-500">{note}</p>}
    </div>
  );
}

function ChartEmpty() {
  return (
    <div className="grid h-[240px] place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
      Belum ada data untuk ditampilkan.
    </div>
  );
}

/*
  variant="screen"  → dipakai di Dashboard: tooltip bawaan dimatikan, detail titik tampil di panel bawah grafik,
                      catatan disembunyikan di balik tombol "Catatan".
  variant="report"  → dipakai di Laporan/cetak: catatan tampil statis di bawah grafik.
*/
export default function ChartsSection({ ideas, ranking, variant = "report" }) {
  const screen = variant === "screen";
  const scatterRef = useRef(null);
  const barRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(null);

  useEffect(() => {
    const redraw = () => {
      scatterRef.current?.resize();
      barRef.current?.resize();
    };
    window.addEventListener("beforeprint", redraw);
    window.addEventListener("afterprint", redraw);
    return () => {
      window.removeEventListener("beforeprint", redraw);
      window.removeEventListener("afterprint", redraw);
    };
  }, []);

  const groups = useMemo(() => groupByCoordinate(ideas), [ideas]);

  // Data berubah → titik terpilih direset
  useEffect(() => setActiveIdx(null), [ideas]);

  const scatterData = useMemo(() => {
    const radius = groups.map((g) => (g.items.length > 1 ? Math.min(12 + g.items.length * 3, 26) : 8));
    return {
      datasets: [
        {
          label: "Ide",
          data: groups.map((g) => ({ x: g.f, y: g.i, count: g.items.length, names: g.items.map((n) => n.nama) })),
          backgroundColor: groups.map((g) => QUADRANTS[getQuadrant(g.f, g.i)].color),
          borderColor: groups.map((_, idx) => (screen && idx === activeIdx ? "#0f172a" : "#ffffff")),
          borderWidth: groups.map((_, idx) => (screen && idx === activeIdx ? 3 : 2)),
          pointRadius: radius,
          pointHoverRadius: radius.map((r) => r + 2),
          pointHitRadius: 14,
        },
      ],
    };
  }, [groups, activeIdx, screen]);

  const scatterOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 200 },
      layout: { padding: 6 },
      onHover: screen
        ? (evt, els) => {
            if (evt.native && evt.native.target) evt.native.target.style.cursor = els.length ? "pointer" : "default";
            if (els.length) setActiveIdx(els[0].index);
          }
        : undefined,
      onClick: screen ? (evt, els) => setActiveIdx(els.length ? els[0].index : null) : undefined,
      scales: {
        x: {
          min: 0,
          max: 6,
          title: { display: true, text: "Feasibility", font: { weight: "700" } },
          ticks: { stepSize: 1, callback: (v) => (v >= 1 && v <= 5 ? v : "") },
          grid: { color: "#e2e8f0" },
        },
        y: {
          min: 0,
          max: 6,
          title: { display: true, text: "Impact", font: { weight: "700" } },
          ticks: { stepSize: 1, callback: (v) => (v >= 1 && v <= 5 ? v : "") },
          grid: { color: "#e2e8f0" },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: screen
          ? { enabled: false }
          : {
              ...tooltipBase,
              callbacks: {
                title: (items) => `Feasibility ${items[0].raw.x} · Impact ${items[0].raw.y}`,
                label: (item) => item.raw.names.map((n) => `• ${n}`),
                footer: (items) => QUADRANTS[getQuadrant(items[0].raw.x, items[0].raw.y)].label,
              },
            },
      },
    }),
    [screen]
  );

  const barData = useMemo(
    () => ({
      labels: ranking.map((x) => x.nama),
      datasets: [
        {
          label: "Total Score",
          data: ranking.map((x) => x.total),
          backgroundColor: ranking.map((x) => QUADRANTS[x.q].color),
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 20,
        },
      ],
    }),
    [ranking]
  );

  const barOptions = useMemo(
    () => ({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 24 } },
      scales: {
        x: {
          min: 0,
          max: 10,
          ticks: { stepSize: 2 },
          title: { display: true, text: "Total Score (Feasibility + Impact)", font: { weight: "700" } },
          grid: { color: "#e2e8f0" },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { size: 10.5 },
            callback(value) {
              const label = this.getLabelForValue(value);
              return label.length > 27 ? `${label.slice(0, 26)}…` : label;
            },
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltipBase,
          yAlign: "center",
          callbacks: {
            title: (items) => ranking[items[0].dataIndex].nama,
            label: (item) => {
              const x = ranking[item.dataIndex];
              return `Total ${x.total}/10 (F ${x.f} + I ${x.i})`;
            },
            footer: (items) => QUADRANTS[ranking[items[0].dataIndex].q].label,
          },
        },
      },
    }),
    [ranking]
  );

  const hasData = ideas.length > 0;
  const uniquePoints = groups.length;
  const grouped = hasData && uniquePoints < ideas.length;
  const barHeight = Math.max(320, ranking.length * 32 + 70);

  const noteText = grouped
    ? `${ideas.length} ide ditampilkan sebagai ${uniquePoints} titik karena ada ide dengan koordinat (Feasibility, Impact) yang sama persis. Titik yang lebih besar berisi angka jumlah ide.`
    : "Setiap titik mewakili satu ide. Garis putus-putus di 3,5 memisahkan skor rendah (1–3) dari skor tinggi (4–5).";
  const reportNote = grouped
    ? `Catatan: ${ideas.length} ide ditampilkan sebagai ${uniquePoints} titik karena ada ide dengan koordinat (Feasibility, Impact) yang sama persis. Titik yang lebih besar berisi angka jumlah ide.`
    : null;

  return (
    <div className="grid gap-4 lg:grid-cols-2 print:grid-cols-2 print:gap-2">
      <ChartCard
        screen={screen}
        title="Matriks Feasibility vs Impact"
        subtitle="Sumbu X: Feasibility · Sumbu Y: Impact · garis putus-putus di 3,5"
        action={screen && hasData ? <NoteButton text={noteText} /> : null}
        note={screen ? null : reportNote}
        footer={screen && hasData ? <PointDetail group={groups[activeIdx]} /> : null}
      >
        {hasData ? (
          <div
            className={`relative min-w-0 ${
              screen ? "h-[280px] sm:h-[340px]" : "h-[340px] sm:h-[380px] print:!h-[300px]"
            }`}
          >
            <Scatter ref={scatterRef} data={scatterData} options={scatterOptions} plugins={[quadPlugin, countPlugin]} />
          </div>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>

      <ChartCard screen={screen} title="Total Score per Ide" subtitle="Diurutkan dari skor tertinggi · warna mengikuti kuadran">
        {hasData ? (
          screen ? (
            <div className="relative min-w-0 flex-1" style={{ minHeight: barHeight }}>
              <div className="absolute inset-0">
                <Bar ref={barRef} data={barData} options={barOptions} plugins={[valuePlugin]} />
              </div>
            </div>
          ) : (
            <div className="relative min-w-0 print:!h-[300px]" style={{ height: barHeight }}>
              <Bar ref={barRef} data={barData} options={barOptions} plugins={[valuePlugin]} />
            </div>
          )
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>
    </div>
  );
}