import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  categories = ["All"],
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryClick = (category: string) => {
    onSelectCategory(category);
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <aside className="w-full md:w-48 shrink-0 md:border-r-[0.5px] border-neutral-200 dark:border-neutral-800 p-6 flex flex-col justify-between transition-colors duration-300">
      <div>
        <h2 className="text-sm font-sans font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-6">
          Categories
        </h2>
        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 thin-scrollbar">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`text-left px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-900"
                }`}
              >
                {category}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="hidden md:block border-t-[0.5px] border-neutral-200 dark:border-neutral-800 pt-6 mt-8">
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-sans leading-relaxed">
          © 2026 THE CANVES. Inspired by classic Swiss print design and luxury digital publishing standards.
        </p>
      </div>
    </aside>
  );
};
export default Sidebar;
