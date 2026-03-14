import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useStore } from "../../lib/store";
import { Store, ClipboardList, BarChart3, Settings } from "lucide-react";

const navItems = [
  { path: "/", icon: Store, label: "POS", adminOnly: false },
  { path: "/menu", icon: ClipboardList, label: "Men\u00fc", adminOnly: true },
  { path: "/accounting", icon: BarChart3, label: "Muhasebe", adminOnly: true },
  { path: "/settings", icon: Settings, label: "Ayarlar", adminOnly: true },
];

export function BottomNav() {
  const isAdmin = useStore((s) => s.isAdmin);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-card/80 backdrop-blur-2xl border-t border-white/[0.08] z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-[52px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 min-w-[56px] relative transition-all",
                  isActive ? "text-accent-blue" : "text-text-secondary"
                )
              }
            >
              <Icon className="w-[22px] h-[22px]" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.adminOnly && !isAdmin && (
                <span className="absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-accent-amber" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
