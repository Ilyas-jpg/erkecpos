import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useStore } from "../../lib/store";
import { Store, ClipboardList, Package, Target, BarChart3, Trash2, Settings, LogOut, Sun, Moon } from "lucide-react";

const navItems = [
  { path: "/", icon: Store, label: "POS", adminOnly: false },
  { path: "/menu", icon: ClipboardList, label: "Men\u00fc", adminOnly: true },
  { path: "/combos", icon: Package, label: "Men\u00fcler", adminOnly: true },
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
    <aside className="hidden lg:flex flex-col w-[76px] bg-bg-card/50 backdrop-blur-xl border-r border-white/[0.06] h-full">
      <div className="flex items-center justify-center h-14 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-accent-blue flex items-center justify-center">
          <Store className="w-4 h-4 text-white" />
        </div>
      </div>

      <nav className="flex-1 flex flex-col items-center gap-1 py-3 scroll-container">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all text-center gap-1 relative",
                  isActive
                    ? "bg-accent-blue/15 text-accent-blue"
                    : "text-text-secondary hover:bg-white/[0.06] hover:text-text-primary"
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              {item.adminOnly && !isAdmin && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-amber" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-1 py-3 border-t border-white/[0.06]">
        {isAdmin && (
          <button
            onClick={logoutAdmin}
            className="w-14 h-12 flex flex-col items-center justify-center rounded-xl text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-all"
            title="\u00c7\u0131k\u0131\u015f"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[9px] mt-0.5">\u00c7\u0131k\u0131\u015f</span>
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="w-14 h-12 flex items-center justify-center rounded-xl text-text-secondary hover:bg-white/[0.06] transition-all"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
