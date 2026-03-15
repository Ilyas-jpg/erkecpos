import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useStore } from "../../lib/store";
import { Store, ClipboardList, Package, Target, BarChart3, Trash2, Settings, LogOut, Sun, Moon } from "lucide-react";

const navItems = [
  { path: "/", icon: Store, label: "POS", adminOnly: false },
  { path: "/menu", icon: ClipboardList, label: "Menü", adminOnly: true },
  { path: "/combos", icon: Package, label: "Menüler", adminOnly: true },
  { path: "/campaigns", icon: Target, label: "Kampanya", adminOnly: true },
  { path: "/accounting", icon: BarChart3, label: "Muhasebe", adminOnly: true },
  { path: "/waste", icon: Trash2, label: "Zayi", adminOnly: true },
  { path: "/settings", icon: Settings, label: "Ayarlar", adminOnly: true },
];

export function Sidebar() {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const isAdmin = useStore((s) => s.isAdmin);
  const logoutAdmin = useStore((s) => s.logoutAdmin);

  return (
    <aside className="hidden lg:flex flex-col w-[76px] vibrancy-sidebar border-r border-separator h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-[56px] shrink-0">
        <div className="w-[34px] h-[34px] rounded-[10px] bg-accent-blue flex items-center justify-center shadow-[0_2px_10px_rgba(10,132,255,0.35)]">
          <Store className="w-[17px] h-[17px] text-white" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1 py-2 scroll-container px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "w-full min-h-[48px] py-1.5 flex flex-col items-center justify-center rounded-[12px] transition-all text-center gap-[3px] relative",
                  isActive
                    ? "bg-accent-blue/12 text-accent-blue"
                    : "text-text-muted hover:bg-fill-quaternary hover:text-text-secondary"
                )
              }
            >
              <Icon className="w-[21px] h-[21px]" strokeWidth={1.7} />
              <span className="text-[10px] font-medium leading-none tracking-[-0.01em]">{item.label}</span>
              {item.adminOnly && !isAdmin && (
                <span className="absolute top-1.5 right-2 w-[6px] h-[6px] rounded-full bg-accent-orange" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-1 py-3 border-t border-separator px-2 shrink-0">
        {isAdmin && (
          <button
            onClick={logoutAdmin}
            className="w-full min-h-[44px] py-1.5 flex flex-col items-center justify-center rounded-[12px] text-text-muted hover:text-accent-red hover:bg-accent-red/10 transition-all gap-[3px]"
            title="Çıkış"
          >
            <LogOut className="w-[20px] h-[20px]" strokeWidth={1.7} />
            <span className="text-[10px] font-medium leading-none">Çıkış</span>
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="w-full min-h-[44px] flex items-center justify-center rounded-[12px] text-text-muted hover:bg-fill-quaternary hover:text-text-secondary transition-all"
        >
          {theme === "dark" ? <Sun className="w-[20px] h-[20px]" strokeWidth={1.7} /> : <Moon className="w-[20px] h-[20px]" strokeWidth={1.7} />}
        </button>
      </div>
    </aside>
  );
}
