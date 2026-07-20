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

  const tabs = [
    { value: ArticleStatus.APPROVED, label: "Approved" },
    { value: ArticleStatus.PENDING_REVIEW, label: "Review" },
    { value: ArticleStatus.REJECTED, label: "Rejected" }
  ];

  return (
    <div className="crm-table-toolbar">
      <div className="crm-status-tabs" aria-label="Article status filters">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = articles.filter((article) => article.status === tab.value).length;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setActiveTab(tab.value);
                setCurrentPage(1);
              }}
              className={`crm-status-tab${isActive ? " is-active" : ""}`}
              aria-pressed={isActive}
            >
              <span>{tab.label}</span>
              <strong>{count}</strong>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CrmTabs;
