import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useStore } from "../../lib/store";
import { Store, ClipboardList, BarChart3, Settings } from "lucide-react";

const navItems = [
  { path: "/", icon: Store, label: "POS", adminOnly: false },
  { path: "/menu", icon: ClipboardList, label: "Menü", adminOnly: true },
  { path: "/accounting", icon: BarChart3, label: "Muhasebe", adminOnly: true },
  { path: "/settings", icon: Settings, label: "Ayarlar", adminOnly: true },
];

export function BottomNav() {
  const isAdmin = useStore((s) => s.isAdmin);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 vibrancy-bar border-t border-separator z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-[49px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-[2px] px-4 py-1 min-w-[56px] relative transition-colors",
                  isActive ? "text-accent-blue" : "text-text-muted"
                )
              }
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={isAdmin ? 1.8 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.adminOnly && !isAdmin && (
                <span className="absolute top-0.5 right-2 w-[5px] h-[5px] rounded-full bg-accent-orange" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
