import { Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import type { Article } from "../data/articles";
import ArticleArtwork from "./ArticleArtwork";

interface ArticleGridProps {
  articles: Article[];
}

export default function ArticleGrid({ articles }: ArticleGridProps) {
  const featured = articles.slice(0, 2);
  const compact = articles.slice(2);

  return (
    <section className="latest-stories" aria-labelledby="latest-stories-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Fresh from the desk</p>
          <h2 id="latest-stories-heading">Latest stories</h2>
        </div>
        <p>{articles.length} stories in this edition</p>
      </div>

      <div className="latest-layout">
        <div className="standard-story-grid">
          {featured.map((article) => (
            <article key={article.id} className="standard-story story-link-group">
              <Link to={`/article/${article.id}`} className="standard-story__image">
                <ArticleArtwork article={article} />
              </Link>
              <div className="story-heading-row">
                <p className="category-label">{article.category}</p>
                <button type="button" aria-label={`Save ${article.title}`}><Bookmark size={16} /></button>
              </div>
              <Link to={`/article/${article.id}`}><h3>{article.title}</h3></Link>
              <p className="standard-story__summary">{article.summary}</p>
              <p className="story-meta"><span>{article.author?.name || "CampFire Editors"}</span><span>{article.readingTime}</span></p>
            </article>
          ))}
        </div>

        <div className="compact-story-list">
          {compact.map((article) => (
            <article key={article.id} className="compact-story story-link-group">
              <Link to={`/article/${article.id}`} className="compact-story__image">
                <ArticleArtwork article={article} />
              </Link>
              <div>
                <p className="category-label">{article.category}</p>
                <Link to={`/article/${article.id}`}><h3>{article.title}</h3></Link>
                <p className="story-meta"><span>{article.date}</span><span>{article.readingTime}</span></p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
