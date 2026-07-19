import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { siteConfig } from "../config/site";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories?: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  darkMode,
  onToggleDarkMode,
  selectedCategory,
  onSelectCategory,
  categories = ["All"],
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [locationDetails, setLocationDetails] = useState<any>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country_name) {
          setLocationDetails({
            country: data.country_name,
            city: data.city,
            region: data.region,
            ip: data.ip
          });
        }
      })
      .catch((e) => console.error("Failed to fetch location info:", e));
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleSearchChange = (val: string) => {
    onSearchChange(val);
    // Auto-redirect to home if search is initiated from a detailed page
    if (location.pathname !== "/") {
      navigate("/");
    }
  };


  return (
    <header className="sticky top-0 z-40 w-full border-b-[0.5px] border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-brand-dark/80 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300">
      
      {/* Left section: Logo */}
      <div className="flex items-center justify-between w-full md:w-auto gap-6 shrink-0">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all duration-200 group">
          <span className="text-lg font-display font-black tracking-widest text-neutral-900 dark:text-white uppercase select-none">
            {siteConfig.name}
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
        {categories.map((category) => ({ name: category === "All" ? "Latest" : category, value: category })).map((item) => {
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

      <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
        <div className="relative flex-1 md:flex-initial max-w-xs">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-neutral-400">
            <i className="fa-solid fa-magnifying-glass text-xs"></i>
          </div>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full md:w-44 lg:w-56 pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 text-xs rounded-full focus:outline-none focus:ring-1 focus:ring-accent-coral/50 focus:border-accent-coral text-neutral-850 dark:text-neutral-200 placeholder-neutral-400 transition-all focus:w-full md:focus:w-52 lg:focus:w-64"
          />
        </div>
        <button
          onClick={onToggleDarkMode}
          className="p-2 text-neutral-650 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors rounded-full"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <i className="fa-solid fa-sun text-base"></i> : <i className="fa-solid fa-moon text-base"></i>}
        </button>
        {currentUser ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 pl-3 border-l-[0.5px] border-neutral-200 dark:border-neutral-800 focus:outline-none cursor-pointer group"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border-[0.5px] border-neutral-200 dark:border-neutral-800 shrink-0 shadow-sm group-hover:opacity-85 transition-opacity"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-neutral-850 dark:text-neutral-100 leading-tight truncate max-w-[80px] group-hover:text-accent-coral transition-colors">
                  {currentUser.name}
                </span>
                <span className="text-[9px] text-neutral-400 dark:text-neutral-550 uppercase font-bold tracking-wider leading-none">
                  {currentUser.role === "SUPER_ADMIN" ? "Admin" : "Author"}
                </span>
              </div>
              <i className={`fa-solid fa-chevron-down text-[9px] text-neutral-400 dark:text-neutral-555 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180" : ""}`}></i>
            </button>
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-48 bg-white dark:bg-brand-charcoal border-[1.5px] border-brand-dark rounded-xl shadow-[4px_4px_0px_0px_#000] py-2 z-50 animate-fade-in text-left">
                <div className="px-4 py-1.5 border-b-[0.5px] border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-205 truncate">{currentUser.name}</p>
                  <p className="text-[9px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{currentUser.role === "SUPER_ADMIN" ? "Admin" : "Author"}</p>
                </div>
                
                {/* Location details */}
                <div className="px-4 py-2 border-b-[0.5px] border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                  <div className="flex items-center gap-1.5 mb-1 text-[9px] uppercase tracking-wider text-accent-coral font-bold">
                    <i className="fa-solid fa-location-dot"></i>
                    <span>Login Session</span>
                  </div>
                  {locationDetails ? (
                    <div>
                      <p>{locationDetails.city}, {locationDetails.country}</p>
                      <p className="font-mono mt-0.5 opacity-85">{locationDetails.ip}</p>
                    </div>
                  ) : (
                    <p>Detecting location...</p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate("/editor");
                  }}
                  className="w-full px-4 py-2.5 text-xs font-semibold text-neutral-755 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <i className="fa-solid fa-pen-to-square text-neutral-500 dark:text-neutral-400"></i>
                  <span>Editor Workspace</span>
                </button>
                <div className="h-[0.5px] bg-neutral-200 dark:bg-neutral-800 my-1"></div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    localStorage.removeItem("editorUser");
                    localStorage.removeItem("authToken");
                    window.dispatchEvent(new Event("storage"));
                    setCurrentUser(null);
                    navigate("/");
                  }}
                  className="w-full px-4 py-2.5 text-xs font-bold text-red-550 hover:text-red-650 hover:bg-red-50/50 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
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
