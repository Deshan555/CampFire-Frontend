import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div 
      className="flex w-full justify-center py-3" 
      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 450, letterSpacing: "0.02em" }}
    >
      <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 px-1 py-1 sm:px-3">
        
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-2 h-6 rounded-full text-xs transition-colors ${
            currentPage === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:text-black hover:bg-gray-50"
          }`}
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Pages Container */}
        <div className="flex items-center gap-1 px-1 sm:px-2 border-x border-transparent sm:border-gray-100">
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-xs text-gray-600 hover:bg-gray-100 transition-colors"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="w-5 h-6 flex items-center justify-center text-xs text-gray-400">
                  ...
                </span>
              )}
            </>
          )}

          {pages.map((page) => (
            <div key={page} className="flex items-center justify-center">
              {page === currentPage ? (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/5">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs shadow-sm">
                    {page}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {page}
                </button>
              )}
            </div>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="w-5 h-6 flex items-center justify-center text-xs text-gray-400">
                  ...
                </span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-xs text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-2 h-6 rounded-full text-xs transition-colors ${
            currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:text-black hover:bg-gray-50"
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        {/* Showing text - only visible on medium screens and up */}
        <div className="hidden md:block pl-4 pr-3 border-l border-gray-100">
          <p className="text-xs text-gray-500 whitespace-nowrap">
            Showing page {currentPage} of {totalPages}
          </p>
        </div>

      </div>
    </div>
  );
};

