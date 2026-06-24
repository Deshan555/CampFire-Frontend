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
  role: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}/reject`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ role })
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
}): Promise<{ title: string; summary: string; content: string[] }> {
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
