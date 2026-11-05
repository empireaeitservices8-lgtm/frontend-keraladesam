import { Article, VideoItem } from '@/data/newsData';

export const VERCEL_API_BASE_URL = 'https://kerala-dhesam-admin.vercel.app/api';
export const RENDER_API_BASE_URL = 'https://kerala-dhesam-admin.onrender.com/api';
export const LIVE_API_BASE_URL = VERCEL_API_BASE_URL;
let isLocalBackendOffline = false;

export function getApiBaseUrl(): string {
  // During server-side build / prerender (Node.js)
  if (typeof window === 'undefined') {
    if (process.env.API_URL) return process.env.API_URL.replace(/\/$/, '');
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    if (process.env.RENDER) return RENDER_API_BASE_URL;
    return 'http://127.0.0.1:5000/api';
  }

  // Priority 1: User-configured environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    if (
      isLocalBackendOffline &&
      (process.env.NEXT_PUBLIC_API_URL.includes('localhost') ||
        process.env.NEXT_PUBLIC_API_URL.includes('127.0.0.1'))
    ) {
      return window.location.hostname.includes('onrender.com')
        ? RENDER_API_BASE_URL
        : VERCEL_API_BASE_URL;
    }
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // Priority 2: When browsing on Render (kerala-dhesam.onrender.com), point to Render backend
  if (window.location.hostname.includes('onrender.com')) {
    return RENDER_API_BASE_URL;
  }

  // Priority 3: Localhost development
  if (
    !isLocalBackendOffline &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.'))
  ) {
    return 'http://localhost:5000/api';
  }

  // Priority 4: Default Vercel production API
  return VERCEL_API_BASE_URL;
}

export async function apiFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  const urlStr = input.toString();

  // If in browser and local backend is already known to be offline, route directly to live API
  if (
    typeof window !== 'undefined' &&
    isLocalBackendOffline &&
    (urlStr.includes('localhost:5000') || urlStr.includes('127.0.0.1:5000'))
  ) {
    const liveTarget = window.location.hostname.includes('onrender.com')
      ? RENDER_API_BASE_URL
      : VERCEL_API_BASE_URL;
    const fallbackUrl = urlStr.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000\/api/i, liveTarget);
    return await fetch(fallbackUrl, init);
  }

  try {
    return await fetch(input, init);
  } catch (err: any) {
    // If request to localhost/127.0.0.1 failed (ERR_CONNECTION_REFUSED when local backend isn't running)
    if (urlStr.includes('localhost:5000') || urlStr.includes('127.0.0.1:5000')) {
      isLocalBackendOffline = true;
      const liveTarget = typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')
        ? RENDER_API_BASE_URL
        : VERCEL_API_BASE_URL;
      const fallbackUrl = urlStr.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000\/api/i, liveTarget);
      if (typeof window !== 'undefined') {
        console.warn(`[Kerala Desam] Local backend server at :5000 is offline. Automatically routed request to Live API: ${fallbackUrl}`);
        try {
          return await fetch(fallbackUrl, init);
        } catch (fallbackErr) {
          throw fallbackErr;
        }
      }
    }
    throw err;
  }
}

export function getMalayalamAudioUrl(text: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/tts?text=${encodeURIComponent(text)}`;
}

export function formatUploadDateTime(rawDate?: string | Date): string {
  if (!rawDate) return 'തത്സമയം';
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return 'തത്സമയം';

  const day = d.getDate();
  const months = ['ജനു', 'ഫെബ്രു', 'മാർച്ച്', 'ഏപ്രിൽ', 'മേയ്', 'ജൂൺ', 'ജൂലൈ', 'ഓഗ', 'സെപ്റ്റം', 'ഒക്ടോ', 'നവം', 'ഡിസം'];
  const monthName = months[d.getMonth()] || '';
  const year = d.getFullYear();
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  return `${day} ${monthName} ${year} | ${timeStr}`;
}

export function deduplicateArticles(list: Article[]): Article[] {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const result: Article[] = [];

  for (const item of list) {
    if (!item) continue;
    const idKey = (item.id || item._id || item.customId || '').trim();
    const titleKey = (item.title || '')
      .trim()
      .toLowerCase()
      .replace(/[\s\u200B-\u200D\uFEFF]+/g, ' ')
      .replace(/[.;:!?।"'`’‘“”]+$/, '');

    if (idKey && seenIds.has(idKey)) continue;
    if (titleKey && seenTitles.has(titleKey)) continue;

    if (idKey) seenIds.add(idKey);
    if (titleKey) seenTitles.add(titleKey);
    result.push(item);
  }

  return result;
}

