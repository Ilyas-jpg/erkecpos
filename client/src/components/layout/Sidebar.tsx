import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useStore } from "../../lib/store";

const navItems = [
  { path: "/", icon: "🏪", label: "POS", adminOnly: false },
  { path: "/menu", icon: "📋", label: "Menü", adminOnly: true },
  { path: "/combos", icon: "📦", label: "Menüler", adminOnly: true },
  { path: "/campaigns", icon: "🎯", label: "Kampanya", adminOnly: true },
  { path: "/accounting", icon: "📊", label: "Muhasebe", adminOnly: true },
  { path: "/waste", icon: "🗑️", label: "Zayi", adminOnly: true },
  { path: "/settings", icon: "⚙️", label: "Ayarlar", adminOnly: true },
];

export function Sidebar() {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const isAdmin = useStore((s) => s.isAdmin);
  const logoutAdmin = useStore((s) => s.logoutAdmin);

  return (
    <aside className="hidden lg:flex flex-col w-[80px] bg-bg-card border-r border-border h-full">
      <div className="flex items-center justify-center h-16 border-b border-border">
        <span className="text-2xl">🍽️</span>
      </div>

      <nav className="flex-1 flex flex-col items-center gap-1 py-3 scroll-container">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all text-center gap-0.5 relative",
                isActive
                  ? "bg-accent-red/20 text-accent-red"
                  : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
              )
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            {item.adminOnly && !isAdmin && (
              <span className="absolute top-1 right-1 text-[8px]">🔒</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-1 mb-3">
        {isAdmin && (
          <button
            onClick={logoutAdmin}
            className="w-16 h-12 flex flex-col items-center justify-center rounded-xl hover:bg-accent-red/10 text-text-secondary hover:text-accent-red transition-all"
            title="Çıkış"
          >
            <span className="text-lg">🔓</span>
            <span className="text-[9px]">Çıkış</span>
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="w-16 h-12 flex items-center justify-center rounded-xl hover:bg-bg-surface text-xl"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </aside>
  );
}
