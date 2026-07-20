import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { fetchArticles, fetchArticlesPage, type PaginationMeta } from "./api";
import ArticleGrid from "./components/ArticleGrid";
import CanvesAnimationShowcase from "./components/canves-animations";
import Footer from "./components/Footer";
import HeroNavigation from "./components/HeroNavigation";
import HeroSection from "./components/HeroSection";
import { LoadingScreen } from "./components/common/LoadingScreen";
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
type SessionUser = { name?: string; username?: string; role?: string };

const readSession = (): SessionUser | null => {
  try {
    const stored = localStorage.getItem("editorUser");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const isSuperAdminSession = (): boolean => {
  try {
    const stored = localStorage.getItem("editorUser");
    if (!stored || !localStorage.getItem("authToken")) return false;
    const parsed = JSON.parse(stored) as SessionUser;
    return parsed.role === "SUPER_ADMIN";
  } catch {
    return false;
  }
};

const ProtectedAdminRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  if (!isSuperAdminSession()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
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
  const [serverArticles, setServerArticles] = useState<Article[]>([]);
  const [serverMeta, setServerMeta] = useState<PaginationMeta | null>(null);
  const [serverLoading, setServerLoading] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(readSession);
  const location = useLocation();
  const itemsPerPage = 6;
  const activeSearchQuery = searchQuery.trim().length >= 3 ? searchQuery : "";
  const canUseServerPagination =
    selectedSubcategory === "All" &&
    feedFilter === "ALL";

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

  useEffect(() => {
    if (!canUseServerPagination) return;

    let active = true;
    setServerLoading(true);
    fetchArticlesPage(selectedCategory, {
      page: currentPage,
      limit: itemsPerPage,
      search: activeSearchQuery
    })
      .then(({ articles: pageArticles, meta }) => {
        if (!active) return;
        setServerArticles(pageArticles);
        setServerMeta(meta);
        setLoadError(false);
      })
      .catch((error) => {
        console.error("Error loading paginated articles:", error);
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setServerLoading(false);
      });

    return () => { active = false; };
  }, [activeSearchQuery, canUseServerPagination, currentPage, selectedCategory]);

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
    const query = activeSearchQuery.trim().toLowerCase().replace(/^#/, "");
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
        article.id,
        article.dbId,
        article.summary,
        article.category,
        article.subcategory,
        article.author?.name,
        article.authorUsername,
        ...(article.hashtags || [])
      ].some((value) => (value || "").toLowerCase().replace(/^#/, "").includes(query));
      return matchesCategory && matchesSubcategory && matchesFeed && matchesSearch;
    });
  }, [activeSearchQuery, articles, feedFilter, selectedCategory, selectedSubcategory]);

  const clientTotalPages = Math.max(1, Math.ceil(filteredArticles.length / itemsPerPage));
  const clientPaginatedArticles = filteredArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const visibleArticles = canUseServerPagination ? serverArticles : clientPaginatedArticles;
  const visibleTotalItems = canUseServerPagination ? (serverMeta?.totalItems ?? serverArticles.length) : filteredArticles.length;
  const visibleTotalPages = canUseServerPagination ? Math.max(1, serverMeta?.totalPages || 1) : clientTotalPages;
  const heroArticles = useMemo(() => {
    if (articles.length === 0) return [];
    const shuffleArray = (array: Article[]) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };
    const featured = articles.filter((article) => article.featured);
    const nonFeatured = articles.filter((article) => !article.featured);
    
    return (featured.length > 0
      ? [...shuffleArray(featured), ...shuffleArray(nonFeatured)]
      : shuffleArray(articles)
    ).slice(0, 5);
  }, [articles]);

  const publicationShell =
    !location.pathname.startsWith("/admin") &&
    !location.pathname.startsWith("/article/") &&
    location.pathname !== "/login" &&
    location.pathname !== "/register" &&
    location.pathname !== "/editor" &&
    location.pathname !== "/ai-writer";

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
              <div className="editorial-shell blog-lottie-loading" aria-label="Loading stories">
                <LoadingScreen message="Loading stories..." />
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
                  {serverLoading ? (
                    <div className="blog-lottie-loading blog-lottie-loading--compact" aria-label="Loading stories">
                      <LoadingScreen message="Loading articles..." />
                    </div>
                  ) : visibleArticles.length > 0 ? (
                    <ArticleGrid articles={visibleArticles} />
                  ) : (
                    <div className="publication-empty publication-empty--compact">
                      <p className="eyebrow">No matching stories</p>
                      <h2>Try another topic or search.</h2>
                    </div>
                  )}
                  {visibleTotalItems > itemsPerPage && (
                    <Pagination currentPage={currentPage} totalPages={visibleTotalPages} onPageChange={setCurrentPage} />
                  )}
                  <PromotionalSection articles={filteredArticles.length > 0 ? filteredArticles : articles} />
                </div>
              </div>
            )
          } />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/animation-showcase" element={<CanvesAnimationShowcase />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />
          <Route path="/admin/*" element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } />
          <Route path="/editor" element={<CrmDashboard />} />
          <Route path="/ai-writer" element={<AiWriterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>

      {publicationShell && <Footer categories={categories} />}
    </div>
  );
}

export default App;
