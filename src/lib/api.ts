import { Article, VideoItem } from '@/data/newsData';

export const VERCEL_API_BASE_URL = 'https://kerala-dhesam-admin.vercel.app/api';
export const RENDER_API_BASE_URL = 'https://kerala-dhesam-admin.onrender.com/api';
export const LIVE_API_BASE_URL = RENDER_API_BASE_URL;
let isLocalBackendOffline = false;

export function getApiBaseUrl(): string {
  // During server-side build / prerender (Node.js)
  if (typeof window === 'undefined') {
    if (process.env.API_URL) return process.env.API_URL.replace(/\/$/, '');
    if (process.env.RENDER) return RENDER_API_BASE_URL;
    if (process.env.NODE_ENV === 'production') return RENDER_API_BASE_URL;
    return RENDER_API_BASE_URL;
  }

  // Priority 1: When browsing on Render (kerala-dhesam.onrender.com), point to Render backend
  if (window.location.hostname.includes('onrender.com')) {
    return RENDER_API_BASE_URL;
  }

  // Priority 2: When browsing on HTTPS anywhere in production, never use insecure http://localhost
  if (window.location.protocol === 'https:') {
    if (
      process.env.NEXT_PUBLIC_API_URL &&
      !process.env.NEXT_PUBLIC_API_URL.includes('localhost') &&
      !process.env.NEXT_PUBLIC_API_URL.includes('127.0.0.1')
    ) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    }
    return RENDER_API_BASE_URL;
  }

  // Priority 3: Localhost development (http://localhost:3000)
  if (
    !isLocalBackendOffline &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.'))
  ) {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    }
    return 'http://localhost:5001/api';
  }

  // Priority 4: Default live production API (Render)
  return RENDER_API_BASE_URL;
}

