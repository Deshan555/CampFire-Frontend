import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Banner from "./components/Banner";
import Navbar from "./components/Navbar";
import FeaturedArticle from "./components/FeaturedArticle";
import ArticleGrid from "./components/ArticleGrid";
import ArticlePage from "./pages/ArticlePage";
import CrmDashboard from "./pages/CrmDashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import AiWriterPage from "./pages/AiWriterPage";
import CanvesAnimationShowcase from "./components/canves-animations";
import PodcastWidget from "./components/PodcastWidget";
import ArtistSpotlight from "./components/ArtistSpotlight";
import NewsletterSignup from "./components/NewsletterSignup";
import MustSeeMoments from "./components/MustSeeMoments";
import Footer from "./components/Footer";
import FloatingBottomNav from "./components/FloatingBottomNav";
import { fetchArticles } from "./api";
import type { Article } from "./data/articles";

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [darkMode, setDarkMode] = useState(false);

  // Load theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const location = useLocation();

  // Fetch articles from Express backend on mount or when navigating to home
  useEffect(() => {
    let active = true;
    if (location.pathname === "/") {
      setLoading(true);
      fetchArticles()
        .then((data) => {
          if (active) {
            setArticles(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("⚠️ Error loading articles from server:", err);
          if (active) {
            setLoading(false);
          }
        });
    } else {
      if (articles.length === 0) {
        fetchArticles()
          .then((data) => {
            if (active) {
              setArticles(data);
              setLoading(false);
            }
          })
          .catch((err) => {
            console.error("⚠️ Error loading articles from server:", err);
            if (active) {
              setLoading(false);
            }
          });
      } else {
        setLoading(false);
      }
    }
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const handleToggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  // Find the featured article from dynamic dataset
  const featuredArticle = articles.find((a) => a.featured) || articles[0];

  // Filtering logic
  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (selectedCategory === "Trending" ? article.trending : article.category === selectedCategory);

    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const showLayout = location.pathname !== "/ai-writer" && location.pathname !== "/editor";

  return (
    <div className={`min-h-screen flex flex-col bg-white dark:bg-brand-dark transition-colors duration-300 ${showLayout ? "pb-24" : ""}`}>
      {/* 1. Global Banner */}
      {showLayout && <Banner />}

      {/* 2. Top Header Navbar */}
      {showLayout && (
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* 3. Routing Layer */}
      <Routes>
        {/* Home Feed Route */}
        <Route
          path="/"
          element={
            <div className="flex-1 w-full bg-brand-light dark:bg-brand-dark flex flex-col">
              {loading ? (
                <div className="py-48 text-center flex flex-col items-center justify-center flex-grow">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neutral-900 dark:border-white mb-4"></div>
                  <p className="font-serif italic text-xs text-neutral-500 uppercase tracking-widest">
                    Loading CANVES Edition...
                  </p>
                </div>
              ) : searchQuery !== "" || (selectedCategory !== "All" && selectedCategory !== "Trending") ? (
                /* Dynamic filtered search / category list */
                <main className="max-w-[1400px] w-full mx-auto p-6 md:p-8 flex flex-col gap-6 flex-grow">
                  <div className="text-left border-b-[1.5px] border-brand-dark pb-4 mb-4 mt-6">
                    <span className="text-[10px] text-accent-coral uppercase tracking-widest font-extrabold font-display block mb-1">
                      Category Feed
                    </span>
                    <h2 className="font-serif font-black text-3xl leading-tight text-neutral-900 dark:text-white uppercase tracking-tight">
                      {searchQuery !== "" ? `Search results for "${searchQuery}"` : `${selectedCategory} Articles`}
                    </h2>
                  </div>

                  {filteredArticles.length === 0 ? (
                    <div className="py-24 text-center border-[1.5px] border-brand-dark rounded-xl bg-brand-cream dark:bg-brand-charcoal text-neutral-500 dark:text-neutral-400 p-8 shadow-[3px_3px_0px_0px_#111]">
                      <p className="font-serif text-lg italic">No articles found matching your criteria.</p>
                      <button
                        onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                        className="mt-6 px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold rounded-md border border-neutral-900 hover:opacity-90 cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <ArticleGrid articles={filteredArticles} />
                  )}
                </main>
              ) : (
                /* Editorial inspired print layout */
                <>
                  {/* Big homepage title brand banner */}
                  <div className="w-full bg-brand-charcoal text-white pt-10 pb-6 px-6 select-none border-b border-neutral-900">
                    <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-800 pb-8">
                      <div className="text-left">
                        <h1 className="font-display font-black text-6xl sm:text-7xl md:text-8xl lg:text-10xl leading-[0.85] tracking-tighter uppercase">
                          THE CANVES
                        </h1>
                        <p className="text-xs text-accent-coral uppercase tracking-widest font-extrabold font-display mt-3.5 pl-1.5">
                          Blog about art music design.
                        </p>
                      </div>
                      
                      {/* Social Audio buttons */}
                      <div className="flex gap-3 shrink-0 mb-1">
                        <button className="w-9 h-9 rounded-full bg-accent-coral hover:bg-accent-coral-dark text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md" title="Soundcloud">
                          <i className="fa-brands fa-soundcloud text-base"></i>
                        </button>
                        <button className="w-9 h-9 rounded-full bg-accent-coral hover:bg-accent-coral-dark text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md" title="Spotify">
                          <i className="fa-brands fa-spotify text-base"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal featured article block */}
                  <FeaturedArticle article={featuredArticle} />

                  {/* Podcast block */}
                  <PodcastWidget />

                  {/* Artist Spotlight block */}
                  <ArtistSpotlight articles={articles} />

                  {/* Newsletter block */}
                  <NewsletterSignup />

                  {/* Must-See Moments bottom block */}
                  <MustSeeMoments articles={articles} />
                </>
              )}
            </div>
          }
        />

        {/* Dedicated Full Page Article View */}
        <Route
          path="/article/:id"
          element={
            <div className="flex-1 bg-white dark:bg-brand-dark">
              <ArticlePage />
            </div>
          }
        />

        {/* CRM Dashboard Route */}
        <Route
          path="/editor"
          element={
            <div className="flex-1 bg-white dark:bg-brand-dark">
              <CrmDashboard />
            </div>
          }
        />

        {/* Public AI Writer Playground Route */}
        <Route
          path="/ai-writer"
          element={
            <div className="flex-1 bg-white dark:bg-brand-dark">
              <AiWriterPage />
            </div>
          }
        />

        {/* Editor Login Route */}
        <Route
          path="/login"
          element={
            <div className="flex-1 bg-white dark:bg-brand-dark">
              <LoginPage />
            </div>
          }
        />

        {/* Reader Register Route */}
        <Route
          path="/register"
          element={
            <div className="flex-1 bg-white dark:bg-brand-dark">
              <RegisterPage />
            </div>
          }
        />

        {/* Admin Register Route */}
        <Route
          path="/admin/register"
          element={
            <div className="flex-1 bg-white dark:bg-brand-dark">
              <AdminRegisterPage />
            </div>
          }
        />

        {/* Animation Showcase Route */}
        <Route
          path="/animation-showcase"
          element={
            <div className="flex-1">
              <CanvesAnimationShowcase />
            </div>
          }
        />
      </Routes>

      {/* 4. Global Footer */}
      {showLayout && <Footer />}

      {/* 5. Floating Bottom Nav */}
      {showLayout && <FloatingBottomNav />}
    </div>
  );
}

export default App;
