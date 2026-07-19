import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, ChevronDown, ChevronRight, Menu, Search, UserRound, X } from "lucide-react";
import { fetchCategories, fetchSubcategories, type CategoryDto, type SubcategoryDto } from "../api";
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
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [apiCategories, setApiCategories] = useState<CategoryDto[]>([]);
  const [apiSubcategories, setApiSubcategories] = useState<SubcategoryDto[]>([]);
  const categoryLinksRef = useRef<HTMLDivElement>(null);
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
            {menuOpen ? <X size={18} /> : <Menu size={18} />} Menu
          </button>
          <div ref={categoryLinksRef} className={`category-links ${menuOpen ? "is-open" : ""}`}>
            <button
              type="button"
              onClick={() => chooseCategory("All")}
              className={selectedCategory === "All" && feedFilter === "ALL" ? "is-active" : ""}
            >
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
        </nav>
      </div>
    </header>
  );
}
