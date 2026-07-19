import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Article } from "../data/articles";
import ArticleArtwork from "./ArticleArtwork";

interface PromotionalSectionProps {
  articles: Article[];
}

export default function PromotionalSection({ articles }: PromotionalSectionProps) {
  const feature = articles.find((article) => article.featured) || articles[0];
  if (!feature) return null;

  return (
    <section className="magazine-feature" aria-labelledby="magazine-feature-title">
      <div className="magazine-copy">
        <p className="eyebrow">CampFire original</p>
        <p className="magazine-edition">The long read / {feature.category}</p>
        <h2 id="magazine-feature-title">{feature.title}</h2>
        <p>{feature.summary}</p>
        <Link to={`/article/${feature.id}`}>Continue reading <ArrowRight size={17} /></Link>
      </div>
      <Link to={`/article/${feature.id}`} className="magazine-image">
        <ArticleArtwork article={feature} />
      </Link>
    </section>
  );
}
