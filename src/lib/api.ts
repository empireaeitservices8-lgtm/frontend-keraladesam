import { Article } from '@/data/newsData';

function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api';
  }
  return 'https://kerala-dhesam-admin.vercel.app/api';
}

const API_BASE_URL = getApiBaseUrl();

export function normalizeArticle(raw: any): Article {
  return {
    id: raw.customId || raw._id || 'article',
    customId: raw.customId || raw._id,
    title: raw.title || '',
    lead: raw.lead || '',
    category: raw.category || 'പ്രധാനം',
    categoryColor: raw.categoryColor || '#006b9a',
    timeAgo: raw.publishedAt || raw.createdAt ? new Date(raw.createdAt || Date.now()).toLocaleTimeString('ml-IN', { hour: '2-digit', minute: '2-digit' }) : 'തത്സമയം',
    publishedAt: raw.publishedAt || new Date().toLocaleString('ml-IN'),
    updatedAt: raw.updatedAt || '',
    author: {
      name: raw.author?.name || 'കേരളദേശം ന്യൂസ് ഡെസ്ക്',
      designation: raw.author?.designation || 'റിപ്പോർട്ടർ',
      location: raw.author?.location || 'കേരളം',
      avatar: raw.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      verified: raw.author?.verified ?? true,
    },
    district: raw.district || '',
    country: raw.country || '',
    views: raw.views || '1.2k',
    imageUrl: raw.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
    imageCaption: raw.imageCaption || '',
    readTime: raw.readTime || '3 മിനിറ്റ് വായന',
    audioDuration: raw.audioDuration || '03:00',
    paragraphs: Array.isArray(raw.paragraphs) && raw.paragraphs.length > 0 ? raw.paragraphs : [raw.lead || ''],
    highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    trending: Boolean(raw.trending),
    breaking: Boolean(raw.breaking),
  };
}

export interface ArticleQueryParams {
  category?: string;
  search?: string;
  trending?: boolean;
  district?: string;
  limit?: number;
}

export async function getArticles(params?: ArticleQueryParams): Promise<Article[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const url = new URL(`${baseUrl}/articles`);
    if (params?.category && params.category !== 'all' && params.category !== 'എല്ലാം') {
      url.searchParams.set('category', params.category);
    }
    if (params?.search) {
      url.searchParams.set('search', params.search);
    }
    if (params?.trending) {
      url.searchParams.set('trending', 'true');
    }
    if (params?.district && params.district !== 'all' && params.district !== 'എല്ലാം') {
      url.searchParams.set('district', params.district);
    }
    if (params?.limit) {
      url.searchParams.set('limit', params.limit.toString());
    }
    url.searchParams.set('_t', Date.now().toString());

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.articles) ? data.articles.map(normalizeArticle) : [];
  } catch (error) {
    console.error('Failed to fetch articles from database API:', error);
    return [];
  }
}

export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/articles/${id}?_t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.article) return normalizeArticle(data.article);
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch article ${id} from database API:`, error);
    return null;
  }
}

export async function getBreakingNews(): Promise<string[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/breaking?_t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const headlines = Array.isArray(data.headlines) ? data.headlines.map((h: any) => h.headline) : [];
      return headlines;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch breaking news from database API:', error);
    return [];
  }
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  avatar?: string;
}

export async function adminLogin(
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; user?: AdminUser; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }
    return { success: true, token: data.token, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during login' };
  }
}

export async function adminRegister(
  name: string,
  email: string,
  password: string,
  role: 'admin' | 'editor' = 'editor'
): Promise<{ success: boolean; token?: string; user?: AdminUser; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Registration failed' };
    }
    return { success: true, token: data.token, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during registration' };
  }
}

export async function adminGetMe(token: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Unauthorized' };
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function adminCreateArticle(
  articleData: Partial<Article>,
  token: string
): Promise<{ success: boolean; article?: Article; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(articleData),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to create article' };
    return { success: true, article: normalizeArticle(data.article) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function adminUpdateArticle(
  id: string,
  articleData: Partial<Article>,
  token: string
): Promise<{ success: boolean; article?: Article; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(articleData),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to update article' };
    return { success: true, article: normalizeArticle(data.article) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function adminDeleteArticle(
  id: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to delete article' };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function adminGetRawBreaking(): Promise<Array<{ _id: string; headline: string; active: boolean; createdAt: string }>> {
  try {
    const res = await fetch(`${API_BASE_URL}/breaking?_t=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data.headlines) ? data.headlines : [];
  } catch {
    return [];
  }
}

export async function adminCreateBreaking(
  headline: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/breaking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ headline }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to add breaking headline' };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function adminDeleteBreaking(
  id: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/breaking/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to delete headline' };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

// Aliases for compatibility
export const getRealArticles = getArticles;
export const getRealArticleById = getArticleById;
export const getRealBreakingNews = getBreakingNews;
