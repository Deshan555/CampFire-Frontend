import { useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { fetchArticles } from "./api";
import ArticleGrid from "./components/ArticleGrid";
import CanvesAnimationShowcase from "./components/canves-animations";
import Footer from "./components/Footer";
import HeroNavigation from "./components/HeroNavigation";
import HeroSection from "./components/HeroSection";
import Pagination from "./components/Pagination";
import PromotionalSection from "./components/PromotionalSection";
import type { Article } from "./data/articles";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import AiWriterPage from "./pages/AiWriterPage";
import ArticlePage from "./pages/ArticlePage";
import CrmDashboard from "./pages/CrmDashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

type FeedFilter = "ALL" | "NEW" | "TRENDING" | "MORE";
type SessionUser = { name?: string; username?: string };

const readSession = (): SessionUser | null => {
  try {
    const stored = localStorage.getItem("editorUser");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<SessionUser | null>(readSession);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchArticles()
      .then((data) => {
        if (!active) return;
        setArticles(Array.isArray(data) ? data : []);
        setLoadError(false);
      })
      .catch((error) => {
        console.error("Error loading articles:", error);
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const syncSession = () => setUser(readSession());
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, []);

  const categories = useMemo(() => [
    "All",
    ...Array.from(new Set(articles.map((article) => article.category).filter(Boolean))).sort()
  ], [articles]);

  const subcategories = useMemo(() => [
    "All",
    ...Array.from(new Set(
      articles
        .filter((article) => selectedCategory === "All" || article.category === selectedCategory)
        .map((article) => article.subcategory)
        .filter((value): value is string => Boolean(value))
    )).sort()
  ], [articles, selectedCategory]);

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
      const matchesSubcategory = selectedSubcategory === "All" || article.subcategory === selectedSubcategory;
      const matchesFeed =
        feedFilter === "ALL" ||
        (feedFilter === "TRENDING" && article.trending) ||
        (feedFilter === "NEW" && !article.trending) ||
        (feedFilter === "MORE" && Boolean(article.featured || article.isPartner || (article.likes || 0) > 0));
      const matchesSearch = !query || [
        article.title,
        article.summary,
        article.category,
        article.subcategory,
        article.author?.name
      ].some((value) => (value || "").toLowerCase().includes(query));
      return matchesCategory && matchesSubcategory && matchesFeed && matchesSearch;
    });
  }, [articles, feedFilter, searchQuery, selectedCategory, selectedSubcategory]);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / itemsPerPage));
  const paginatedArticles = filteredArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const heroArticles = (articles.some((article) => article.featured)
    ? [...articles.filter((article) => article.featured), ...articles.filter((article) => !article.featured)]
    : articles).slice(0, 5);

  const publicationShell = !location.pathname.startsWith("/admin") && location.pathname !== "/editor" && location.pathname !== "/ai-writer";

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory("All");
    setFeedFilter("ALL");
    setCurrentPage(1);
  };

  const selectFeed = (filter: FeedFilter) => {
    setFeedFilter(filter);
    setCurrentPage(1);
  };

  const logout = () => {
    localStorage.removeItem("editorUser");
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <div className="app-shell">
      {publicationShell && (
        <HeroNavigation
          searchQuery={searchQuery}
          onSearchChange={(query) => { setSearchQuery(query); setCurrentPage(1); }}
          user={user}
          onLogout={logout}
          categories={categories}
          subcategories={subcategories}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          feedFilter={feedFilter}
          onSelectCategory={selectCategory}
          onSelectSubcategory={(subcategory) => { setSelectedSubcategory(subcategory); setCurrentPage(1); }}
          onSelectFeedFilter={selectFeed}
        />
      )}

      <main className="app-main">
        <Routes>
          <Route path="/" element={
            loading ? (
              <div className="editorial-shell editorial-loading" aria-label="Loading stories">
                <span /><span /><span /><span />
              </div>
            ) : loadError ? (
              <div className="editorial-shell publication-empty">
                <p className="eyebrow">Edition unavailable</p>
                <h1>We could not reach the editorial desk.</h1>
                <p>Check the backend connection and refresh to load the current edition.</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="editorial-shell publication-empty">
                <p className="eyebrow">The next edition</p>
                <h1>New stories are being prepared.</h1>
                <p>Published articles will appear here as soon as the editorial desk releases them.</p>
              </div>
            ) : (
              <div className="home-publication">
                <HeroSection articles={heroArticles} />
                <div className="editorial-shell">
                  {paginatedArticles.length > 0 ? (
                    <ArticleGrid articles={paginatedArticles} />
                  ) : (
                    <div className="publication-empty publication-empty--compact">
                      <p className="eyebrow">No matching stories</p>
                      <h2>Try another topic or search.</h2>
                    </div>
                  )}
                  {filteredArticles.length > itemsPerPage && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  )}
                  <PromotionalSection articles={filteredArticles.length > 0 ? filteredArticles : articles} />
                </div>
              </div>
            )
          } />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/animation-showcase" element={<CanvesAnimationShowcase />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/editor" element={<CrmDashboard />} />
          <Route path="/ai-writer" element={<AiWriterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />
        </Routes>
      </main>

      {publicationShell && <Footer categories={categories} />}
    </div>
  );
}

export default App;
