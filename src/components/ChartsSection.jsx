import { useEffect, useMemo, useRef } from "react";
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
import { BATAS_GARIS, QUADRANTS, getQuadrant } from "../data/constants";

ChartJS.register(LinearScale, CategoryScale, PointElement, BarElement, Tooltip, Legend);
ChartJS.defaults.font.family = '"Plus Jakarta Sans", ui-sans-serif, sans-serif';
ChartJS.defaults.color = "#64748b";

/* ---------- Plugin kustom: garis putus-putus pembatas kuadran + label 4 kuadran ---------- */
export const quadPlugin = {
  id: "quadPlugin",
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea: a, scales } = chart;
    if (!a || !scales.x || !scales.y) return;
    const cx = scales.x.getPixelForValue(BATAS_GARIS);
    const cy = scales.y.getPixelForValue(BATAS_GARIS);

    ctx.save();

    // Latar tipis tiap kuadran
    const tint = (x0, y0, x1, y1, color) => {
      ctx.fillStyle = `${color}14`;
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    };
    tint(cx, a.top, a.right, cy, QUADRANTS.prioritas.color);
    tint(a.left, a.top, cx, cy, QUADRANTS.potensi.color);
    tint(cx, cy, a.right, a.bottom, QUADRANTS.pertimbangkan.color);
    tint(a.left, cy, cx, a.bottom, QUADRANTS.tunda.color);

    // Garis putus-putus di x = 3.5 dan y = 3.5
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

    // Label 4 kuadran di sudut luar chart
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

function ChartCard({ title, subtitle, children, note }) {
  return (
    <div className="card avoid-break flex h-full flex-col p-5 print:rounded-lg print:p-3 print:shadow-none">
      <div className="mb-3">
        <h3 className="font-display text-[15px] font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      {children}
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

export default function ChartsSection({ ideas, ranking }) {
  const scatterRef = useRef(null);
  const barRef = useRef(null);

  // Pastikan canvas dihitung ulang saat dialog cetak dibuka/ditutup
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

  const scatterData = useMemo(() => {
    const radius = groups.map((g) => (g.items.length > 1 ? Math.min(12 + g.items.length * 3, 26) : 8));
    return {
      datasets: [
        {
          label: "Ide",
          data: groups.map((g) => ({ x: g.f, y: g.i, count: g.items.length, names: g.items.map((n) => n.nama) })),
          backgroundColor: groups.map((g) => QUADRANTS[getQuadrant(g.f, g.i)].color),
          borderColor: "#ffffff",
          borderWidth: 2,
          pointRadius: radius,
          pointHoverRadius: radius.map((r) => r + 2),
        },
      ],
    };
  }, [groups]);

  const scatterOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 6 },
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
        tooltip: {
          ...tooltipBase,
          callbacks: {
            title: (items) => `Feasibility ${items[0].raw.x} · Impact ${items[0].raw.y}`,
            label: (item) => item.raw.names.map((n) => `• ${n}`),
            footer: (items) => QUADRANTS[getQuadrant(items[0].raw.x, items[0].raw.y)].label,
          },
        },
      },
    }),
    []
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
  const note =
    hasData && uniquePoints < ideas.length
      ? `Catatan: ${ideas.length} ide ditampilkan sebagai ${uniquePoints} titik karena ada ide dengan koordinat (Feasibility, Impact) yang sama persis. Titik yang lebih besar berisi angka jumlah ide; arahkan kursor ke titik untuk melihat daftar namanya.`
      : null;

  const barHeight = Math.max(320, ranking.length * 32 + 70);

  return (
    <div className="grid gap-4 lg:grid-cols-2 print:grid-cols-2 print:gap-2">
      <ChartCard title="Matriks Feasibility vs Impact" subtitle="Sumbu X: Feasibility · Sumbu Y: Impact · garis putus-putus di 3,5" note={note}>
        {hasData ? (
          <div className="relative h-[340px] min-w-0 sm:h-[380px] print:!h-[300px]">
            <Scatter ref={scatterRef} data={scatterData} options={scatterOptions} plugins={[quadPlugin, countPlugin]} />
          </div>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>

      <ChartCard title="Total Score per Ide" subtitle="Diurutkan dari skor tertinggi · warna mengikuti kuadran">
        {hasData ? (
          <div className="relative min-w-0 print:!h-[300px]" style={{ height: barHeight }}>
            <Bar ref={barRef} data={barData} options={barOptions} plugins={[valuePlugin]} />
          </div>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>
    </div>
  );
}
