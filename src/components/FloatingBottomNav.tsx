import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Newspaper, PenTool, LayoutDashboard, Sparkles } from "lucide-react";

export const FloatingBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      name: "Feed",
      path: "/",
      icon: Newspaper,
    },
    {
      name: "AI Writer",
      path: "/ai-writer",
      icon: PenTool,
    },
    {
      name: "Editor",
      path: "/editor",
      icon: LayoutDashboard,
    },
    {
      name: "Showcase",
      path: "/animation-showcase",
      icon: Sparkles,
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-2 bg-white/70 dark:bg-neutral-900/85 backdrop-blur-lg border border-neutral-200/50 dark:border-neutral-800/40 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
              isActive
                ? "bg-[var(--color-sage-light)] text-[var(--color-sage-dark)] shadow-sm scale-105"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30"
            }`}
          >
            <Icon
              className={`w-4 h-4 transition-colors ${
                isActive
                  ? "stroke-[var(--color-sage-dark)]"
                  : "stroke-neutral-500 dark:stroke-neutral-400 group-hover:stroke-neutral-900 dark:group-hover:stroke-white"
              }`}
              strokeWidth={1.75}
            />
            <span className="hidden sm:inline">{item.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default FloatingBottomNav;
