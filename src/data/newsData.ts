export interface Article {
  id: string;
  customId?: string;
  title: string;
  lead: string;
  category: string;
  categoryColor: string;
  timeAgo: string;
  publishedAt: string;
  updatedAt: string;
  createdAt?: string;
  author: {
    name: string;
    designation: string;
    location: string;
    avatar: string;
    verified: boolean;
  };
  district?: string;
  country?: string;
  views: string;
  imageUrl: string;
  imageCaption?: string;
  readTime: string;
  paragraphs: string[];
  highlights?: string[];
  relatedArticles?: string[];
  audioDuration?: string;
  tags?: string[];
  trending?: boolean;
  breaking?: boolean;
  isHeadline?: boolean;
}

export interface VideoItem {
  id: string;
  _id?: string;
  title: string;
  category: string;
  duration: string;
  views: string;
  viewsCount?: number;
  thumbnail: string;
  videoUrl: string;
  youtubeId?: string;
  description?: string;
  createdAt?: string;
}

export interface DamLevel {
  name: string;
  capacity: string;
  percentage: number;
  status: 'normal' | 'warning' | 'alert';
  color: string;
}

export interface CurrencyRate {
  code: string;
  name: string;
  inrRate: number;
  change: 'up' | 'down' | 'same';
  flag: string;
}

export interface CategoryConfig {
  slug: string;
  name: string;
  englishTitle: string;
  description: string;
  color: string;
  tags: string[];
}

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  world: {
    slug: 'world',
    name: 'International',
    englishTitle: 'INTERNATIONAL NEWS',
    description: 'Global geopolitics, international diplomacy, world economies, and overseas developments.',
    color: '#006b9a',
    tags: ['Diplomacy', 'Climate', 'Economy', 'Technology', 'Middle East']
  },
  politics: {
    slug: 'politics',
    name: 'Politics',
    englishTitle: 'POLITICS & GOVERNANCE',
    description: 'Kerala and national political developments, state assembly proceedings, policy decisions, and governance.',
    color: '#C8102E',
    tags: ['Assembly', 'Governance', 'Parliament', 'Elections', 'Policy']
  },
  business: {
    slug: 'business',
    name: 'Business',
    englishTitle: 'BUSINESS & ECONOMY',
    description: 'Markets, stock exchange, startups, banking, gold trends, and major commercial infrastructure.',
    color: '#005277',
    tags: ['Vizhinjam', 'Markets', 'Startups', 'Stocks', 'Banking']
  },
  cinema: {
    slug: 'cinema',
    name: 'Cinema',
    englishTitle: 'CINEMA & ENTERTAINMENT',
    description: 'Malayalam and Indian film news, box office collections, reviews, OTT releases, and performing arts.',
    color: '#B45309',
    tags: ['Box Office', 'Awards', 'Film Festivals', 'OTT', 'Music']
  },
  sports: {
    slug: 'sports',
    name: 'Sports',
    englishTitle: 'SPORTS & GAMES',
    description: 'Football, cricket, athletics, ISL, IPL, Santosh Trophy, and major national and global tournaments.',
    color: '#15803d',
    tags: ['Santosh Trophy', 'IPL', 'Kerala Blasters', 'Cricket', 'Athletics']
  },
  opinion: {
    slug: 'opinion',
    name: 'Opinion',
    englishTitle: 'EDITORIAL & OPINION',
    description: 'Perspectives and commentary from leading writers, editorials, in-depth analyses, and civic discourse.',
    color: '#854d0e',
    tags: ['Editorial', 'Education', 'Environment', 'Society', 'Culture']
  },
  special: {
    slug: 'special',
    name: 'Special Reports',
    englishTitle: 'SPECIAL REPORTS',
    description: 'Investigative stories, exclusive series, ground reports, and deep-dive features from the newsroom.',
    color: '#991b1b',
    tags: ['Special Report', 'Investigation', 'Series', 'Exclusives']
  }
};

export const BREAKING_NEWS: string[] = [];

export const DAM_LEVELS: DamLevel[] = [
  { name: "ഇടുക്കി ഡാം", capacity: "2345.5 അടി (42%)", percentage: 42, status: "normal", color: "#006b9a" },
  { name: "മുല്ലപ്പെരിയാർ", capacity: "128.2 അടി (58%)", percentage: 58, status: "warning", color: "#B45309" },
  { name: "ഇടമലയാർ", capacity: "148.6 മീറ്റർ (36%)", percentage: 36, status: "normal", color: "#006b9a" },
  { name: "ബാണാസുര സാഗർ", capacity: "762.4 മീറ്റർ (49%)", percentage: 49, status: "normal", color: "#006b9a" },
  { name: "തെന്മല (പരപ്പാർ)", capacity: "103.8 മീറ്റർ (62%)", percentage: 62, status: "warning", color: "#B45309" },
];

// Live rates are now fetched 100% dynamically from real-time market APIs
export const CURRENCY_RATES: CurrencyRate[] = [];

export const KERALA_DISTRICTS: string[] = [
  "എല്ലാം",
  "തിരുവനന്തപുരം",
  "കൊല്ലം",
  "പത്തനംതിട്ട",
  "ആലപ്പുഴ",
  "കോട്ടയം",
  "ഇടുക്കി",
  "എറണാകുളം",
  "തൃശ്ശൂർ",
  "പാലക്കാട്",
  "മലപ്പുറം",
  "കോഴിക്കോട്",
  "വയനാട്",
  "കണ്ണൂർ",
  "കാസർഗോഡ്",
];

export const PRAVASI_COUNTRIES = [
  { id: "all", name: "All Countries", flag: "🌐" },
  { id: "uae", name: "UAE", flag: "🇦🇪" },
  { id: "saudi", name: "Saudi Arabia", flag: "🇸🇦" },
  { id: "qatar", name: "Qatar", flag: "🇶🇦" },
  { id: "kuwait", name: "Kuwait", flag: "🇰🇼" },
  { id: "oman", name: "Oman", flag: "🇴🇲" },
  { id: "bahrain", name: "Bahrain", flag: "🇧🇭" },
  { id: "uk", name: "UK & Europe", flag: "🇬🇧" },
  { id: "usa", name: "USA & Canada", flag: "🇺🇸" },
  { id: "australia", name: "Australia", flag: "🇦🇺" },
];

export const MAIN_ARTICLES: Article[] = [];
