import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_CATATAN,
  PRESET_IDEAS,
  QUADRANT_ORDER,
  STORAGE_KEY,
  getQuadrant,
  uid,
} from "../data/constants";

function isValidIdea(x) {
  return (
    x &&
    typeof x.nama === "string" &&
    (x.target === "Penjual" || x.target === "Pembeli") &&
    Number.isInteger(x.f) && x.f >= 1 && x.f <= 5 &&
    Number.isInteger(x.i) && x.i >= 1 && x.i <= 5
  );
}

function loadState() {
  const fallback = { ideas: [], selectedId: null, catatan: DEFAULT_CATATAN };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    const ideas = Array.isArray(data.ideas)
      ? data.ideas.filter(isValidIdea).map((x) => ({ ...x, id: x.id || uid() }))
      : [];
    return {
      ideas,
      selectedId: data.selectedId ?? null,
      catatan: typeof data.catatan === "string" ? data.catatan : DEFAULT_CATATAN,
    };
  } catch {
    return fallback;
  }
}

function makePreset() {
  return PRESET_IDEAS.map((x) => ({ ...x, id: uid() }));
}

export default function useIdeaStore() {
  const [state, setState] = useState(loadState);
  const { ideas, selectedId, catatan } = state;

  // Simpan otomatis ke LocalStorage setiap state berubah
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ideas, selectedId, catatan }));
    } catch {
      /* penyimpanan penuh / diblokir — abaikan */
    }
  }, [ideas, selectedId, catatan]);

  // Ide + total + kuadran
  const enriched = useMemo(
    () => ideas.map((x) => ({ ...x, total: x.f + x.i, q: getQuadrant(x.f, x.i) })),
    [ideas]
  );

  // Peringkat: total tertinggi dulu (urutan input dipertahankan saat seri)
  const ranking = useMemo(
    () => enriched.map((x, idx) => ({ x, idx })).sort((a, b) => b.x.total - a.x.total || a.idx - b.idx).map((r) => r.x),
    [enriched]
  );

  const counts = useMemo(() => {
    const c = Object.fromEntries(QUADRANT_ORDER.map((k) => [k, 0]));
    enriched.forEach((x) => { c[x.q] += 1; });
    return c;
  }, [enriched]);

  const stats = useMemo(() => {
    const total = enriched.length;
    const avg = total ? enriched.reduce((s, x) => s + x.total, 0) / total : 0;
    return { total, avg, counts, prioritas: counts.prioritas };
  }, [enriched, counts]);

  // Kandidat: ide di kuadran prioritas dengan total tertinggi (bisa lebih dari satu = seri)
  const topCandidates = useMemo(() => {
    const pr = enriched.filter((x) => x.q === "prioritas");
    if (!pr.length) return [];
    const max = Math.max(...pr.map((x) => x.total));
    return pr.filter((x) => x.total === max);
  }, [enriched]);

  const isTie = topCandidates.length > 1;

  const selected = useMemo(() => {
    if (!topCandidates.length) return null;
    if (topCandidates.length === 1) return topCandidates[0];
    return topCandidates.find((x) => x.id === selectedId) || null;
  }, [topCandidates, selectedId]);

  const addIdea = useCallback((data) => {
    setState((s) => ({ ...s, ideas: [...s.ideas, { ...data, id: uid() }] }));
  }, []);

  const updateIdea = useCallback((id, data) => {
    setState((s) => ({ ...s, ideas: s.ideas.map((x) => (x.id === id ? { ...x, ...data } : x)) }));
  }, []);

  const deleteIdea = useCallback((id) => {
    setState((s) => ({
      ...s,
      ideas: s.ideas.filter((x) => x.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    }));
  }, []);

  const loadPreset = useCallback(() => {
    setState((s) => ({ ...s, ideas: makePreset(), selectedId: null }));
  }, []);

  const resetAll = useCallback(() => {
    setState({ ideas: [], selectedId: null, catatan: DEFAULT_CATATAN });
  }, []);

  const setSelectedId = useCallback((id) => {
    setState((s) => ({ ...s, selectedId: id }));
  }, []);

  const setCatatan = useCallback((text) => {
    setState((s) => ({ ...s, catatan: text }));
  }, []);

  const restoreCatatan = useCallback(() => {
    setState((s) => ({ ...s, catatan: DEFAULT_CATATAN }));
  }, []);

  return {
    ideas: enriched,
    ranking,
    stats,
    counts,
    topCandidates,
    isTie,
    selected,
    selectedId,
    catatan,
    addIdea,
    updateIdea,
    deleteIdea,
    loadPreset,
    resetAll,
    setSelectedId,
    setCatatan,
    restoreCatatan,
  };
}
