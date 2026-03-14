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
    <aside className="hidden lg:flex flex-col w-[72px] bg-bg-card border-r border-border h-full">
      <div className="flex items-center justify-center h-14 border-b border-border">
        <span className="text-xl">🍽️</span>
      </div>

      <nav className="flex-1 flex flex-col items-center gap-0.5 py-2 scroll-container">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "w-14 h-14 flex flex-col items-center justify-center transition-all text-center gap-0.5 relative",
                isActive
                  ? "bg-accent-red/15 text-accent-red"
                  : "text-text-muted hover:bg-bg-surface hover:text-text-secondary"
              )
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[9px] font-medium leading-tight tracking-wider">{item.label}</span>
            {item.adminOnly && !isAdmin && (
              <span className="absolute top-1 right-1 text-[7px] opacity-60">🔒</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-0.5 py-2 border-t border-border">
        {isAdmin && (
          <button
            onClick={logoutAdmin}
            className="w-14 h-12 flex flex-col items-center justify-center text-text-muted hover:text-accent-red transition-all"
            title="Çıkış"
          >
            <span className="text-base">🔓</span>
            <span className="text-[8px] mt-0.5">Çıkış</span>
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="w-14 h-12 flex items-center justify-center text-text-muted hover:text-text-secondary transition-all text-lg"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </aside>
  );
}
