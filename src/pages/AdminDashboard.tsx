import React, { useState } from "react";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  Layers,
  Tag,
  Settings,
  Bot,
  LogOut,
  Menu,
  X,
  Newspaper
} from "lucide-react";

import AdminOverview from "../components/admin/AdminOverview";
import AdminCategories from "../components/admin/AdminCategories";
import AdminSubcategories from "../components/admin/AdminSubcategories";
import AdminTags from "../components/admin/AdminTags";
import AdminUsers from "../components/admin/AdminUsers";
import AdminAiSettings from "../components/admin/AdminAiSettings";
import { CrmDashboard } from "./CrmDashboard";

export const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  React.useEffect(() => {
    const sessionStr = localStorage.getItem("editorUser");
    if (!sessionStr) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(sessionStr);
      if (user.role === "SUPER_ADMIN") {
        setCurrentUser(user);
        setAuthorized(true);
      } else {
        alert("Access Denied: Admin privileges required.");
        navigate("/login");
      }
    } catch (e) {
      navigate("/login");
    }
  }, [navigate]);

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Article Editor", path: "/admin/editor", icon: Newspaper },
    { label: "Admins Management", path: "/admin/users", icon: Users },
    { label: "Categories", path: "/admin/categories", icon: FolderTree },
    { label: "Subcategories", path: "/admin/subcategories", icon: Layers },
    { label: "Tags", path: "/admin/tags", icon: Tag },
    { label: "AI Settings", path: "/admin/ai-settings", icon: Bot },
    { label: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("editorUser");
    localStorage.removeItem("authToken");
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  if (!authorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#FAFBFD] overflow-hidden text-gray-900 font-sans">

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar - Carbon & Brass Theme */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-black text-zinc-400 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 shrink-0 border-r border-zinc-900 carbon-theme
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Brand / Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-zinc-900 shrink-0">
          <Link
            to="/"
            className="text-white tracking-tight"
            style={{
              fontFamily: '"Poppins", "SF Pro Display", "Inter", sans-serif',
              fontWeight: 550,
              fontSize: '30px',
              lineHeight: '44px'
            }}
          >
            CampFire.
          </Link>
          <button className="md:hidden text-zinc-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== "/admin" && location.pathname.startsWith(item.path + "/"));
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                  }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r bg-[#C6923A]"></span>
                )}
                <IconComponent
                  size={16}
                  strokeWidth={isActive ? 2 : 1.75}
                  className={`transition-colors shrink-0 ${isActive ? "text-[#C6923A]" : "text-zinc-300 group-hover:text-white"}`}
                />
                <span className="truncate whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile Section */}
        <div className="p-4 border-t border-zinc-900 shrink-0 flex items-center justify-between bg-black">
          <div className="flex items-center gap-3 overflow-hidden">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border border-zinc-700 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                {currentUser?.firstName ? currentUser.firstName.charAt(0) : currentUser?.username ? currentUser.username.toUpperCase().charAt(0) : "A"}
              </div>
            )}
            <div className="overflow-hidden leading-tight">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ""}` : currentUser?.username || "Admin User"}
              </div>
              <div className="text-[10px] text-zinc-500 truncate">Super Admin</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Body Frame */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden relative">

        {/* Floating Mobile Menu Trigger */}
        {!isMobileMenuOpen && (
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden fixed top-4 left-4 z-40 p-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-md hover:bg-gray-50 transition-all shrink-0"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Dynamic Route View (takes full space) */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/editor" element={<CrmDashboard />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/categories" element={<AdminCategories />} />
            <Route path="/subcategories" element={<AdminSubcategories />} />
            <Route path="/tags" element={<AdminTags />} />
            <Route path="/ai-settings" element={<AdminAiSettings />} />
            <Route path="/settings" element={
              <div className="p-8 h-full bg-white flex flex-col justify-center items-center text-center">
                <Settings size={48} className="text-gray-300 mb-4 animate-spin duration-1000" />
                <h2 className="text-xl font-bold">Site Settings</h2>
                <p className="text-gray-500 mt-1 max-w-sm text-xs">Configuring global layout rules, newsletter defaults, and third-party integrations.</p>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
