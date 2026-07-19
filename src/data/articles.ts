export interface Author {
  id?: string;
  name: string;
  role: string;
  avatar?: string | null;
}

export const ArticleStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  ARCHIVED: "ARCHIVED"
} as const;

export type ArticleStatus = typeof ArticleStatus[keyof typeof ArticleStatus];

export interface Article {
  id: string;
  dbId?: string;
  title: string;
  summary: string;
  content: string[];
  author: Author;
  date: string;
  publishedAtDate?: Date;
  readingTime: string;
  category: string;
  image?: string | null;
  imageUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
  reviewFeedback?: string | null;
  reviewedAt?: string | null;
  video?: { src: string; type: string; poster?: string | null };
  featured?: boolean;
  trending?: boolean;
  isPartner?: boolean;
  likes?: number;
  status?: ArticleStatus;
  authorId?: string;
  authorUsername?: string;
  hashtags?: string[];
  subcategory?: string;
  subcategoryId?: string;
  targetCountries?: string[];
}