export function normalizeArticle(raw: any): Article {
  const uploadFormatted = formatUploadDateTime(raw.createdAt || raw.publishedAt);
  const realId = raw._id ? String(raw._id) : (raw.customId || 'article');
  return {
    id: realId,
    _id: raw._id ? String(raw._id) : undefined,
    customId: raw.customId || realId,
    title: raw.title || '',
    lead: raw.lead || '',
    category: raw.category || 'പ്രധാനം',
    categoryColor: raw.categoryColor || '#006b9a',
    timeAgo: uploadFormatted,
    publishedAt: raw.publishedAt || uploadFormatted,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toLocaleString('ml-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '',
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : (raw.publishedAt || new Date().toISOString()),
    author: {
      name: (raw.author?.name?.toLowerCase().includes('editor') || raw.author?.name?.toLowerCase().includes('chief')) ? 'എഡിറ്റർ' : (raw.author?.name || 'കേരളദേശം ന്യൂസ് ഡെസ്ക്'),
      designation: raw.author?.designation || 'ഡെസ്ക് റിപ്പോർട്ടർ',
      location: raw.author?.location || 'കേരളം',
      avatar:
        raw.author?.avatar && !raw.author.avatar.includes('534528741775')
          ? raw.author.avatar
          : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80',
      verified: raw.author?.verified ?? true,
    },
    district: raw.district || '',
    country: raw.country || '',
    views: raw.viewsCount ? String(raw.viewsCount) : (raw.views && raw.views !== '1.2k' ? String(raw.views) : '1'),
    viewsCount: Number(raw.viewsCount !== undefined ? raw.viewsCount : (raw.views ? parseInt(raw.views) || 1 : 1)),
    likes: Number(raw.likesCount !== undefined ? raw.likesCount : (raw.likes || 0)),
    likesCount: Number(raw.likesCount !== undefined ? raw.likesCount : (raw.likes || 0)),
    imageUrl: raw.imageUrl || '',
    imageCaption: raw.imageCaption || '',
    readTime: raw.readTime || '3 മിനിറ്റ് വായന',
    audioDuration: raw.audioDuration || '03:00',
    paragraphs: Array.isArray(raw.paragraphs) && raw.paragraphs.length > 0 ? raw.paragraphs : [raw.lead || ''],
    highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    trending: Boolean(raw.trending),
    breaking: Boolean(raw.breaking),
    isHeadline: Boolean(raw.isHeadline),
  };
}

// In-Memory & Session Storage Cache for 0ms Instant Loading (SWR)
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 25000; // 25 seconds freshness

export function getCachedData<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data as T;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(`kd_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          memoryCache.set(key, parsed);
          return parsed.data as T;
        }
      }
    } catch {}
  }
  return null;
}

export function setCachedData(key: string, data: any) {
  const entry = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(`kd_${key}`, JSON.stringify(entry));
    } catch {}
  }
}

export function clearApiCache() {
  memoryCache.clear();
  if (typeof window !== 'undefined') {
    try {
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith('kd_')) sessionStorage.removeItem(k);
      });
    } catch {}
  }
}

export interface ArticleQueryParams {
  category?: string;
  search?: string;
  trending?: boolean;
  district?: string;
  limit?: number;
}

export async function getArticles(params?: ArticleQueryParams): Promise<Article[]> {
  const cacheKey = `articles_${params?.category || 'all'}_${params?.search || ''}_${params?.district || ''}_${params?.limit || 'def'}_${params?.trending || 'f'}`;
  const cached = getCachedData<Article[]>(cacheKey);

  // Async network fetch from Edge CDN / API
  const fetchTask = async () => {
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

      const res = await apiFetch(url.toString(), {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rawArticles = Array.isArray(data.articles) ? data.articles.map(normalizeArticle) : [];
      const deduplicated = deduplicateArticles(rawArticles);
      if (deduplicated.length > 0) {
        setCachedData(cacheKey, deduplicated);
      }
      return deduplicated;
    } catch (error) {
      console.error('Failed to fetch articles from database API:', error);
      return cached || [];
    }
  };

  // If cached data exists, return immediately in 0ms! (Stale-While-Revalidate: re-fetch in background)
  if (cached && cached.length > 0) {
    fetchTask();
    return cached;
  }

  return await fetchTask();
}

export async function getArticleById(id: string): Promise<Article | null> {
  const cacheKey = `article_${id}`;
  const cached = getCachedData<Article>(cacheKey);

  const fetchTask = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await apiFetch(`${baseUrl}/articles/${id}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.article) {
          const normalized = normalizeArticle(data.article);
          setCachedData(cacheKey, normalized);
          return normalized;
        }
      }
      return cached || null;
    } catch (error) {
      console.error(`Failed to fetch article ${id} from database API:`, error);
      return cached || null;
    }
  };

  if (cached) {
    fetchTask();
    return cached;
  }

  return await fetchTask();
}

