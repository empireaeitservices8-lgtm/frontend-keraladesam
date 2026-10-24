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
    name: 'ലോകം',
    englishTitle: 'World & Global Affairs',
    description: 'ആഗോള രാഷ്ട്രീയവും നയതന്ത്രവും, രാജ്യാന്തര കരാറുകൾ, വിദേശ വികസനങ്ങൾ എന്നിവയുടെ സമഗ്ര റിപ്പോർട്ടിംഗ്.',
    color: '#006b9a',
    tags: ['ആഗോള നയതന്ത്രം', 'കാലാവസ്ഥ', 'സമ്പദ്‌വ്യവസ്ഥ', 'സാങ്കേതികവിദ്യ', 'മിഡിൽ ഈസ്റ്റ്']
  },
  politics: {
    slug: 'politics',
    name: 'രാഷ്ട്രീയം',
    englishTitle: 'Politics & Governance',
    description: 'കേരളത്തിലെയും ദേശീയതലത്തിലെയും രാഷ്ട്രീയ സംഭവവികാസങ്ങൾ, നിയമസഭാ നടപടികൾ, നയപരമായ തീരുമാനങ്ങൾ.',
    color: '#C8102E',
    tags: ['നിയമസഭ', 'ഭരണനയം', 'പാർലമെന്റ്', 'തെരഞ്ഞെടുപ്പ്', 'വികസനം']
  },
  business: {
    slug: 'business',
    name: 'ബിസിനസ്',
    englishTitle: 'Business & Economy',
    description: 'ഓഹരി വിപണി, സ്വർണ്ണവില, സ്റ്റാർട്ടപ്പുകൾ, ബാങ്കിംഗ്, വിഴിഞ്ഞം അടക്കമുള്ള വൻകിട വാണിജ്യ പദ്ധതികൾ.',
    color: '#005277',
    tags: ['വിഴിഞ്ഞം', 'സ്വർണവില', 'സ്റ്റാർട്ടപ്പുകൾ', 'ഓഹരിവിപണി', 'ബാങ്കിംഗ്']
  },
  cinema: {
    slug: 'cinema',
    name: 'സിനിമ',
    englishTitle: 'Cinema & Arts',
    description: 'മലയാള ചലച്ചിത്ര വിശേഷങ്ങൾ, ബോക്സ് ഓഫീസ് റിപ്പോർട്ടുകൾ, റിവ്യൂകൾ, നാടകം, സാഹിത്യം, കലാരംഗം.',
    color: '#B45309',
    tags: ['ബോക്സ് ഓഫീസ്', 'അവാർഡുകൾ', 'ഫിലിം ഫെസ്റ്റിവൽ', 'ഒ.ടി.ടി', 'സംഗീതം']
  },
  sports: {
    slug: 'sports',
    name: 'സ്പോർട്സ്',
    englishTitle: 'Sports & Games',
    description: 'ഫുട്ബോൾ, ക്രിക്കറ്റ്, അത്‌ലറ്റിക്സ്, സന്തോഷ് ട്രോഫി, ഐഎസ്എൽ, ഐപിഎൽ എന്നിവയുടെ സമഗ്ര കായിക വിശകലനം.',
    color: '#15803d',
    tags: ['സന്തോഷ് ട്രോഫി', 'ഐപിഎൽ', 'കേരള ബ്ലാസ്റ്റേഴ്സ്', 'ക്രിക്കറ്റ്', 'അത്‌ലറ്റിക്സ്']
  },
  opinion: {
    slug: 'opinion',
    name: 'അഭിപ്രായം',
    englishTitle: 'Editorial & Opinion',
    description: 'പ്രമുഖ ചിന്തകരുടെയും എഴുത്തുകാരുടെയും നിരീക്ഷണങ്ങൾ, മുഖപ്രസംഗങ്ങൾ, സമകാലിക വിഷയങ്ങളിലെ തുറന്നെഴുത്ത്.',
    color: '#854d0e',
    tags: ['എഡിറ്റോറിയൽ', 'വിദ്യാഭ്യാസം', 'പരിസ്ഥിതി', 'സാമൂഹികം', 'സാംസ്കാരികം']
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

export const CURRENCY_RATES: CurrencyRate[] = [
  { code: "AED", name: "യു.എ.ഇ ദിർഹം", inrRate: 23.42, change: "up", flag: "🇦🇪" },
  { code: "SAR", name: "സൗദി റിയാൽ", inrRate: 22.95, change: "up", flag: "🇸🇦" },
  { code: "QAR", name: "ഖത്തർ റിയാൽ", inrRate: 23.60, change: "same", flag: "🇶🇦" },
  { code: "KWD", name: "കുവൈത്ത് ദിനാർ", inrRate: 280.15, change: "down", flag: "🇰🇼" },
  { code: "OMR", name: "ഒമാൻ റിയാൽ", inrRate: 223.80, change: "same", flag: "🇴🇲" },
  { code: "BHD", name: "ബഹ്റൈൻ ദിനാർ", inrRate: 228.45, change: "up", flag: "🇧🇭" },
  { code: "USD", name: "യു.എസ് ഡോളർ", inrRate: 86.10, change: "up", flag: "🇺🇸" },
];

export const KERALA_DISTRICTS = [
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
  { id: "all", name: "മുഴുവൻ പ്രവാസം", flag: "🌐" },
  { id: "uae", name: "യു.എ.ഇ (UAE)", flag: "🇦🇪" },
  { id: "saudi", name: "സൗദി അറേബ്യ", flag: "🇸🇦" },
  { id: "qatar", name: "ഖത്തർ", flag: "🇶🇦" },
  { id: "kuwait", name: "കുവൈത്ത്", flag: "🇰🇼" },
  { id: "oman", name: "ഒമാൻ", flag: "🇴🇲" },
  { id: "bahrain", name: "ബഹ്റൈൻ", flag: "🇧🇭" },
  { id: "europe", name: "യൂറോപ്പ് & യുകെ", flag: "🇬🇧" },
  { id: "americas", name: "യു.എസ് / കാനഡ", flag: "🇺🇸" },
];

export const MAIN_ARTICLES: Article[] = [];
