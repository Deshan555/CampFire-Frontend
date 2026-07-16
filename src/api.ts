import type { Article } from "./data/articles";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5092/api";

/**
 * Helper to build request headers, appending the Bearer token if present.
 */
function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem("authToken");
  const headers: Record<string, string> = {
    ...extraHeaders
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchArticles(
  category?: string,
  editorParams?: {
    editorMode?: boolean;
    role?: string;
    authorUsername?: string;
    authorName?: string;
  }
): Promise<Article[]> {
  const url = new URL(`${API_BASE_URL}/articles`);
  if (category && category !== "All") {
    url.searchParams.append("category", category);
  }
  if (editorParams) {
    if (editorParams.editorMode) {
      url.searchParams.append("editorMode", "true");
    }
    if (editorParams.role) {
      url.searchParams.append("role", editorParams.role);
    }
    if (editorParams.authorUsername) {
      url.searchParams.append("authorUsername", editorParams.authorUsername);
    }
    if (editorParams.authorName) {
      url.searchParams.append("authorName", editorParams.authorName);
    }
  }
  const response = await fetch(url.toString(), {
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error("Failed to fetch articles from backend");
  }
  return response.json();
}

export async function fetchArticleDetails(
  id: string,
  userParams?: {
    role?: string;
    authorUsername?: string;
    authorName?: string;
  }
): Promise<Article> {
  const url = new URL(`${API_BASE_URL}/articles/${id}`);
  if (userParams) {
    if (userParams.role) {
      url.searchParams.append("role", userParams.role);
    }
    if (userParams.authorUsername) {
      url.searchParams.append("authorUsername", userParams.authorUsername);
    }
    if (userParams.authorName) {
      url.searchParams.append("authorName", userParams.authorName);
    }
  }
  const response = await fetch(url.toString(), {
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch article details for ID ${id}`);
  }
  return response.json();
}

export async function likeArticle(id: string): Promise<{ success: boolean; likes: number }> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}/like`, {
    method: "POST",
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error(`Failed to submit like for article ID ${id}`);
  }
  return response.json();
}

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ email })
  });
  if (!response.ok) {
    throw new Error("Failed to subscribe to newsletter");
  }
  return response.json();
}

export async function createArticle(
  article: Partial<Article> & {
    authorName?: string;
    authorRole?: string;
    authorAvatar?: string;
  }
): Promise<{ success: boolean; article: Article }> {
  const response = await fetch(`${API_BASE_URL}/articles`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(article)
  });
  if (!response.ok) {
    throw new Error("Failed to create article");
  }
  return response.json();
}

export async function updateArticle(
  id: string,
  article: Partial<Article>
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
    method: "PUT",
    headers: getHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(article)
  });
  if (!response.ok) {
    throw new Error(`Failed to update article ID ${id}`);
  }
  return response.json();
}

export async function deleteArticle(
  id: string,
  userParams?: {
    role?: string;
    authorUsername?: string;
    authorName?: string;
  }
): Promise<{ success: boolean }> {
  const url = new URL(`${API_BASE_URL}/articles/${id}`);
  if (userParams) {
    if (userParams.role) {
      url.searchParams.append("role", userParams.role);
    }
    if (userParams.authorUsername) {
      url.searchParams.append("authorUsername", userParams.authorUsername);
    }
    if (userParams.authorName) {
      url.searchParams.append("authorName", userParams.authorName);
    }
  }
  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error(`Failed to delete article ID ${id}`);
  }
  return response.json();
}

export async function approveArticle(
  id: string,
  role: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}/approve`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ role })
  });
  if (!response.ok) {
    throw new Error("Failed to approve article");
  }
  return response.json();
}

export async function rejectArticle(
  id: string,
  role: string,
  reason?: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}/reject`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ role, reason })
  });
  if (!response.ok) {
    throw new Error("Failed to reject article");
  }
  return response.json();
}

