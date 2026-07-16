import React from "react";
import { Link } from "react-router-dom";
import type { Article } from "../data/articles";
import HeroNavigation from "./HeroNavigation";

interface HeroSectionProps {
  articles: Article[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user?: any;
  onLogout?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  articles,
  searchQuery,
  onSearchChange,
  user,
  onLogout,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (!articles || articles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % articles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [articles]);

  if (!articles || articles.length === 0) return null;

  const article = articles[currentIndex];

  return (
    <div className="w-full relative rounded-b-3xl overflow-hidden mb-10 group" style={{ minHeight: '600px', height: '70vh' }}>
      {/* Background Images for smooth transitions */}
      {articles.map((art, index) => (
        <img
          key={art.id}
          src={art.image || "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80"}
          alt={art.title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out group-hover:scale-105 group-hover:duration-[3000ms] ${
            index === currentIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 z-10" 
        style={{ 
          background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.7) 100%)' 
        }} 
      />

      {/* Navigation (Top) */}
      <HeroNavigation 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        user={user}
        onLogout={onLogout}
      />

      {/* Content (Bottom) */}
      <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20 text-white flex flex-col md:flex-row justify-between items-end gap-8">
        
        {/* Left: Article Details */}
        <div className="flex-1 max-w-3xl">
          <span className="inline-block px-4 py-1.5 mb-4 text-[11px] font-medium tracking-wide bg-black/40 backdrop-blur-sm rounded-full text-white/90">
            {article.category}
          </span>
          
          <Link to={`/article/${article.id}`} className="block group/title">
            <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-3 text-white group-hover/title:text-white/90 transition-colors">
              {article.title}
            </h1>
          </Link>
          
          <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-2xl font-medium mb-6">
            {article.summary}
          </p>

          {/* Dot Pagination Indicator */}
          <div className="flex items-center gap-2">
            {articles.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                  idx === currentIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right: Author Metadata */}
        <div className="flex items-center gap-3 flex-shrink-0 self-end mb-2">
          <img
            src={article.author.avatar}
            alt={article.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">
              {article.author.name}
            </span>
            <span className="text-[11px] text-white/70 font-medium">
              {article.date} • {article.readingTime}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroSection;
