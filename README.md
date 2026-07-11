# 🔥 CampFire Backend — A-Z Reference Guide

> **Express.js + Supabase + TypeScript** backend for the CampFire Editorial Magazine platform.

---

## Table of Contents

| # | Section | Description |
|---|---------|-------------|
| A | [Architecture Overview](#a-architecture-overview) | High-level system design |
| B | [Build & Scripts](#b-build--scripts) | npm scripts and compilation |
| C | [Controllers](#c-controllers) | Request handlers for each domain |
| D | [Database & Schema](#d-database--schema) | Supabase tables and relationships |
| E | [Environment Variables](#e-environment-variables) | `.env` configuration |
| F | [File Upload](#f-file-upload) | Multer + Supabase Storage |
| G | [Getting Started](#g-getting-started) | Installation and setup |
| H | [Health Check](#h-health-check) | Server health endpoint |
| I | [Index / Entry Point](#i-index--entry-point) | `src/index.ts` boot sequence |
| J | [JWT Authentication](#j-jwt-authentication) | Custom HMAC-SHA256 token system |
| K | [Key Constants](#k-key-constants) | Shared config values |
| L | [Logging Middleware](#l-logging-middleware) | Request/response logging |
| M | [Middleware Stack](#m-middleware-stack) | All middleware explained |
| N | [Nodemon Config](#n-nodemon-config) | Dev server hot-reload |
| O | [Object Types & Interfaces](#o-object-types--interfaces) | TypeScript type definitions |
| P | [Password Hashing](#p-password-hashing) | PBKDF2 salt+hash utilities |
| Q | [Query Patterns (Supabase)](#q-query-patterns-supabase) | Common Supabase query snippets |
| R | [Repositories](#r-repositories) | Data access layer |
| S | [Services](#s-services) | Business logic layer |
| T | [Tenant & Multi-Tenancy](#t-tenant--multi-tenancy) | Tenant context middleware |
| U | [Upload Controller](#u-upload-controller) | File upload to Supabase Storage |
| V | [Validation](#v-validation) | Request body validation |
| W | [Workflow (Request Lifecycle)](#w-workflow-request-lifecycle) | Full request flow |
| X | [Express Type Extensions](#x-express-type-extensions) | Custom `Request` properties |
| Y | [YouTube Service](#y-youtube-service) | Innertube video search |
| Z | [Zero-Dependency JWT](#z-zero-dependency-jwt) | Why no `jsonwebtoken` package |

---

## A. Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    Express.js Server                     │
│                    (Port 5092)                           │
├──────────────────────────────────────────────────────────┤
│  Middleware Pipeline                                     │
│  ┌─────────┐ ┌──────────┐ ┌────────────┐ ┌───────────┐ │
│  │  CORS   │→│ Logging  │→│Rate Limiter│→│  Tenant   │ │
│  └─────────┘ └──────────┘ └────────────┘ └───────────┘ │
├──────────────────────────────────────────────────────────┤
│  Routes → Controllers → Services → Repositories         │
├──────────────────────────────────────────────────────────┤
│                  Supabase (PostgreSQL)                   │
│          + Supabase Storage (file uploads)               │
└──────────────────────────────────────────────────────────┘
```

The backend follows a **layered architecture** pattern:

| Layer | Directory | Responsibility |
|-------|-----------|---------------|
| **Routes** | `src/routes/` | URL mapping, middleware chaining |
| **Controllers** | `src/controllers/` | Parse request, call service, return response |
| **Services** | `src/services/` | Business logic, orchestration |
| **Repositories** | `src/repositories/` | Raw Supabase queries (data access) |
| **Middleware** | `src/middleware/` | Cross-cutting concerns (auth, logging, etc.) |
| **Utils** | `src/utils/` | Pure utility functions (JWT, hashing, validators) |
| **Types** | `src/types/` | TypeScript interfaces and type extensions |

---

## B. Build & Scripts

**`package.json` scripts:**

```json
{
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Starts dev server with hot-reload via `nodemon` + `ts-node` |
| `npm run build` | Compiles TypeScript to `./dist` |
| `npm start` | Runs the compiled production build |

**Key dependencies:**

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.43.4",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "multer": "^2.2.0",
    "pg": "^8.22.0"
  }
}
```

---

## C. Controllers

Controllers live in `src/controllers/` and contain **static methods** that handle HTTP requests.

### ArticleController

Handles all article CRUD, likes, and newsletter subscription.

```typescript
// src/controllers/articleController.ts
export class ArticleController {

  // GET /api/articles — List articles with optional filters
  static async listArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryFilter = req.query.category as string;
      const editorMode = req.query.editorMode === "true";
      const role = req.role;
      const authorUsername = req.query.authorUsername as string;
      const authorName = req.query.authorName as string;

      const articles = await ArticleService.getArticles(
        categoryFilter, editorMode, role, authorUsername, authorName
      );
      res.json(articles);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/articles/:id — Get single article by ID or slug
  static async getArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const article = await ArticleService.getArticleDetails(
        id, req.role,
        req.query.authorUsername as string,
        req.query.authorName as string
      );
      res.json(article);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/articles/:id/like — Increment likes
  static async likeArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const likes = await ArticleService.likeArticle(req.params.id);
      res.json({ success: true, likes });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/articles — Create new article
  static async createArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = { ...req.body, role: req.role };
      const article = await ArticleService.createArticle(payload);
      res.json({ success: true, article });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/articles/:id — Update existing article
  static async updateArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = { ...req.body, role: req.role };
      await ArticleService.updateArticle(req.params.id, payload);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/articles/:id — Delete article
  static async deleteArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const role = req.role || "READER";
      await ArticleService.deleteArticle(req.params.id, role,
        (req.query.authorUsername || req.body.authorUsername) as string,
        (req.query.authorName || req.body.authorName) as string
      );
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/articles/:id/approve — Approve pending article
  static async approveArticle(req: Request, res: Response, next: NextFunction) {
    try {
      await ArticleService.approveArticle(req.params.id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/articles/:id/reject — Reject pending article
  static async rejectArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      await ArticleService.rejectArticle(req.params.id, reason);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
```

### AuthController

```typescript
// src/controllers/authController.ts
export class AuthController {

  // POST /api/login — Authenticate user and return JWT
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const result = await AuthService.login(
        username, password, req.blogSiteId, req.tenantId
      );
      res.json({
        success: true,
        user: result.user,
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/register — Register a new reader
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.registerReader(req.body, req.tenantId);
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: result
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

### AdminController

```typescript
// src/controllers/adminController.ts
export class AdminController {

  // ALL /api/seed — Seed database with initial data
  static async seed(req: Request, res: Response, next: NextFunction) {
    try {
      await ArticleService.seedDatabase();
      res.json({ success: true, message: "Database seeded successfully." });
    } catch (error: any) {
      res.status(500).json({ error: `Seeding failed: ${error.message}` });
    }
  }

  // POST /api/admin/register — Register admin/author/editor user
  static async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password, firstName, lastName,
              avatarUrl, bio, role } = req.body;

      if (!username || !email || !role) {
        return res.status(400).json({
          error: "username, email, and role are required."
        });
      }

      const user = await UserService.registerUser({
        username, email, password, firstName,
        lastName, avatarUrl, bio,
        role: role.toUpperCase()
      }, req.tenantId, req.blogSiteId);

      res.status(201).json({ success: true, user });
    } catch (error: any) {
      if (error.message === "Username already exists") {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: `Registration failed: ${error.message}` });
    }
  }

  // GET /api/admin/roles — List all available roles
  static async listRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await UserRepository.getAllRoles();
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ error: `Failed to fetch roles: ${error.message}` });
    }
  }
}
```

### AiController

```typescript
// src/controllers/aiController.ts
export class AiController {

  // POST /api/ai/generate-article — Generate article via Ollama LLM
  static async generateArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { model, topic, tone, instructions, includeVideo } = req.body;
      if (!model) { res.status(400).json({ error: "model is required" }); return; }
      if (!topic) { res.status(400).json({ error: "topic is required" }); return; }

      const articleData = await AiService.generateArticle({
        model, topic, tone, instructions, includeVideo
      });
      res.json({ success: true, ...articleData });
    } catch (error) {
      next(error);
    }
  }

  // CRUD for review rules — GET/POST/PUT/DELETE /api/ai/rules
  static async listRules(req, res, next)   { /* ... */ }
  static async createRule(req, res, next)  { /* ... */ }
  static async updateRule(req, res, next)  { /* ... */ }
  static async deleteRule(req, res, next)  { /* ... */ }

  // POST /api/ai/review/:id — AI-powered article review
  static async reviewArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { model } = req.body;
      const reviewResult = await AiService.reviewArticle(id, model);
      res.json({ success: true, ...reviewResult });
    } catch (error) {
      next(error);
    }
  }
}
```

### AuthorController & UserController

```typescript
// src/controllers/authorController.ts
export class AuthorController {
  // GET /api/authors/:username — Get author profile
  static async getAuthorDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const author = await UserRepository.findAdminByUsername(req.params.username);
      if (!author) { res.status(404).json({ error: "Author not found" }); return; }
      res.json(author);
    } catch (error) { next(error); }
  }
}

// src/controllers/userController.ts
export class UserController {
  // GET /api/users/profile — Get authenticated user profile
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
      const profile = await UserRepository.findById(userId);
      if (!profile) { res.status(404).json({ error: "User not found." }); return; }
      res.json(profile);
    } catch (error) { next(error); }
  }
}
```

---

## D. Database & Schema

The backend uses **Supabase** (hosted PostgreSQL). Key tables:

| Table | Description |
|-------|-------------|
| `tenants` | Multi-tenant organizations |
| `blog_sites` | Blog sites belonging to tenants |
| `roles` | User roles (SUPER_ADMIN, EDITOR, AUTHOR, READER) |
| `admins` | Admin/author/editor accounts |
| `users` | Reader accounts |
| `categories` | Article categories (Art, Design, Music, etc.) |
| `articles` | Published articles with metadata |
| `comments` | Article comments |
| `subscriptions` | Newsletter email subscriptions |
| `review_rules` | AI review criteria for articles |

**Entity Relationships:**

```
tenants (1) ──→ (N) blog_sites
tenants (1) ──→ (N) admins
tenants (1) ──→ (N) users
roles   (1) ──→ (N) admins
admins  (1) ──→ (N) articles  (as author_id)
categories (1) ──→ (N) articles
articles (1) ──→ (N) comments
blog_sites (1) ──→ (N) review_rules
```

---

## E. Environment Variables

Create a `.env` file in `backend/`:

```bash
PORT=5092

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

JWT_SECRET=your-secret-key-change-in-production

OLLAMA_BASE_URL=http://localhost:11434   # Local Ollama for AI features
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5092` | Server port |
| `SUPABASE_URL` | **Yes** | — | Supabase project URL |
| `SUPABASE_KEY` | **Yes** | — | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | — | Supabase service role key (admin access) |
| `JWT_SECRET` | No | hardcoded fallback | Secret for signing JWTs |
| `OLLAMA_BASE_URL` | No | `http://localhost:11434` | Ollama server for AI generation |

---

## F. File Upload

File uploads use **Multer** (memory storage) → **Supabase Storage**.

```typescript
// src/routes/upload.ts
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });
router.post("/", upload.single("file"), UploadController.uploadFile);
```

The `UploadController` auto-creates a bucket named `campfire-assets` if it doesn't exist:

```typescript
// src/controllers/uploadController.ts
const ensureBucketExists = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets.some((b: any) => b.name === "campfire-assets");
  if (!exists) {
    await supabase.storage.createBucket("campfire-assets", {
      public: true,
      allowedMimeTypes: ["image/*", "video/*", "audio/*", "application/pdf"],
      fileSizeLimit: 10485760 // 10MB
    });
  }
};
```

**Upload flow:**
1. Client sends `multipart/form-data` with field name `file`
2. Multer stores file in memory buffer
3. File is uploaded to Supabase Storage with unique timestamped name
4. Public URL is returned to the client

---

## G. Getting Started

```bash
# 1. Clone and navigate
cd CampFire/backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Seed the database (first run)
curl http://localhost:5092/api/seed

# 5. Start development server
npm run dev
# → Server runs on http://localhost:5092
```

---

## H. Health Check

```typescript
// src/routes/health.ts
router.get("/", (req: Request, res: Response) => {
  res.json({ status: "UP", timestamp: new Date().toISOString() });
});
```

**Usage:**

```bash
curl http://localhost:5092/api/health
# → { "status": "UP", "timestamp": "2024-11-12T10:00:00.000Z" }
```

---

## I. Index / Entry Point

`src/index.ts` is the application bootstrap:

```typescript
// src/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5092;

// 1. CORS — allow frontend origins
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// 2. Body parsing
app.use(express.json());

// 3. Global middleware pipeline
app.use(loggingMiddleware);
app.use(rateLimiterMiddleware);
app.use(tenantContextMiddleware);

// 4. Inline route registrations (direct controller mounting)
app.post("/api/login", AuthController.login);
app.post("/api/newsletter/subscribe", ArticleController.subscribe);
app.all("/api/seed", AdminController.seed);
app.get("/api/articles", ArticleController.listArticles);
app.get("/api/articles/:id", ArticleController.getArticle);
// ... more inline routes

// 5. Router-based route registrations
app.use("/api/auth", authRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/users", usersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/authors", authorsRouter);
app.use("/api/health", healthRouter);
app.use("/api/ai", aiRouter);
app.use("/api/upload", uploadRouter);

// 6. Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Camp Fire Editorial API is operational." });
});

// 7. Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

---

## J. JWT Authentication

Custom JWT implementation using Node.js `crypto` (no external library):

```typescript
// src/utils/jwt.ts
import crypto from "crypto";

// Sign a JWT token with HMAC-SHA256
export function signToken(payload: object, expiryHours = 24): string {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiryHours * 3600;
  const fullPayload = { ...payload, exp };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(fullPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(signatureInput)
    .digest();

  return `${signatureInput}.${base64url(signature)}`;
}

// Verify and decode a JWT token
export function verifyToken(token: string): any {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const calculatedSignature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  if (base64url(calculatedSignature) !== encodedSignature) return null;

  const payload = JSON.parse(base64urlDecode(encodedPayload));
  if (payload.exp && Date.now() / 1000 > payload.exp) return null;

  return payload;
}
```

**Token payload structure:**
```json
{
  "id": "22222222-2222-2222-2222-222222222222",
  "username": "admin",
  "role": "SUPER_ADMIN",
  "tenantId": "00000000-0000-0000-0000-000000000000",
  "exp": 1731494400
}
```

---

## K. Key Constants

```typescript
// src/utils/constants.ts
export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000000";
export const DEFAULT_BLOG_SITE_ID = "11111111-1111-1111-1111-111111111111";

export const JWT_SECRET = process.env.JWT_SECRET
  || "campfire-secret-key-change-in-production-12345";
export const JWT_EXPIRY = "24h";
```

---

## L. Logging Middleware

```typescript
// src/middleware/logging.ts
export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    );
  });
  next();
}
```

**Example output:**
```
[2024-11-12T10:30:00.000Z] GET /api/articles - 200 (45ms)
[2024-11-12T10:30:01.500Z] POST /api/login - 200 (120ms)
```

---

## M. Middleware Stack

Middleware is applied in this order:

| Order | Middleware | File | Purpose |
|-------|-----------|------|---------|
| 1 | CORS | built-in | Cross-origin request handling |
| 2 | JSON Parser | built-in | Parse JSON request bodies |
| 3 | Logging | `middleware/logging.ts` | Log request/response with timing |
| 4 | Rate Limiter | `middleware/rateLimiter.ts` | 100 requests/minute per IP |
| 5 | Tenant Context | `middleware/tenantContext.ts` | Extract tenant/blog-site IDs from headers |
| 6 | Auth *(per-route)* | `middleware/auth.ts` | JWT verification, role extraction |
| 7 | Authorization *(per-route)* | `middleware/authorization.ts` | Role-based access control |
| 8 | Validation *(per-route)* | `middleware/validation.ts` | Required field validation |
| 9 | Error Handler | `middleware/errorHandler.ts` | Global error catch |

### Rate Limiter

```typescript
// src/middleware/rateLimiter.ts — In-memory sliding window
const clients = new Map<string, { count: number; resetAt: number }>();

export function rateLimiterMiddleware(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const windowMs = 60000; // 1 minute
  const limit = 100;

  let record = clients.get(ip);
  if (!record || Date.now() > record.resetAt) {
    record = { count: 1, resetAt: Date.now() + windowMs };
    clients.set(ip, record);
  } else {
    record.count++;
  }

  if (record.count > limit) {
    res.status(429).json({ error: "Too many requests." });
    return;
  }
  next();
}
```

### Authorization (Role-Based)

```typescript
// src/middleware/authorization.ts
export function requireRoles(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.role;
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ error: "Access denied. Insufficient permissions." });
      return;
    }
    next();
  };
}

// Usage in routes:
router.post("/", authMiddleware, requireRoles(["SUPER_ADMIN", "AUTHOR"]),
  ArticleController.createArticle
);
```

### Validation

```typescript
// src/middleware/validation.ts
export function validateBody(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = validateRequired(req.body, fields);
    if (missing.length > 0) {
      res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
      return;
    }
    next();
  };
}

// Usage:
router.post("/login", validateBody(["username", "password"]), AuthController.login);
```

---

## N. Nodemon Config

```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.spec.ts", "local_db.json"],
  "exec": "ts-node src/index.ts"
}
```

---

## O. Object Types & Interfaces

```typescript
// src/types/api.ts
export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string[];
  author: Author;
  date: string;
  readingTime: string;
  category: string;
  image?: string;
  video?: { src: string; type: string; poster?: string };
  featured?: boolean;
  trending?: boolean;
  isPartner?: boolean;
  likes?: number;
  status?: "approved" | "pending" | "rejected" | "draft";
  authorUsername?: string;
}
```

---

## P. Password Hashing

Uses PBKDF2 with random salt (no external bcrypt dependency):

```typescript
// src/utils/password.ts
import crypto from "crypto";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}
```

**Storage format:** `<16-byte-hex-salt>:<64-byte-hex-hash>`

---

## Q. Query Patterns (Supabase)

### Select with joins (relational data)

```typescript
// Fetch articles with author and category joined
const { data, error } = await supabase
  .from("articles")
  .select(`
    id, title, slug, summary, content,
    featured_image_url, likes_count, status,
    author:admins!author_id(
      id, first_name, last_name, username, avatar_url, bio
    ),
    category:categories!category_id(
      id, name, slug
    )
  `)
  .is("deleted_at", null);
```

### Find by ID or slug

```typescript
let query = supabase.from("articles").select("...");
if (isUUID) {
  query = query.eq("id", id);
} else {
  query = query.eq("slug", id);
}
const { data } = await query.is("deleted_at", null).maybeSingle();
```

### Upsert (insert or update)

```typescript
await supabase.from("articles").upsert(dbArticle);
```

### Soft-delete filter

```typescript
// All queries filter out soft-deleted records
.is("deleted_at", null)
```

---

## R. Repositories

Repositories are the **data access layer** — they only interact with Supabase.

### ArticleRepository

```typescript
// src/repositories/articleRepository.ts
export class ArticleRepository {
  static async findAll()                    { /* SELECT with joins */ }
  static async findByIdOrSlug(id, isUUID)   { /* Single article lookup */ }
  static async create(articleData)          { /* INSERT */ }
  static async update(id, updateData)       { /* UPDATE by ID */ }
  static async delete(id)                   { /* DELETE by ID */ }
  static async incrementLikes(id, newLikes) { /* UPDATE likes_count */ }
  static async findCategoryByName(name)     { /* Lookup category */ }
  static async createCategory(data)         { /* INSERT category */ }
  static async subscribeNewsletter(email)   { /* INSERT subscription */ }
}
```

### UserRepository

```typescript
// src/repositories/userRepository.ts
export class UserRepository {
  static async findUserByUsername(username)   { /* users table lookup */ }
  static async findAdminByUsername(username)  { /* admins table lookup */ }
  static async findById(id)                  { /* users table by ID */ }
  static async findRole(adminId)             { /* Join admins → roles */ }
  static async findRoleByName(roleName)      { /* roles table lookup */ }
  static async getAllRoles()                  { /* List all roles */ }
  static async createAdmin(adminData)        { /* INSERT admin */ }
  static async createUser(userData)          { /* INSERT user */ }
}
```

### CommentRepository

```typescript
// src/repositories/commentRepository.ts
export class CommentRepository {
  static async findByArticleId(articleId) { /* SELECT where article_id */ }
  static async createComment(commentData) { /* INSERT comment */ }
}
```

### RuleRepository

```typescript
// src/repositories/ruleRepository.ts
export class RuleRepository {
  static async findAll(blogSiteId)          { /* List review rules */ }
  static async findById(id)                 { /* Single rule lookup */ }
  static async create(ruleData)             { /* INSERT rule */ }
  static async update(id, updateData)       { /* UPDATE rule */ }
  static async delete(id)                   { /* DELETE rule */ }
}
```

---

## S. Services

Services contain the **business logic** and orchestrate between repositories.

### AuthService — Login Flow

```typescript
// src/services/authService.ts
export class AuthService {
  static async login(username, password, blogSiteId, tenantId) {
    // 1. Try admins table first, then users table
    let user = await UserRepository.findAdminByUsername(username);
    let isAdmin = true;
    if (!user) {
      user = await UserRepository.findUserByUsername(username);
      isAdmin = false;
    }

    // 2. Verify password
    if (!user || !verifyPassword(password, user.password_hash)) {
      throw new Error("Invalid username or password");
    }

    // 3. Check account status
    if (!user.is_active) throw new Error("User account is inactive");

    // 4. Determine role
    let role = "READER";
    if (isAdmin) {
      const foundRole = await UserRepository.findRole(user.id);
      if (foundRole) role = foundRole;
    }

    // 5. Sign and return JWT
    const token = signToken({ id: user.id, username: user.username, role, tenantId });
    return { token, user: { username, name: "...", role, avatar: "..." } };
  }
}
```

### ArticleService — Key Methods

```typescript
// src/services/articleService.ts
export class ArticleService {

  // Transforms raw DB records into API-friendly format
  static async getArticles(categoryFilter?, editorMode?, role?, ...) {
    const rawData = await ArticleRepository.findAll();
    let articles = rawData.map((item) => ({
      id: item.slug || item.id,
      title: item.title,
      category: item.category?.name || "Uncategorized",
      status: item.status === "pending_review" ? "pending" : item.status,
      author: {
        name: `${item.author?.first_name} ${item.author?.last_name}`.trim(),
        role: item.author?.bio || "Staff Writer",
        avatar: item.author?.avatar_url
      },
      // ... more field mappings
    }));

    // Filter by category
    if (categoryFilter && categoryFilter !== "All") {
      articles = articles.filter(a => a.category === categoryFilter);
    }

    // Editor mode: authors only see their own articles
    if (editorMode && role === "AUTHOR") {
      articles = articles.filter(a => a.authorUsername === authorUsername);
    } else if (!editorMode) {
      articles = articles.filter(a => a.status === "approved");
    }

    return articles;
  }

  // Smart article suggestions based on scoring
  static async getArticleSuggestions(id) {
    // Score based on: category match (+100), author match (+30),
    // popularity (likes * 0.5), featured (+20), trending (+15),
    // recency (decay over 60 days)
    // Returns top 3 articles
  }

  // Article creation with auto author resolution
  static async createArticle(body) {
    const authorId = await UserService.findOrCreateAuthor(username, name, ...);
    // Auto-resolve category (find existing or create new)
    // Status: SUPER_ADMIN → "approved", AUTHOR → "pending_review"
    await ArticleRepository.create(dbArticle);
  }

  // Database seeding
  static async seedDatabase() {
    // Creates: tenant, blog_site, admin users, categories, articles
  }
}
```

### AiService — Ollama Integration

```typescript
// src/services/aiService.ts
export class AiService {

  // Supported models
  static supportedModels = [
    "gemma3:1b", "deepseek-coder:1.3b", "deepseek-r1:1.5b",
    "deepseek-r1:8b", "llama3.2:latest"
  ];

  // Generate article via local Ollama
  static async generateArticle(options) {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      body: JSON.stringify({
        model: options.model,
        prompt: systemPrompt + userPrompt,
        stream: false,
        options: { temperature: 0.7 }
      })
    });

    const text = (await response.json()).response;
    return this.parseGeneratedArticle(text, options.topic, options.includeVideo);
  }

  // AI article review against editorial rules
  static async reviewArticle(articleId, model) {
    // 1. Fetch article from DB
    // 2. Fetch active review rules (or use defaults)
    // 3. Send to Ollama with review prompt
    // 4. Parse JSON response { approved: boolean, feedback: string }
    // 5. Update article status in DB
    return { id, status, approved, feedback };
  }
}
```

### CacheService — In-Memory TTL Cache

```typescript
// src/services/cacheService.ts
export class CacheService {
  private static store = new Map<string, { value: any; expiry: number }>();

  static set(key: string, value: any, ttlSeconds = 300) {
    this.store.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 });
  }

  static get(key: string) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) { this.store.delete(key); return null; }
    return item.value;
  }

  static delete(key: string) { this.store.delete(key); }
}
```

---

## T. Tenant & Multi-Tenancy

```typescript
// src/middleware/tenantContext.ts
export function tenantContextMiddleware(req, res, next) {
  req.tenantId = (req.headers["x-tenant-id"] as string) || DEFAULT_TENANT_ID;
  req.blogSiteId = (req.headers["x-blog-site-id"] as string) || DEFAULT_BLOG_SITE_ID;
  next();
}
```

Clients can send custom headers to target a specific tenant:
```
X-Tenant-Id: 00000000-0000-0000-0000-000000000000
X-Blog-Site-Id: 11111111-1111-1111-1111-111111111111
```

---

## U. Upload Controller

See [F. File Upload](#f-file-upload) for the full implementation.

**API endpoint:**
```
POST /api/upload
Content-Type: multipart/form-data
Body: file=<binary>
```

**Response:**
```json
{
  "success": true,
  "url": "https://your-project.supabase.co/storage/v1/object/public/campfire-assets/1731234567890_abc123.jpg",
  "fileName": "1731234567890_abc123.jpg",
  "originalName": "photo.jpg",
  "mimeType": "image/jpeg",
  "size": 245000
}
```

---

## V. Validation

```typescript
// src/utils/validators.ts
export function validateEmail(email: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/.test(email);
}

export function validateRequired(obj: any, fields: string[]): string[] {
  const missing: string[] = [];
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null || obj[f] === "") {
      missing.push(f);
    }
  }
  return missing;
}
```

---

## W. Workflow (Request Lifecycle)

```
Client Request
  │
  ├─→ CORS check
  ├─→ JSON body parsing
  ├─→ Logging (start timer)
  ├─→ Rate Limiter (check IP limit)
  ├─→ Tenant Context (extract headers)
  │
  ├─→ Route Matching
  │     ├─→ Auth Middleware (verify JWT, set req.user)
  │     ├─→ Authorization (check role permissions)
  │     └─→ Validation (check required fields)
  │
  ├─→ Controller (parse params, call service)
  │     └─→ Service (business logic)
  │           └─→ Repository (Supabase query)
  │
  ├─→ Response sent to client
  └─→ Logging (log with duration)
```

---

## X. Express Type Extensions

```typescript
// src/types/express.d.ts
import { AuthenticatedUser } from "./api";

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      blogSiteId?: string;
      user?: AuthenticatedUser;
      role?: string;
    }
  }
}
```

This allows `req.tenantId`, `req.blogSiteId`, `req.user`, and `req.role` throughout the app.

---

## Y. YouTube Service

Uses YouTube's internal **Innertube API** (no API key required) to search and rank videos:

```typescript
// src/services/youtubeService.ts
export class YoutubeService {
  static async findBestVideo(query: string, opts = { limit: 5, sortBy: "engagement" }) {
    // 1. Scrape INNERTUBE_API_KEY from youtube.com homepage
    const key = await getInnertubeKey();

    // 2. Search videos via innertube/v1/search
    const results = await searchVideos(query, opts.limit, key);

    // 3. Enrich with stats (views, likes, comments) via player + next endpoints
    const enriched = results.map(v => ({
      ...v,
      ...await getVideoStats(v.id, key),
      engagement: stats.likeCount + stats.commentCount * 5
    }));

    // 4. Sort by engagement and return top result
    enriched.sort((a, b) => b.engagement - a.engagement);
    return enriched[0];
  }
}
```

**Engagement formula:** `likeCount + (commentCount × 5)`

---

## Z. Zero-Dependency JWT

The project implements JWT **without** the `jsonwebtoken` npm package. Instead, it uses Node.js built-in `crypto` module for HMAC-SHA256 signing and verification. This keeps the dependency footprint minimal while maintaining standard JWT compatibility.

See [J. JWT Authentication](#j-jwt-authentication) for the full implementation.

---

## API Endpoint Summary

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET` | `/` | No | — | API status |
| `GET` | `/api/health` | No | — | Health check |
| `ALL` | `/api/seed` | No | — | Seed database |
| `POST` | `/api/login` | No | — | Login |
| `POST` | `/api/auth/register` | No | — | Register reader |
| `POST` | `/api/admin/register` | No | — | Register admin/author |
| `GET` | `/api/admin/roles` | No | — | List roles |
| `GET` | `/api/articles` | Auth | Any | List articles |
| `GET` | `/api/articles/:id` | Auth | Any | Get article details |
| `GET` | `/api/articles/:id/suggestions` | Auth | Any | Get related articles |
| `POST` | `/api/articles/:id/like` | No | — | Like article |
| `POST` | `/api/articles` | Auth | SUPER_ADMIN, AUTHOR | Create article |
| `PUT` | `/api/articles/:id` | Auth | SUPER_ADMIN, AUTHOR | Update article |
| `DELETE` | `/api/articles/:id` | Auth | SUPER_ADMIN, AUTHOR | Delete article |
| `POST` | `/api/articles/:id/approve` | Auth | SUPER_ADMIN | Approve article |
| `POST` | `/api/articles/:id/reject` | Auth | SUPER_ADMIN | Reject article |
| `POST` | `/api/newsletter/subscribe` | No | — | Subscribe email |
| `GET` | `/api/users/profile` | Auth | Any | Get user profile |
| `GET` | `/api/authors/:username` | No | — | Get author details |
| `POST` | `/api/upload` | No | — | Upload file |
| `POST` | `/api/ai/generate-article` | No | — | Generate AI article |
| `GET` | `/api/ai/rules` | Auth | SUPER_ADMIN, EDITOR | List review rules |
| `POST` | `/api/ai/rules` | Auth | SUPER_ADMIN, EDITOR | Create review rule |
| `PUT` | `/api/ai/rules/:id` | Auth | SUPER_ADMIN, EDITOR | Update review rule |
| `DELETE` | `/api/ai/rules/:id` | Auth | SUPER_ADMIN, EDITOR | Delete review rule |
| `POST` | `/api/ai/review/:id` | Auth | SUPER_ADMIN, EDITOR | AI review article |

---

## Directory Structure

```
backend/
├── .env                          # Environment variables
├── nodemon.json                  # Dev server config
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── schema.sql                    # Full database schema
├── migration.sql                 # Migration scripts
├── src/
│   ├── index.ts                  # 🚀 Entry point
│   ├── supabase.ts               # Supabase client initialization
│   ├── initialData.ts            # Seed data (articles)
│   ├── controllers/
│   │   ├── adminController.ts    # Admin operations
│   │   ├── aiController.ts       # AI generation & review
│   │   ├── articleController.ts  # Article CRUD
│   │   ├── authController.ts     # Authentication
│   │   ├── authorController.ts   # Author profiles
│   │   ├── uploadController.ts   # File uploads
│   │   └── userController.ts     # User profiles
│   ├── middleware/
│   │   ├── auth.ts               # JWT authentication
│   │   ├── authorization.ts      # Role-based access
│   │   ├── errorHandler.ts       # Global error handler
│   │   ├── logging.ts            # Request logging
│   │   ├── rateLimiter.ts        # Rate limiting
│   │   ├── tenantContext.ts      # Multi-tenant context
│   │   └── validation.ts         # Body validation
│   ├── repositories/
│   │   ├── articleRepository.ts  # Article data access
│   │   ├── commentRepository.ts  # Comment data access
│   │   ├── ruleRepository.ts     # Review rules data access
│   │   └── userRepository.ts     # User data access
│   ├── routes/
│   │   ├── admin.ts              # /api/admin routes
│   │   ├── ai.ts                 # /api/ai routes
│   │   ├── articles.ts           # /api/articles routes
│   │   ├── auth.ts               # /api/auth routes
│   │   ├── authors.ts            # /api/authors routes
│   │   ├── health.ts             # /api/health routes
│   │   ├── upload.ts             # /api/upload routes
│   │   └── users.ts              # /api/users routes
│   ├── services/
│   │   ├── aiService.ts          # AI/Ollama integration
│   │   ├── articleService.ts     # Article business logic
│   │   ├── authService.ts        # Authentication logic
│   │   ├── cacheService.ts       # In-memory TTL cache
│   │   ├── emailService.ts       # Email notifications
│   │   ├── userService.ts        # User management
│   │   └── youtubeService.ts     # YouTube video search
│   ├── types/
│   │   ├── api.ts                # Domain interfaces
│   │   ├── express.d.ts          # Express type extensions
│   │   └── index.ts              # Type barrel export
│   └── utils/
│       ├── constants.ts          # App-wide constants
│       ├── jwt.ts                # JWT sign/verify
│       ├── password.ts           # Password hash/verify
│       └── validators.ts         # Input validators
└── dist/                         # Compiled output
```

---

*Author: Deshan Jayashanka • CampFire Editorial Platform*
