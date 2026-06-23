import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  darkMode,
  onToggleDarkMode,
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
    <header className="w-full border-b-[0.5px] border-neutral-200 dark:border-neutral-800 bg-white dark:bg-brand-dark px-6 py-4 flex items-center justify-between transition-colors duration-300">
      {/* Left section: Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="text-3xl font-display font-black tracking-tighter hover:opacity-80 transition-opacity">
          SSPeech
        </Link>
      </div>

      {/* Center section: Search Bar */}
      <div className="flex-1 max-w-lg mx-8 relative hidden md:block">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>
        <input
          type="text"
          placeholder="Search articles, categories, authors..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-accent-purple/50 focus:border-accent-purple text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-600 transition-all"
        />
      </div>

      {/* Right section: CTA Actions */}
      <div className="flex items-center gap-4">
        {/* Mobile Search Input */}
        <div className="md:hidden relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-32 px-3 py-1 bg-neutral-50 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 text-xs rounded-full focus:outline-none text-neutral-800 dark:text-neutral-200 transition-all focus:w-44"
          />
        </div>

        {/* New Button */}
        <button className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 border-[0.5px] border-neutral-200 dark:border-neutral-800 text-xs font-semibold rounded-full text-neutral-800 dark:text-neutral-200 transition-colors">
          <span>New</span>
          <span className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-pulse"></span>
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
