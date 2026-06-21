import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to editor
  useEffect(() => {
    const session = localStorage.getItem("editorUser");
    if (session) {
      navigate("/editor");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5092/api";
      const response = await fetch(`${apiBaseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed. Please verify credentials.");
      }

      // Store user details in localStorage
      localStorage.setItem("editorUser", JSON.stringify(data.user));
      
      // Dispatch an event to notify Navbar and other components of auth status
      window.dispatchEvent(new Event("storage"));
      
      navigate("/editor");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const triggerQuickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg("");
  };

  return (
    <div className="flex-1 min-h-[80vh] flex items-center justify-center px-6 py-16 bg-neutral-50 dark:bg-neutral-900/10">
      <div className="w-full max-w-md bg-white dark:bg-brand-dark border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl transition-all duration-300">
        
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-display font-black tracking-tighter hover:opacity-80 transition-opacity">
            SSPeech
          </Link>
          <h2 className="font-serif text-xl font-bold mt-4 text-neutral-850 dark:text-neutral-50">
            Editorial Staff Login
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-550 mt-1.5">
            Log in to manage publications, review draft queues, and verify articles.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/20 border-[0.5px] border-red-200 dark:border-red-950 text-red-750 dark:text-red-400 text-xs font-bold py-3 px-4 rounded-xl flex items-center gap-2 animate-pulse">
            <i className="fa-solid fa-circle-exclamation text-sm"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-neutral-450 dark:text-neutral-550 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-neutral-400">
                <i className="fa-solid fa-user text-xs"></i>
              </span>
              <input
                type="text"
                required
                placeholder="e.g. robert"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-850 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-450 dark:text-neutral-550 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-neutral-400">
                <i className="fa-solid fa-lock text-xs"></i>
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-850 dark:text-neutral-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-b-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Secure Access</span>
                <i className="fa-solid fa-arrow-right-to-bracket text-[10px]"></i>
              </>
            )}
          </button>
        </form>

        {/* Quick Testing Profiles */}
        <div className="mt-8 pt-6 border-t-[0.5px] border-neutral-250 dark:border-neutral-800">
          <span className="block text-[10px] font-extrabold text-neutral-400 dark:text-neutral-550 uppercase tracking-wider text-center mb-4">
            Quick Validation Profiles
          </span>
          <div className="space-y-2.5">
            {/* Profile 1: Robert (Author) */}
            <button
              type="button"
              onClick={() => triggerQuickLogin("robert", "password")}
              className="w-full p-2.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900/40 dark:hover:bg-neutral-850 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
                  alt=""
                  className="w-7 h-7 rounded-full object-cover border-[0.5px] border-neutral-300"
                />
                <div>
                  <span className="text-xs font-bold text-neutral-850 dark:text-neutral-150 block">Robert Fox</span>
                  <span className="text-[9px] text-neutral-400 uppercase font-semibold">Author Profile</span>
                </div>
              </div>
              <span className="text-[9px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded font-mono">
                Click to Fill
              </span>
            </button>

            {/* Profile 2: Esther (Author) */}
            <button
              type="button"
              onClick={() => triggerQuickLogin("esther", "password")}
              className="w-full p-2.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900/40 dark:hover:bg-neutral-850 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
                  alt=""
                  className="w-7 h-7 rounded-full object-cover border-[0.5px] border-neutral-300"
                />
                <div>
                  <span className="text-xs font-bold text-neutral-855 dark:text-neutral-150 block">Esther Howard</span>
                  <span className="text-[9px] text-neutral-400 uppercase font-semibold">Author Profile</span>
                </div>
              </div>
              <span className="text-[9px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded font-mono">
                Click to Fill
              </span>
            </button>

            {/* Profile 3: Admin (Super Admin) */}
            <button
              type="button"
              onClick={() => triggerQuickLogin("admin", "admin123")}
              className="w-full p-2.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900/40 dark:hover:bg-neutral-850 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                  CE
                </div>
                <div>
                  <span className="text-xs font-bold text-neutral-850 dark:text-neutral-150 block">Chief Editor</span>
                  <span className="text-[9px] text-neutral-400 uppercase font-semibold">Super Admin Profile</span>
                </div>
              </div>
              <span className="text-[9px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded font-mono">
                Click to Fill
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default LoginPage;
