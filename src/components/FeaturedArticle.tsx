import React from "react";
import { Link } from "react-router-dom";
import type { Article } from "../data/articles";

interface FeaturedArticleProps {
  article: Article;
}

export const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article }) => {
  return (
    <article className="border-b-[0.5px] border-neutral-200 dark:border-neutral-800 pb-12 transition-colors duration-300">
      {/* Newspaper style edition header */}
      <div className="border-b-[0.5px] border-neutral-200 dark:border-neutral-800 pb-6 mb-8 text-left">
        <span className="text-sm font-serif italic text-neutral-500 block mb-1">
          Thursday,
        </span>
        <h1 className="font-display text-[72px] sm:text-[96px] lg:text-[110px] leading-[0.85] font-black tracking-tight text-neutral-900 dark:text-neutral-50 uppercase select-none">
          February 12
        </h1>
      </div>

      {/* Author and meta block */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <img
            src={article.author.avatar}
            alt={article.author.name}
            className="w-10 h-10 rounded-full object-cover border-[0.5px] border-neutral-200 dark:border-neutral-800"
          />
          <div className="text-left">
            <span className="text-sm font-bold text-neutral-850 dark:text-neutral-200 block">
              {article.author.name}
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
              {article.date} • {article.readingTime} • {article.category}
            </span>
          </div>
        </div>

        {/* Action sharing triggers */}
        <div className="flex items-center gap-3 text-neutral-400 dark:text-neutral-500">
          <button className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-full transition-all hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer" title="Share article">
            <i className="fa-solid fa-share-nodes text-sm"></i>
          </button>
          <button className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-full transition-all hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer" title="Save bookmark">
            <i className="fa-solid fa-bookmark text-sm"></i>
          </button>
        </div>
      </div>

      {/* Article Title */}
      <Link
        to={`/article/${article.id}`}
        className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-left text-neutral-900 dark:text-neutral-100 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer transition-colors leading-[1.1] mb-6 block"
      >
        {article.title}
      </Link>

      {/* Featured Hero Image */}
      <Link
        to={`/article/${article.id}`}
        className="w-full aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden border-[0.5px] border-neutral-200 dark:border-neutral-800 mb-6 group cursor-pointer block"
      >
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out"
          loading="eager"
        />
      </Link>

      {/* Summary Paragraph */}
      <p className="text-neutral-605 dark:text-neutral-400 text-left text-base sm:text-lg leading-relaxed mb-6 font-sans">
        {article.summary}
      </p>

      {/* Read All Button */}
      <div className="flex justify-start">
        <Link
          to={`/article/${article.id}`}
          className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-semibold text-sm rounded-full flex items-center gap-2 group transition-all duration-300 shadow-sm cursor-pointer"
        >
          <span>Read article</span>
          <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
        </Link>
      </div>
    </article>
  );
};
export default FeaturedArticle;
