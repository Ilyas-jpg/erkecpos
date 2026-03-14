import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useStore } from "./lib/store";
import { connectRealtime } from "./lib/realtime";
import { Sidebar } from "./components/layout/Sidebar";
import { BottomNav } from "./components/layout/BottomNav";
import { ToastContainer } from "./components/layout/Toast";
import { POSPage } from "./pages/POSPage";
import { MenuManagePage } from "./pages/MenuManagePage";
import { CombosPage } from "./pages/CombosPage";
import { CampaignsPage } from "./pages/CampaignsPage";
import { AccountingPage } from "./pages/AccountingPage";
import { WastePage } from "./pages/WastePage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  const fetchAll = useStore((s) => s.fetchAll);
  const fetchProducts = useStore((s) => s.fetchProducts);
  const fetchCategories = useStore((s) => s.fetchCategories);
  const fetchCombos = useStore((s) => s.fetchCombos);
  const fetchExtras = useStore((s) => s.fetchExtras);
  const fetchSettings = useStore((s) => s.fetchSettings);
  const loading = useStore((s) => s.loading);

  useEffect(() => {
    fetchAll();

    // Connect realtime
    const es = connectRealtime({
      products: () => fetchProducts(),
      categories: () => fetchCategories(),
      combos: () => fetchCombos(),
      extras: () => fetchExtras(),
      settings: () => fetchSettings(),
    });

    return () => es.close();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🍽️</div>
          <p className="text-text-secondary">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="h-full flex">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<POSPage />} />
            <Route path="/menu" element={<MenuManagePage />} />
            <Route path="/combos" element={<CombosPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/accounting" element={<AccountingPage />} />
            <Route path="/waste" element={<WastePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
      <ToastContainer />
    </BrowserRouter>
  );
}
