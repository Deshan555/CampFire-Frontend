import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Article } from "../data/articles";
import ArticleArtwork from "./ArticleArtwork";

interface HeroSectionProps {
  articles: Article[];
}

const Meta = ({ article }: { article: Article }) => (
  <p className="story-meta">
    <span>{article.author?.name || "CampFire Editors"}</span>
    <span>{article.date}</span>
    <span>{article.readingTime}</span>
  </p>
);

export default function HeroSection({ articles }: HeroSectionProps) {
  if (articles.length === 0) return null;

  const [lead, supporting, ...secondary] = articles;
  const sideStories = secondary.slice(0, 3);

  return (
    <section className="top-stories editorial-shell" aria-labelledby="top-stories-heading">
      <div className="section-kicker-row">
        <div>
          <p className="eyebrow">Today&apos;s edition</p>
          <h1 id="top-stories-heading">Stories worth gathering around</h1>
        </div>
        <Link to={`/article/${lead.id}`} className="text-action">Read the lead story <ArrowUpRight size={16} /></Link>
      </div>

      <div className="lead-grid">
        <article className="lead-story story-link-group">
          <Link to={`/article/${lead.id}`} className="lead-story__image">
            <ArticleArtwork article={lead} eager />
          </Link>
          <p className="category-label">{lead.category}</p>
          <Link to={`/article/${lead.id}`}><h2>{lead.title}</h2></Link>
          <p className="lead-summary">{lead.summary}</p>
          <Meta article={lead} />
        </article>

        {supporting && (
          <article className="supporting-story story-link-group">
            <Link to={`/article/${supporting.id}`} className="supporting-story__image">
              <ArticleArtwork article={supporting} eager />
            </Link>
            <p className="category-label">{supporting.category}</p>
            <Link to={`/article/${supporting.id}`}><h2>{supporting.title}</h2></Link>
            <p>{supporting.summary}</p>
            <Meta article={supporting} />
          </article>
        )}

        <aside className="latest-briefing" aria-label="Latest briefing">
          <div className="briefing-heading">
            <p className="eyebrow">The briefing</p>
            <span>Live</span>
          </div>
          {sideStories.length > 0 ? sideStories.map((article, index) => (
            <article key={article.id} className="briefing-item story-link-group">
              <span className="briefing-number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="category-label">{article.category}</p>
                <Link to={`/article/${article.id}`}><h3>{article.title}</h3></Link>
                <p className="story-meta"><span>{article.date}</span><span>{article.readingTime}</span></p>
              </div>
            </article>
          )) : (
            <p className="briefing-empty">More stories will appear as the edition develops.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
