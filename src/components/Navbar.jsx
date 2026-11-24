import { motion } from "framer-motion";
import {
  HiOutlineDocumentText,
  HiOutlineLightBulb,
  HiOutlinePlus,
  HiOutlinePrinter,
  HiOutlineSquares2X2,
  HiOutlineTableCells,
  HiOutlineTrophy,
} from "react-icons/hi2";
import { APP_NAME, KELOMPOK } from "../data/constants";

export const TABS = [
  { id: "dashboard", label: "Dashboard", icon: HiOutlineSquares2X2 },
  { id: "kelola", label: "Kelola Ide", icon: HiOutlineTableCells },
  { id: "keputusan", label: "Keputusan", icon: HiOutlineTrophy },
  { id: "laporan", label: "Laporan", icon: HiOutlineDocumentText },
];

export default function Navbar({ tab, onTab, ideaCount, onAdd, onPrint }) {
  return (
    <>
      {/* ===== Top navbar (glassmorphic, sticky) ===== */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Kiri: logo */}
          <button
            onClick={() => onTab("dashboard")}
            className="flex items-center gap-3 rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label="Ke Dashboard"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-sm shadow-teal-600/30">
              <HiOutlineLightBulb className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-bold tracking-tight text-slate-900">
                {APP_NAME}
              </span>
              <span className="block text-[11px] font-medium text-slate-500">{KELOMPOK}</span>
            </span>
          </button>

          {/* Tengah: segmented pill (desktop) */}
          <nav
            className="hidden items-center gap-1 rounded-2xl bg-slate-100 p-1 md:flex"
            aria-label="Navigasi utama"
          >
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onTab(t.id)}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                    active ? "text-teal-700" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill-desktop"
                      className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <t.icon className="h-4 w-4" />
                    {t.label}
                    {t.id === "kelola" && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                          active ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {ideaCount}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Kanan: aksi */}
          <div className="flex items-center gap-2">
            <button onClick={onAdd} className="btn-primary !px-3.5 !py-2">
              <HiOutlinePlus className="h-4 w-4" />
              <span className="hidden sm:inline">Tambah Ide</span>
              <span className="sm:hidden">Ide</span>
            </button>
            <button
              onClick={onPrint}
              className="btn-soft !px-2.5 !py-2"
              aria-label="Cetak PDF"
              title="Cetak PDF"
            >
              <HiOutlinePrinter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ===== Floating bottom navigation (mobile) ===== */}
      <nav
        className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-slate-200 bg-white/85 p-1.5 shadow-lg shadow-slate-900/10 backdrop-blur-md md:hidden print:hidden"
        style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
        aria-label="Navigasi bawah"
      >
        <ul className="grid grid-cols-4 gap-1">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <li key={t.id}>
                <button
                  onClick={() => onTab(t.id)}
                  className={`relative flex w-full flex-col items-center gap-0.5 rounded-xl py-2 text-[10.5px] font-semibold transition-colors ${
                    active ? "text-teal-700" : "text-slate-500"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill-mobile"
                      className="absolute inset-0 rounded-xl bg-teal-50 ring-1 ring-teal-600/15"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10 flex flex-col items-center gap-0.5">
                    <span className="relative">
                      <t.icon className="h-5 w-5" />
                      {t.id === "kelola" && ideaCount > 0 && (
                        <span className="absolute -right-2.5 -top-1.5 min-w-[16px] rounded-full bg-rose-500 px-1 text-center text-[9px] font-bold leading-4 text-white">
                          {ideaCount}
                        </span>
                      )}
                    </span>
                    {t.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
