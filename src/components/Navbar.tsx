import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  darkMode,
  onToggleDarkMode,
  selectedCategory,
  onSelectCategory,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem("editorUser");
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => {
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  const handleSearchChange = (val: string) => {
    onSearchChange(val);
    // Auto-redirect to home if search is initiated from a detailed page
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const handleWriteClick = () => {
    if (currentUser) {
      navigate("/editor");
    } else {
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-[0.5px] border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-brand-dark/80 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300">
      
      {/* Left section: Logo */}
      <div className="flex items-center justify-between w-full md:w-auto gap-6 shrink-0">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all duration-200 group">
          <span className="text-sm font-display font-black tracking-widest text-neutral-500 dark:text-neutral-400 uppercase select-none">
            THE CANVES BLOG.
          </span>
        </Link>
        
        {/* Mobile menu toggle or controls */}
        <div className="flex items-center md:hidden gap-3">
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 text-neutral-600 dark:text-neutral-450 text-sm"
          >
            {darkMode ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
          </button>
        </div>
      </div>

      {/* Center Section: Editorial Categories Navigation */}
      <nav className="flex items-center gap-5 overflow-x-auto max-w-full pb-1 md:pb-0 font-display text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-neutral-500 dark:text-neutral-450 shrink-0 thin-scrollbar">
        {[
          { name: "Latest", value: "All" },
          { name: "Trending", value: "Trending" },
          { name: "Art", value: "Art" },
          { name: "Design", value: "Design" },
          { name: "Music", value: "Music" },
          { name: "Podcast", value: "Podcast" }
        ].map((item) => {
          const isActive =
            item.value === "Trending"
              ? selectedCategory === "Trending"
              : selectedCategory === item.value;
          return (
            <button
              key={item.name}
              onClick={() => {
                onSelectCategory(item.value);
                if (location.pathname !== "/") {
                  navigate("/");
                }
              }}
              className={`hover:text-accent-coral transition-colors cursor-pointer ${
                isActive ? "text-accent-coral underline underline-offset-4 decoration-2" : ""
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Right section: Search & CTA Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
        
        {/* Search Input */}
        <div className="relative flex-1 md:flex-initial max-w-xs">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
            <i className="fa-solid fa-magnifying-glass text-xs"></i>
          </div>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full md:w-44 lg:w-56 pl-9 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 text-xs rounded-full focus:outline-none focus:ring-1 focus:ring-accent-coral/50 focus:border-accent-coral text-neutral-850 dark:text-neutral-200 placeholder-neutral-400 transition-all focus:w-full md:focus:w-52 lg:focus:w-64"
          />
        </div>

        {/* New Button */}
        <button
          onClick={() => navigate("/ai-writer")}
          className="hidden lg:flex items-center gap-1 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 border-[0.5px] border-neutral-200 dark:border-neutral-800 text-[10px] font-bold uppercase tracking-wider rounded-full text-neutral-750 dark:text-neutral-350 transition-colors cursor-pointer"
          title="Open AI Writer Playground"
        >
          <span>AI Writer</span>
          <span className="w-1.5 h-1.5 bg-accent-coral rounded-full animate-pulse"></span>
        </button>

        {/* Language selector */}
        <button className="p-2 text-neutral-650 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors rounded-full" title="Language">
          <i className="fa-solid fa-globe text-base"></i>
        </button>

        {/* Create post button */}
        <button
          onClick={handleWriteClick}
          className="p-2 text-neutral-650 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors rounded-full"
          title="Write article"
        >
          <i className="fa-solid fa-pen-to-square text-base"></i>
        </button>

        {/* Notifications */}
        <button className="p-2 text-neutral-655 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors rounded-full relative" title="Notifications">
          <i className="fa-solid fa-bell text-base"></i>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-brand-dark"></span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 text-neutral-650 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors rounded-full"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <i className="fa-solid fa-sun text-base"></i> : <i className="fa-solid fa-moon text-base"></i>}
        </button>

        {/* Profile / Login Status Badge */}
        {currentUser ? (
          <div className="flex items-center gap-3 pl-3 border-l-[0.5px] border-neutral-200 dark:border-neutral-800">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border-[0.5px] border-neutral-200 dark:border-neutral-800 shrink-0 shadow-sm"
              title={`${currentUser.name} (${currentUser.role})`}
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-neutral-850 dark:text-neutral-100 leading-tight truncate max-w-[80px]">
                {currentUser.name}
              </span>
              <span className="text-[9px] text-neutral-400 dark:text-neutral-550 uppercase font-bold tracking-wider leading-none">
                {currentUser.role === "super_admin" ? "Admin" : "Author"}
              </span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("editorUser");
                localStorage.removeItem("authToken");
                window.dispatchEvent(new Event("storage"));
                setCurrentUser(null);
                navigate("/");
              }}
              className="p-2 text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-500 transition-colors rounded-full cursor-pointer"
              title="Logout"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i>
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="p-2 text-neutral-650 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-150 transition-colors rounded-full cursor-pointer"
            title="Editor Sign In"
          >
            <i className="fa-solid fa-user-lock text-sm"></i>
          </button>
        )}
      </div>
    </header>
  );
};
export default Navbar;
