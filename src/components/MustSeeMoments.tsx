import React, { useRef } from "react";
import { Link } from "react-router-dom";
import type { Article } from "../data/articles";

interface MustSeeMomentsProps {
  articles: Article[];
}

export const MustSeeMoments: React.FC<MustSeeMomentsProps> = ({ articles }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter must-see articles
  const filteredArticles = articles.filter(
    (a) =>
      a.id === "unmissable-shows" ||
      a.id === "hidden-gems-exhibits" ||
      a.id === "design-diaries"
  );

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const getTagsForArticle = (id: string): string[] => {
    if (id === "unmissable-shows") return ["Performance", "Recommendations", "Digital"];
    if (id === "hidden-gems-exhibits") return ["Recommendations", "Exhibits", "Art"];
    if (id === "design-diaries") return ["Sculpture", "Design", "Architecture"];
    return ["Culture", "Spotlight"];
  };

  return (
    <section className="w-full px-6 py-12 md:py-16 bg-[#F0EFED] dark:bg-brand-dark/50 border-t-[1.5px] border-brand-dark transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Block */}
        <div className="flex items-center justify-between border-b-[1.5px] border-brand-dark pb-4 mb-8">
          <div className="text-left">
            <span className="text-[10px] text-accent-coral uppercase tracking-widest font-extrabold font-display block mb-1">
              Top Picks
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl leading-tight text-neutral-900 dark:text-white uppercase tracking-tight select-none">
              Must-See Moments
            </h2>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-2.5">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-neutral-900 hover:bg-neutral-900 hover:text-white flex items-center justify-center transition-all cursor-pointer dark:border-neutral-500 dark:hover:bg-white dark:hover:text-neutral-950"
              title="Scroll left"
            >
              <i className="fa-solid fa-arrow-left text-sm"></i>
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-neutral-900 hover:bg-neutral-900 hover:text-white flex items-center justify-center transition-all cursor-pointer dark:border-neutral-500 dark:hover:bg-white dark:hover:text-neutral-950"
              title="Scroll right"
            >
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </button>
          </div>
        </div>

        {/* 3-Column Grid / Carousel Row */}
        <div
          ref={scrollContainerRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scroll-smooth thin-scrollbar snap-x"
        >
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="w-full min-w-[280px] md:min-w-0 snap-start flex flex-col"
            >
              <div className="editorial-card p-4 rounded-xl flex flex-col h-full gap-4">
                
                {/* Rectangular Image */}
                <Link
                  to={`/article/${article.id}`}
                  className="aspect-[4/3] bg-neutral-200 rounded-3xl overflow-hidden block relative group"
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500 group-hover:scale-102"
                  />
                </Link>

                {/* Tags block */}
                <div className="flex gap-1.5 flex-wrap">
                  {getTagsForArticle(article.id).map((t) => (
                    <span key={t} className="editorial-tag">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Article Info */}
                <div className="text-left flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans block mb-1">
                      {article.date} • {article.readingTime}
                    </span>
                    <Link
                      to={`/article/${article.id}`}
                      className="font-serif font-black text-lg sm:text-xl text-neutral-900 hover:text-accent-coral dark:text-white dark:hover:text-accent-coral leading-tight block hover:underline"
                    >
                      {article.title}
                    </Link>
                    <p className="text-neutral-550 dark:text-neutral-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <Link
                    to={`/article/${article.id}`}
                    className="text-xs font-bold text-neutral-900 hover:text-accent-coral dark:text-white dark:hover:text-accent-coral flex items-center gap-1 font-display uppercase tracking-widest border-t border-neutral-200 dark:border-neutral-800 pt-3"
                  >
                    <span>Read More</span>
                    <i className="fa-solid fa-chevron-right text-[9px]"></i>
                  </Link>
                </div>

              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default MustSeeMoments;
