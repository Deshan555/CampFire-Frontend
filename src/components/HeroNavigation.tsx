import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Flame,
  Home,
  Layers,
  LogIn,
  Menu,
  Search,
  Sparkles,
  UserPlus,
  X
} from "lucide-react";
import { fetchArticlesPage, fetchCategories, fetchSubcategories, type CategoryDto, type SubcategoryDto } from "../api";
import type { Article } from "../data/articles";
import { siteConfig } from "../config/site";
import ArticleArtwork from "./ArticleArtwork";

type FeedFilter = "ALL" | "NEW" | "TRENDING" | "MORE";

interface HeroNavigationProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user?: { name?: string; username?: string } | null;
  onLogout?: () => void;
  categories?: string[];
  subcategories?: string[];
  selectedCategory?: string;
  selectedSubcategory?: string;
  feedFilter?: FeedFilter;
  onSelectCategory?: (category: string) => void;
  onSelectSubcategory?: (subcategory: string) => void;
  onSelectFeedFilter?: (filter: FeedFilter) => void;
}

const feedFilters: Array<{ label: string; value: FeedFilter; Icon: typeof Clock3 }> = [
  { label: "Latest", value: "NEW", Icon: Clock3 },
  { label: "Trending", value: "TRENDING", Icon: Flame },
  { label: "More", value: "MORE", Icon: Sparkles }
];

