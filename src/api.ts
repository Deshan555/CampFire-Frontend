import type { Article } from "./data/articles";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5092/api";

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

async function handleResponse(response: Response) {
  let json;
  try {
    json = await response.json();
  } catch (e) {
    throw new Error("Invalid JSON response from server");
  }
  
  if (!response.ok || json.success === false) {
    if (json.errors && json.errors.length > 0) {
      throw new Error(json.errors[0].message);
    }
    throw new Error(json.error || "An error occurred");
  }
  
  // Return the data directly based on the new backend standard structure
  return json.data;
}

export async function fetchArticles(
  category?: string,
  editorParams?: {
    editorMode?: boolean;
    role?: string;
    authorId?: string;
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
    if (editorParams.authorId) {
      url.searchParams.append("authorId", editorParams.authorId);
    }
  }
  const response = await fetch(url.toString(), {
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function fetchArticleDetails(
  id: string,
  userParams?: {
    role?: string;
    authorId?: string;
  }
): Promise<Article> {
  const url = new URL(`${API_BASE_URL}/articles/${id}`);
  if (userParams) {
    if (userParams.role) {
      url.searchParams.append("role", userParams.role);
    }
    if (userParams.authorId) {
      url.searchParams.append("authorId", userParams.authorId);
    }
  }
  const response = await fetch(url.toString(), {
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function likeArticle(id: string): Promise<{ success: boolean; likes: number }> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}/like`, {
    method: "POST",
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ email })
  });
  return handleResponse(response);
}

export async function createArticle(
  article: Partial<Article> & {
    authorId?: string;
  }
): Promise<{ success: boolean; article: Article }> {
  const response = await fetch(`${API_BASE_URL}/articles`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(article)
  });
  return handleResponse(response);
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
  return handleResponse(response);
}

export async function deleteArticle(
  id: string,
  userParams?: {
    role?: string;
    authorId?: string;
  }
): Promise<{ success: boolean }> {
  const url = new URL(`${API_BASE_URL}/articles/${id}`);
  if (userParams) {
    if (userParams.role) {
      url.searchParams.append("role", userParams.role);
    }
    if (userParams.authorId) {
      url.searchParams.append("authorId", userParams.authorId);
    }
  }
  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function approveArticle(
  id: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}/approve`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({})
  });
  return handleResponse(response);
}

export async function rejectArticle(
  id: string,
  reason?: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}/reject`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ reason })
  });
  return handleResponse(response);
}

export async function registerReader(
  payload: { username: string; email: string; password: string; firstName?: string; lastName?: string; avatarUrl?: string; bio?: string }
): Promise<{ success: boolean; user: any }> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function registerAdmin(
  payload: { username: string; email: string; password: string; firstName?: string; lastName?: string; avatarUrl?: string; bio?: string; role: string }
): Promise<{ success: boolean; user: any }> {
  const response = await fetch(`${API_BASE_URL}/admin/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
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
  return handleResponse(response);
}

export async function fetchArticleSuggestions(id: string): Promise<Article[]> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}/suggestions`, {
    headers: getHeaders()
  });
  return handleResponse(response);
}

/**
 * Uploads a file to the backend storage
 */
export async function uploadFile(file: File): Promise<{ success: boolean; url: string; fileName: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: getHeaders(),
    body: formData
  });

  return handleResponse(response);
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
  const data = await handleResponse(response);
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
  const data = await handleResponse(response);
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
  const data = await handleResponse(response);
  return data.rule;
}

export async function deleteRule(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/ai/rules/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  await handleResponse(response);
  return true;
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
  const data = await handleResponse(response);
  return { success: true, ...data };
}

// Admin / User Management endpoints (Placeholder / Future Implementation)
export async function fetchUsers(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: getHeaders()
  });
  return handleResponse(response);
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  count: number;
  status: TaxonomyStatus;
}

export interface SubcategoryDto {
  id: string;
  name: string;
  parentName: string;
  categoryId: string;
  slug: string;
  count: number;
  status: TaxonomyStatus;
}

export async function fetchCategories(): Promise<CategoryDto[]> {
  const response = await fetch(`${API_BASE_URL}/admin/categories`, {
    headers: getHeaders()
  });
  return handleResponse(response);
}

export type TaxonomyStatus = "ACTIVE" | "INACTIVE";

export async function createCategory(payload: { name: string; slug?: string; status: TaxonomyStatus }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/categories`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function updateCategory(id: string, payload: { name: string; slug: string; status: TaxonomyStatus }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
    method: "PUT",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function deleteCategory(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function fetchSubcategories(): Promise<SubcategoryDto[]> {
  const response = await fetch(`${API_BASE_URL}/admin/subcategories`, {
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function createSubcategory(payload: { name: string; parentName: string; slug?: string; status: TaxonomyStatus }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/subcategories`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function updateSubcategory(id: string, payload: { name: string; parentName: string; slug: string; status: TaxonomyStatus }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/subcategories/${id}`, {
    method: "PUT",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function deleteSubcategory(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/subcategories/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function fetchTags(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/admin/tags`, {
    headers: getHeaders()
  });
  return handleResponse(response);
}
