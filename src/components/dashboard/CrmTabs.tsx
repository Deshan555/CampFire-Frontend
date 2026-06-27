/**
 * Author: Deshan Jayashanka
 */

import React from "react";
import type { Article } from "../../data/articles";

interface CrmTabsProps {
  currentUser: any;
  activeTab: "approved" | "pending" | "rejected";
  setActiveTab: (tab: "approved" | "pending" | "rejected") => void;
  setCurrentPage: (page: number) => void;
  articles: Article[];
}

export const CrmTabs: React.FC<CrmTabsProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  setCurrentPage,
  articles,
}) => {
  if (!currentUser) return null;

  return (
    <div className="flex border-b-[0.5px] border-neutral-200 dark:border-neutral-800 mb-6 gap-6">
      <button
        onClick={() => {
          setActiveTab("approved");
          setCurrentPage(1);
        }}
        className={`pb-3 text-xs font-extrabold uppercase tracking-wider relative cursor-pointer transition-colors ${
          activeTab === "approved"
            ? "text-neutral-900 dark:text-white"
            : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-355"
        }`}
      >
        <span>Approved Publications</span>
        <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-neutral-100 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-855 rounded text-neutral-500 font-mono">
          {articles.filter((a) => a.status === "approved").length}
        </span>
        {activeTab === "approved" && (
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-900 dark:bg-white animate-fade-in"></span>
        )}
      </button>

      <button
        onClick={() => {
          setActiveTab("pending");
          setCurrentPage(1);
        }}
        className={`pb-3 text-xs font-extrabold uppercase tracking-wider relative cursor-pointer transition-colors ${
          activeTab === "pending"
            ? "text-neutral-900 dark:text-white"
            : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-355"
        }`}
      >
        <span>Pending Reviews</span>
        <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-500/10 border-[0.5px] border-red-500/20 rounded text-red-550 dark:text-red-400 font-mono font-bold">
          {articles.filter((a) => a.status === "pending").length}
        </span>
        {activeTab === "pending" && (
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-900 dark:bg-white animate-fade-in"></span>
        )}
      </button>

      <button
        onClick={() => {
          setActiveTab("rejected");
          setCurrentPage(1);
        }}
        className={`pb-3 text-xs font-extrabold uppercase tracking-wider relative cursor-pointer transition-colors ${
          activeTab === "rejected"
            ? "text-neutral-900 dark:text-white"
            : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-355"
        }`}
      >
        <span>Declined contents</span>
        <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-500/10 border-[0.5px] border-amber-500/20 rounded text-amber-600 dark:text-amber-400 font-mono font-bold">
          {articles.filter((a) => a.status === "rejected").length}
        </span>
        {activeTab === "rejected" && (
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-900 dark:bg-white animate-fade-in"></span>
        )}
      </button>
    </div>
  );
};

export default CrmTabs;
