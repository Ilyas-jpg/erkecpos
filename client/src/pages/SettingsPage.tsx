import { useState, useEffect } from "react";
import { useStore } from "../lib/store";
import { api } from "../lib/api";
import { Button } from "../components/shared/Button";
import { Toggle } from "../components/shared/Toggle";
import { TopBar } from "../components/layout/TopBar";

export function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const fetchSettings = useStore((s) => s.fetchSettings);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const addToast = useStore((s) => s.addToast);

  const [serviceEnabled, setServiceEnabled] = useState(true);
  const [serviceValue, setServiceValue] = useState(10);
  const [taxRate, setTaxRate] = useState(10);
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessTaxId, setBusinessTaxId] = useState("");
  const [dailyTarget, setDailyTarget] = useState(10000);
  const [adminPin, setAdminPin] = useState("123456");

  useEffect(() => {
    if (settings) {
      setAdminPin((settings as any).admin_pin?.pin ?? "123456");
      setServiceEnabled(settings.service_charge?.enabled ?? true);
      setServiceValue(settings.service_charge?.value ?? 10);
      setTaxRate(settings.tax_rate?.rate ?? 10);
      setBusinessName(settings.business_info?.name ?? "");
      setBusinessAddress(settings.business_info?.address ?? "");
      setBusinessPhone(settings.business_info?.phone ?? "");
      setBusinessTaxId(settings.business_info?.tax_id ?? "");
      setDailyTarget(settings.daily_target?.amount ?? 10000);
    }
  }, [settings]);

  const save = async (key: string, value: any) => {
    try {
      await api.put(`/api/settings/${key}`, { value });
      addToast("Ayar kaydedildi");
      await fetchSettings();
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  const inputClass = "w-full bg-bg-surface border border-border px-4 py-3 text-sm min-h-[48px] text-text-primary placeholder:text-text-muted transition-all";
  const inputMonoClass = inputClass + " font-mono";

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Ayarlar" />

      <div className="flex-1 overflow-y-auto scroll-container p-5 max-w-2xl">
        <div className="space-y-5">
          {/* Theme */}
          <section className="bg-bg-card border border-border p-5">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-4">Tema</h3>
            <Toggle checked={theme === "light"} onChange={toggleTheme} label={theme === "dark" ? "Koyu Tema" : "Açık Tema"} />
          </section>

          {/* Service Charge */}
          <section className="bg-bg-card border border-border p-5">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-4">Servis Ücreti</h3>
            <Toggle checked={serviceEnabled} onChange={(v) => setServiceEnabled(v)} label="Aktif" />
            <div className="mt-3">
              <label className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5 block">Oran (%)</label>
              <input type="number" value={serviceValue} onChange={(e) => setServiceValue(Number(e.target.value))}
                className={inputMonoClass} />
            </div>
            <Button variant="secondary" className="mt-4 w-full" onClick={() => save("service_charge", {
              enabled: serviceEnabled, type: "percent", value: serviceValue, label: "Servis Ücreti"
            })}>Kaydet</Button>
          </section>

          {/* Tax Rate */}
          <section className="bg-bg-card border border-border p-5">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-4">KDV</h3>
            <div>
              <label className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5 block">Oran (%)</label>
              <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))}
                className={inputMonoClass} />
            </div>
            <Button variant="secondary" className="mt-4 w-full" onClick={() => save("tax_rate", { rate: taxRate, label: "KDV" })}>
              Kaydet
            </Button>
          </section>

          {/* Business Info */}
          <section className="bg-bg-card border border-border p-5">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-4">İşletme Bilgileri</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5 block">İşletme Adı</label>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="İşletme adı" className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5 block">Adres</label>
                <input value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="Adres" className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5 block">Telefon</label>
                <input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="Telefon" className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5 block">Vergi No</label>
                <input value={businessTaxId} onChange={(e) => setBusinessTaxId(e.target.value)} placeholder="Vergi No" className={inputClass} />
              </div>
            </div>
            <Button variant="secondary" className="mt-4 w-full" onClick={() => save("business_info", {
              name: businessName, address: businessAddress, phone: businessPhone, tax_id: businessTaxId,
            })}>Kaydet</Button>
          </section>

          {/* Admin PIN */}
          <section className="bg-bg-card border border-border p-5">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-2">Yönetim PIN Kodu</h3>
            <p className="text-[10px] text-text-muted mb-4">Yönetim paneline erişim için kullanılan PIN. Varsayılan: 123456</p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ""))}
              placeholder="PIN kodu (4-8 haneli)"
              className={inputMonoClass + " tracking-[0.4em] text-center text-lg"}
            />
            <Button variant="secondary" className="mt-4 w-full" onClick={() => save("admin_pin", { pin: adminPin })}>
              PIN Kaydet
            </Button>
          </section>

          {/* Daily Target */}
          <section className="bg-bg-card border border-border p-5 mb-20">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-4">Günlük Hedef</h3>
            <input type="number" value={dailyTarget} onChange={(e) => setDailyTarget(Number(e.target.value))}
              className={inputMonoClass} />
            <Button variant="secondary" className="mt-4 w-full" onClick={() => save("daily_target", { amount: dailyTarget })}>
              Kaydet
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
