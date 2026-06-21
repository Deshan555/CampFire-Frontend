import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Banner from "./components/Banner";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import FeaturedArticle from "./components/FeaturedArticle";
import RightSidebar from "./components/RightSidebar";
import ArticleGrid from "./components/ArticleGrid";
import ArticlePage from "./pages/ArticlePage";
import CrmDashboard from "./pages/CrmDashboard";
import LoginPage from "./pages/LoginPage";
import AdSensePlaceholder from "./components/AdSensePlaceholder";
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
      selectedCategory === "All" || article.category === selectedCategory;

    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-brand-dark transition-colors duration-300">
      {/* 1. Global Banner */}
      <Banner />

      {/* 2. Top Header Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* 3. Routing Layer */}
      <Routes>
        {/* Home Feed Route */}
        <Route
          path="/"
          element={
            <div className="flex-1 max-w-[1440px] w-full mx-auto flex flex-col md:flex-row border-x-[0.5px] border-neutral-200 dark:border-neutral-800">
              {/* Left Sidebar */}
              <Sidebar
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* Main Content Area */}
              <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 border-r-[0.5px] border-neutral-200 dark:border-neutral-800">
                {/* AdSense Top Banner */}
                <AdSensePlaceholder type="banner" className="h-20 w-full mb-4" />

                {loading ? (
                  <div className="py-32 text-center flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white mb-4"></div>
                    <p className="font-serif italic text-sm text-neutral-500 uppercase tracking-widest">
                      Loading Current Edition...
                    </p>
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div className="py-20 text-center text-neutral-500 dark:text-neutral-400 border-[0.5px] border-dashed border-neutral-200 dark:border-neutral-850 rounded-2xl">
                    <p className="font-serif text-lg italic">No articles found matching your criteria.</p>
                    <button
                      onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                      className="mt-4 px-6 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold rounded-full hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Featured Article */}
                    {(selectedCategory === "All" || (featuredArticle && featuredArticle.category === selectedCategory)) &&
                      (searchQuery === "" || (featuredArticle && filteredArticles.some(a => a.id === featuredArticle.id))) && (
                        <FeaturedArticle article={featuredArticle} />
                    )}

                    {/* Secondary Articles Grid */}
                    <ArticleGrid articles={filteredArticles} />
                  </>
                )}

                {/* AdSense Bottom Banner */}
                <AdSensePlaceholder type="banner" className="h-20 w-full mt-4" />
              </main>

              {/* Right Sidebar Widgets */}
              <RightSidebar />
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

        {/* Editor Login Route */}
        <Route
          path="/login"
          element={
            <div className="flex-1 bg-white dark:bg-brand-dark">
              <LoginPage />
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
