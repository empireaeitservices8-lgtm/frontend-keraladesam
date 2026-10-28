import { Article, VideoItem } from '@/data/newsData';

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.'))
  ) {
    return 'http://localhost:5000/api';
  }
  return 'https://kerala-dhesam-admin.vercel.app/api';
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
      name: raw.author?.name === 'Chief Editor' ? 'ചീഫ് എഡിറ്റർ' : (raw.author?.name || 'കേരളദേശം ന്യൂസ് ഡെസ്ക്'),
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
    const rawArticles = Array.isArray(data.articles) ? data.articles.map(normalizeArticle) : [];
    return deduplicateArticles(rawArticles);
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
      const seen = new Set<string>();
      const uniqueHeadlines: string[] = [];
      for (const h of headlines) {
        const text = String(h || '').trim();
        if (!text || seen.has(text)) continue;
        seen.add(text);
        uniqueHeadlines.push(text);
      }
      return uniqueHeadlines;
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
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/auth/login`, {
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
    const res = await fetch(`${baseUrl}/auth/register`, {
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
    const res = await fetch(`${baseUrl}/auth/me`, {
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

      res = await fetch(`${baseUrl}/articles`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    } else {
      res = await fetch(`${baseUrl}/articles`, {
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

      res = await fetch(`${baseUrl}/articles/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    } else {
      res = await fetch(`${baseUrl}/articles/${id}`, {
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
    const res = await fetch(`${baseUrl}/articles/${id}`, {
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
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/breaking?_t=${Date.now()}`, { cache: 'no-store' });
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
    const res = await fetch(`${baseUrl}/breaking`, {
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
    const res = await fetch(`${baseUrl}/breaking/${id}`, {
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
    const res = await fetch(`${baseUrl}/breaking/${id}`, {
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

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.videos) ? data.videos.map(normalizeVideo) : [];
  } catch (error) {
    console.error('Failed to fetch videos from API:', error);
    return [];
  }
}

export async function getVideoById(id: string): Promise<VideoItem | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/videos/${id}?_t=${Date.now()}`, { cache: 'no-store' });
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

      res = await fetch(`${baseUrl}/videos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    } else {
      res = await fetch(`${baseUrl}/videos`, {
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
    const res = await fetch(`${baseUrl}/videos/${id}`, {
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
    const res = await fetch(`${baseUrl}/articles/${id}/headline`, {
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


