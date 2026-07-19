import type { Article } from "../data/articles";
import type { CSSProperties } from "react";

interface ArticleArtworkProps {
  article: Article;
  className?: string;
  eager?: boolean;
}

const categoryTone = (category: string) => {
  const tones = ["#C83C2D", "#47704D", "#426C91", "#D96B32", "#6E5548"];
  const index = Array.from(category || "CampFire").reduce((total, char) => total + char.charCodeAt(0), 0);
  return tones[index % tones.length];
};

export default function ArticleArtwork({ article, className = "", eager = false }: ArticleArtworkProps) {
  if (article.image) {
    return (
      <img
        src={article.image}
        alt={article.title}
        className={`article-artwork ${className}`}
        loading={eager ? "eager" : "lazy"}
      />
    );
  }

  const accent = categoryTone(article.category);

  return (
    <div
      className={`article-placeholder ${className}`}
      style={{ "--placeholder-accent": accent } as CSSProperties}
      role="img"
      aria-label={`Editorial cover for ${article.title}`}
    >
      <span className="article-placeholder__edition">CampFire / Editorial</span>
      <span className="article-placeholder__initial">{article.title.charAt(0).toUpperCase()}</span>
      <span className="article-placeholder__category">{article.category}</span>
    </div>
  );
}
