# CampFire Frontend

React + Vite frontend for the CampFire editorial magazine platform. It includes the public article experience, article detail reading mode, search previews, responsive magazine navigation, editor dashboard, admin portal, AI writer tools, uploads, and article management workflows.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Lucide icons
- Lottie animations
- Video.js / `@videojs/react`

## Project Structure

```text
frontend/
  src/
    api.ts                 backend API client
    App.tsx                app routing and publication shell
    components/            reusable UI and blog sections
    components/admin/      admin management screens
    components/dashboard/  article editor dashboard
    components/common/     shared loading/empty/pagination components
    config/                site configuration
    data/                  shared frontend article types
    pages/                 route pages
    assets/                fonts, lottie files, static assets
    index.css              global design system and component styling
```

## Requirements

- Node.js 20+
- npm
- Backend API running locally or deployed

## Setup

```bash
cd frontend
npm install
cp .env.example .env # create manually if this file does not exist
npm run dev
```

The dev server usually runs at:

```text
http://localhost:5173
```

## Environment Variables

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5092/api
VITE_SITE_NAME=CampFire
VITE_SITE_DESCRIPTION=Independent stories, ideas, and perspectives.
VITE_SITE_LOCATION=Asia/Colombo
VITE_BLOG_SITE_ID=optional-blog-site-uuid
```

Only variables prefixed with `VITE_` are exposed to the browser.

## Scripts

```bash
npm run dev       # start Vite dev server
npm run build     # type-check and build production assets
npm run lint      # run ESLint
npm run preview   # preview production build
```

## Routes

```text
/                  public magazine home
/article/:id       article detail page
/login             staff/editor login
/register          reader registration
/admin/login       admin login
/admin/register    admin/editor/author registration
/admin/*           protected admin portal
/editor            editorial dashboard
/ai-writer         AI article generation page
/animation-showcase
```

Admin routes are rendered outside of the public blog shell. Article view also hides the public header/footer/navigation shell.

## Main Features

- Public magazine home with paginated article lists
- Header search with preview results after 3 characters
- Article detail page with:
  - Markdown rendering
  - code blocks and tables
  - video banner/player
  - image gallery
  - hashtags
  - related article suggestions with location support
  - Kindle-like reading mode
  - one-column and two-column reading layouts
  - saved font/theme preferences in localStorage
  - floating article controls
- Admin/editor tools:
  - article CRUD
  - approval/rejection workflow
  - AI review
  - categories/subcategories/users management
  - upload support
- Loading and empty states with Lottie animations

## API Client

All backend requests are centralized in:

```text
src/api.ts
```

The client reads `VITE_API_BASE_URL` and automatically attaches `Authorization: Bearer <token>` when `authToken` exists in localStorage.

Common calls include:

```text
fetchArticles
fetchArticlesPage
fetchArticleDetails
fetchArticleSuggestions
createArticle
updateArticle
deleteArticle
approveArticle
rejectArticle
registerReader
registerAdmin
fetchUsers
fetchCategories
fetchSubcategories
uploadImage
generateArticle
reviewArticle
```

## Authentication

Successful login stores:

```text
localStorage.editorUser
localStorage.authToken
```

Admin screens require a valid session. Super admins can access `/admin/*`; authors/editors use `/editor` for editorial work.

## Styling Notes

Most global styling lives in:

```text
src/index.css
```

The app uses a newspaper/editorial design language:

- restrained off-white paper backgrounds
- compact admin tables
- Lucide icon buttons
- responsive floating controls
- Lottie loading and not-found states
- article reading themes saved in localStorage

When changing UI, prefer existing classes and patterns before adding new abstractions.

## Development Workflow

1. Start backend:

```bash
cd ../backend
npm run dev
```

2. Start frontend:

```bash
cd ../frontend
npm run dev
```

3. Open `http://localhost:5173`.
4. Use `/admin/login` for super admin access or `/login` for editorial access.

## Build

```bash
npm run build
```

The build runs TypeScript project references first, then Vite. Current builds may show warnings from `lottie-web` direct `eval` and large chunks; those are warnings, not build failures.

## Troubleshooting

- Blank article list: verify backend is running and `VITE_API_BASE_URL` points to `/api`.
- Login succeeds but admin route redirects: clear localStorage and log in again.
- Upload fails: check backend Supabase Storage configuration.
- Search preview does not show: type at least 3 characters and confirm the backend `/api/articles/search` endpoint works.
- Lottie warnings during build: expected from the current `lottie-web` dependency.
