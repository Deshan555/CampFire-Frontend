# CampFire Frontend — A-Z Reference Guide

> **React 19 + Vite + TypeScript + TailwindCSS v4** frontend for the CampFire Editorial Magazine platform ("THE CANVES").

---

## Table of Contents

| # | Section | Description |
|---|---------|-------------|
| A | [Architecture Overview](#a-architecture-overview) | High-level frontend structure |
| B | [Build & Scripts](#b-build--scripts) | npm scripts and dev server |
| C | [Components (Layout)](#c-components-layout) | Navbar, Footer, Banner, FloatingBottomNav |
| D | [Dashboard Components](#d-dashboard-components) | CRM/Editor dashboard modules |
| E | [Entry Point & Routing](#e-entry-point--routing) | main.tsx, App.tsx, React Router |
| F | [Fetching Data (API Client)](#f-fetching-data-api-client) | api.ts — all backend API calls |
| G | [Getting Started](#g-getting-started) | Installation and setup |
| H | [Home Page Sections](#h-home-page-sections) | Featured, Podcast, Spotlight, etc. |
| I | [Interfaces & Types](#i-interfaces--types) | TypeScript type definitions |
| J | [JSX Patterns](#j-jsx-patterns) | Common component patterns |
| K | [Key Libraries](#k-key-libraries) | Major dependencies explained |
| L | [Login & Auth Flow](#l-login--auth-flow) | JWT-based authentication |
| M | [Markdown Rendering](#m-markdown-rendering) | Article content rendering |
| N | [Navigation](#n-navigation) | Category tabs, bottom nav, routing |
| O | [Organization (File Structure)](#o-organization-file-structure) | Directory layout |
| P | [Pages](#p-pages) | All page components |
| Q | [Query Parameters & Filters](#q-query-parameters--filters) | Search and category filtering |
| R | [React Patterns](#r-react-patterns) | Hooks, state, effects used |
| S | [Styling & Design System](#s-styling--design-system) | TailwindCSS v4, custom properties |
| T | [Theming (Dark Mode)](#t-theming-dark-mode) | Light/dark mode toggle |
| U | [Upload (File Upload)](#u-upload-file-upload) | Image upload to Supabase Storage |
| V | [Video Player](#v-video-player) | Video.js integration |
| W | [Widgets](#w-widgets) | Podcast, Artist Spotlight, Newsletter |
| X | [eXternal Assets & Fonts](#x-external-assets--fonts) | CDN resources |
| Y | [YouTube Integration](#y-youtube-integration) | AI article video embedding |
| Z | [Zero-Config Vite Setup](#z-zero-config-vite-setup) | Vite configuration details |

---

## A. Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                      Vite Dev Server                       │
│                     (Port 5173)                            │
├────────────────────────────────────────────────────────────┤
│  React 19 + React Router v7 (BrowserRouter)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Banner   │  │  Navbar  │  │  Pages   │  │  Footer  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                            │
│  Pages:  /  →  Home Feed                                   │
│          /article/:id  →  Article Detail                   │
│          /editor  →  CRM Dashboard                         │
│          /ai-writer  →  AI Writer                          │
│          /login  →  Login                                  │
│          /register  →  Reader Registration                 │
│          /admin/register  →  Admin Registration            │
│          /animation-showcase  →  Canvas Animations         │
├────────────────────────────────────────────────────────────┤
│  api.ts → fetch() → Express Backend (Port 5092)           │
├────────────────────────────────────────────────────────────┤
│  TailwindCSS v4 + Custom Design Tokens                    │
└────────────────────────────────────────────────────────────┘
```

---

## B. Build & Scripts

**`package.json` scripts:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Starts Vite dev server on `http://localhost:5173` |
| `npm run build` | Type-checks then builds production bundle to `./dist` |
| `npm run lint` | Runs ESLint across the project |
| `npm run preview` | Previews the production build locally |

---

## C. Components (Layout)

### Banner

Displays a small top announcement bar.

```tsx
// src/components/Banner.tsx
const Banner: React.FC = () => {
  return (
    <div className="w-full bg-brand-charcoal text-white text-center py-2 ...">
      {/* Announcement text */}
    </div>
  );
};
```

### Navbar

Full-featured navigation bar with search, category tabs, dark mode toggle, and profile dropdown.

```tsx
// src/components/Navbar.tsx
interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery, onSearchChange, darkMode,
  onToggleDarkMode, selectedCategory, onSelectCategory,
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Check localStorage for logged-in user
  useEffect(() => {
    const stored = localStorage.getItem("editorUser");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  // Listen for cross-tab auth changes
  useEffect(() => {
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  // Renders: Logo, search bar, category tabs, dark mode, profile dropdown
};
```

### Footer

Multi-column footer with branding, links, and social icons.

```tsx
// src/components/Footer.tsx
export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-charcoal text-white py-12 px-6">
      {/* Logo + tagline */}
      {/* Social icons: Instagram, YouTube, Facebook */}
      {/* Link columns: Pages, Categories, Contact */}
      {/* Copyright */}
    </footer>
  );
};
```

### FloatingBottomNav

Pill-shaped floating bottom navigation for quick page switching.

```tsx
// src/components/FloatingBottomNav.tsx
import { Newspaper, PenTool, LayoutDashboard, Sparkles } from "lucide-react";

const navItems = [
  { name: "Feed",       path: "/",                    icon: Newspaper },
  { name: "AI Writer",  path: "/ai-writer",           icon: PenTool },
  { name: "Editor",     path: "/editor",              icon: LayoutDashboard },
  { name: "Showcase",   path: "/animation-showcase",  icon: Sparkles },
];

export const FloatingBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
      bg-white/70 dark:bg-neutral-900/85 backdrop-blur-lg rounded-full">
      {navItems.map((item) => (
        <button
          key={item.name}
          onClick={() => navigate(item.path)}
          className={isActive ? "bg-sage-light text-sage-dark" : "text-neutral-500"}
        >
          <item.icon className="w-4 h-4" />
          <span>{item.name}</span>
        </button>
      ))}
    </div>
  );
};
```

---

## D. Dashboard Components

Located in `src/components/dashboard/`:

| Component | File | Purpose |
|-----------|------|---------|
| **CrmHeader** | `CrmHeader.tsx` | Dashboard top bar with branding and user info |
| **CrmTabs** | `CrmTabs.tsx` | Tab navigation (Articles, Analytics, AI Rules) |
| **CrmTable** | `CrmTable.tsx` | Article data table with actions (edit/delete/approve/reject) |
| **CrmPagination** | `CrmPagination.tsx` | Page navigation for table rows |
| **CrmAnalytics** | `CrmAnalytics.tsx` | Statistics cards and charts |
| **ArticleFormDrawer** | `ArticleFormDrawer.tsx` | Slide-over form for creating/editing articles |
| **AiReviewModal** | `AiReviewModal.tsx` | Modal for AI-powered article review |
| **AiRulesModal** | `AiRulesModal.tsx` | CRUD modal for managing AI review rules |

### ArticleFormDrawer (Key Pattern)

```tsx
// src/components/dashboard/ArticleFormDrawer.tsx
interface ArticleFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (article: Partial<Article>) => void;
  editArticle?: Article | null;
  userRole: string;
  authorUsername: string;
  authorName: string;
}

export const ArticleFormDrawer: React.FC<ArticleFormDrawerProps> = ({
  isOpen, onClose, onSave, editArticle, userRole, authorUsername, authorName
}) => {
  // Form state for: title, summary, content, category, image, video, etc.
  // Supports image upload via Supabase Storage
  // Inline markdown preview
  // Auto-saves draft to state
};
```

### AiReviewModal

```tsx
// src/components/dashboard/AiReviewModal.tsx
interface AiReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  articleTitle: string;
  onReviewComplete: (result: { approved: boolean; feedback: string }) => void;
}

// Sends article to local Ollama for AI editorial review
// Displays approval/rejection with detailed feedback
```

---

## E. Entry Point & Routing

### main.tsx

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

### App.tsx — Route Definitions

```tsx
// src/App.tsx
function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [darkMode, setDarkMode] = useState(false);

  // Fetch articles from backend on mount
  useEffect(() => {
    fetchArticles()
      .then(data => setArticles(data))
      .catch(err => console.error("Error loading articles:", err));
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white dark:bg-brand-dark">
      {showLayout && <Banner />}
      {showLayout && <Navbar ... />}

      <Routes>
        <Route path="/"                  element={<HomePage />} />
        <Route path="/article/:id"       element={<ArticlePage />} />
        <Route path="/editor"            element={<CrmDashboard />} />
        <Route path="/ai-writer"         element={<AiWriterPage />} />
        <Route path="/login"             element={<LoginPage />} />
        <Route path="/register"          element={<RegisterPage />} />
        <Route path="/admin/register"    element={<AdminRegisterPage />} />
        <Route path="/animation-showcase" element={<CanvesAnimationShowcase />} />
      </Routes>

      {showLayout && <Footer />}
      {showLayout && <FloatingBottomNav />}
    </div>
  );
}
```

> **Note:** Layout components (Banner, Navbar, Footer, FloatingBottomNav) are hidden on `/ai-writer` and `/editor` routes.

---

## F. Fetching Data (API Client)

All backend calls are centralized in `src/api.ts`:

```typescript
// src/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5092/api";

// Helper: attach Bearer token if logged in
function getHeaders(extra = {}): Record<string, string> {
  const token = localStorage.getItem("authToken");
  const headers = { ...extra };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}
```

### Article Operations

```typescript
// Fetch all articles (with optional category/editor filters)
export async function fetchArticles(
  category?: string,
  editorParams?: { editorMode?: boolean; role?: string; authorUsername?: string }
): Promise<Article[]> {
  const url = new URL(`${API_BASE_URL}/articles`);
  if (category && category !== "All") url.searchParams.append("category", category);
  if (editorParams?.editorMode) url.searchParams.append("editorMode", "true");
  if (editorParams?.role) url.searchParams.append("role", editorParams.role);
  const response = await fetch(url.toString(), { headers: getHeaders() });
  return response.json();
}

// Fetch single article details
export async function fetchArticleDetails(id: string, userParams?): Promise<Article> {
  const url = new URL(`${API_BASE_URL}/articles/${id}`);
  // Appends role, authorUsername, authorName as query params
  const response = await fetch(url.toString(), { headers: getHeaders() });
  return response.json();
}

// Get related article suggestions (smart scoring)
export async function fetchArticleSuggestions(id: string): Promise<Article[]> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}/suggestions`, {
    headers: getHeaders()
  });
  return response.json();
}

// Like an article
export async function likeArticle(id: string): Promise<{ success: boolean; likes: number }> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}/like`, {
    method: "POST", headers: getHeaders()
  });
  return response.json();
}

// Create article
export async function createArticle(article: Partial<Article>): Promise<{ success: boolean; article: Article }> {
  const response = await fetch(`${API_BASE_URL}/articles`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(article)
  });
  return response.json();
}

// Update article
export async function updateArticle(id: string, article: Partial<Article>): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
    method: "PUT",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(article)
  });
  return response.json();
}

// Delete article
export async function deleteArticle(id: string, userParams?): Promise<{ success: boolean }> {
  const url = new URL(`${API_BASE_URL}/articles/${id}`);
  // Append role/authorUsername params for permission checks
  const response = await fetch(url.toString(), { method: "DELETE", headers: getHeaders() });
  return response.json();
}

// Approve/Reject article
export async function approveArticle(id: string, role: string) { /* POST */ }
export async function rejectArticle(id: string, role: string, reason?: string) { /* POST */ }
```

### Auth Operations

```typescript
// Register a reader
export async function registerReader(payload: {
  username: string; email: string; password?: string;
  firstName?: string; lastName?: string;
}): Promise<{ success: boolean; user: any }> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response.json();
}

// Register an admin/author/editor
export async function registerAdmin(payload: {
  username: string; email: string; role: string; password?: string;
}): Promise<{ success: boolean; user: any }> {
  const response = await fetch(`${API_BASE_URL}/admin/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response.json();
}
```

### AI Operations

```typescript
// Generate article via local Ollama
export async function generateAiArticle(payload: {
  model: string; topic: string; tone?: string;
  instructions?: string; includeVideo?: boolean;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ai/generate-article`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  return response.json();
}

// AI review an article against editorial rules
export async function reviewArticleWithAi(
  id: string,
  model: string,
  selectedRuleIds?: string[],
  addedRules?: { name: string; criteria: string }[]
): Promise<{ success: boolean; approved: boolean; feedback: string }> {
  const response = await fetch(`${API_BASE_URL}/ai/review/${id}`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ model, selectedRuleIds, addedRules })
  });
  return response.json();
}
```

### Review Rules CRUD

```typescript
export interface ReviewRule {
  id?: string;
  blog_site_id?: string;
  name: string;
  criteria: string;
  is_active: boolean;
}

export async function fetchRules(blogSiteId: string): Promise<ReviewRule[]> { /* GET */ }
export async function createRule(payload): Promise<ReviewRule> { /* POST */ }
export async function updateRule(id, payload): Promise<ReviewRule> { /* PUT */ }
export async function deleteRule(id): Promise<boolean> { /* DELETE */ }
```

### File Upload

```typescript
export async function uploadFile(file: File): Promise<{
  success: boolean; url: string; fileName: string
}> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: getHeaders(), // No Content-Type — browser sets multipart boundary
    body: formData
  });
  return response.json();
}
```

### Newsletter Subscription

```typescript
export async function subscribeNewsletter(email: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email })
  });
  return response.json();
}
```

---

## G. Getting Started

```bash
# 1. Navigate to frontend
cd CampFire/frontend

# 2. Install dependencies
npm install

# 3. Set environment variable (optional)
echo "VITE_API_BASE_URL=http://localhost:5092/api" > .env

# 4. Start dev server
npm run dev
# → App runs on http://localhost:5173

# 5. Make sure the backend is running on port 5092
```

---

## H. Home Page Sections

The home page (`/`) is an **editorial magazine layout** with multiple content blocks:

```tsx
// Inside App.tsx — Home route renders these in order:
<>
  {/* 1. Big masthead title */}
  <div className="bg-brand-charcoal text-white">
    <h1 className="font-display text-8xl font-black uppercase">THE CANVES</h1>
    <p className="text-accent-coral uppercase tracking-widest">
      Blog about art music design.
    </p>
  </div>

  {/* 2. Featured article (hero card) */}
  <FeaturedArticle article={featuredArticle} />

  {/* 3. Podcast widget */}
  <PodcastWidget />

  {/* 4. Artist spotlight carousel */}
  <ArtistSpotlight articles={articles} />

  {/* 5. Newsletter signup */}
  <NewsletterSignup />

  {/* 6. Must-see moments grid */}
  <MustSeeMoments articles={articles} />
</>
```

When the user **searches or filters by category**, the layout switches to an `<ArticleGrid />` view.

---

## I. Interfaces & Types

```typescript
// src/data/articles.ts
export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string[];          // Array of markdown paragraphs
  author: Author;
  date: string;
  readingTime: string;
  category: string;
  image?: string;             // Featured image URL
  imageUrls?: string[];       // Additional images
  video?: {
    src: string;
    type: string;
    poster?: string;
  };
  featured?: boolean;
  trending?: boolean;
  isPartner?: boolean;
  likes?: number;
  status?: 'approved' | 'pending' | 'rejected' | 'draft';
  authorUsername?: string;
  createdAt?: string;
  updatedAt?: string;
  reviewFeedback?: string;
  reviewedAt?: string;
}

// Available categories for tab navigation
export const CATEGORIES = ["All", "Latest", "Trending", "Art", "Design", "Music", "Podcast"];
```

---

## J. JSX Patterns

### Conditional rendering with layout toggle

```tsx
// App.tsx — hide navbar/footer on certain pages
const showLayout = location.pathname !== "/ai-writer" && location.pathname !== "/editor";

return (
  <div>
    {showLayout && <Banner />}
    {showLayout && <Navbar ... />}
    <Routes>...</Routes>
    {showLayout && <Footer />}
    {showLayout && <FloatingBottomNav />}
  </div>
);
```

### Active state pattern for navigation

```tsx
// FloatingBottomNav.tsx
const isActive = location.pathname === item.path;

<button className={isActive
  ? "bg-sage-light text-sage-dark shadow-sm scale-105"
  : "text-neutral-500 hover:text-neutral-900"
}>
```

### Error boundary with cleanup

```tsx
// App.tsx — data fetching with cleanup
useEffect(() => {
  let active = true;
  fetchArticles().then((data) => {
    if (active) {
      setArticles(data);
      setLoading(false);
    }
  });
  return () => { active = false; };
}, [location.pathname]);
```

### Link patterns

```tsx
// Article cards link to detail page
<Link to={`/article/${article.id}`} className="editorial-card">
  <h3>{article.title}</h3>
</Link>
```

---

## K. Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.2.6 | UI framework |
| `react-dom` | ^19.2.6 | DOM rendering |
| `react-router-dom` | ^7.18.0 | Client-side routing |
| `tailwindcss` | ^4.3.1 | Utility-first CSS |
| `@tailwindcss/vite` | ^4.3.1 | TailwindCSS Vite plugin |
| `lucide-react` | ^1.21.0 | Icon library |
| `antd` | ^6.4.5 | Ant Design components (CRM dashboard) |
| `video.js` | ^8.23.7 | Video player |
| `@videojs/react` | ^10.0.0-beta | React Video.js wrapper |
| `class-variance-authority` | ^0.7.1 | Variant-based styling |
| `clsx` | ^2.1.1 | Conditional classnames |
| `tailwind-merge` | ^3.6.0 | TailwindCSS class deduplication |
| `vaul` | ^1.1.2 | Drawer component |
| `shadcn` | ^4.12.0 | UI component collection |
| `@fontsource-variable/geist` | ^5.2.9 | Geist font |
| `tw-animate-css` | ^1.4.0 | TailwindCSS animation utilities |

---

## L. Login & Auth Flow

### Login Flow

```tsx
// src/pages/LoginPage.tsx
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1. Call backend login endpoint
  const response = await fetch(`${apiBaseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  // 2. Store user and JWT token in localStorage
  localStorage.setItem("editorUser", JSON.stringify(data.user));
  localStorage.setItem("authToken", data.token);

  // 3. Notify other components (Navbar)
  window.dispatchEvent(new Event("storage"));

  // 4. Redirect to editor dashboard
  navigate("/editor");
};
```

### Auth State Persistence

```tsx
// Navbar checks localStorage on mount and storage events
useEffect(() => {
  const checkUser = () => {
    const stored = localStorage.getItem("editorUser");
    if (stored) setCurrentUser(JSON.parse(stored));
    else setCurrentUser(null);
  };
  checkUser();
  window.addEventListener("storage", checkUser);
  return () => window.removeEventListener("storage", checkUser);
}, []);
```

### Auto-redirect if logged in

```tsx
// LoginPage.tsx
useEffect(() => {
  const session = localStorage.getItem("editorUser");
  if (session) navigate("/editor");
}, [navigate]);
```

### Logout

```tsx
// Navbar dropdown
const handleLogout = () => {
  localStorage.removeItem("editorUser");
  localStorage.removeItem("authToken");
  window.dispatchEvent(new Event("storage"));
  navigate("/");
};
```

### Auth token in API calls

```typescript
// src/api.ts — every authenticated request sends Bearer token
function getHeaders(extra = {}) {
  const token = localStorage.getItem("authToken");
  const headers = { ...extra };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}
```

---

## M. Markdown Rendering

Article content is stored as an array of markdown paragraphs. The `Markdown.tsx` component renders them:

```tsx
// src/components/Markdown.tsx
// Renders markdown strings with:
// - Headings (##, ###)
// - Bold/italic text
// - Lists (ordered and unordered)
// - Blockquotes
// - Code blocks
// - Links
// All rendered with editorial typography styling
```

Usage in `ArticlePage`:

```tsx
{article.content.map((paragraph, index) => (
  <Markdown key={index} content={paragraph} />
))}
```

---

## N. Navigation

### Category Tabs (Navbar)

```tsx
const CATEGORIES = ["All", "Latest", "Trending", "Art", "Design", "Music", "Podcast"];

// Rendered as horizontal scrollable tabs
{CATEGORIES.map((cat) => (
  <button
    key={cat}
    onClick={() => onSelectCategory(cat)}
    className={selectedCategory === cat ? "active-tab" : "inactive-tab"}
  >
    {cat}
  </button>
))}
```

### Floating Bottom Nav

Always visible, fixed at bottom center — pill-shaped glassmorphism bar with icons:

- **Feed** → `/`
- **AI Writer** → `/ai-writer`
- **Editor** → `/editor`
- **Showcase** → `/animation-showcase`

### React Router Routes

| Path | Page | Auth Required |
|------|------|:---:|
| `/` | Home Feed | No |
| `/article/:id` | Article Detail | No |
| `/editor` | CRM Dashboard | Yes |
| `/ai-writer` | AI Writer | No |
| `/login` | Login | No |
| `/register` | Reader Registration | No |
| `/admin/register` | Admin Registration | No |
| `/animation-showcase` | Canvas Animations | No |

---

## O. Organization (File Structure)

```
frontend/
├── .env                              # VITE_API_BASE_URL
├── index.html                        # HTML shell
├── vite.config.ts                    # Vite + React + TailwindCSS
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript config
├── tsconfig.app.json                 # App-specific TS config
├── eslint.config.js                  # ESLint rules
├── src/
│   ├── main.tsx                      # 🚀 Entry point (StrictMode + BrowserRouter)
│   ├── App.tsx                       # Root component with routing
│   ├── api.ts                        # Centralized API client
│   ├── index.css                     # Global styles + TailwindCSS imports
│   │
│   ├── data/
│   │   └── articles.ts              # TypeScript interfaces + fallback data
│   │
│   ├── components/
│   │   ├── Banner.tsx                # Top announcement bar
│   │   ├── Navbar.tsx                # Header with search + categories
│   │   ├── FeaturedArticle.tsx       # Hero featured article block
│   │   ├── ArticleGrid.tsx           # Grid of article cards
│   │   ├── ArtistSpotlight.tsx       # Artist carousel section
│   │   ├── MustSeeMoments.tsx        # Bottom article highlights
│   │   ├── PodcastWidget.tsx         # Podcast player widget
│   │   ├── NewsletterSignup.tsx      # Email subscription form
│   │   ├── RightSidebar.tsx          # Article page sidebar
│   │   ├── Sidebar.tsx               # Alternative sidebar
│   │   ├── VideoPlayer.tsx           # Video.js player wrapper
│   │   ├── Markdown.tsx              # Markdown content renderer
│   │   ├── FloatingBottomNav.tsx     # Fixed bottom navigation
│   │   ├── Footer.tsx                # Site footer
│   │   ├── AdSensePlaceholder.tsx    # Ad placeholder block
│   │   ├── canves-animations.tsx     # Canvas animation components
│   │   ├── canves-animations.css     # Animation styles
│   │   │
│   │   ├── dashboard/                # CRM Dashboard components
│   │   │   ├── CrmHeader.tsx         # Dashboard header
│   │   │   ├── CrmTabs.tsx           # Tab navigation
│   │   │   ├── CrmTable.tsx          # Articles data table
│   │   │   ├── CrmPagination.tsx     # Table pagination
│   │   │   ├── CrmAnalytics.tsx      # Stats & analytics
│   │   │   ├── ArticleFormDrawer.tsx  # Article create/edit form
│   │   │   ├── AiReviewModal.tsx     # AI review modal
│   │   │   └── AiRulesModal.tsx      # AI rules management
│   │   │
│   │   └── ui/                       # Shared UI primitives (shadcn)
│   │
│   ├── pages/
│   │   ├── ArticlePage.tsx           # Full article detail view
│   │   ├── CrmDashboard.tsx          # CRM/Editor dashboard
│   │   ├── AiWriterPage.tsx          # AI article generator
│   │   ├── LoginPage.tsx             # Login form
│   │   ├── RegisterPage.tsx          # Reader registration
│   │   └── AdminRegisterPage.tsx     # Admin/author registration
│   │
│   ├── lib/                          # Utility functions (empty)
│   └── assets/                       # Static assets
│
├── public/                           # Public static files
└── dist/                             # Build output
```

---

## P. Pages

### ArticlePage (`/article/:id`)

Full-width article detail view with:
- Hero image / video player
- Author card with avatar
- Markdown content rendering
- Like button
- Related article suggestions (fetched via scoring API)
- Right sidebar with AdSense placeholders
- Responsive layout

```tsx
// src/pages/ArticlePage.tsx
const ArticlePage: React.FC = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [suggestions, setSuggestions] = useState<Article[]>([]);

  useEffect(() => {
    fetchArticleDetails(id).then(setArticle);
    fetchArticleSuggestions(id).then(setSuggestions);
  }, [id]);

  // Renders full article layout with sidebar
};
```

### CrmDashboard (`/editor`)

Full-featured editorial dashboard with:
- Article list table with status badges (approved/pending/rejected)
- Create/edit articles via slide-over drawer
- Approve/reject workflow
- AI-powered article review
- AI review rules management
- Analytics panel

```tsx
// src/pages/CrmDashboard.tsx
const CrmDashboard: React.FC = () => {
  // Auth guard: redirect to /login if not logged in
  useEffect(() => {
    const user = localStorage.getItem("editorUser");
    if (!user) navigate("/login");
  }, []);

  // Fetch articles in editor mode
  // Manage CRUD operations
  // Role-based UI: SUPER_ADMIN sees all, AUTHOR sees own articles
};
```

### AiWriterPage (`/ai-writer`)

Interactive AI article generation playground:
- Model selector (Ollama models)
- Topic, tone, and instructions inputs
- Live generation with loading states
- Preview generated article
- Option to publish to the platform

```tsx
// src/pages/AiWriterPage.tsx
const AiWriterPage: React.FC = () => {
  const [model, setModel] = useState("gemma3:1b");
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setGenerating(true);
    const data = await generateAiArticle({ model, topic, tone, instructions });
    setResult(data);
    setGenerating(false);
  };
};
```

### LoginPage (`/login`)

Animated login form with canvas morph animation background.

### RegisterPage (`/register`) & AdminRegisterPage (`/admin/register`)

Registration forms for readers and admin users respectively.

---

## Q. Query Parameters & Filters

### Category filtering

```tsx
// App.tsx
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
```

### Editor mode parameters

```typescript
// When fetching in editor mode, pass role context
fetchArticles(undefined, {
  editorMode: true,
  role: currentUser.role,
  authorUsername: currentUser.username,
  authorName: currentUser.name
});
```

---

## R. React Patterns

### State management

The app uses **local component state** (no global store like Redux):
- `useState` for all local UI state
- `localStorage` for auth persistence
- Props drilling for shared state between parent/child

### Effect patterns

```tsx
// Cleanup pattern to prevent state updates on unmounted components
useEffect(() => {
  let active = true;
  fetchData().then(data => {
    if (active) setState(data);
  });
  return () => { active = false; };
}, [dependency]);
```

### Cross-component communication

```tsx
// Auth state changes via custom storage events
localStorage.setItem("editorUser", JSON.stringify(user));
window.dispatchEvent(new Event("storage"));

// Listener in other components
window.addEventListener("storage", checkUser);
```

### Click-outside pattern (Navbar dropdown)

```tsx
const dropdownRef = React.useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
```

---

## S. Styling & Design System

### TailwindCSS v4

TailwindCSS is integrated as a Vite plugin:

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### Custom Design Tokens (CSS Custom Properties)

```css
/* src/index.css — Key design tokens */
:root {
  --color-brand-dark: #0f0f11;
  --color-brand-light: #faf9f6;
  --color-brand-charcoal: #1a1a1d;
  --color-brand-cream: #f5f0eb;
  --color-accent-coral: #e11d48;
  --color-accent-coral-dark: #be123c;
  --color-sage-light: #e8f0e4;
  --color-sage-dark: #3d6b3d;
}
```

### Editorial Card Pattern

```css
/* Reusable card style used throughout the app */
.editorial-card {
  @apply bg-white border-[1.5px] border-brand-dark rounded-xl
         shadow-[3px_3px_0px_0px_#111] hover:shadow-[5px_5px_0px_0px_#111]
         hover:-translate-x-[1px] hover:-translate-y-[1px]
         transition-all duration-300;
}
```

### Typography

- **Display headings:** `font-display` (custom display typeface)
- **Body text:** `font-serif` (editorial serif)
- **UI text:** `font-sans` (system sans-serif)
- **Geist font:** imported via `@fontsource-variable/geist`

---

## T. Theming (Dark Mode)

```tsx
// App.tsx — Dark mode toggle
const [darkMode, setDarkMode] = useState(false);

// Load from localStorage or system preference
useEffect(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
    setDarkMode(true);
    document.documentElement.classList.add("dark");
  }
}, []);

// Toggle function
const handleToggleDarkMode = () => {
  if (darkMode) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }
  setDarkMode(!darkMode);
};
```

**CSS dark mode usage:**

```tsx
<div className="bg-white dark:bg-brand-dark text-neutral-900 dark:text-white">
```

---

## U. Upload (File Upload)

Image upload is used in the **ArticleFormDrawer** for featured images:

```typescript
// src/api.ts
export async function uploadFile(file: File): Promise<{
  success: boolean; url: string; fileName: string
}> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: getHeaders(), // No Content-Type — browser auto-sets multipart boundary
    body: formData
  });

  return response.json();
}
```

**Usage in ArticleFormDrawer:**

```tsx
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploading(true);
  try {
    const result = await uploadFile(file);
    setImageUrl(result.url); // Supabase public URL
  } catch (err) {
    console.error("Upload failed:", err);
  }
  setUploading(false);
};
```

---

## V. Video Player

Uses **Video.js** with the official React wrapper:

```tsx
// src/components/VideoPlayer.tsx
import videojs from 'video.js';

interface VideoPlayerProps {
  src: string;
  type?: string;
  poster?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, type, poster }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoRef.current!.appendChild(videoElement);

      playerRef.current = videojs(videoElement, {
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{ src, type: type || "video/mp4" }],
        poster,
      });
    }
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]);
};
```

---

## W. Widgets

### PodcastWidget

Audio player styled as an editorial podcast block with waveform visualization.

```tsx
// src/components/PodcastWidget.tsx
export const PodcastWidget: React.FC = () => {
  // Renders podcast episode cards with play buttons
  // Features: episode titles, durations, visual waveform bars
};
```

### ArtistSpotlight

Horizontal scrolling carousel showcasing article authors.

```tsx
// src/components/ArtistSpotlight.tsx
interface ArtistSpotlightProps {
  articles: Article[];
}

export const ArtistSpotlight: React.FC<ArtistSpotlightProps> = ({ articles }) => {
  // Extracts unique authors from articles
  // Renders author cards with avatar, name, bio
  // Horizontal scroll with navigation arrows
};
```

### NewsletterSignup

Email subscription form with frequency options.

```tsx
// src/components/NewsletterSignup.tsx
export const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    await subscribeNewsletter(email.trim());
    setSubscribed(true);
  };

  // Renders:
  // - Weekly / Monthly toggle checkboxes
  // - Email input field
  // - Submit button
  // - Success message
};
```

### MustSeeMoments

Bottom section showing article highlights in a visual grid.

```tsx
// src/components/MustSeeMoments.tsx
interface MustSeeMomentsProps {
  articles: Article[];
}
// Renders article cards in a masonry-style grid layout
```

---

## X. eXternal Assets & Fonts

### Font Awesome (Icons)

Loaded via CDN in `index.html` for social media icons:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
```

### Geist Font

Loaded via npm package:

```typescript
import '@fontsource-variable/geist';
```

### Unsplash Images

Default images use Unsplash URLs with auto-format parameters:

```
https://images.unsplash.com/photo-xxx?auto=format&fit=crop&w=600&h=600&q=80
```

---

## Y. YouTube Integration

When generating AI articles, the backend optionally fetches a matching YouTube video via the Innertube API. The frontend displays it using the `VideoPlayer` component:

```tsx
// ArticlePage.tsx
{article.video && (
  <VideoPlayer
    src={article.video.src}
    type={article.video.type}
    poster={article.video.poster}
  />
)}
```

The `AiWriterPage` has a toggle to include/exclude video:

```tsx
<label>
  <input
    type="checkbox"
    checked={includeVideo}
    onChange={(e) => setIncludeVideo(e.target.checked)}
  />
  Include YouTube video
</label>
```

---

## Z. Zero-Config Vite Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: ['**/backend/**'], // Ignore backend changes
    },
  },
})
```

| Feature | Configuration |
|---------|---------------|
| **React HMR** | `@vitejs/plugin-react` — automatic Fast Refresh |
| **TailwindCSS** | `@tailwindcss/vite` — native Vite integration (no PostCSS config needed) |
| **Dev port** | Default `5173` |
| **API proxy** | Uses env variable `VITE_API_BASE_URL` (default: `http://localhost:5092/api`) |
| **File watching** | Backend directory excluded to prevent unnecessary reloads |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:5092/api` | Backend API endpoint |

Access in code:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5092/api";
```

---

## User Roles & Permissions (Frontend)

| Role | Feed | Create Article | Edit Own | Edit All | Approve/Reject | AI Review | Manage Rules |
|------|:----:|:--------------:|:--------:|:--------:|:--------------:|:---------:|:------------:|
| READER | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| AUTHOR | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| EDITOR | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

*Author: Deshan Jayashanka • CampFire Editorial Platform*
