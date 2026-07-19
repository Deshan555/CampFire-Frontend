import React, { useRef } from "react";
import { Link } from "react-router-dom";
import type { Article } from "../data/articles";

interface ArtistSpotlightProps {
  articles: Article[];
}

export const ArtistSpotlight: React.FC<ArtistSpotlightProps> = ({ articles }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter spotlight articles
  const spotlightArticles = articles.filter(
    (a) => a.id === "leo-hart-interview" || a.id === "eva-martinez-visionary"
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

  return (
    <section className="w-full px-6 py-12 md:py-16 bg-[#F0EFED] dark:bg-brand-dark/50 border-y-[1.5px] border-brand-dark transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-10 items-stretch">
        
        {/* Left column: Title & Navigation */}
        <div className="w-full md:w-80 flex flex-col justify-between items-start text-left shrink-0">
          <div>
            <span className="text-[10px] text-accent-coral uppercase tracking-widest font-extrabold font-display block mb-2">
              Featured Interviews
            </span>
            <h2 className="font-serif font-black text-4xl sm:text-5xl leading-[1.05] text-neutral-900 dark:text-white uppercase tracking-tight select-none mb-6">
              Spotlight on Artists
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed font-sans mb-6">
              Step inside the studios and minds of contemporary creators who are redefining the boundaries of painting, sound, and visual style.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2.5 mt-4">
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

        {/* Right column: Scrollable Carousel List */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex gap-6 overflow-x-auto pb-4 scroll-smooth thin-scrollbar select-none snap-x"
        >
          {spotlightArticles.map((article) => (
            <div
              key={article.id}
              className="w-[300px] sm:w-[340px] shrink-0 snap-start"
            >
              <div className="editorial-card p-4 rounded-xl flex flex-col h-full gap-4">
                
                {/* Artist Portrait */}
                <Link
                  to={`/article/${article.id}`}
                  className="aspect-[4/3] bg-neutral-200 rounded-3xl overflow-hidden block relative group"
                >
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500 ease-out group-hover:scale-102"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-4xl font-bold text-neutral-400">
                      {(article.category || article.title).charAt(0)}
                    </div>
                  )}
                </Link>

                {/* Tags block */}
                <div className="flex gap-1.5 flex-wrap">
                  {article.category === "Music"
                    ? ["Music", "City", "Personality"].map((t) => (
                        <span key={t} className="editorial-tag">
                          {t}
                        </span>
                      ))
                    : ["Personality", "Art", "Artist"].map((t) => (
                        <span key={t} className="editorial-tag">
                          {t}
                        </span>
                      ))}
                </div>

                {/* Title & Metadata */}
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
                    <p className="text-neutral-500 dark:text-neutral-450 text-xs mt-2 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <Link
                    to={`/article/${article.id}`}
                    className="text-xs font-bold text-neutral-900 hover:text-accent-coral dark:text-white dark:hover:text-accent-coral flex items-center gap-1 font-display uppercase tracking-widest border-t border-neutral-200 dark:border-neutral-800 pt-3"
                  >
                    <span>Read Interview</span>
                    <i className="fa-solid fa-chevron-right text-[9px]"></i>
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ArtistSpotlight;
