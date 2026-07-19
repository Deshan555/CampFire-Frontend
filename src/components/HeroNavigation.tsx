import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, ChevronDown, Menu, Search, UserRound, X } from "lucide-react";
import { siteConfig } from "../config/site";

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

const feedFilters: Array<{ label: string; value: FeedFilter }> = [
  { label: "Latest", value: "NEW" },
  { label: "Trending", value: "TRENDING" },
  { label: "More", value: "MORE" }
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

  const chooseCategory = (category: string) => {
    onSelectCategory?.(category);
    setMenuOpen(false);
  };

  return (
    <header className="publication-header">
      <div className="utility-bar editorial-shell">
        <p>{publicationDate}</p>
        <p className="utility-edition"><span aria-hidden="true" />{editionLabel}</p>
        <div className="utility-actions">
          <button type="button" onClick={() => setSearchOpen((value) => !value)} aria-label="Search articles">
            <Search size={15} /> Search
          </button>
          {user ? (
            <>
              <Link to="/editor"><UserRound size={15} />{user.name || user.username || "Profile"}</Link>
              <button type="button" onClick={onLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register" className="utility-account">Create account</Link>
            </>
          )}
        </div>
      </div>

      <div className="masthead editorial-shell">
        <p className="masthead-note">Independent stories<br />for curious minds</p>
        <Link to="/" className="wordmark" aria-label={`${siteConfig.name} home`}>{siteConfig.name}</Link>
        <Link to="/editor" className="masthead-action"><Bookmark size={16} /> Reading list</Link>
      </div>

      {searchOpen && (
        <div className="search-drawer editorial-shell">
          <Search size={18} aria-hidden="true" />
          <input
            autoFocus
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search stories, topics, and authors"
            aria-label="Search stories, topics, and authors"
          />
          <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={18} /></button>
        </div>
      )}

      <div className="nav-frame">
        <nav className="category-nav editorial-shell" aria-label="Primary navigation">
          <button type="button" className="mobile-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />} Sections
          </button>
          <div className={`category-links ${menuOpen ? "is-open" : ""}`}>
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => chooseCategory(category)}
                className={selectedCategory === category && feedFilter === "ALL" ? "is-active" : ""}
              >
                {category === "All" ? "Home" : category}
              </button>
            ))}
            {feedFilters.map((filter) => (
              <button
                type="button"
                key={filter.value}
                onClick={() => onSelectFeedFilter?.(filter.value)}
                className={feedFilter === filter.value ? "is-active" : ""}
              >
                {filter.label}
              </button>
            ))}
          </div>
          {subcategories.length > 1 && (
            <label className="subcategory-select">
              <span className="sr-only">Subcategory</span>
              <select value={selectedSubcategory} onChange={(event) => onSelectSubcategory?.(event.target.value)}>
                {subcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>{subcategory === "All" ? "All topics" : subcategory}</option>
                ))}
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </label>
          )}
        </nav>
      </div>
    </header>
  );
}
