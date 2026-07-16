import React from "react";
import { Link } from "react-router-dom";
import type { Article } from "../data/articles";

interface ArticleGridProps {
  articles: Article[];
}

export const ArticleGrid: React.FC<ArticleGridProps> = ({ articles }) => {
  return (
    <section className="w-full pb-12 transition-colors duration-300">
      
      {/* Primary Grid Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {articles.map((article) => {
          return (
            <Link
              key={article.id}
              to={`/article/${article.id}`}
              className="flex flex-col group cursor-pointer text-left"
            >
              {/* Image with floating badge */}
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-5 bg-gray-100">
                <img
                  src={article.image || "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80"}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-[10px] font-medium tracking-wide capitalize bg-black/40 backdrop-blur-sm rounded-full text-white/90">
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Meta data */}
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3 tracking-wide">
                <span>{article.date}</span>
                <span>•</span>
                <span>{article.readingTime}</span>
              </div>

              {/* Title & Summary */}
              <div className="flex-1">
                <h3 className="font-serif text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-black transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed mb-4 font-normal">
                  {article.summary}
                </p>
              </div>
              
              {/* Author */}
              <div className="flex items-center gap-2 mt-auto">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-[11px] font-bold text-gray-900">
                  {article.author.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ArticleGrid;