export async function likeArticle(
  id: string,
  action: 'like' | 'unlike' = 'like'
): Promise<{ success: boolean; likesCount?: number }> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/articles/${id}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Invalidate cached article so fresh like counts reflect
    memoryCache.delete(`article_${id}`);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(`kd_article_${id}`);
      } catch {}
    }
    return data;
  } catch (error) {
    console.error(`Failed to like article ${id}:`, error);
    return { success: false };
  }
}

export async function getBreakingNews(): Promise<string[]> {
  const cacheKey = 'breaking_headlines';
  const cached = getCachedData<string[]>(cacheKey);

  const fetchTask = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await apiFetch(`${baseUrl}/breaking`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const headlines = Array.isArray(data.headlines) ? data.headlines.map((h: any) => h.headline) : [];
        const seen = new Set<string>();
        const uniqueHeadlines: string[] = [];
        for (const h of headlines) {
          const text = String(h || '').trim();
          if (!text || seen.has(text)) continue;
          seen.add(text);
          uniqueHeadlines.push(text);
        }
        if (uniqueHeadlines.length > 0) {
          setCachedData(cacheKey, uniqueHeadlines);
        }
        return uniqueHeadlines;
      }
      return cached || [];
    } catch (error) {
      console.error('Failed to fetch breaking news from database API:', error);
      return cached || [];
    }
  };

  if (cached && cached.length > 0) {
    fetchTask();
    return cached;
  }

  return await fetchTask();
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
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/auth/login`, {
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
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/auth/register`, {
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
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/auth/me`, {
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
  token: string,
  imageFile?: File
): Promise<{ success: boolean; article?: Article; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    let res: Response;

    if (imageFile) {
      const formData = new FormData();
      Object.entries(articleData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(
            key,
            typeof value === 'object' ? JSON.stringify(value) : String(value)
          );
        }
      });
      formData.append('image', imageFile);

      res = await apiFetch(`${baseUrl}/articles`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    } else {
      res = await apiFetch(`${baseUrl}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(articleData),
      });
    }

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Failed to create article',
      };
    }

    clearApiCache();
    return {
      success: true,
      article: normalizeArticle(data.article),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error',
    };
  }
}

