import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HeroSection from "./components/HeroSection";
import HeroNavigation from "./components/HeroNavigation";
import BlogToolbar from "./components/BlogToolbar";
import ArticleGrid from "./components/ArticleGrid";
import Pagination from "./components/Pagination";
import PromotionalSection from "./components/PromotionalSection";
import Footer from "./components/Footer";

// Existing pages
import ArticlePage from "./pages/ArticlePage";
import CrmDashboard from "./pages/CrmDashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import AiWriterPage from "./pages/AiWriterPage";
import CanvesAnimationShowcase from "./components/canves-animations";

import { fetchArticles } from "./api";
import type { Article } from "./data/articles";

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const user = null; // Placeholder for auth state

  const location = useLocation();

  // Fetch articles from Express backend on mount
  useEffect(() => {
    let active = true;
    if (articles.length === 0) {
      setLoading(true);
      fetchArticles()
        .then((data) => {
          if (active) {
            setArticles(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("⚠️ Error loading articles:", err);
          if (active) setLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [articles.length]);

  // Find featured articles for hero carousel
  const featuredArticles = articles.filter(a => a.featured).slice(0, 4);
  const heroArticles = featuredArticles.length > 0 ? featuredArticles : articles.slice(0, 4);

  // Derive categories
  const categories = ["All", "Destinations", "Guides", "Experiences", "Art", "Design"];

  // Filtering logic
  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const showLayout = location.pathname !== "/ai-writer" && location.pathname !== "/editor" && location.pathname !== "/login" && location.pathname !== "/register" && location.pathname !== "/admin/register" && !location.pathname.startsWith("/admin");
  const isHome = location.pathname === "/";

  return (
    <div className={`min-h-screen flex flex-col w-full bg-white transition-colors duration-300 font-sans`}>
      
      {/* If it's not the home page, but we want the layout, show a standalone navigation */}
      {showLayout && !isHome && (
        <div className="w-full bg-[#111] mb-6">
          <HeroNavigation 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            user={user}
          />
        </div>
      )}

      {showLayout ? (
        <div className="w-full bg-white overflow-hidden flex flex-col min-h-screen">
          <Routes>
            <Route
              path="/"
              element={
                <div className="flex flex-col flex-1">
                  {loading ? (
                    <div className="py-48 flex justify-center items-center flex-grow">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                  ) : (
                    <>
                      <HeroSection 
                        articles={heroArticles} 
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        user={user}
                      />
                      
                      <div className="px-6 md:px-12 flex-1 flex flex-col max-w-[1400px] mx-auto w-full">
                        <div className="mb-6 mt-4">
                          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Blog</h2>
                          <p className="text-gray-500 text-sm">Here, we share travel tips, destination guides, and stories that inspire your next adventure.</p>
                        </div>
                        <BlogToolbar 
                          categories={categories}
                          selectedCategory={selectedCategory}
                          onSelectCategory={(cat) => {
                            setSelectedCategory(cat);
                            setCurrentPage(1); // Reset to page 1 on filter
                          }}
                        />
                        
                        {paginatedArticles.length === 0 ? (
                          <div className="py-24 text-center text-gray-500 font-medium">
                            No articles found matching your criteria.
                          </div>
                        ) : (
                          <ArticleGrid articles={paginatedArticles} />
                        )}
                        
                        {filteredArticles.length > 0 && (
                           <Pagination 
                             currentPage={currentPage}
                             totalPages={totalPages}
                             onPageChange={setCurrentPage}
                           />
                        )}

                        <PromotionalSection />
                      </div>
                    </>
                  )}
                </div>
              }
            />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/animation-showcase" element={<CanvesAnimationShowcase />} />
          </Routes>
          
          <Footer />
        </div>
      ) : (
        <Routes>
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/editor" element={<CrmDashboard />} />
          <Route path="/ai-writer" element={<AiWriterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />
        </Routes>
      )}

    </div>
  );
}

export default App;
