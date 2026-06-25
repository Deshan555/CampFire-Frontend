import React from "react";
import { Link } from "react-router-dom";
import type { Article } from "../data/articles";

interface ArticleGridProps {
  articles: Article[];
}

export const ArticleGrid: React.FC<ArticleGridProps> = ({ articles }) => {
  // Separate partners' news from regular feed
  const partnerArticles = articles.filter((a) => a.isPartner);
  const regularArticles = articles.filter((a) => !a.isPartner && !a.featured && !a.trending);

  return (
    <section className="py-8 flex flex-col gap-8 transition-colors duration-300">
      
      {/* Primary Grid Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {regularArticles.map((article, index) => {
          const hasImage = !!article.image;
          
          return (
            <Link
              key={article.id}
              to={`/article/${article.id}`}
              className={`flex flex-col justify-between border-[0.5px] border-neutral-200 dark:border-neutral-800 p-6 rounded-xl hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(216,180,254,0.03)] cursor-pointer transition-all duration-300 text-left ${
                hasImage && index === 0 ? "md:col-span-2 md:flex-row gap-6" : ""
              }`}
            >
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-accent-purple dark:text-purple-400 mb-2 block">
                    {article.category}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-3 leading-snug hover:underline">
                    {article.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed mb-4">
                    {article.summary}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t-[0.5px] border-neutral-150 dark:border-neutral-850">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-6 h-6 rounded-full object-cover border-[0.5px] border-neutral-200 dark:border-neutral-800"
                  />
                  <div className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                    <span className="font-bold">{article.author.name}</span> • {article.date} • {article.readingTime}
                  </div>
                </div>
              </div>

              {hasImage && (
                <div className={`shrink-0 rounded-lg overflow-hidden border-[0.5px] border-neutral-250 dark:border-neutral-750 bg-neutral-100 dark:bg-neutral-900 ${
                  index === 0 ? "w-full md:w-64 aspect-[4/3] md:aspect-square" : "w-full aspect-[16/10] mt-4"
                }`}>
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Partners News Section */}
      {partnerArticles.length > 0 && (
        <div className="border-t-[0.5px] border-neutral-200 dark:border-neutral-800 pt-8 mt-4 text-left">
          <h3 className="text-xs font-sans font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4">
            Our Partners' News
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partnerArticles.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.id}`}
                className="p-6 bg-neutral-50/50 dark:bg-neutral-900/10 border-[0.5px] border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(216,180,254,0.02)] rounded-xl cursor-pointer transition-all duration-300 block"
              >
                <span className="text-[9px] font-sans tracking-widest text-neutral-450 dark:text-neutral-555 uppercase font-semibold block mb-1">
                  Partner Article
                </span>
                <h4 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-100 hover:underline mb-2">
                  {article.title}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                  {article.summary}
                </p>
                <div className="flex items-center gap-2">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                    By {article.author.name} • {article.readingTime}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
export default ArticleGrid;
