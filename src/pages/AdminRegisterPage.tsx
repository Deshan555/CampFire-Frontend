import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerAdmin } from "../api";

export const AdminRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("AUTHOR");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("editorUser");
    if (session) {
      navigate("/editor");
    }
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await registerAdmin({
        username,
        email,
        password,
        firstName,
        lastName,
        role
      });
      // Redirect to login upon successful registration
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-[80vh] flex items-center justify-center px-6 py-16 bg-neutral-50 dark:bg-neutral-900/10">
      <div className="w-full max-w-md bg-white dark:bg-brand-dark border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl transition-all duration-300">
        
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-1 hover:opacity-90 transition-opacity">
            <span className="text-2xl font-display font-black tracking-widest text-neutral-900 dark:text-white uppercase select-none">
              THE CANVES
            </span>
          </Link>
          <h2 className="font-serif text-xl font-bold mt-4 text-neutral-850 dark:text-neutral-50">
            Editorial Staff Application
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-550 mt-1.5">
            Apply to become an Author or Editor.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/20 border-[0.5px] border-red-200 dark:border-red-950 text-red-750 dark:text-red-400 text-xs font-bold py-3 px-4 rounded-xl flex items-center gap-2 animate-pulse">
            <i className="fa-solid fa-circle-exclamation text-sm"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-550 uppercase tracking-wider mb-1.5">
                First Name
              </label>
              <input
                type="text"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-850 dark:text-neutral-100"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-550 uppercase tracking-wider mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Smith"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-850 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-550 uppercase tracking-wider mb-1.5">
              Username *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-neutral-400">
                <i className="fa-solid fa-user text-[10px]"></i>
              </span>
              <input
                type="text"
                required
                placeholder="janesmith"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-850 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-550 uppercase tracking-wider mb-1.5">
              Email *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-neutral-400">
                <i className="fa-solid fa-envelope text-[10px]"></i>
              </span>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-850 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-550 uppercase tracking-wider mb-1.5">
              Password *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-neutral-400">
                <i className="fa-solid fa-lock text-[10px]"></i>
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-850 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-550 uppercase tracking-wider mb-1.5">
              Role *
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-850 dark:text-neutral-100"
              >
                <option value="AUTHOR">Author</option>
                <option value="EDITOR">Editor</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Submit Application</span>
                <i className="fa-solid fa-pen-nib text-[10px]"></i>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Already staff?{" "}
            <Link to="/login" className="text-neutral-900 dark:text-white font-bold hover:underline">
              Log in
            </Link>
          </p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">
            Just want to read?{" "}
            <Link to="/register" className="font-semibold hover:underline">
              Create a Reader Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterPage;
