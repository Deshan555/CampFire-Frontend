/**
 * Author: Deshan Jayashanka
 */

import React from "react";
import type { Article } from "../../data/articles";

interface CrmPaginationProps {
  sortedArticles: Article[];
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  pageSize: number;
  totalPages: number;
}

export const CrmPagination: React.FC<CrmPaginationProps> = ({
  sortedArticles,
  currentPage,
  setCurrentPage,
  pageSize,
  totalPages,
}) => {
  if (sortedArticles.length === 0) return null;

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900/10 border-t-[0.5px] border-neutral-200 dark:border-neutral-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
      <span className="text-xs text-neutral-455 dark:text-neutral-500 font-medium">
        Showing{" "}
        <span className="font-bold text-neutral-700 dark:text-neutral-300">
          {Math.min(sortedArticles.length, (currentPage - 1) * pageSize + 1)}
        </span>{" "}
        to{" "}
        <span className="font-bold text-neutral-700 dark:text-neutral-300">
          {Math.min(sortedArticles.length, currentPage * pageSize)}
        </span>{" "}
        of{" "}
        <span className="font-bold text-neutral-700 dark:text-neutral-300">
          {sortedArticles.length}
        </span>{" "}
        publications
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="px-3 py-1.5 rounded-lg border-[0.5px] border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-650 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900/50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-angle-left mr-1"></i>
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
            const isCurrent = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-none"
                    : "border-[0.5px] border-neutral-200 dark:border-neutral-800 text-neutral-650 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900/50"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="px-3 py-1.5 rounded-lg border-[0.5px] border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-650 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900/50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Next
            <i className="fa-solid fa-angle-right ml-1"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default CrmPagination;