export async function registerReader(
  payload: { username: string; email: string; password?: string; firstName?: string; lastName?: string; avatarUrl?: string; bio?: string }
): Promise<{ success: boolean; user: any }> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to register user");
  }
  return data;
}

export async function registerAdmin(
  payload: { username: string; email: string; password?: string; firstName?: string; lastName?: string; avatarUrl?: string; bio?: string; role: string }
): Promise<{ success: boolean; user: any }> {
  const response = await fetch(`${API_BASE_URL}/admin/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to register admin");
  }
  return data;
}

export async function generateAiArticle(payload: {
  model: string;
  topic: string;
  tone?: string;
  instructions?: string;
  includeVideo?: boolean;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ai/generate-article`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to generate article using AI");
  }
  return data;
}

export async function fetchArticleSuggestions(id: string): Promise<Article[]> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}/suggestions`, {
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch suggestions for article ID ${id}`);
  }
  return response.json();
}

/**
 * Uploads a file to the backend storage
 */
export async function uploadFile(file: File): Promise<{ success: boolean; url: string; fileName: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: getHeaders(), // Browser automatically sets Content-Type with boundary for FormData
    body: formData
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "File upload failed");
  }

  return response.json();
}

export interface ReviewRule {
  id?: string;
  blog_site_id?: string;
  name: string;
  criteria: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function fetchRules(blogSiteId: string): Promise<ReviewRule[]> {
  const response = await fetch(`${API_BASE_URL}/ai/rules?blogSiteId=${blogSiteId}`, {
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch AI review rules");
  }
  return data.rules || [];
}

export async function createRule(payload: { blogSiteId: string; name: string; criteria: string; isActive?: boolean }): Promise<ReviewRule> {
  const response = await fetch(`${API_BASE_URL}/ai/rules`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to create AI review rule");
  }
  return data.rule;
}

export async function updateRule(id: string, payload: { name: string; criteria: string; isActive: boolean }): Promise<ReviewRule> {
  const response = await fetch(`${API_BASE_URL}/ai/rules/${id}`, {
    method: "PUT",
    headers: getHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to update AI review rule");
  }
  return data.rule;
}

export async function deleteRule(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/ai/rules/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete AI review rule");
  }
  return data.success;
}

export async function reviewArticleWithAi(
  id: string,
  model: string,
  selectedRuleIds?: string[],
  addedRules?: { name: string; criteria: string }[]
): Promise<{ success: boolean; approved: boolean; feedback: string }> {
  const response = await fetch(`${API_BASE_URL}/ai/review/${id}`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ model, selectedRuleIds, addedRules })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "AI Article review failed");
  }
  return data;
}

// Admin / User Management endpoints (Placeholder / Future Implementation)
export async function fetchUsers(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
}

export async function fetchCategories(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/admin/categories`, {
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

export async function createCategory(payload: { name: string; slug?: string; status: string }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/categories`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error("Failed to create category");
  }
  return response.json();
}

export async function updateCategory(id: string, payload: { name: string; slug: string; status: string }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
    method: "PUT",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error("Failed to update category");
  }
  return response.json();
}

export async function deleteCategory(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error("Failed to delete category");
  }
  return response.json();
}

export async function fetchSubcategories(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/admin/subcategories`, {
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error("Failed to fetch subcategories");
  }
  return response.json();
}

export async function createSubcategory(payload: { name: string; parentName: string; slug?: string; status: string }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/subcategories`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error("Failed to create subcategory");
  }
  return response.json();
}

export async function updateSubcategory(id: string, payload: { name: string; parentName: string; slug: string; status: string }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/subcategories/${id}`, {
    method: "PUT",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error("Failed to update subcategory");
  }
  return response.json();
}

export async function deleteSubcategory(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/subcategories/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error("Failed to delete subcategory");
  }
  return response.json();
}

export async function fetchTags(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/admin/tags`, {
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }
  return response.json();
}

