/**
 * Author: Deshan Jayashanka
 */

import React from "react";

interface CrmAnalyticsProps {
  currentUser: any;
  loading: boolean;
  totalArticles: number;
  totalLikes: number;
  rulesCount?: number;
  activeRulesCount?: number;
  activeModel?: string;
  handleOpenRules?: () => void;
}

export const CrmAnalytics: React.FC<CrmAnalyticsProps> = ({
  currentUser,
  loading,
  totalArticles,
  totalLikes,
  rulesCount = 0,
  activeRulesCount = 0,
  activeModel = "gemma3:1b",
  handleOpenRules,
}) => {
  const isAdmin = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "EDITOR";
  const getFriendlyModelName = (modelId: string) => {
    if (modelId.startsWith("gemma3")) return "Gemma 3 (1B)";
    if (modelId.startsWith("llama")) return "Llama 3.2 (3B)";
    if (modelId.includes("r1:1.5b")) return "DeepSeek R1 (1.5B)";
    if (modelId.includes("r1:8b")) return "DeepSeek R1 (8B)";
    return modelId;
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-2"} gap-6 mb-8`}>
      <div className="p-6 bg-neutral-50 dark:bg-neutral-900/30 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
        <div>
          <span className="text-xs font-bold text-neutral-400 dark:text-neutral-550 uppercase tracking-wider block">
            {currentUser?.role === "SUPER_ADMIN" ? "Total Publications" : "My Articles"}
          </span>
          <span className="font-serif text-3xl font-black text-neutral-850 dark:text-neutral-100 block mt-2">
            {loading ? "..." : totalArticles}
          </span>
        </div>
        <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-855 rounded-full flex items-center justify-center text-neutral-500 dark:text-neutral-450 border-[0.5px] border-neutral-200 dark:border-neutral-800">
          <i className="fa-solid fa-newspaper text-base"></i>
        </div>
      </div>

      <div className="p-6 bg-neutral-50 dark:bg-neutral-900/30 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
        <div>
          <span className="text-xs font-bold text-neutral-400 dark:text-neutral-550 uppercase tracking-wider block">
            Accumulated Likes
          </span>
          <span className="font-serif text-3xl font-black text-neutral-855 dark:text-neutral-100 block mt-2">
            {loading ? "..." : totalLikes}
          </span>
        </div>
        <div className="w-12 h-12 bg-red-50/50 dark:bg-red-950/10 rounded-full flex items-center justify-center text-red-500 border-[0.5px] border-red-100 dark:border-red-955/50">
          <i className="fa-solid fa-heart text-base"></i>
        </div>
      </div>

      {isAdmin && (
        <>
          <div
            onClick={handleOpenRules}
            className="p-6 bg-neutral-50 dark:bg-neutral-900/30 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:border-accent-purple/40 dark:hover:border-accent-purple/30 group"
          >
            <div>
              <span className="text-xs font-bold text-neutral-400 dark:text-neutral-550 uppercase tracking-wider block group-hover:text-accent-purple transition-colors">
                Active AI Rules
              </span>
              <span className="font-serif text-3xl font-black text-neutral-850 dark:text-neutral-100 block mt-2">
                {activeRulesCount} <span className="text-xs font-sans font-bold text-neutral-400">/ {rulesCount} Total</span>
              </span>
            </div>
            <div className="w-12 h-12 bg-purple-50/50 dark:bg-purple-950/10 rounded-full flex items-center justify-center text-accent-purple border-[0.5px] border-purple-100 dark:border-purple-955/50">
              <i className="fa-solid fa-robot text-base"></i>
            </div>
          </div>

          <div className="p-6 bg-neutral-50 dark:bg-neutral-900/30 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
            <div>
              <span className="text-xs font-bold text-neutral-400 dark:text-neutral-550 uppercase tracking-wider block">
                AI Review Model
              </span>
              <span className="font-serif text-lg font-black text-neutral-850 dark:text-neutral-100 block mt-3 font-mono leading-none">
                {getFriendlyModelName(activeModel)}
              </span>
            </div>
            <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-855 rounded-full flex items-center justify-center text-neutral-500 dark:text-neutral-450 border-[0.5px] border-neutral-200 dark:border-neutral-800">
              <i className="fa-solid fa-microchip text-base"></i>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CrmAnalytics;
