import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const pageItems = getPageItems(currentPage, totalPages);

  return (
    <nav className="modern-pagination" aria-label="Article pagination">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="modern-pagination__arrow"
        aria-label="Previous page"
      >
        <ChevronLeft size={17} />
      </button>

      <div className="modern-pagination__pages">
        {pageItems.map((item, index) => (
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="modern-pagination__ellipsis" aria-hidden="true">...</span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`modern-pagination__page ${currentPage === item ? "is-active" : ""}`}
              aria-current={currentPage === item ? "page" : undefined}
              aria-label={`Page ${item}`}
            >
              {item}
            </button>
          )
        ))}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="modern-pagination__arrow"
        aria-label="Next page"
      >
        <ChevronRight size={17} />
      </button>

      <span className="modern-pagination__status">Page {currentPage} of {totalPages}</span>
    </nav>
  );
};

const getPageItems = (currentPage: number, totalPages: number): Array<number | "ellipsis"> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages]);
  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) pages.add(page);
  }

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }

  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 3);
    pages.add(totalPages - 2);
    pages.add(totalPages - 1);
  }

  const sortedPages = Array.from(pages).filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];
    if (previousPage && page - previousPage > 1) {
      items.push("ellipsis");
    }
    items.push(page);
  });

  return items;
};

export default Pagination;
