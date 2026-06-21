import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchArticleDetails, likeArticle } from "../api";
import type { Article } from "../data/articles";
import VideoPlayer from "../components/VideoPlayer";

export const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
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

        {/* Multi-column editorial body columns */}
        <div className="editorial-prose text-neutral-800 dark:text-neutral-200 md:columns-2 gap-8 column-fill-auto mb-12 select-text text-justify">
          {article.content.map((paragraph, index) => (
            <p key={index} className="text-base sm:text-lg leading-relaxed font-sans mb-6">
              {paragraph}
            </p>
          ))}
          
          <blockquote className="break-inside-avoid border-l-2 border-neutral-900 dark:border-neutral-100 pl-6 py-2 italic font-serif text-xl text-neutral-900 dark:text-neutral-50 my-6">
            "Aesthetic excellence and content density go hand in hand on premium publishing platforms."
          </blockquote>
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

      </article>
    </div>
  );
};

export default ArticlePage;