export async function adminUpdateArticle(
  id: string,
  articleData: Partial<Article>,
  token: string,
  imageFile?: File
): Promise<{ success: boolean; article?: Article; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    let res: Response;

    if (imageFile) {
      const formData = new FormData();
      Object.entries(articleData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(
            key,
            typeof value === 'object' ? JSON.stringify(value) : String(value)
          );
        }
      });
      formData.append('image', imageFile);

      res = await apiFetch(`${baseUrl}/articles/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    } else {
      res = await apiFetch(`${baseUrl}/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(articleData),
      });
    }

    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to update article' };
    clearApiCache();
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
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/articles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to delete article' };
    clearApiCache();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function adminGetRawBreaking(): Promise<Array<{ _id: string; headline: string; active: boolean; createdAt: string }>> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/breaking?all=true&_t=${Date.now()}`, { cache: 'no-store' });
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
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/breaking`, {
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
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/breaking/${id}`, {
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

export async function adminUpdateBreaking(
  id: string,
  payload: { headline?: string; active?: boolean; category?: string },
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/breaking/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to update headline' };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

// Aliases for compatibility
export const getRealArticles = getArticles;
export const getRealArticleById = getArticleById;
export const getRealBreakingNews = getBreakingNews;


export function normalizeVideo(raw: any): VideoItem {
  return {
    id: raw._id || raw.id || 'vid',
    _id: raw._id || raw.id,
    title: raw.title || '',
    category: raw.category || 'KERALA',
    duration: raw.duration || '01:30',
    views: raw.views || (raw.viewsCount ? `${Math.round(raw.viewsCount / 1000)}K` : '1.2K'),
    viewsCount: raw.viewsCount || 1,
    thumbnail:
      raw.thumbnail ||
      (raw.youtubeId ? `https://img.youtube.com/vi/${raw.youtubeId}/hqdefault.jpg` : '') ||
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
    videoUrl: raw.videoUrl || '',
    youtubeId: raw.youtubeId || '',
    description: raw.description || '',
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export async function getVideos(params?: { category?: string; limit?: number; page?: number }): Promise<VideoItem[]> {
  const cacheKey = `videos_${params?.category || 'all'}_${params?.limit || 20}`;
  const cached = getCachedData<VideoItem[]>(cacheKey);

  const fetchTask = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const url = new URL(`${baseUrl}/videos`);
      if (params?.category && params.category !== 'all' && params.category !== 'എല്ലാം') {
        url.searchParams.set('category', params.category);
      }
      if (params?.limit) {
        url.searchParams.set('limit', params.limit.toString());
      }
      if (params?.page) {
        url.searchParams.set('page', params.page.toString());
      }

      const res = await apiFetch(url.toString(), {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data.videos) ? data.videos.map(normalizeVideo) : [];
      if (list.length > 0) {
        setCachedData(cacheKey, list);
      }
      return list;
    } catch (error) {
      console.error('Failed to fetch videos from API:', error);
      return cached || [];
    }
  };

  if (cached && cached.length > 0) {
    fetchTask();
    return cached;
  }

  return await fetchTask();
}

export async function getVideoById(id: string): Promise<VideoItem | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/videos/${id}?_t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.video) return normalizeVideo(data.video);
    }
    return null;
  } catch {
    return null;
  }
}

