import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useStore } from "../../lib/store";

const navItems = [
  { path: "/", icon: "🏪", label: "POS" },
  { path: "/menu", icon: "📋", label: "Menü" },
  { path: "/combos", icon: "📦", label: "Menüler" },
  { path: "/campaigns", icon: "🎯", label: "Kampanya" },
  { path: "/accounting", icon: "📊", label: "Muhasebe" },
  { path: "/waste", icon: "🗑️", label: "Zayi" },
  { path: "/settings", icon: "⚙️", label: "Ayarlar" },
];

export function Sidebar() {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);

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
                "w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all text-center gap-0.5",
                isActive
                  ? "bg-accent-red/20 text-accent-red"
                  : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
              )
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium leading-tight">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={toggleTheme}
        className="w-16 h-16 mx-auto mb-3 flex items-center justify-center rounded-xl hover:bg-bg-surface text-xl"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
    </aside>
  );
}
