import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { generateAiArticle } from "../api";
import Markdown from "../components/Markdown";
import { ShimmerEffect } from "../components/canves-animations";
import Lottie from "lottie-react";
const LottieComponent = (Lottie as any).default || Lottie;
import robotWorkingAnimation from "../assets/lottie/RobotWorking.json";
import { countries } from "countries-list";

const countryOptions = Object.values(countries).map(c => c.name).sort();

export const AiWriterPage: React.FC = () => {
  const [model, setModel] = useState("gemma3:1b");
  const [tone, setTone] = useState("Professional");
  const [topic, setTopic] = useState("");
  const [instructions, setInstructions] = useState("");
  const [includeVideo, setIncludeVideo] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [countriesDropdownOpen, setCountriesDropdownOpen] = useState(false);

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
    hashtags?: string[];
    video?: {
      src: string;
      type: string;
      poster: string;
    };
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
      const finalInstructions = instructions.trim() + (targetCountries.length > 0 ? `\nTarget Countries: ${targetCountries.join(", ")}` : "");
      
      const response = await generateAiArticle({
        model,
        topic: topic.trim(),
        tone,
        instructions: finalInstructions,
        includeVideo
      });

      // Filter out hashtags and image prompts from content
      let newCleanContent: string[] = [];
      let hashtagsFromContent: string[] = [];

      for (let p of response.content || []) {
        // Find if paragraph has image prompts indicator
        const lowerP = p.toLowerCase();
        if (lowerP.includes('image prompts:') || lowerP.includes('**image prompts:**')) {
          const split = p.split(/(?:\*\*|)?image prompts?:?(?:\*\*|)?/i);
          if (split[0].trim().length > 0) {
            newCleanContent.push(split[0].trim());
          }
          break; // Usually image prompts are at the end, so we can ignore the rest
        }

        // Check if paragraph is primarily hashtags
        const hashRegex = /#[\w-]+/g;
        const matches = p.match(hashRegex);
        if (matches && matches.length > 0) {
          const textWithoutHashtags = p.replace(hashRegex, '').trim();
          if (textWithoutHashtags.length < 15) {
            // It's just a hashtag line
            hashtagsFromContent.push(...matches);
            continue;
          }
        }
        
        newCleanContent.push(p);
      }

      response.content = newCleanContent;
      
      // Combine backend hashtags with any leaked into content
      let allHashtags = [...(response.hashtags || []), ...hashtagsFromContent];
      // Clean and dedup
      allHashtags = allHashtags.map(t => t.startsWith('#') ? t : `#${t}`);
      response.hashtags = Array.from(new Set(allHashtags));

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
            <span className="admin-panel-header uppercase select-none dark:text-white">
              THE CANVES AI EDITOR
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
                <label className="block text-xs font-bold text-gray-700 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Ollama Model Engine *
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="selectField-custom w-full"
                >
                  <option value="gemma3:1b">Gemma 3 1B (Fastest)</option>
                  <option value="deepseek-r1:1.5b">DeepSeek R1 1.5B (Reasoning)</option>
                  <option value="deepseek-r1:8b">DeepSeek R1 8B (Deep Reasoning)</option>
                  <option value="llama3.2:latest">Llama 3.2 3B (Balanced)</option>
                  <option value="deepseek-coder:1.3b">DeepSeek Coder 1.3B</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Tone of Voice *
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="selectField-custom w-full"
                >
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Inspirational">Inspirational</option>
                  <option value="Technical">Technical</option>
                  <option value="Informative">Informative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Article Topic *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory safety features in Rust..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="inputField-custom w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Contextual Guidelines
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Focus on borrowing and lifetimes. Include a code block sample. Keep it brief."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="textareaField-custom w-full"
                ></textarea>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-gray-700 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Target Countries for Prioritization
                </label>
                <div 
                  className="inputField-custom w-full flex items-center justify-between cursor-pointer"
                  onClick={() => setCountriesDropdownOpen(!countriesDropdownOpen)}
                >
                  <div className="flex flex-wrap gap-1 overflow-hidden h-5 max-w-[90%]">
                    {targetCountries.length === 0 ? (
                      <span className="text-neutral-400 text-sm">Select countries...</span>
                    ) : (
                      targetCountries.map(tc => (
                        <span key={tc} className="text-[10px] font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-1.5 rounded">
                          {tc}
                        </span>
                      ))
                    )}
                  </div>
                  <i className={`fa-solid fa-chevron-down text-xs transition-transform ${countriesDropdownOpen ? "rotate-180" : ""}`}></i>
                </div>
                
                {countriesDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {countryOptions.map(country => {
                      const isSelected = targetCountries.includes(country);
                      return (
                        <div 
                          key={country}
                          className="flex items-center px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer"
                          onClick={() => {
                            if (isSelected) {
                              setTargetCountries(targetCountries.filter(c => c !== country));
                            } else {
                              setTargetCountries([...targetCountries, country]);
                            }
                          }}
                        >
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 h-3 w-3 mr-2"
                          />
                          <span className="text-xs text-neutral-700 dark:text-neutral-300">{country}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="includeVideo"
                  checked={includeVideo}
                  onChange={(e) => setIncludeVideo(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="includeVideo" className="text-xs font-bold text-gray-700 dark:text-neutral-300 cursor-pointer select-none">
                  Find and attach a matching YouTube video
                </label>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="main-button w-full"
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
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center w-full">
                <div className="flex flex-col items-center justify-center">
                  <LottieComponent animationData={robotWorkingAnimation} loop={true} style={{ height: 320 }} />
                  <p className="mt-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400 font-[Poppins]">
                    THE CANVES AI Editor is writing...
                  </p>
                </div>
                <div className="space-y-4 w-full mt-8">
                  <ShimmerEffect className="h-6 w-3/4 rounded-md mx-auto" />
                  <ShimmerEffect className="h-4 w-1/2 rounded-md mx-auto" />
                  <div className="space-y-3 pt-6 w-full">
                    <ShimmerEffect className="h-3 w-full rounded-md" />
                    <ShimmerEffect className="h-3 w-11/12 rounded-md" />
                    <ShimmerEffect className="h-3 w-5/6 rounded-md" />
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
                    className="secondary-button"
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

                {/* Hashtags */}
                {generatedArticle.hashtags && generatedArticle.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 my-2">
                    {generatedArticle.hashtags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-md tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Video Player Preview if Available */}
                {generatedArticle.video?.src && (
                  <div className="bg-neutral-50 dark:bg-neutral-900/30 border-l-2 border-red-500 p-4 rounded-r-xl my-4">
                    <span className="block text-[9px] uppercase font-extrabold text-neutral-400 dark:text-neutral-505 mb-2 tracking-wider flex items-center gap-1.5">
                      <i className="fa-brands fa-youtube text-red-500"></i> Recommended Contextual Video
                    </span>
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                      <iframe
                        src={generatedArticle.video.src.replace("watch?v=", "embed/")}
                        title="YouTube video player"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}

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
