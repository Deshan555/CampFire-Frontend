import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatedButton, LoadingSpinner } from "../components/canves-animations";
import { siteConfig } from "../config/site";

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

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || responseData.errors?.[0]?.message || "Login failed. Please verify credentials.");
      }

      const payload = responseData.data ? responseData.data : responseData;

      if (!payload.user) {
        throw new Error("Invalid response format from server.");
      }

      // Store user details and JWT token in localStorage
      localStorage.setItem("editorUser", JSON.stringify(payload.user));
      if (payload.token) {
        localStorage.setItem("authToken", payload.token);
      }
      
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

  return (
    <div className="auth-publication">
      <div className="auth-panel">
        
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-1 hover:opacity-90 transition-opacity">
            <span className="text-2xl font-display font-black tracking-widest text-neutral-900 dark:text-white uppercase select-none">
              {siteConfig.name}
            </span>
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

          <AnimatedButton
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full py-3 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <LoadingSpinner size="sm" message="" className="text-white" />
            ) : (
              <>
                <span>Secure Access</span>
                <i className="fa-solid fa-arrow-right-to-bracket text-[10px]"></i>
              </>
            )}
          </AnimatedButton>
        </form>

        <div className="mt-8 text-center pt-6 border-t-[0.5px] border-neutral-250 dark:border-neutral-800">
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">
            Just want to read?{" "}
            <Link to="/register" className="font-semibold text-neutral-900 dark:text-white hover:underline">
              Create a Reader Account
            </Link>
          </p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">
            Are you a writer?{" "}
            <Link to="/admin/register" className="font-semibold text-neutral-900 dark:text-white hover:underline">
              Apply for an Editorial Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
export default LoginPage;
