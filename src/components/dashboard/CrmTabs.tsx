/**
 * Author: Deshan Jayashanka
 */

import React from "react";
import { ArticleStatus, type Article } from "../../data/articles";

interface CrmTabsProps {
  currentUser: any;
  activeTab: ArticleStatus;
  setActiveTab: (tab: ArticleStatus) => void;
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
    <div className="px-6 py-3.5 border-b border-gray-200 shrink-0 bg-gray-50 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <select
          value={activeTab}
          onChange={(e) => {
            setActiveTab(e.target.value as ArticleStatus);
            setCurrentPage(1);
          }}
          className="customDropdown text-xs text-gray-700"
        >
          <option value={ArticleStatus.APPROVED}>Approved Publications ({articles.filter(a => a.status === ArticleStatus.APPROVED).length})</option>
          <option value={ArticleStatus.PENDING_REVIEW}>Pending Reviews ({articles.filter(a => a.status === ArticleStatus.PENDING_REVIEW).length})</option>
          <option value={ArticleStatus.REJECTED}>Rejected Drafts ({articles.filter(a => a.status === ArticleStatus.REJECTED).length})</option>
        </select>
      </div>
      
      <div className="relative w-full max-w-xs">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
           <i className="fa-solid fa-magnifying-glass text-[11px]"></i>
        </div>
        <input
          type="text"
          placeholder="Search articles (coming soon)..."
          disabled
          className="customInput w-full pl-9 opacity-50 cursor-not-allowed"
        />
      </div>
    </div>
  );
};

export default CrmTabs;
