import React from "react";

interface AdSensePlaceholderProps {
  type: "banner" | "sidebar" | "in-feed";
  className?: string;
}

export const AdSensePlaceholder: React.FC<AdSensePlaceholderProps> = ({ type, className = "" }) => {
  return (
    <div
      className={`relative flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 overflow-hidden transition-all duration-300 ${className}`}
    >
      <span className="absolute top-1 right-2 text-[9px] font-sans tracking-widest text-neutral-400 dark:text-neutral-500 uppercase select-none">
        Advertisement
      </span>

      {type === "banner" && (
        <div className="py-3 px-6 text-center">
          <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            SSPeech Premium Partner Program
          </p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
            Get 80% off secure digital transactions. Click to learn more.
          </p>
        </div>
      )}

      {type === "sidebar" && (
        <div className="p-6 text-center w-full">
          <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xs font-serif font-bold text-neutral-700 dark:text-neutral-300">Ads</span>
          </div>
          <h4 className="text-sm font-serif font-semibold text-neutral-800 dark:text-neutral-200">
            Build your SaaS in weeks
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
            Deploy secure cloud databases instantly with absolute zero cold starts.
          </p>
          <button className="mt-4 px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-medium rounded-full transition-colors">
            Try Free
          </button>
        </div>
      )}

      {type === "in-feed" && (
        <div className="p-4 flex items-center gap-4 w-full text-left">
          <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 shrink-0 flex items-center justify-center text-xs font-serif italic text-neutral-500">
            Ad
          </div>
          <div>
            <h5 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Sponsored Link
            </h5>
            <p className="text-sm font-serif font-medium text-neutral-900 dark:text-neutral-100 hover:underline cursor-pointer">
              Top 10 cloud service patterns for developers in 2026
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              cloudinfra-comparison.org
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdSensePlaceholder;