export default function HeroNavigation({
  searchQuery,
  onSearchChange,
  user,
  onLogout,
  categories = ["All"],
  subcategories = ["All"],
  selectedCategory = "All",
  selectedSubcategory = "All",
  feedFilter = "ALL",
  onSelectCategory,
  onSelectSubcategory,
  onSelectFeedFilter
}: HeroNavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [apiCategories, setApiCategories] = useState<CategoryDto[]>([]);
  const [apiSubcategories, setApiSubcategories] = useState<SubcategoryDto[]>([]);
  const [previewArticles, setPreviewArticles] = useState<Article[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const categoryLinksRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const publicationDate = useMemo(
    () => new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date()),
    []
  );
  const editionLabel = useMemo(() => {
    if (siteConfig.locationLabel) return siteConfig.locationLabel;
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, " ");
    } catch {
      return "Daily edition";
    }
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([fetchCategories(), fetchSubcategories()])
      .then(([categoryData, subcategoryData]) => {
        if (!active) return;
        setApiCategories(categoryData.filter((category) => category.status === "ACTIVE"));
        setApiSubcategories(subcategoryData.filter((subcategory) => subcategory.status === "ACTIVE"));
      })
      .catch((error) => {
        console.error("Failed to load publication taxonomy:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!openCategory) return;

    const closeCategoryMenu = (event: MouseEvent) => {
      if (categoryLinksRef.current && !categoryLinksRef.current.contains(event.target as Node)) {
        setOpenCategory(null);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenCategory(null);
    };

    document.addEventListener("mousedown", closeCategoryMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeCategoryMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openCategory]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const searchExpanded = searchOpen || searchQuery.trim().length > 0;

  useEffect(() => {
    const query = searchQuery.trim();
    if (!searchExpanded || query.length < 3) {
      setPreviewArticles([]);
      setPreviewLoading(false);
      setPreviewError(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setPreviewLoading(true);
      setPreviewError(false);
      fetchArticlesPage(undefined, { page: 1, limit: 5, search: query })
        .then(({ articles }) => {
          if (!active) return;
          setPreviewArticles(articles);
        })
        .catch((error) => {
          console.error("Failed to load search preview:", error);
          if (!active) return;
          setPreviewArticles([]);
          setPreviewError(true);
        })
        .finally(() => {
          if (active) setPreviewLoading(false);
        });
    }, 260);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchExpanded, searchQuery]);

  const categoryGroups = useMemo(() => {
    if (apiCategories.length > 0) {
      return [...apiCategories]
        .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
        .map((category) => ({
          id: category.id,
          name: category.name,
          count: category.count,
          subcategories: apiSubcategories
            .filter((subcategory) =>
              subcategory.categoryId === category.id || subcategory.parentName === category.name
            )
            .sort((left, right) => left.name.localeCompare(right.name))
        }));
    }

    return categories
      .filter((category) => category !== "All")
      .map((category) => ({
        id: category,
        name: category,
        count: 0,
        subcategories: category === selectedCategory
          ? subcategories
              .filter((subcategory) => subcategory !== "All")
              .map((subcategory) => ({
                id: `${category}-${subcategory}`,
                name: subcategory,
                parentName: category,
                categoryId: category,
                count: 0,
                status: "ACTIVE" as const
              }))
          : []
      }));
  }, [apiCategories, apiSubcategories, categories, selectedCategory, subcategories]);

  const activeCategoryGroup = categoryGroups.find((category) => category.id === openCategory)
    || categoryGroups.find((category) => category.name === selectedCategory)
    || categoryGroups[0];

  const chooseCategory = (category: string) => {
    onSelectCategory?.(category);
    setMenuOpen(false);
    setOpenCategory(null);
  };

  const chooseSubcategory = (category: string, subcategory: string) => {
    onSelectCategory?.(category);
    onSelectSubcategory?.(subcategory);
    setMenuOpen(false);
    setOpenCategory(null);
  };

  return (
    <header className="publication-header">
      <div className="utility-bar editorial-shell">
        <p>{publicationDate}</p>
        <p className="utility-edition"><span aria-hidden="true" />{editionLabel}</p>
        <div className="utility-actions">
          {user ? (
            <>
              <Link to="/editor"><CircleUserRound size={14} />{user.name || user.username || "Profile"}</Link>
              <button type="button" onClick={onLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login"><LogIn size={14} /> Sign in</Link>
              <Link to="/register" className="utility-account"><UserPlus size={14} /> Create account</Link>
            </>
          )}
        </div>
      </div>

      <div className="masthead editorial-shell">
        <p className="masthead-edition">Today's edition</p>
        <div className="masthead-brand">
          <Link to="/" className="wordmark" aria-label={`${siteConfig.name} home`}>{siteConfig.name}</Link>
          <p className="masthead-tagline">Stories <span /> Ideas <span /> Perspectives</p>
        </div>
        <div className={`masthead-search-shell ${searchExpanded ? "is-open" : ""}`}>
          <div className={`masthead-search-floating ${searchExpanded ? "is-open" : ""}`}>
            {searchExpanded ? (
              <>
                <button
                  type="button"
                  className="masthead-search-leading"
                  onClick={() => searchInputRef.current?.focus()}
                  aria-label="Focus search"
                >
                  <Search size={17} />
                </button>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search articles"
                  aria-label="Search articles"
                  aria-controls="masthead-search-preview"
                  aria-expanded={searchExpanded}
                />
                <button
                  type="button"
                  className="masthead-search-close"
                  onClick={() => {
                    onSearchChange("");
                    setPreviewArticles([]);
                    setSearchOpen(false);
                  }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="masthead-search-toggle"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
              >
                <Search size={16} />
                <span>Search</span>
              </button>
            )}
          </div>
          {searchExpanded && searchQuery.trim().length > 0 && (
            <div id="masthead-search-preview" className="masthead-search-preview" role="listbox" aria-label="Search previews">
              {searchQuery.trim().length < 3 ? (
                <p className="masthead-search-preview__state">Type 3 letters to search</p>
              ) : previewLoading ? (
                <p className="masthead-search-preview__state">Searching...</p>
              ) : previewError ? (
                <p className="masthead-search-preview__state">Search unavailable</p>
              ) : previewArticles.length > 0 ? (
                <>
                  {previewArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.id}`}
                      className="masthead-search-result"
                      role="option"
                      onClick={() => setSearchOpen(false)}
                    >
                      <span className="masthead-search-result__image">
                        <ArticleArtwork article={article} />
                      </span>
                      <span className="masthead-search-result__copy">
                        <span className="masthead-search-result__category">{article.category}</span>
                        <span className="masthead-search-result__title">{article.title}</span>
                        <span className="masthead-search-result__meta">{article.readingTime}</span>
                      </span>
                    </Link>
                  ))}
                </>
              ) : (
                <p className="masthead-search-preview__state">No matches yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="nav-frame">
        <nav className="category-nav editorial-shell" aria-label="Primary navigation">
          <button type="button" className="mobile-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />} Menu
          </button>
          <div ref={categoryLinksRef} className={`category-links ${menuOpen ? "is-open" : ""}`}>
            <button
              type="button"
              onClick={() => chooseCategory("All")}
              className={selectedCategory === "All" && feedFilter === "ALL" ? "is-active" : ""}
            >
              <Home size={14} aria-hidden="true" />
              Home
            </button>
            {categoryGroups.length > 0 && (
              <div className={`category-menu taxonomy-menu ${openCategory ? "is-open" : ""}`}>
                <button
                  type="button"
                  className={`category-menu__trigger ${selectedCategory !== "All" && feedFilter === "ALL" ? "is-active" : ""}`}
                  onClick={() => setOpenCategory(openCategory ? null : activeCategoryGroup?.id || categoryGroups[0].id)}
                  aria-haspopup="menu"
                  aria-expanded={Boolean(openCategory)}
                >
                  <Layers size={14} aria-hidden="true" />
                  Sections
                  <ChevronDown size={13} aria-hidden="true" />
                </button>

                <div className="category-submenu taxonomy-dropdown" role="menu" aria-label="Publication sections">
                  <div className="taxonomy-category-list" aria-label="Categories">
                    {categoryGroups.map((category) => (
                      <button
                        type="button"
                        role="menuitem"
                        key={category.id}
                        className={activeCategoryGroup?.id === category.id ? "is-active" : ""}
                        onMouseEnter={() => setOpenCategory(category.id)}
                        onFocus={() => setOpenCategory(category.id)}
                        onClick={() => setOpenCategory(category.id)}
                      >
                        <span>{category.name}</span>
                        <ChevronRight size={13} aria-hidden="true" />
                      </button>
                    ))}
                  </div>

                  {activeCategoryGroup && (
                    <div className="taxonomy-topic-list" aria-label={`${activeCategoryGroup.name} subcategories`}>
                      <div className="taxonomy-topic-heading">
                        <strong>{activeCategoryGroup.name}</strong>
                        <span>{activeCategoryGroup.subcategories.length} topics</span>
                      </div>
                      <button
                        type="button"
                        role="menuitem"
                        className={selectedCategory === activeCategoryGroup.name && selectedSubcategory === "All" ? "is-active" : ""}
                        onClick={() => chooseSubcategory(activeCategoryGroup.name, "All")}
                      >
                        <span>All {activeCategoryGroup.name}</span>
                        <span>{activeCategoryGroup.count}</span>
                      </button>
                      {activeCategoryGroup.subcategories.map((subcategory) => (
                        <button
                          type="button"
                          role="menuitem"
                          key={subcategory.id}
                          className={selectedCategory === activeCategoryGroup.name && selectedSubcategory === subcategory.name ? "is-active" : ""}
                          onClick={() => chooseSubcategory(activeCategoryGroup.name, subcategory.name)}
                        >
                          <span>{subcategory.name}</span>
                          <span>{subcategory.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {feedFilters.map(({ Icon, ...filter }) => (
              <button
                type="button"
                key={filter.value}
                onClick={() => onSelectFeedFilter?.(filter.value)}
                className={feedFilter === filter.value ? "is-active" : ""}
              >
                <Icon size={14} aria-hidden="true" />
                {filter.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
