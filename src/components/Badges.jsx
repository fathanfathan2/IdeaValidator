import { QUADRANTS } from "../data/constants";

export function QuadBadge({ q, className = "" }) {
  const cfg = QUADRANTS[q];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${cfg.badge} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function TargetBadge({ target }) {
  const seller = target === "Penjual";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
        seller
          ? "bg-slate-100 text-slate-700 ring-slate-500/20"
          : "bg-white text-slate-600 ring-slate-300"
      }`}
    >
      {target}
    </span>
  );
}
