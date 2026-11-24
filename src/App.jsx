import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import Navbar from "./components/Navbar";
import IdeaModal from "./components/IdeaModal";
import useIdeaStore from "./hooks/useIdeaStore";
import DashboardView from "./views/DashboardView";
import ManageView from "./views/ManageView";
import DecisionView from "./views/DecisionView";
import ReportView from "./views/ReportView";

export default function App() {
  const store = useIdeaStore();
  const [tab, setTab] = useState("dashboard");
  const [filter, setFilter] = useState("semua");
  const [modal, setModal] = useState(null); // null | { idea: null | object }
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const notify = useCallback((message) => {
    setToast({ message, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Pindah tab selalu kembali ke atas halaman
  const goTab = useCallback((id) => {
    setTab(id);
    window.scrollTo({ top: 0 });
  }, []);

  // Klik kartu kuadran di Dashboard → buka Kelola Ide dengan filter aktif
  const goManage = useCallback(
    (quadrant) => {
      setFilter(quadrant);
      goTab("kelola");
    },
    [goTab]
  );

  const handlePrint = useCallback(() => {
    if (tab === "laporan") {
      window.print();
    } else {
      goTab("laporan");
      setTimeout(() => window.print(), 900);
    }
  }, [tab, goTab]);

  const openAdd = useCallback(() => setModal({ idea: null }), []);
  const openEdit = useCallback((idea) => setModal({ idea }), []);
  const closeModal = useCallback(() => setModal(null), []);

  const saveIdea = (data, id) => {
    if (id) {
      store.updateIdea(id, data);
      notify("Perubahan ide disimpan");
    } else {
      store.addIdea(data);
      notify("Ide baru ditambahkan");
    }
    closeModal();
  };

  const views = {
    dashboard: (
      <DashboardView
        store={store}
        onGoManage={goManage}
        onGoDecision={() => goTab("keputusan")}
        onAdd={openAdd}
      />
    ),
    kelola: (
      <ManageView
        store={store}
        filter={filter}
        onFilter={setFilter}
        onAdd={openAdd}
        onEdit={openEdit}
        notify={notify}
      />
    ),
    keputusan: <DecisionView store={store} onAdd={openAdd} notify={notify} />,
    laporan: <ReportView store={store} />,
  };

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <Navbar tab={tab} onTab={goTab} ideaCount={store.ideas.length} onAdd={openAdd} onPrint={handlePrint} />

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 md:pb-12 print:max-w-none print:p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {views[tab]}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {modal && <IdeaModal key={modal.idea?.id ?? "new"} idea={modal.idea} onClose={closeModal} onSave={saveIdea} />}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 md:bottom-6 print:hidden"
            role="status"
          >
            <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl">
              <HiOutlineCheckCircle className="h-5 w-5 text-teal-400" />
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