export async function adminCreateVideo(
  videoData: {
    title: string;
    category?: string;
    duration?: string;
    views?: string;
    videoUrl: string;
    thumbnail?: string;
    description?: string;
  },
  token: string,
  thumbnailFile?: File
): Promise<{ success: boolean; video?: VideoItem; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    let res: Response;

    if (thumbnailFile) {
      const formData = new FormData();
      Object.entries(videoData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          formData.append(k, String(v));
        }
      });
      formData.append('thumbnail', thumbnailFile);

      res = await apiFetch(`${baseUrl}/videos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    } else {
      res = await apiFetch(`${baseUrl}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(videoData),
      });
    }

    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to create video' };
    return { success: true, video: data.video ? normalizeVideo(data.video) : undefined };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function adminDeleteVideo(
  id: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/videos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to delete video' };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export const getRealVideos = getVideos;

export async function adminToggleHeadline(
  id: string,
  token: string
): Promise<{ success: boolean; isHeadline?: boolean; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/articles/${id}/headline`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to toggle headline' };
    return { success: true, isHeadline: data.isHeadline };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export interface SubscriberItem {
  _id: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export async function subscribeNewsletter(
  email: string
): Promise<{ success: boolean; message: string; alreadySubscribed?: boolean; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.error || 'സബ്‌സ്ക്രിപ്ഷൻ പരാജയപ്പെട്ടു.', error: data.error };
    }
    return {
      success: true,
      message: data.message || 'നന്ദി! നിങ്ങളുടെ ഇമെയിൽ വിജയകരമായി രജിസ്റ്റർ ചെയ്തു.',
      alreadySubscribed: data.alreadySubscribed,
    };
  } catch (err: any) {
    return { success: false, message: 'നെറ്റ്‌വർക്ക് തകരാർ കാരണം രജിസ്റ്റർ ചെയ്യാനായില്ല.', error: err.message };
  }
}

export async function adminGetSubscribers(
  token?: string
): Promise<{ success: boolean; subscribers: SubscriberItem[]; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await apiFetch(`${baseUrl}/subscribers?_t=${Date.now()}`, {
      headers,
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, subscribers: [], error: data.error || 'Failed to fetch subscribers' };
    return { success: true, subscribers: Array.isArray(data.subscribers) ? data.subscribers : [] };
  } catch (err: any) {
    return { success: false, subscribers: [], error: err.message };
  }
}

export async function adminDeleteSubscriber(
  id: string,
  token?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await apiFetch(`${baseUrl}/subscribers/${id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to delete subscriber' };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export interface AdInquiryItem {
  _id: string;
  id?: string;
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  adType: string;
  budget?: string;
  message?: string;
  status: 'New' | 'Contacted' | 'Confirmed' | 'Closed';
  createdAt: string;
}

export async function submitAdInquiry(data: {
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  adType: string;
  budget?: string;
  message?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/ads/inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      return { success: false, error: resData.error || 'പരസ്യ അപേക്ഷ അയക്കാൻ കഴിഞ്ഞില്ല' };
    }
    return { success: true, message: resData.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'നെറ്റ്‌വർക്ക് പിശക്. വീണ്ടും ശ്രമിക്കുക.' };
  }
}

export async function adminGetAdInquiries(
  token?: string
): Promise<{ success: boolean; inquiries: AdInquiryItem[]; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await apiFetch(`${baseUrl}/ads/inquiries?_t=${Date.now()}`, {
      headers,
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, inquiries: [], error: data.error || 'Failed to fetch ad inquiries' };
    }
    return { success: true, inquiries: Array.isArray(data.inquiries) ? data.inquiries : [] };
  } catch (err: any) {
    return { success: false, inquiries: [], error: err.message };
  }
}

