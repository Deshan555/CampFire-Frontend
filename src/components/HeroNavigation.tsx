import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X, Globe } from "lucide-react";

interface HeroNavigationProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user?: any;
  onLogout?: () => void;
}

const HeroNavigation: React.FC<HeroNavigationProps> = ({
  searchQuery,
  onSearchChange,
  user,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="w-full absolute top-0 left-0 z-50">
      <nav className="w-full px-8 py-4 flex items-center justify-between text-white bg-black/20 backdrop-blur-xl border-b border-white/10">
      {/* Left: Logo & Links */}
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-sans font-bold tracking-tight">
          <div className="w-6 h-6 bg-white text-black flex items-center justify-center rounded-[6px] font-black text-sm">C</div>
          CampFire
        </Link>
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-white/90">
          <Link to="#" className="hover:text-white transition-colors">Hotel</Link>
          <Link to="#" className="hover:text-white transition-colors">Flight</Link>
          <Link to="#" className="hover:text-white transition-colors">Train</Link>
          <Link to="#" className="hover:text-white transition-colors">Travel</Link>
          <Link to="#" className="hover:text-white transition-colors">Car Rental</Link>
        </div>
      </div>

      {/* Center: Search Field (Hidden on Mobile) */}
      <div className="hidden md:flex flex-1 justify-center max-w-sm mx-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search destination..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white/20 backdrop-blur-md border border-white/10 text-white placeholder:text-white/80 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:bg-white/30 transition-colors"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80" />
        </div>
      </div>

      {/* Right: Auth Links & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
          <button className="flex items-center gap-1 hover:text-white/80 transition-colors">
            <Globe className="w-4 h-4" />
            EN
          </button>
          
          {user ? (
             <div className="flex items-center gap-4">
               <Link to="/editor" className="hover:text-white/80 transition-colors">Dashboard</Link>
               <button onClick={onLogout} className="hover:text-white/80 transition-colors">Log Out</button>
             </div>
          ) : (
            <>
              <Link to="/login" className="hover:text-white/80 transition-colors font-medium">Log In</Link>
              <Link to="/register" className="bg-white text-black px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors font-medium text-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
        
        <button 
          className="md:hidden text-white hover:text-white/80 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full mt-4 bg-white text-black rounded-2xl shadow-xl p-6 flex flex-col gap-5 md:hidden border border-gray-100 animate-in fade-in slide-in-from-top-2">
          <div className="relative w-full mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-black placeholder:text-gray-400 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          {user ? (
            <>
              <Link to="/editor" className="font-semibold text-gray-800">Dashboard</Link>
              <button onClick={onLogout} className="font-semibold text-left text-gray-800">Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-semibold text-gray-800">Log In</Link>
              <Link to="/register" className="font-semibold text-blue-600">Sign Up</Link>
            </>
          )}
        </div>
      )}
      </nav>
    </div>
  );
};

export default HeroNavigation;