export async function apiFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  const urlStr = input.toString();

  // Create an abort controller with safety timeout (generous in browser to allow Render cold start wakeup)
  const controller = new AbortController();
  const timeoutMs = typeof window === 'undefined' ? 4500 : 30000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const mergedInit: RequestInit = {
    ...init,
    signal: init?.signal || controller.signal,
  };

  // If in browser and local backend is already known to be offline, route directly to live API
  if (
    typeof window !== 'undefined' &&
    isLocalBackendOffline &&
    (urlStr.includes('localhost:') || urlStr.includes('127.0.0.1:'))
  ) {
    const fallbackUrl = urlStr.replace(/https?:\/\/(localhost|127\.0\.0\.1):(5000|5001)\/api/i, RENDER_API_BASE_URL);
    try {
      const res = await fetch(fallbackUrl, mergedInit);
      clearTimeout(timeoutId);
      return res;
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  }

  try {
    const res = await fetch(input, mergedInit);
    clearTimeout(timeoutId);
    return res;
  } catch (err: any) {
    clearTimeout(timeoutId);
    // If request to localhost failed (ERR_CONNECTION_REFUSED when local backend isn't running)
    if (urlStr.includes('localhost:') || urlStr.includes('127.0.0.1:')) {
      isLocalBackendOffline = true;
      const fallbackUrl = urlStr.replace(/https?:\/\/(localhost|127\.0\.0\.1):(5000|5001)\/api/i, RENDER_API_BASE_URL);
      if (typeof window !== 'undefined') {
        console.warn(`[Kerala Desam] Local backend server is offline. Automatically routed request to Live API: ${fallbackUrl}`);
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

export function resolveMediaUrl(url?: string): string {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/')) {
    const base = getApiBaseUrl().replace(/\/api\/?$/, '');
    return `${base}${trimmed}`;
  }
  if (trimmed.startsWith('uploads/')) {
    const base = getApiBaseUrl().replace(/\/api\/?$/, '');
    return `${base}/${trimmed}`;
  }
  return trimmed;
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
    imageUrl: resolveMediaUrl(raw.imageUrl || raw.image_url),
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

// In-Memory & LocalStorage SWR Cache for 0ms Instant Loading
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 30000; // 30 seconds freshness

export function getCachedData<T>(key: string, allowStale = true): T | null {
  const entry = memoryCache.get(key);
  if (entry) {
    if (!allowStale && Date.now() - entry.timestamp > CACHE_TTL_MS) {
      return null;
    }
    return entry.data as T;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(`kd_${key}`) || localStorage.getItem(`kd_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.data !== undefined) {
          memoryCache.set(key, parsed);
          if (!allowStale && Date.now() - parsed.timestamp > CACHE_TTL_MS) {
            return null;
          }
          return parsed.data as T;
        } else if (parsed && !parsed.timestamp) {
          // Direct stored object/array
          return parsed as T;
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
      const serialized = JSON.stringify(entry);
      sessionStorage.setItem(`kd_${key}`, serialized);
      localStorage.setItem(`kd_${key}`, serialized);
    } catch {}
  }
}

export function getDeletedArticleIds(): Set<string> {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    const raw = localStorage.getItem('kd_deleted_article_ids');
    if (!raw) return new Set<string>();
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return new Set<string>();
    const cleaned = list
      .map((x) => String(x || '').trim())
      .filter((x) => x && x !== 'undefined' && x !== 'null' && x !== 'NaN');
    if (cleaned.length !== list.length) {
      localStorage.setItem('kd_deleted_article_ids', JSON.stringify(cleaned));
    }
    return new Set<string>(cleaned);
  } catch {
    return new Set<string>();
  }
}

export function recordDeletedArticleId(id: string) {
  if (typeof window === 'undefined' || !id) return;
  const cleanId = String(id).trim();
  if (!cleanId || cleanId === 'undefined' || cleanId === 'null') return;
  try {
    const set = getDeletedArticleIds();
    if (!set.has(cleanId)) {
      set.add(cleanId);
      localStorage.setItem('kd_deleted_article_ids', JSON.stringify(Array.from(set)));
    }
  } catch {}
}

export function getDeletedBreakingIds(): Set<string> {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    const raw = localStorage.getItem('kd_deleted_breaking_ids');
    if (!raw) return new Set<string>();
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return new Set<string>();
    const cleaned = list
      .map((x) => String(x || '').trim())
      .filter((x) => x && x !== 'undefined' && x !== 'null' && x !== 'NaN');
    if (cleaned.length !== list.length) {
      localStorage.setItem('kd_deleted_breaking_ids', JSON.stringify(cleaned));
    }
    return new Set<string>(cleaned);
  } catch {
    return new Set<string>();
  }
}

export function recordDeletedBreakingId(id: string) {
  if (typeof window === 'undefined' || !id) return;
  const cleanId = String(id).trim();
  if (!cleanId || cleanId === 'undefined' || cleanId === 'null') return;
  try {
    const set = getDeletedBreakingIds();
    if (!set.has(cleanId)) {
      set.add(cleanId);
      localStorage.setItem('kd_deleted_breaking_ids', JSON.stringify(Array.from(set)));
    }
  } catch {}
}

export function getDeletedVideoIds(): Set<string> {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    const raw = localStorage.getItem('kd_deleted_video_ids');
    if (!raw) return new Set<string>();
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return new Set<string>();
    const cleaned = list
      .map((x) => String(x || '').trim())
      .filter((x) => x && x !== 'undefined' && x !== 'null' && x !== 'NaN');
    if (cleaned.length !== list.length) {
      localStorage.setItem('kd_deleted_video_ids', JSON.stringify(cleaned));
    }
    return new Set<string>(cleaned);
  } catch {
    return new Set<string>();
  }
}

export function recordDeletedVideoId(id: string) {
  if (typeof window === 'undefined' || !id) return;
  const cleanId = String(id).trim();
  if (!cleanId || cleanId === 'undefined' || cleanId === 'null') return;
  try {
    const set = getDeletedVideoIds();
    if (!set.has(cleanId)) {
      set.add(cleanId);
      localStorage.setItem('kd_deleted_video_ids', JSON.stringify(Array.from(set)));
    }
  } catch {}
}

export function isItemDeleted(
  item: { id?: any; _id?: any; customId?: any; youtubeId?: any; headline?: any },
  deletedSet?: Set<string>
): boolean {
  if (!deletedSet || deletedSet.size === 0 || !item) return false;
  if (item.id !== undefined && item.id !== null && item.id !== '') {
    const s = String(item.id).trim();
    if (s && s !== 'undefined' && s !== 'null' && deletedSet.has(s)) return true;
  }
  if (item._id !== undefined && item._id !== null && item._id !== '') {
    const s = String(item._id).trim();
    if (s && s !== 'undefined' && s !== 'null' && deletedSet.has(s)) return true;
  }
  if (item.customId !== undefined && item.customId !== null && item.customId !== '') {
    const s = String(item.customId).trim();
    if (s && s !== 'undefined' && s !== 'null' && deletedSet.has(s)) return true;
  }
  if (item.youtubeId !== undefined && item.youtubeId !== null && item.youtubeId !== '') {
    const s = String(item.youtubeId).trim();
    if (s && s !== 'undefined' && s !== 'null' && deletedSet.has(s)) return true;
  }
  if (item.headline !== undefined && item.headline !== null && item.headline !== '') {
    const s = String(item.headline).trim();
    if (s && s !== 'undefined' && s !== 'null' && deletedSet.has(s)) return true;
  }
  return false;
}

export function clearApiCache() {
  memoryCache.clear();
  if (typeof window !== 'undefined') {
    try {
      // Clear session network cache
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith('kd_') && !k.includes('deleted')) sessionStorage.removeItem(k);
      });
      // Clear persistent content cache without destroying user persistent settings or auth tokens in localStorage
      const preservedKeys = new Set([
        'keraladesam_admin_jwt',
        'token',
        'user',
        'kd_font_size',
        'kd_saved_bookmarks',
        'kd_bookmarks',
        'kd_photo_story',
        'kd_admin_articles',
        'kd_admin_breaking',
        'kd_admin_videos',
        'kd_admin_subscribers',
        'kd_admin_ads',
        'kd_home_articles',
        'kd_home_videos',
        'kd_deleted_article_ids',
        'kd_deleted_breaking_ids',
        'kd_deleted_video_ids',
      ]);
      Object.keys(localStorage).forEach((k) => {
        if (preservedKeys.has(k) || k.startsWith('kd_followed_')) return;
        if (
          k.startsWith('kd_') ||
          k.startsWith('articles_') ||
          k.startsWith('breaking_') ||
          k.startsWith('videos_')
        ) {
          localStorage.removeItem(k);
        }
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
  bypassCache?: boolean;
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
      url.searchParams.set('_t', Date.now().toString());

      const res = await apiFetch(url.toString(), {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rawArticles = Array.isArray(data.articles) ? data.articles.map(normalizeArticle) : [];
      const deletedIds = getDeletedArticleIds();
      const filtered = rawArticles.filter((a: Article) => !isItemDeleted(a, deletedIds));
      const deduplicated = deduplicateArticles(filtered);
      setCachedData(cacheKey, deduplicated);
      return deduplicated;
    } catch (error) {
      console.error('Failed to fetch articles from database API:', error);
      const deletedIds = getDeletedArticleIds();
      let fallback = (cached || []).filter((a: Article) => !isItemDeleted(a, deletedIds));
      if (fallback.length === 0 && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('kd_home_articles');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              fallback = parsed.filter((a: Article) => !isItemDeleted(a, deletedIds));
            }
          }
        } catch {}
      }
      return fallback;
    }
  };

  // If bypassCache is requested, skip stale cached data and fetch live!
  const deletedIds = getDeletedArticleIds();
  if (!params?.bypassCache && cached && cached.length > 0) {
    fetchTask();
    return cached.filter((a: Article) => !isItemDeleted(a, deletedIds));
  }

  return await fetchTask();
}

export async function getArticleById(id: string): Promise<Article | null> {
  const cleanId = String(id).trim();
  const deletedIds = getDeletedArticleIds();
  if (deletedIds.has(cleanId)) return null;

  const cacheKey = `article_${cleanId}`;
  const cached = getCachedData<Article>(cacheKey);

  const fetchTask = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await apiFetch(`${baseUrl}/articles/${cleanId}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.article) {
          const normalized = normalizeArticle(data.article);
          if (isItemDeleted(normalized, deletedIds)) {
            return null;
          }
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

export const DEFAULT_BREAKING_HEADLINES: string[] = [
  'വയനാട് പുനരധിവാസം: സമഗ്ര പാക്കേജ് ഉടൻ പ്രഖ്യാപിക്കുമെന്ന് കേന്ദ്രം; കേരളത്തിന് പ്രത്യേക പരിഗണന',
  'സംസ്ഥാനത്ത് ഇന്ധന സെസ് കുറച്ചേക്കും: ബജറ്റിന് മുന്നോടിയായി ധനവകുപ്പിന്റെ നിർണായക നീക്കം',
  'യൂണിവേഴ്സിറ്റി യൂണിയൻ തെരഞ്ഞെടുപ്പിൽ വിദ്യാർത്ഥി സംഘടനകൾക്ക് വൻ മുന്നേറ്റം',
  'പെരിയാറിലെ ജലനിരപ്പ് നിയന്ത്രണവിധേയം; മുൻകരുതൽ നടപടികൾ ഊർജ്ജിതമാക്കി ദുരന്തനിവാരണ അതോറിറ്റി',
  'ഐഎസ്ആർഒയുടെ അടുത്ത ചാന്ദ്ര ദൗത്യം 70% ചെലവ് കുറഞ്ഞത്: ശാസ്ത്രജ്ഞർക്ക് അഭിനന്ദനം',
];

export async function getBreakingNews(bypassCache?: boolean): Promise<string[]> {
  const cacheKey = 'breaking_headlines';
  const cached = getCachedData<string[]>(cacheKey);
  const deletedIds = getDeletedBreakingIds();

  const fetchTask = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await apiFetch(`${baseUrl}/breaking?_t=${Date.now()}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data.headlines)
          ? data.headlines
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

        const seen = new Set<string>();
        const uniqueHeadlines: string[] = [];
        for (const item of rawList) {
          const text = String((typeof item === 'string' ? item : (item?.headline || item?.title || '')) || '').trim();
          const id = String(typeof item === 'object' && item ? (item.id || item._id || '') : '');
          if (!text || seen.has(text) || deletedIds.has(text) || (id && deletedIds.has(id))) continue;
          seen.add(text);
          uniqueHeadlines.push(text);
        }

        setCachedData(cacheKey, uniqueHeadlines);
        return uniqueHeadlines;
      }
      return (cached || []).filter((h) => !deletedIds.has(h));
    } catch (error) {
      console.error('Failed to fetch breaking news from database API:', error);
      let fallback = (cached || []).filter((h) => !deletedIds.has(h));
      if (fallback.length === 0 && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('kd_breaking_news');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              fallback = parsed.filter((h: string) => !deletedIds.has(h));
            }
          }
        } catch {}
      }
      if (fallback.length === 0) {
        fallback = DEFAULT_BREAKING_HEADLINES.filter((h) => !deletedIds.has(h));
      }
      return fallback;
    }
  };

  if (!bypassCache && cached) {
    fetchTask();
    return cached.filter((h) => !deletedIds.has(h));
  }

  const result = await fetchTask();
  return (result || []).filter((h) => !deletedIds.has(h));
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
          if (key === 'imageUrl' && imageFile) return;
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
          if (key === 'imageUrl' && imageFile) return;
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
    const cleanId = String(id).trim();
    recordDeletedArticleId(cleanId);

    // Synchronously purge from localStorage immediately
    if (typeof window !== 'undefined') {
      try {
        const adminArt = localStorage.getItem('kd_admin_articles');
        if (adminArt) {
          const parsed = JSON.parse(adminArt);
          if (Array.isArray(parsed)) {
            const remaining = parsed.filter(
              (a: Article) => String(a.id) !== cleanId && String(a._id) !== cleanId && String(a.customId) !== cleanId
            );
            localStorage.setItem('kd_admin_articles', JSON.stringify(remaining));
          }
        }
        const homeArt = localStorage.getItem('kd_home_articles');
        if (homeArt) {
          const parsed = JSON.parse(homeArt);
          if (Array.isArray(parsed)) {
            const remaining = parsed.filter(
              (a: Article) => String(a.id) !== cleanId && String(a._id) !== cleanId && String(a.customId) !== cleanId
            );
            localStorage.setItem('kd_home_articles', JSON.stringify(remaining));
          }
        }
        sessionStorage.removeItem(`kd_article_${cleanId}`);
      } catch {}
    }

    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/articles/${cleanId}`, {
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

export async function adminGetArticles(): Promise<Article[]> {
  const deletedIds = getDeletedArticleIds();
  try {
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/articles?limit=100&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const list = (Array.isArray(data.articles) ? data.articles.map(normalizeArticle) : []).filter(
        (a: Article) => !isItemDeleted(a, deletedIds)
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('kd_admin_articles', JSON.stringify(list)); } catch {}
      }
      return list;
    }
  } catch (err) {
    console.warn('adminGetArticles network warning, checking cached fallback:', err);
  }
  // Resilient fallback to cached admin articles
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('kd_admin_articles');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter((a: Article) => !isItemDeleted(a, deletedIds));
        }
      }
    } catch {}
  }
  return [];
}

export async function adminGetRawBreaking(): Promise<Array<{ _id: string; headline: string; active: boolean; createdAt: string }>> {
  const deletedIds = getDeletedBreakingIds();
  try {
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/breaking?all=true&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data.headlines) ? data.headlines : Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      const filtered = rawList.filter((b: any) => !isItemDeleted(b, deletedIds));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('kd_admin_breaking', JSON.stringify(filtered)); } catch {}
      }
      return filtered;
    }
  } catch (err) {
    console.warn('adminGetRawBreaking network warning, checking cached fallback:', err);
  }
  // Resilient fallback to cached breaking items
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('kd_admin_breaking');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter((b: any) => !isItemDeleted(b, deletedIds));
        }
      }
    } catch {}
  }
  return [];
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
    const cleanId = String(id).trim();
    recordDeletedBreakingId(cleanId);

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('kd_admin_breaking');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const remaining = parsed.filter(
              (b: any) => String(b.id) !== cleanId && String(b._id) !== cleanId && b.headline !== cleanId
            );
            localStorage.setItem('kd_admin_breaking', JSON.stringify(remaining));
            localStorage.setItem('kd_breaking_news', JSON.stringify(remaining.map((b: any) => b.headline)));
          }
        }
      } catch {}
    }

    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/breaking/${cleanId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to delete headline' };
    clearApiCache();
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
      resolveMediaUrl(raw.thumbnail) ||
      (raw.youtubeId ? `https://img.youtube.com/vi/${raw.youtubeId}/hqdefault.jpg` : '') ||
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
    videoUrl: raw.videoUrl || '',
    youtubeId: raw.youtubeId || '',
    description: raw.description || '',
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export async function getVideos(params?: { category?: string; limit?: number; page?: number; bypassCache?: boolean }): Promise<VideoItem[]> {
  const cacheKey = `videos_${params?.category || 'all'}_${params?.limit || 20}`;
  const cached = getCachedData<VideoItem[]>(cacheKey);
  const deletedIds = getDeletedVideoIds();

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
      url.searchParams.set('_t', Date.now().toString());

      const res = await apiFetch(url.toString(), {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = (Array.isArray(data.videos) ? data.videos.map(normalizeVideo) : []).filter(
        (v: VideoItem) => !isItemDeleted(v, deletedIds)
      );
      setCachedData(cacheKey, list);
      return list;
    } catch (error) {
      console.error('Failed to fetch videos from API:', error);
      let fallback = (cached || []).filter((v: VideoItem) => !isItemDeleted(v, deletedIds));
      if (fallback.length === 0 && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('kd_home_videos');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              fallback = parsed.filter((v: VideoItem) => !isItemDeleted(v, deletedIds));
            }
          }
        } catch {}
      }
      return fallback;
    }
  };

  if (!params?.bypassCache && cached && cached.length > 0) {
    fetchTask();
    return cached.filter((v) => !isItemDeleted(v, deletedIds));
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
    const cleanId = String(id).trim();
    recordDeletedVideoId(cleanId);

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('kd_admin_videos');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const remaining = parsed.filter(
              (v: any) => String(v.id) !== cleanId && String(v._id) !== cleanId
            );
            localStorage.setItem('kd_admin_videos', JSON.stringify(remaining));
          }
        }
        const homeVideos = localStorage.getItem('kd_home_videos');
        if (homeVideos) {
          const parsed = JSON.parse(homeVideos);
          if (Array.isArray(parsed)) {
            const remaining = parsed.filter(
              (v: any) => String(v.id) !== cleanId && String(v._id) !== cleanId
            );
            localStorage.setItem('kd_home_videos', JSON.stringify(remaining));
          }
        }
      } catch {}
    }

    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/videos/${cleanId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to delete video' };
    clearApiCache();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function adminGetVideos(): Promise<VideoItem[]> {
  const deletedIds = getDeletedVideoIds();
  try {
    const baseUrl = getApiBaseUrl();
    const res = await apiFetch(`${baseUrl}/videos?limit=100&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const list = (Array.isArray(data.videos) ? data.videos.map(normalizeVideo) : []).filter(
        (v: VideoItem) => !isItemDeleted(v, deletedIds)
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('kd_admin_videos', JSON.stringify(list)); } catch {}
      }
      return list;
    }
  } catch (err) {
    console.warn('adminGetVideos network warning, checking cached fallback:', err);
  }
  // Resilient fallback to cached videos
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('kd_admin_videos');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter((v: any) => !isItemDeleted(v, deletedIds));
        }
      }
    } catch {}
  }
  return [];
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
  const cacheKey = 'admin_subscribers_all';
  const cached = getCachedData<SubscriberItem[]>(cacheKey);

  const fetchTask = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await apiFetch(`${baseUrl}/subscribers?_t=${Date.now()}`, {
        headers,
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) return { success: false, subscribers: cached || [], error: data.error || 'Failed to fetch subscribers' };
      const subscribers = Array.isArray(data.subscribers) ? data.subscribers : [];
      setCachedData(cacheKey, subscribers);
      return { success: true, subscribers };
    } catch (err: any) {
      return { success: false, subscribers: cached || [], error: err.message };
    }
  };

  if (cached && cached.length > 0) {
    fetchTask();
    return { success: true, subscribers: cached };
  }
  return await fetchTask();
}

export async function adminDeleteSubscriber(
  id: string,
  token?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanId = String(id).trim();
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('kd_admin_subscribers');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const remaining = parsed.filter((s: any) => String(s.id) !== cleanId && String(s._id) !== cleanId);
            localStorage.setItem('kd_admin_subscribers', JSON.stringify(remaining));
          }
        }
      } catch {}
    }

    const baseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await apiFetch(`${baseUrl}/subscribers/${cleanId}`, {
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
  const cacheKey = 'admin_ads_all';
  const cached = getCachedData<AdInquiryItem[]>(cacheKey);

  const fetchTask = async () => {
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
        return { success: false, inquiries: cached || [], error: data.error || 'Failed to fetch ad inquiries' };
      }
      const inquiries = Array.isArray(data.inquiries) ? data.inquiries : [];
      setCachedData(cacheKey, inquiries);
      return { success: true, inquiries };
    } catch (err: any) {
      return { success: false, inquiries: cached || [], error: err.message };
    }
  };

  if (cached && cached.length > 0) {
    fetchTask();
    return { success: true, inquiries: cached };
  }
  return await fetchTask();
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
    const cleanId = String(id).trim();
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('kd_admin_ads');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const remaining = parsed.filter((a: any) => String(a.id) !== cleanId && String(a._id) !== cleanId);
            localStorage.setItem('kd_admin_ads', JSON.stringify(remaining));
          }
        }
      } catch {}
    }

    const baseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {};
    const activeToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('keraladesam_admin_jwt') || localStorage.getItem('token')
        : undefined);
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;
    const res = await apiFetch(`${baseUrl}/ads/inquiries/${cleanId}`, {
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
      url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      caption: 'കുട്ടനാട് 1',
    },
    {
      url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
      caption: 'കുട്ടനാട് 3',
    },
    {
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      caption: 'ചിത്രം 3 അടിക്കുറിപ്പ്',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      caption: 'ചിത്രം 4 അടിക്കുറിപ്പ്',
    },
    {
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_xN8096Q8wWzE4E6tQ3b4i_Gz_r_S3tQ9gw&s',
      caption: 'ചിത്രം 5 അടിക്കുറിപ്പ്',
    },
  ],
};

export async function getRealPhotoStory(bypassCache?: boolean): Promise<PhotoStoryItem | null> {
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

  const existingStory =
    (localCustomStory && Array.isArray(localCustomStory.images) && localCustomStory.images.length > 0)
      ? localCustomStory
      : (cached && Array.isArray(cached.images) && cached.images.length > 0)
      ? cached
      : null;

  const fetchTask = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await apiFetch(`${baseUrl}/photo-story?_t=${Date.now()}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.photoStory && Array.isArray(data.photoStory.images) && data.photoStory.images.length > 0) {
          const normalizedStory: PhotoStoryItem = {
            ...data.photoStory,
            images: data.photoStory.images.map((img: any) => ({
              url: resolveMediaUrl(img.url),
              caption: img.caption || '',
            })),
          };
          setCachedData(cacheKey, normalizedStory);
          if (typeof window !== 'undefined') {
            localStorage.setItem('kd_photo_story', JSON.stringify(normalizedStory));
          }
          return normalizedStory;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch photo story from API, checking local fallback:', err);
    }
    return existingStory || DEFAULT_PHOTO_STORY;
  };

  if (!bypassCache && existingStory) {
    fetchTask();
    return existingStory;
  }

  return await fetchTask();
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




