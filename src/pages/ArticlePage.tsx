import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchArticleDetails, likeArticle, fetchArticleSuggestions } from "../api";
import type { Article } from "../data/articles";
import VideoPlayer from "../components/VideoPlayer";
import Markdown from "../components/Markdown";

export const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  
  // Likes state
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Emojis feedback state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<number | null>(null);

  // Load article details from API
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setFetchError(false);
    
    let userParams: any = undefined;
    try {
      const stored = localStorage.getItem("editorUser");
      if (stored) {
        const u = JSON.parse(stored);
        userParams = {
          role: u.role,
          authorUsername: u.username,
          authorName: u.name
        };
      }
    } catch (e) {
      console.error(e);
    }
    
    fetchArticleDetails(id, userParams)
      .then((data) => {
        setArticle(data);
        setLikes(data.likes || 0);
        setLoading(false);
        
        // Reset local interaction states
        setIsLiked(false);
        setIsFollowing(false);
        setIsSaved(false);
        setFeedbackSubmitted(null);
        
        // Scroll to top
        window.scrollTo(0, 0);
      })
      .catch((err) => {
        console.error("⚠️ Failed to load article details from API:", err);
        setFetchError(true);
        setLoading(false);
      });

    fetchArticleSuggestions(id)
      .then((data) => {
        setSuggestions(data);
      })
      .catch((err) => {
        console.error("⚠️ Failed to load article suggestions:", err);
        setSuggestions([]);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 py-32 text-center flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white mb-4"></div>
        <p className="font-serif italic text-sm text-neutral-505 text-neutral-500 uppercase tracking-widest">
          Loading Publication Details...
        </p>
      </div>
    );
  }

  if (fetchError || !article) {
    return (
      <div className="flex-1 py-20 text-center flex flex-col items-center justify-center">
        <h2 className="font-serif text-3xl font-black text-neutral-900 dark:text-neutral-55 mb-4">
          Article Not Found
        </h2>
        <p className="text-neutral-500 mb-8 max-w-sm">
          The publication you are searching for might have been archived or moved to another edition.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Return to home feed
        </Link>
      </div>
    );
  }

  const handleLike = () => {
    likeArticle(article.id)
      .then((res) => {
        setLikes(res.likes);
        setIsLiked(!isLiked);
      })
      .catch((err) => {
        console.error("⚠️ Failed to submit like:", err);
      });
  };

  const emojis = [
    { label: "Unhappy", symbol: "😞" },
    { label: "Neutral", symbol: "😐" },
    { label: "Happy", symbol: "😊" },
    { label: "Loved it", symbol: "🤩" },
  ];

  return (
    <div className="flex-1 w-full max-w-[900px] mx-auto px-6 py-12 border-x-[0.5px] border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
      
      {/* Back to feed button */}
      <div className="mb-8 flex justify-start">
        <Link
          to="/"
          className="group flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-455 dark:hover:text-neutral-100 transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          <span>Back to articles</span>
        </Link>
      </div>

      {/* Main article content panel */}
      <article className="text-left">
        {/* Category */}
        <span className="text-xs font-sans font-extrabold uppercase tracking-widest text-accent-purple dark:text-purple-400 mb-3 block">
          {article.category}
        </span>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-neutral-50 leading-[1.15] mb-6 select-text">
          {article.title}
        </h1>

        {/* Author details section */}
        <div className="flex flex-wrap items-center justify-between border-y-[0.5px] border-neutral-200 dark:border-neutral-800 py-4 mb-8">
          <div className="flex items-center gap-3">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-12 h-12 rounded-full object-cover border-[0.5px] border-neutral-200 dark:border-neutral-800"
            />
            <div>
              <p className="text-sm font-bold text-neutral-850 dark:text-neutral-50">
                {article.author.name}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-550 font-medium">
                {article.author.role} • {article.readingTime} • {article.date}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isFollowing
                  ? "bg-neutral-105 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  : "bg-neutral-900 text-white hover:bg-neutral-850 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2.5 rounded-full border-[0.5px] transition-all cursor-pointer ${
                isSaved
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent"
                  : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-550"
              }`}
              title="Bookmark"
            >
              <i className={`${isSaved ? "fa-solid" : "fa-regular"} fa-bookmark text-sm`}></i>
            </button>
          </div>
        </div>

        {/* Hero media display */}
        {article.video ? (
          <div className="w-full aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden mb-8 flex">
            <VideoPlayer
              src={article.video.src}
              poster={article.video.poster}
            />
          </div>
        ) : article.image ? (
          <div className="w-full aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden mb-8">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

        {/* Editorial body rendering Markdown (README) format */}
        <div className="editorial-prose text-neutral-850 dark:text-neutral-200 mb-12 max-w-2xl mx-auto select-text text-justify">
          <Markdown content={article.content.join("\n\n")} />
        </div>

        {/* Interactive Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between border-y-[0.5px] border-neutral-200 dark:border-neutral-800 py-6 my-10 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-[0.5px] text-sm font-semibold transition-all cursor-pointer ${
                isLiked
                  ? "bg-accent-purple/10 border-accent-purple text-purple-650 dark:text-purple-400"
                  : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-650 dark:text-neutral-450"
              }`}
            >
              <i className={`${isLiked ? "fa-solid" : "fa-regular"} fa-heart text-base`}></i>
              <span>{likes} Likes</span>
            </button>
            <button className="p-2.5 rounded-full border-[0.5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 cursor-pointer" title="Share nodes">
              <i className="fa-solid fa-share-nodes text-sm"></i>
            </button>
          </div>

          {/* Quick Reaction Emojis widget */}
          <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-900/30 px-5 py-2 rounded-full border-[0.5px] border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-sans font-bold text-neutral-500">Rate article:</span>
            {feedbackSubmitted !== null ? (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-455 animate-pulse">
                Thanks! {emojis[feedbackSubmitted].symbol}
              </span>
            ) : (
              <div className="flex gap-2">
                {emojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFeedbackSubmitted(idx)}
                    title={emoji.label}
                    className="text-base hover:scale-125 transition-transform cursor-pointer"
                  >
                    {emoji.symbol}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related / Suggested Articles Section */}
        {suggestions.length > 0 && (
          <div className="mt-16 pt-10 border-t-[0.5px] border-neutral-200 dark:border-neutral-800 text-left animate-fade-in">
            <h3 className="font-serif text-xl font-black text-neutral-900 dark:text-neutral-50 mb-6 tracking-tight">
              Suggested Reads
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {suggestions.map((art) => (
                <Link
                  key={art.id}
                  to={`/article/${art.id}`}
                  className="group flex flex-col gap-3 hover:opacity-95 transition-opacity cursor-pointer"
                >
                  {art.image ? (
                    <div className="aspect-[16/10] bg-neutral-105 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm shrink-0">
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] bg-neutral-50 dark:bg-neutral-900 border-[0.5px] border-neutral-250 dark:border-neutral-850 rounded-xl flex items-center justify-center shrink-0 text-neutral-350">
                      <i className="fa-solid fa-newspaper text-2xl"></i>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-accent-purple dark:text-purple-400">
                      {art.category}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-1 line-clamp-2 group-hover:underline leading-snug">
                      {art.title}
                    </h4>
                    <p className="text-[11px] text-neutral-450 dark:text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </article>
    </div>
  );
};

export default ArticlePage;
