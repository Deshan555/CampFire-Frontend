import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ARTICLES, AUTHORS, type Article } from "../data/articles";
import AdSensePlaceholder from "./AdSensePlaceholder";
import { subscribeNewsletter } from "../api";

interface RightSidebarProps {
  articles?: Article[];
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ articles = [] }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<number | null>(null);

  // Filter trending articles
  const trendingArticles = articles.length > 0
    ? articles.filter((a) => a.trending)
    : ARTICLES.filter((a) => a.trending);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      subscribeNewsletter(email.trim())
        .then(() => {
          setSubscribed(true);
          setEmail("");
        })
        .catch((err) => {
          console.error("⚠️ Failed to subscribe to newsletter API:", err);
        });
    }
  };

  const emojis = [
    { label: "Unhappy", symbol: "😞", iconClass: "fa-regular fa-face-frown text-red-500 hover:text-red-650 transition-colors" },
    { label: "Neutral", symbol: "😐", iconClass: "fa-regular fa-face-meh text-amber-500 hover:text-amber-605 transition-colors" },
    { label: "Happy", symbol: "😊", iconClass: "fa-regular fa-face-smile text-emerald-500 hover:text-emerald-605 transition-colors" },
    { label: "Loved it", symbol: "🤩", iconClass: "fa-solid fa-face-grin-stars text-accent-coral" },
  ];

  return (
    <aside className="w-full lg:w-80 shrink-0 p-6 flex flex-col gap-8 lg:border-l-[0.5px] border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
      
      {/* 1. Trending Widget */}
      <div className="border-b-[0.5px] border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <h3 className="text-sm font-sans font-extrabold uppercase tracking-widest text-neutral-800 dark:text-neutral-250">
              Trending
            </h3>
          </div>
          <button className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer">
            View all
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {trendingArticles.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.id}`}
              className="group cursor-pointer text-left py-1 hover:opacity-85 transition-opacity block"
            >
              <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:underline line-clamp-2 leading-snug">
                {article.title}
              </h4>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-sans mt-1 block">
                {article.date} • {article.readingTime}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. Our Authors Showcase */}
      <div className="border-b-[0.5px] border-neutral-200 dark:border-neutral-800 pb-6 text-left">
        <h3 className="text-sm font-sans font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4">
          Our Authors
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.values(AUTHORS).map((author) => (
            <div key={author.name} className="flex items-center gap-2 group">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-8 h-8 rounded-full object-cover border-[0.5px] border-neutral-200 dark:border-neutral-800 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-100 truncate">
                  {author.name}
                </p>
                <p className="text-[9px] text-neutral-400 dark:text-neutral-500 truncate">
                  {author.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Soft Green Newsletter Subscription Box */}
      <div className="relative bg-gradient-to-br from-accent-green via-emerald-100 to-accent-green/85 dark:from-emerald-950/45 dark:via-neutral-900/60 dark:to-emerald-950/20 text-neutral-900 dark:text-neutral-100 p-6 rounded-2xl overflow-hidden border-[0.5px] border-emerald-350 dark:border-emerald-900/40 select-none text-left shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Abstract background graphics */}
        <svg
          className="absolute inset-0 opacity-15 pointer-events-none"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M-20,60 Q40,120 120,40 T280,140" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-900 dark:text-neutral-600" />
          <path d="M-10,80 Q60,150 140,70 T300,160" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-900 dark:text-neutral-600" />
        </svg>

        <h4 className="font-serif text-2xl font-black leading-tight tracking-tight uppercase mb-2">
          Subscribe To Read More
        </h4>
        <p className="text-xs text-neutral-850 dark:text-neutral-350 leading-relaxed mb-4 font-medium">
          Get unlimited access for <span className="font-bold">80 cents/week</span> and receive instant notifications about new releases.
        </p>

        {subscribed ? (
          <div className="bg-white/95 dark:bg-neutral-900/90 text-emerald-800 dark:text-emerald-400 text-xs font-semibold py-2 px-3 rounded-lg border-[0.5px] border-emerald-250 dark:border-emerald-900/60 text-center animate-fade-in">
            ✓ Successfully subscribed! Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2 relative z-10">
            <input
              type="email"
              placeholder="Your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white/90 dark:bg-neutral-900/60 focus:bg-white dark:focus:bg-neutral-900 text-xs border-[0.5px] border-emerald-350 dark:border-neutral-800 rounded-full focus:outline-none focus:ring-1 focus:ring-emerald-600 text-neutral-900 dark:text-neutral-200 placeholder-neutral-450 dark:placeholder-neutral-600 transition-all"
            />
            <button
              type="submit"
              className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 text-white text-xs font-semibold rounded-full transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Subscribe</span>
              <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          </form>
        )}
      </div>

      {/* 4. Detailed Recommendation Card (Using Mobile App Mockup) */}
      <div className="border-b-[0.5px] border-neutral-200 dark:border-neutral-800 pb-6 text-left">
        <h3 className="text-sm font-sans font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4">
          Editor's Pick
        </h3>
        <Link
          to="/article/banking-app"
          className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border-[0.5px] border-neutral-200 dark:border-neutral-800 hover:opacity-95 transition-opacity block cursor-pointer"
        >
          <div className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden border-[0.5px] border-neutral-350 dark:border-neutral-700 mb-3">
            <img
              src="/mobile_finances_mockup.png"
              alt="Manage your finances wisely app display"
              className="w-full h-full object-cover"
            />
          </div>
          <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1 leading-snug hover:underline">
            The popularity of mobile banking
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-450 leading-relaxed line-clamp-2">
            Why digital transactions have seen a massive surge in global adoption and how users manage assets.
          </p>
        </Link>
      </div>

      {/* 5. Feedback Rating Widget */}
      <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border-[0.5px] border-neutral-200 dark:border-neutral-800">
        <h4 className="text-xs font-sans font-bold text-neutral-700 dark:text-neutral-300 mb-3 select-none">
          How did you like the article?
        </h4>
        {feedbackSubmitted !== null ? (
          <p className="text-xs font-medium text-purple-650 dark:text-purple-405 animate-pulse flex items-center justify-center gap-1.5">
            Thank you for your feedback! <i className={`${emojis[feedbackSubmitted].iconClass} text-base`}></i>
          </p>
        ) : (
          <div className="flex justify-center gap-3.5">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => setFeedbackSubmitted(index)}
                title={emoji.label}
                className="hover:scale-125 transition-all duration-200 cursor-pointer flex items-center justify-center p-0.5"
              >
                <i className={`${emoji.iconClass} text-xl`}></i>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Elegant ad placement simulation inside sidebar */}
      <AdSensePlaceholder type="sidebar" />
      
    </aside>
  );
};
export default RightSidebar;
