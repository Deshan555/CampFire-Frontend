import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { generateAiArticle } from "../api";
import Markdown from "../components/Markdown";
import logoDay from "../assets/logo_day.png";
import logoNight from "../assets/logo_night.png";

export const AiWriterPage: React.FC = () => {
  const [model, setModel] = useState("gemma3:1b");
  const [tone, setTone] = useState("Professional");
  const [topic, setTopic] = useState("");
  const [instructions, setInstructions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Theme state local sync
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const handleToggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  // Generated Article State
  const [generatedArticle, setGeneratedArticle] = useState<{
    title: string;
    summary: string;
    content: string[];
  } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMsg("Topic or subject is required.");
      return;
    }

    setGenerating(true);
    setErrorMsg("");
    setSuccessMsg("");
    setGeneratedArticle(null);

    try {
      const response = await generateAiArticle({
        model,
        topic: topic.trim(),
        tone,
        instructions: instructions.trim()
      });

      setGeneratedArticle(response);
      setSuccessMsg("Article generated successfully!");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message || "Failed to connect to local Ollama server. Verify that Ollama is running."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedArticle) return;
    const fullText = `Title: ${generatedArticle.title}\n\nSummary: ${generatedArticle.summary}\n\n${generatedArticle.content.join("\n\n")}`;
    navigator.clipboard.writeText(fullText);
    setSuccessMsg("Copied to clipboard!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-white dark:bg-brand-dark transition-colors duration-300 overflow-hidden font-sans">
      {/* Standalone Local Navbar */}
      <header className="h-16 shrink-0 border-b-[0.5px] border-neutral-200 dark:border-neutral-850 bg-white dark:bg-brand-dark px-6 flex items-center justify-between z-10 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer border-r border-neutral-200 dark:border-neutral-800 pr-4 h-5"
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src={logoDay} alt="Camp Fire Logo" className="h-7 w-auto block dark:hidden" />
            <img src={logoNight} alt="Camp Fire Logo" className="h-7 w-auto hidden dark:block" />
            <span className="text-base font-display font-black tracking-tighter text-neutral-905 dark:text-neutral-50">
              Camp Fire AI Editor
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {successMsg && (
            <span className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold py-1 px-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-lg animate-pulse select-none">
              {successMsg}
            </span>
          )}

          {/* Theme Toggler */}
          <button
            onClick={handleToggleDarkMode}
            className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-450 dark:hover:text-neutral-100 transition-colors rounded-full cursor-pointer"
            title="Toggle theme"
          >
            {darkMode ? <i className="fa-solid fa-sun text-sm"></i> : <i className="fa-solid fa-moon text-sm"></i>}
          </button>
        </div>
      </header>

      {/* Workspace Area split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Parameters Form Scrollpane */}
        <div className="w-80 shrink-0 border-r-[0.5px] border-neutral-200 dark:border-neutral-850 bg-neutral-50/50 dark:bg-neutral-900/10 overflow-y-auto p-6 text-left flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <h2 className="font-serif text-base font-extrabold text-neutral-850 dark:text-neutral-100 flex items-center gap-2">
                <i className="fa-solid fa-sliders text-neutral-400"></i>
                <span>Configuration</span>
              </h2>
              <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
                Adjust setting parameters below to write your publication draft.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Ollama Model Engine *
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200 cursor-pointer"
                >
                  <option value="gemma3:1b">Gemma 3 1B (Fastest)</option>
                  <option value="deepseek-r1:1.5b">DeepSeek R1 1.5B (Reasoning)</option>
                  <option value="deepseek-r1:8b">DeepSeek R1 8B (Deep Reasoning)</option>
                  <option value="llama3.2:latest">Llama 3.2 3B (Balanced)</option>
                  <option value="deepseek-coder:1.3b">DeepSeek Coder 1.3B</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Tone of Voice *
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200 cursor-pointer"
                >
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Inspirational">Inspirational</option>
                  <option value="Technical">Technical</option>
                  <option value="Informative">Informative</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Article Topic *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory safety features in Rust..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Contextual Guidelines
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Focus on borrowing and lifetimes. Include a code block sample. Keep it brief."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200 resize-none transition-all"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 bg-violet-650 hover:bg-violet-750 disabled:bg-violet-400 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                {generating ? (
                  <>
                    <i className="fa-solid fa-spinner animate-spin"></i>
                    <span>Composing Draft...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    <span>Generate Draft</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Setup instructions block */}
          <div className="border-t-[0.5px] border-neutral-200 dark:border-neutral-800 pt-4 mt-6 space-y-2 text-[10px] text-neutral-400 leading-normal">
            <span className="font-bold text-neutral-500 uppercase tracking-wider block">Local Engine Instructions:</span>
            <p>1. Start Ollama locally on your device.</p>
            <p>2. Fetch chosen model: <code>ollama pull {model}</code>.</p>
          </div>
        </div>

        {/* Right Side: Preview Reading Scrollpane */}
        <div className="flex-1 bg-white dark:bg-brand-dark overflow-y-auto p-8 md:p-16 flex flex-col items-center">
          <div className="w-full max-w-2xl flex flex-col justify-start">
            {/* Status Notifications */}
            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-950/20 border-[0.5px] border-red-200 dark:border-red-950 text-red-750 dark:text-red-400 text-xs font-semibold py-3 px-4 rounded-xl flex items-start gap-2 mb-8 text-left">
                <i className="fa-solid fa-circle-exclamation mt-0.5 shrink-0 text-sm"></i>
                <div>
                  <p className="font-bold">Ollama Connection Failed</p>
                  <p className="mt-1 font-normal leading-relaxed text-[11px]">{errorMsg}</p>
                  <div className="mt-2 text-[9px] uppercase font-bold">
                    Start local instance: <code className="bg-white/40 dark:bg-black/20 px-1 py-0.5 rounded font-mono">ollama run {model}</code> in terminal.
                  </div>
                </div>
              </div>
            )}

            {generating && (
              <div className="flex-1 flex flex-col items-start justify-center py-20 animate-pulse text-left w-full">
                <div className="flex items-center gap-3 mb-6">
                  <i className="fa-solid fa-wand-magic-sparkles text-3xl text-violet-500 animate-spin"></i>
                  <h3 className="font-serif text-xl italic font-bold text-neutral-800 dark:text-neutral-255">
                    Camp Fire AI Editor is writing...
                  </h3>
                </div>
                <div className="space-y-4 w-full">
                  <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-md w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md w-1/2 animate-pulse"></div>
                  <div className="space-y-2 pt-6 w-full">
                    <div className="h-3 bg-neutral-100 dark:bg-neutral-850 rounded-md w-full"></div>
                    <div className="h-3 bg-neutral-100 dark:bg-neutral-850 rounded-md w-11/12"></div>
                    <div className="h-3 bg-neutral-100 dark:bg-neutral-850 rounded-md w-5/6"></div>
                  </div>
                </div>
              </div>
            )}

            {!generating && !generatedArticle && !errorMsg && (
              <div className="py-32 text-center select-none border-[0.5px] border-dashed border-neutral-200 dark:border-neutral-850 rounded-2xl w-full flex flex-col items-center justify-center p-8">
                <i className="fa-solid fa-file-signature text-4xl text-neutral-300 dark:text-neutral-750 mb-4"></i>
                <h3 className="font-serif text-base font-bold text-neutral-700 dark:text-neutral-350 mb-1">
                  Draft Preview Pane
                </h3>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs leading-normal">
                  Configure settings on the left sidebar pane and generate to view formatted draft preview.
                </p>
              </div>
            )}

            {generatedArticle && (
              <div className="w-full text-left space-y-6 animate-fade-in pb-16">
                {/* Toolbar */}
                <div className="flex items-center justify-between border-b-[0.5px] border-neutral-200 dark:border-neutral-850 pb-4 mb-4 select-none">
                  <span className="text-[9px] font-extrabold uppercase bg-violet-100 dark:bg-violet-950 text-violet-750 dark:text-violet-300 px-2.5 py-1 rounded-md">
                    AI Generated Draft ({model})
                  </span>
                  
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 border-[0.5px] border-neutral-200 dark:border-neutral-805 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer shadow-sm"
                  >
                    <i className="fa-solid fa-copy"></i>
                    <span>Copy Article</span>
                  </button>
                </div>

                {/* Classic Swiss Print Article Title */}
                <h1 className="font-serif text-3xl sm:text-4xl font-black text-neutral-950 dark:text-neutral-50 tracking-tight leading-tight">
                  {generatedArticle.title}
                </h1>

                {/* Summary Hook box */}
                <div className="bg-neutral-50 dark:bg-neutral-900/30 border-l-2 border-violet-500 p-4 rounded-r-xl my-4">
                  <span className="block text-[9px] uppercase font-extrabold text-neutral-400 dark:text-neutral-500 mb-1 tracking-wider">
                    Summary Hook Excerpt
                  </span>
                  <p className="font-serif italic text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {generatedArticle.summary}
                  </p>
                </div>

                {/* Paragraphs body with full Markdown support */}
                <div className="pt-2">
                  <Markdown content={generatedArticle.content.join("\n\n")} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiWriterPage;
