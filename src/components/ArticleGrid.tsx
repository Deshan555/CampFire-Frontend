import { Bookmark, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import type { Article } from "../data/articles";
import ArticleArtwork from "./ArticleArtwork";

interface ArticleGridProps {
  articles: Article[];
}

export default function ArticleGrid({ articles }: ArticleGridProps) {
  return (
    <section className="latest-stories" aria-labelledby="latest-stories-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Fresh from the desk</p>
          <h2 id="latest-stories-heading">Latest stories</h2>
        </div>
        <p>{articles.length} stories in this edition</p>
      </div>

      <div className="newspaper-story-list">
        {articles.map((article, index) => (
          <article key={article.id} className="newspaper-story-row story-link-group">
            <span className="newspaper-story-number">{String(index + 1).padStart(2, "0")}</span>

            <Link to={`/article/${article.id}`} className="newspaper-story-image">
              <ArticleArtwork article={article} />
            </Link>

            <div className="newspaper-story-copy">
              <p className="category-label">{article.category}</p>
              <Link to={`/article/${article.id}`}><h3>{article.title}</h3></Link>
              <p className="newspaper-story-summary">{article.summary}</p>
              <p className="story-meta">
                <span>{article.author?.name || "CampFire Editors"}</span>
                <span>{article.date}</span>
              </p>
            </div>

            <div className="newspaper-story-aside">
              <span><Clock size={14} />{article.readingTime}</span>
              <button type="button" aria-label={`Save ${article.title}`}><Bookmark size={17} /></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