export async function adminUpdateAdInquiryStatus(
  id: string,
  status: string,
  token?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const activeToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('keraladesam_admin_jwt') || localStorage.getItem('token')
        : undefined);
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;
    const res = await apiFetch(`${baseUrl}/ads/inquiries/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data.error || 'Failed to update status' };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminDeleteAdInquiry(
  id: string,
  token?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {};
    const activeToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('keraladesam_admin_jwt') || localStorage.getItem('token')
        : undefined);
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;
    const res = await apiFetch(`${baseUrl}/ads/inquiries/${id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data.error || 'Failed to delete inquiry' };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------- PHOTO STORY API -----------------
export interface PhotoStoryImage {
  url: string;
  caption?: string;
}

export interface PhotoStoryItem {
  id?: number | string;
  tagLabel: string;
  subtitle: string;
  title: string;
  description: string;
  images: PhotoStoryImage[];
  updatedAt?: string;
  isCustom?: boolean;
}

export const DEFAULT_PHOTO_STORY: PhotoStoryItem = {
  tagLabel: 'PHOTO STORY',
  subtitle: 'KERALA IN FRAMES',
  title: 'കുട്ടനാടൻ കായൽ ജീവിതം: വേനൽമഴയുടെ വരവറിയിച്ച് ഓളങ്ങൾ',
  description: "Visual captures of life, landscapes, and backwaters across God's Own Country.",
  images: [
    {
      url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80',
      caption: 'കുട്ടനാട് 1',
    },
    {
      url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
      caption: 'കുട്ടനാട് 2',
    },
    {
      url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80',
      caption: 'കുട്ടനാട് 3',
    },
  ],
};

export async function getRealPhotoStory(): Promise<PhotoStoryItem | null> {
  const cacheKey = 'photo_story_active';
  const cached = getCachedData<PhotoStoryItem>(cacheKey);

  let localCustomStory: PhotoStoryItem | null = null;
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('kd_photo_story');
      if (local) {
        localCustomStory = JSON.parse(local);
      }
    } catch {}
  }

  try {
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/photo-story?_t=${Date.now()}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.photoStory) {
        setCachedData(cacheKey, data.photoStory);
        if (typeof window !== 'undefined') {
          localStorage.setItem('kd_photo_story', JSON.stringify(data.photoStory));
        }
        return data.photoStory;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch photo story from API, checking local fallback:', err);
  }

  if (localCustomStory) return localCustomStory;
  if (cached) return cached;
  return null;
}

export async function adminUpdatePhotoStory(
  storyData: PhotoStoryItem,
  token?: string
): Promise<{ success: boolean; photoStory?: PhotoStoryItem; error?: string }> {
  const customStory: PhotoStoryItem = {
    ...storyData,
    isCustom: true,
    updatedAt: new Date().toISOString(),
  };

  // Always update memory cache & localStorage immediately
  if (typeof window !== 'undefined') {
    setCachedData('photo_story_active', customStory);
    try {
      localStorage.setItem('kd_photo_story', JSON.stringify(customStory));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
    window.dispatchEvent(new Event('kd_photo_story_updated'));
  }

  try {
    const baseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const activeToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('keraladesam_admin_jwt') || localStorage.getItem('token')
        : undefined);
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

    const res = await apiFetch(`${baseUrl}/photo-story`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(customStory),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.photoStory) {
      const merged = { ...data.photoStory, isCustom: true };
      setCachedData('photo_story_active', merged);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kd_photo_story', JSON.stringify(merged));
        window.dispatchEvent(new Event('kd_photo_story_updated'));
      }
      return { success: true, photoStory: merged };
    }

    return { success: true, photoStory: customStory };
  } catch (err: any) {
    return { success: true, photoStory: customStory };
  }
}

export async function adminDeletePhotoStory(
  token?: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('kd_photo_story');
    setCachedData('photo_story_active', null);
    window.dispatchEvent(new Event('kd_photo_story_updated'));
  }
  try {
    const baseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {};
    const activeToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('keraladesam_admin_jwt') || localStorage.getItem('token')
        : undefined);
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

    const res = await apiFetch(`${baseUrl}/photo-story`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data.error || 'Failed to delete photo story' };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function adminUploadMedia(
  file: File,
  token?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    const activeToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('keraladesam_admin_jwt') || localStorage.getItem('token')
        : undefined);
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

    const res = await apiFetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.data?.url) {
      return { success: false, error: data.error || 'Upload failed' };
    }
    return { success: true, url: data.data.url };
  } catch (err: any) {
    return { success: false, error: err.message || 'Upload network error' };
  }
}




