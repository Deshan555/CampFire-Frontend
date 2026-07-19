import React from "react";
import { Link } from "react-router-dom";
import type { Article } from "../data/articles";
import ArticleArtwork from "./ArticleArtwork";

interface FeaturedArticleProps {
  article: Article;
}

export const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article }) => {
  if (!article) return null;

  return (
    <div className="w-full px-6 py-8 md:py-12 bg-brand-charcoal text-white transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto">
        <article className="editorial-card text-neutral-900 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-stretch">
          
          {/* Left Text details */}
          <div className="flex-1 flex flex-col justify-between text-left gap-6">
            <div>
              <span className="text-xs md:text-sm font-serif italic text-neutral-500 block mb-2">
                {article.date}
              </span>
              
              <Link
                to={`/article/${article.id}`}
                className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black leading-[1.15] text-neutral-900 hover:text-accent-coral transition-colors mb-3 block"
              >
                {article.title}
              </Link>
              
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-sans mb-4">
                {article.summary}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Author & reading time */}
              <div className="flex items-center gap-3 border-t border-neutral-300/80 pt-4">
                {article.author?.avatar ? (
                  <img
                    src={article.author.avatar}
                    alt={article.author?.name || "Article author"}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-900"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-600">
                    {(article.author?.name || "E").charAt(0)}
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-neutral-850 block">
                    {article.author?.name || "Editorial Team"} ({article.author?.role || "Editor"})
                  </span>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold font-display">
                    {article.readingTime}
                  </span>
                </div>
              </div>

              {/* Tags block */}
              <div className="flex gap-2 flex-wrap">
                {(article.hashtags || []).slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="editorial-tag"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Image */}
          <Link
            to={`/article/${article.id}`}
            className="flex-1 aspect-[16/10] md:aspect-auto md:w-1/2 bg-neutral-200 rounded-3xl overflow-hidden group cursor-pointer block"
          >
            <ArticleArtwork article={article} eager className="group-hover:scale-[1.02]" />
          </Link>

        </article>
      </div>
    </div>
  );
};

export default FeaturedArticle;
