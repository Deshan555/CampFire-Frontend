import React from "react";
// import { ChevronRight } from "lucide-react"; // Removed unused

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="w-full flex justify-center items-center gap-2 pt-8 pb-16">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
      >
        <span className="text-sm font-semibold">&lt;</span>
      </button>
      
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-semibold transition-colors ${
            currentPage === i + 1
              ? "bg-black text-white"
              : "bg-transparent text-gray-600 hover:bg-gray-100"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
      >
        <span className="text-sm font-semibold">&gt;</span>
      </button>
    </div>
  );
};

export default Pagination;
