import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useStore } from "../../lib/store";

const navItems = [
  { path: "/", icon: "🏪", label: "POS", adminOnly: false },
  { path: "/menu", icon: "📋", label: "Menü", adminOnly: true },
  { path: "/accounting", icon: "📊", label: "Muhasebe", adminOnly: true },
  { path: "/settings", icon: "⚙️", label: "Ayarlar", adminOnly: true },
];

export function BottomNav() {
  const isAdmin = useStore((s) => s.isAdmin);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg min-w-[56px] min-h-[48px] relative",
                isActive
                  ? "text-accent-red"
                  : "text-text-secondary"
              )
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.adminOnly && !isAdmin && (
              <span className="absolute -top-0.5 -right-0.5 text-[8px]">🔒</span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
