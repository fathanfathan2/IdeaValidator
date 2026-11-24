// ====== Konstanta & helper IdeaValidator (LKPD 6 — Kelompok 3 · XI PPLG 2) ======

export const STORAGE_KEY = "lkpd6_kelompok3";
export const APP_NAME = "IdeaValidator";
export const APP_TAGLINE = "Matriks Prioritas Feasibility vs Impact";
export const STUDI_KASUS = "E-Commerce Sepatu Wanita";
export const KELOMPOK = "Kelompok 3 · XI PPLG 2";
export const LKPD_TITLE = "LKPD 6 — Validitas Ide Menggunakan Logika Quadran";
export const ANGGOTA = [
  "Anggun Permatasari",
  "Muhammad Fathan Ali Khalifah",
  "Putri Aprilia",
  "Siti Nur Shakila",
];

// Nilai 4–5 = Tinggi, 1–3 = Rendah
export const BATAS_TINGGI = 4;
// Garis pembatas kuadran pada grafik scatter (di antara 3 dan 4)
export const BATAS_GARIS = 3.5;

export const SKALA = {
  1: "Sangat Rendah",
  2: "Rendah",
  3: "Sedang",
  4: "Tinggi",
  5: "Sangat Tinggi",
};

export const DEFAULT_CATATAN =
  "Dipilih karena selaras dengan User Persona utama kelompok (Muhamad Rafi Fauzhan, penjual sepatu wanita online) yang paling terdampak kenaikan biaya admin marketplace 20–30% dan PPh, sehingga berdampak langsung menjaga margin keuntungan usaha.";

export const PRESET_IDEAS = [
  { nama: "Transparent Fee & Net Profit Calculator", target: "Penjual", f: 5, i: 5 },
  { nama: "Transparent Checkout Breakdown", target: "Pembeli", f: 5, i: 5 },
  { nama: "Smart Packaging Proof / Bukti Kemasan Aman", target: "Penjual", f: 5, i: 4 },
  { nama: "Auto-Sync Stock & Variant Guard", target: "Penjual", f: 4, i: 4 },
  { nama: "Live Package Condition Tracking", target: "Pembeli", f: 4, i: 4 },
  { nama: "Policy & Traffic Radar Alert", target: "Penjual", f: 4, i: 3 },
  { nama: "Pre-Checkout Cek Ongkir Luar Jawa Akurat", target: "Pembeli", f: 4, i: 3 },
  { nama: "Real-Time Variant Stock Badge", target: "Pembeli", f: 4, i: 3 },
  { nama: "1-Click Smart Return & Instant Resi", target: "Pembeli", f: 2, i: 4 },
  { nama: "Fast-Fund Escrow / Dana Talangan Kilat", target: "Penjual", f: 2, i: 5 },
];

// Urutan kuadran untuk tampilan
export const QUADRANT_ORDER = ["prioritas", "potensi", "pertimbangkan", "tunda"];

// color = warna grafik, dark = versi lebih gelap. Kelas Tailwind ditulis lengkap agar tidak ter-purge.
export const QUADRANTS = {
  prioritas: {
    key: "prioritas",
    label: "PRIORITAS UTAMA",
    desc: "Feasibility tinggi · Impact tinggi",
    color: "#14b8a6",
    dark: "#0d9488",
    badge: "bg-teal-50 text-teal-700 ring-teal-600/20",
    dot: "bg-teal-500",
    text: "text-teal-600",
    soft: "bg-teal-50",
    bar: "bg-teal-500",
    border: "border-teal-200 hover:border-teal-400",
  },
  potensi: {
    key: "potensi",
    label: "POTENSI",
    desc: "Feasibility rendah · Impact tinggi",
    color: "#ec4899",
    dark: "#e11d48",
    badge: "bg-rose-50 text-rose-700 ring-rose-600/20",
    dot: "bg-rose-500",
    text: "text-rose-600",
    soft: "bg-rose-50",
    bar: "bg-rose-500",
    border: "border-rose-200 hover:border-rose-400",
  },
  pertimbangkan: {
    key: "pertimbangkan",
    label: "PERTIMBANGKAN",
    desc: "Feasibility tinggi · Impact rendah",
    color: "#f59e0b",
    dark: "#d97706",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
    text: "text-amber-600",
    soft: "bg-amber-50",
    bar: "bg-amber-500",
    border: "border-amber-200 hover:border-amber-400",
  },
  tunda: {
    key: "tunda",
    label: "TUNDA",
    desc: "Feasibility rendah · Impact rendah",
    color: "#94a3b8",
    dark: "#64748b",
    badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
    dot: "bg-slate-400",
    text: "text-slate-500",
    soft: "bg-slate-100",
    bar: "bg-slate-400",
    border: "border-slate-200 hover:border-slate-400",
  },
};

// Menentukan kuadran berdasarkan aturan LKPD 6
export function getQuadrant(f, i) {
  const fT = f >= BATAS_TINGGI;
  const iT = i >= BATAS_TINGGI;
  if (fT && iT) return "prioritas";
  if (!fT && iT) return "potensi";
  if (fT && !iT) return "pertimbangkan";
  return "tunda";
}

export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function joinNames(list) {
  const names = list.map((x) => `“${x.nama}”`);
  if (names.length <= 1) return names.join("");
  if (names.length === 2) return `${names[0]} dan ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, dan ${names[names.length - 1]}`;
}

// Alasan otomatis berbasis data untuk ide terpilih
export function buildReason(selected, topCandidates, totalIdeas) {
  if (!selected) return "";
  const tie = topCandidates.length > 1;
  let text =
    `“${selected.nama}” berada di kuadran ${QUADRANTS.prioritas.label} dengan Feasibility ${selected.f} (${SKALA[selected.f]}) ` +
    `dan Impact ${selected.i} (${SKALA[selected.i]}), sehingga total skornya ${selected.total}/10 — ` +
    `tertinggi di antara ${totalIdeas} ide yang divalidasi untuk target ${selected.target.toLowerCase()}.`;
  if (tie) {
    const others = topCandidates.filter((x) => x.id !== selected.id);
    text +=
      ` Terdapat ${topCandidates.length} ide dengan skor tertinggi yang sama (${selected.total}/10), yaitu ${joinNames(topCandidates)}. ` +
      `Karena seri, kelompok memutuskan melalui pertimbangan bersama dan menetapkan “${selected.nama}” sebagai keputusan final` +
      (others.length ? `, sedangkan ${joinNames(others)} menjadi alternatif berikutnya.` : ".");
  }
  return text;
}

// Kesimpulan untuk laporan
export function buildConclusion({ total, counts, selected, topCandidates }) {
  if (!total) {
    return "Belum ada ide yang divalidasi. Tambahkan ide atau muat 10 ide preset LKPD 5 untuk melihat kesimpulan.";
  }
  const prio = counts.prioritas || 0;
  const head = `Dari ${total} ide yang divalidasi, ${prio} ide masuk kuadran ${QUADRANTS.prioritas.label}. `;
  if (!topCandidates.length) {
    return head + "Belum ada ide yang memenuhi syarat Feasibility ≥ 4 dan Impact ≥ 4, sehingga belum ada ide yang dapat ditetapkan sebagai keputusan final.";
  }
  if (!selected) {
    return (
      head +
      `Terdapat ${topCandidates.length} ide dengan skor tertinggi yang sama (${topCandidates[0].total}/10): ${joinNames(topCandidates)}. Keputusan final belum ditetapkan oleh kelompok.`
    );
  }
  return head + buildReason(selected, topCandidates, total);
}
