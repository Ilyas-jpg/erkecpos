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
    <aside className="hidden lg:flex flex-col w-[72px] vibrancy-sidebar border-r border-white/[0.04] h-full">
      <div className="flex items-center justify-center h-[52px]">
        <div className="w-8 h-8 rounded-[8px] bg-accent-blue flex items-center justify-center shadow-[0_2px_8px_rgba(10,132,255,0.3)]">
          <Store className="w-4 h-4 text-white" />
        </div>
      </div>

      <nav className="flex-1 flex flex-col items-center gap-0.5 py-2 scroll-container px-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "w-full py-2 flex flex-col items-center justify-center rounded-[10px] transition-all text-center gap-0.5 relative",
                  isActive
                    ? "bg-accent-blue/10 text-accent-blue/90"
                    : "text-white/30 hover:bg-white/[0.04] hover:text-white/50"
                )
              }
            >
              <Icon className="w-[20px] h-[20px]" strokeWidth={1.8} />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              {item.adminOnly && !isAdmin && (
                <span className="absolute top-1 right-1.5 w-[6px] h-[6px] rounded-full bg-accent-orange" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-0.5 py-2 border-t border-separator px-1.5">
        {isAdmin && (
          <button
            onClick={logoutAdmin}
            className="w-full py-2 flex flex-col items-center justify-center rounded-[10px] text-text-muted hover:text-accent-red hover:bg-accent-red/8 transition-all"
            title="Çıkış"
          >
            <LogOut className="w-[20px] h-[20px]" strokeWidth={1.8} />
            <span className="text-[9px] mt-0.5">Çıkış</span>
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="w-full py-2 flex items-center justify-center rounded-[10px] text-text-muted hover:bg-fill-quaternary transition-all"
        >
          {theme === "dark" ? <Sun className="w-[20px] h-[20px]" strokeWidth={1.8} /> : <Moon className="w-[20px] h-[20px]" strokeWidth={1.8} />}
        </button>
      </div>
    </aside>
  );
}
