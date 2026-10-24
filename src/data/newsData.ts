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

export const BREAKING_NEWS: string[] = [
  "വയനാട് തുരങ്കപാത നിർമാണത്തിന് കേന്ദ്ര പരിസ്ഥിതി അനുമതി ലഭിച്ചു; ടെൻഡർ നടപടികൾ വേഗത്തിലാക്കാൻ നിർദേശം",
  "സംസ്ഥാനത്ത് വേനൽമഴ ശക്തമാകാൻ സാധ്യത: തെക്കൻ ജില്ലകളിൽ യെല്ലോ അലർട്ട് പ്രഖ്യാപിച്ചു",
  "തിരുവനന്തപുരം മെട്രോ പദ്ധതിയുടെ പുതുക്കിയ ഡി.പി.ആർ കേന്ദ്രാനുമതിക്കായി സമർപ്പിച്ചു",
  "ഗൾഫ് രാജ്യങ്ങളിൽ പെരുന്നാൾ അവധി പ്രഖ്യാപിച്ചു; യുഎഇയിൽ 4 ദിവസം അവധി",
  "കൊച്ചി മെട്രോ കാക്കനാട് പാത നിർമാണം 70% പൂർത്തിയായി: ഡിസംബറിൽ കമ്മീഷൻ ചെയ്യും"
];

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

export const MAIN_ARTICLES: Article[] = [
  {
    id: "wayanad-tunnel",
    customId: "wayanad-tunnel",
    title: "വയനാട് ഇരട്ട തുരങ്കപാത നിർമാണത്തിന് കേന്ദ്ര പരിസ്ഥിതി അനുമതി; മലയോര ഹൈവേ വികസനത്തിൽ നിർണായക വഴിത്തിരിവ്",
    lead: "കോഴിക്കോട് ആനക്കാംപൊയിൽ-കള്ളാടി-മേപ്പാടി തുരങ്കപാത യാഥാർഥ്യമാകുമ്പോൾ താമരശ്ശേരി ചുരത്തിലെ ഗതാഗതക്കുരുക്കിന് ശാശ്വത പരിഹാരം; 2,134 കോടി രൂപയുടെ നിർമാണ പദ്ധതിക്ക് സംസ്ഥാന മന്ത്രിസഭയുടെ പ്രത്യേക അനുമതി.",
    category: "വികസനം & അടിസ്ഥാനസൗകര്യം",
    categoryColor: "#006b9a",
    timeAgo: "10 മിനിറ്റ് മുൻപ്",
    publishedAt: "2025 മാർച്ച് 29, 09:30 AM",
    updatedAt: "2025 മാർച്ച് 29, 10:15 AM",
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "നിർദ്ദിഷ്ട വയനാട് തുരങ്കപാതയുടെ ആനക്കാംപൊയിൽ പ്രവേശന കവാടം സ്ഥിതി ചെയ്യുന്ന മലനിരകളുടെ ആകാശദൃശ്യം.",
    readTime: "4 മിനിറ്റ് വായന",
    audioDuration: "03:45",
    author: {
      name: "കെ. ആർ. നാരായണൻ",
      designation: "സീനിയർ ചീഫ് റിപ്പോർട്ടർ",
      location: "തിരുവനന്തപുരം",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxYYHCHhgyTEaleB6KsujrLK-JvitACp_ZFM9MzEdJHRi_d0C8VmnMzOMMK-u17yasy2NbId1bupaXx_4iKs7XB4NIsCyIMXn7JOo-i4lhEaGeuiJqzKaFNUK_uCGRG1iVGWYcRUi-lMTeHPm6pPJC6HutiF0Xl7HEQ7HuFeWxUUfN_nsHYk1DHLIWHirfqJMPcqiJ40oqxD3WwteEtcQZ7l_jZeoa1V71xJOQcf9qH8cfFOMF27T8",
      verified: true
    },
    district: "വയനാട്",
    views: "18.4k",
    trending: true,
    breaking: true,
    highlights: [
      "8.11 കിലോമീറ്റർ നീളമുള്ള ഇരട്ട തുരങ്കം രാജ്യത്തെ മൂന്നാമത്തെ വലിയ തുരങ്കപാതയാകും.",
      "കൊങ്കൺ റെയിൽവേ കോർപ്പറേഷനാണ് പദ്ധതിയുടെ നിർമാണ നിർവഹണ ഏജൻസി.",
      "താമരശ്ശേരി ചുരത്തിലെ യാത്രാസമയം ഒന്നര മണിക്കൂറോളം ലാഭിക്കാൻ സാധിക്കും.",
      "പരിസ്ഥിതി സൗഹൃദ ഡ്രിൽ & ബ്ലാസ്റ്റ് സാങ്കേതികവിദ്യ ഉപയോഗിച്ചാകും തുരങ്കം പണിയുക."
    ],
    paragraphs: [
      "കോഴിക്കോട് ജില്ലയിലെ ആനക്കാംപൊയിലിനെയും വയനാട് ജില്ലയിലെ മേപ്പാടിയെയും ബന്ധിപ്പിച്ച് നിർമിക്കുന്ന ചരിത്രപ്രസിദ്ധമായ ഇരട്ട തുരങ്കപാത നിർമാണത്തിന് കേന്ദ്ര വനം പരിസ്ഥിതി മന്ത്രാലയത്തിന്റെ അന്തിമ അനുമതി ലഭിച്ചു. വയനാട് ചുരത്തിലെ നിത്യേനയുള്ള ഗതാഗതക്കുരുക്കുകൾക്കും പ്രകൃതിക്ഷോഭങ്ങൾ മൂലമുണ്ടാകുന്ന യാത്രാതടസ്സങ്ങൾക്കും ഇതോടെ ശാശ്വത പരിഹാരമാകുമെന്ന് മുഖ്യമന്ത്രിയുടെ ഓഫീസ് അറിയിച്ചു.",
      "2,134 കോടി രൂപ കിഫ്ബി വഴി വകയിരുത്തിയിട്ടുള്ള ഈ മെഗാ പ്രൊജക്റ്റിൽ രണ്ട് തുരങ്കങ്ങളിലായി ആകെ നാല് വരി പാതയാണ് വിഭാവനം ചെയ്തിരിക്കുന്നത്. നിർമാണ കരാർ ഉടൻ തന്നെ ഗ്ലോബൽ ടെൻഡറിലൂടെ അന്തിമമാക്കുമെന്നും ഈ വർഷം അവസാനത്തോടെ തുരങ്കം തുരക്കുന്ന പ്രവർത്തനങ്ങൾക്ക് തുടക്കമാകുമെന്നും പൊതുമരാമത്ത് വകുപ്പ് അറിയിച്ചു.",
      "പദ്ധതിക്കായി 12.5 ഹെക്ടർ വനഭൂമിയാണ് വിട്ടുകിട്ടേണ്ടിയിരുന്നത്. ഇതിന് പകരമായി കാസർഗോഡ്, കണ്ണൂർ ജില്ലകളിലായി തത്തുല്യമായ റവന്യൂ ഭൂമി വനവൽക്കരണത്തിനായി വനംവകുപ്പിന് കൈമാറിയിട്ടുണ്ട്. തുരങ്കപാത യാഥാർത്ഥ്യമാകുന്നതോടെ കൊച്ചി, കോഴിക്കോട് വിമാനത്താവളങ്ങളിൽ നിന്ന് വയനാട്ടിലേക്കും മൈസൂരു, ബെംഗളൂരു നഗരങ്ങളിലേക്കുമുള്ള ചരക്കുഗതാഗത ദൂരം ഗണ്യമായി കുറയും."
    ],
    tags: ["WayanadTunnel", "KeralaInfrastructure", "HighrangeNews", "Kozhikode"]
  },
  {
    id: "kerala-budget-infra",
    customId: "kerala-budget-infra",
    title: "സംസ്ഥാന ബജറ്റിൽ അടിസ്ഥാന സൗകര്യ വികസനത്തിന് മുൻഗണന; തീരദേശ-മലയോര ഹൈവേകൾക്ക് അധിക വിഹിതം",
    lead: "സംസ്ഥാനത്തിന്റെ മൊത്തം ആഭ്യന്തര ഉൽപ്പാദനത്തിൽ 6.8% വളർച്ച ലക്ഷ്യമിട്ട് ധനമന്ത്രി പുതിയ വികസന പാക്കേജ് പ്രഖ്യാപിച്ചു.",
    category: "ഭരണം & നിയമസഭ",
    categoryColor: "#C8102E",
    timeAgo: "25 മിനിറ്റ് മുൻപ്",
    publishedAt: "2025 മാർച്ച് 29, 09:15 AM",
    updatedAt: "2025 മാർച്ച് 29, 09:40 AM",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    readTime: "3 മിനിറ്റ് വായന",
    audioDuration: "03:00",
    author: {
      name: "എസ്. സുരേഷ് കുമാർ",
      designation: "സ്പെഷ്യൽ കറസ്പോണ്ടന്റ്",
      location: "തിരുവനന്തപുരം",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxYYHCHhgyTEaleB6KsujrLK-JvitACp_ZFM9MzEdJHRi_d0C8VmnMzOMMK-u17yasy2NbId1bupaXx_4iKs7XB4NIsCyIMXn7JOo-i4lhEaGeuiJqzKaFNUK_uCGRG1iVGWYcRUi-lMTeHPm6pPJC6HutiF0Xl7HEQ7HuFeWxUUfN_nsHYk1DHLIWHirfqJMPcqiJ40oqxD3WwteEtcQZ7l_jZeoa1V71xJOQcf9qH8cfFOMF27T8",
      verified: true
    },
    district: "തിരുവനന്തപുരം",
    views: "12.8k",
    trending: true,
    paragraphs: [
      "നിയമസഭയിൽ അവതരിപ്പിച്ച പുതുക്കിയ ധനബജറ്റിൽ അടിസ്ഥാന സൗകര്യങ്ങൾക്കും വിവരസാങ്കേതിക രംഗത്തിനും റെക്കോർഡ് തുക അനുവദിച്ചു.",
      "തീരദേശ ഹൈവേയുടെയും മലയോര ഹൈവേയുടെയും നിർമാണ വേഗത വർധിപ്പിക്കാൻ 1,500 കോടി രൂപ നീക്കിവെച്ചതായി ധനമന്ത്രി അറിയിച്ചു."
    ],
    tags: ["KeralaBudget", "Economy", "StateAssembly", "Politics"]
  },
  {
    id: "thiruvananthapuram-metro",
    customId: "thiruvananthapuram-metro",
    title: "തിരുവനന്തപുരം ലൈറ്റ് മെട്രോ: പുതിയ ഡിപിആർ കേന്ദ്രാനുമതിക്കായി സമർപ്പിച്ചു",
    lead: "പള്ളിപ്പുറം ടെക്‌നോസിറ്റി മുതൽ കരമന വരെയും രണ്ടാം ഘട്ടത്തിൽ നെയ്യാറ്റിൻകരയിലേക്കും നീളുന്ന പദ്ധതിക്ക് ഭരണാനുമതി.",
    category: "നഗരവികസനം",
    categoryColor: "#006b9a",
    timeAgo: "40 മിനിറ്റ് മുൻപ്",
    publishedAt: "2025 മാർച്ച് 29, 09:00 AM",
    updatedAt: "2025 മാർച്ച് 29, 09:00 AM",
    imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80",
    readTime: "3 മിനിറ്റ് വായന",
    audioDuration: "02:45",
    author: {
      name: "അനുപമ മേനോൻ",
      designation: "സിറ്റി ബ്യൂറോ ചീഫ്",
      location: "തിരുവനന്തപുരം",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxYYHCHhgyTEaleB6KsujrLK-JvitACp_ZFM9MzEdJHRi_d0C8VmnMzOMMK-u17yasy2NbId1bupaXx_4iKs7XB4NIsCyIMXn7JOo-i4lhEaGeuiJqzKaFNUK_uCGRG1iVGWYcRUi-lMTeHPm6pPJC6HutiF0Xl7HEQ7HuFeWxUUfN_nsHYk1DHLIWHirfqJMPcqiJ40oqxD3WwteEtcQZ7l_jZeoa1V71xJOQcf9qH8cfFOMF27T8",
      verified: true
    },
    district: "തിരുവനന്തപുരം",
    views: "9.5k",
    paragraphs: [
      "തലസ്ഥാന നഗരിയിലെ യാത്രാക്ലേശത്തിന് പരിഹാരം കാണുന്ന തിരുവനന്തപുരം മെട്രോ പദ്ധതിയുടെ സമഗ്ര ഡിപിആർ കൊച്ചി മെട്രോ റെയിൽ ലിമിറ്റഡ് (കെഎംആർഎൽ) സമർപ്പിച്ചു."
    ],
    tags: ["Metro", "UrbanTransit", "Trivandrum", "Development"]
  },
  {
    id: "vizhinjam-commercial-shipping",
    customId: "vizhinjam-commercial-shipping",
    title: "വിഴിഞ്ഞം അന്താരാഷ്ട്ര തുറമുഖത്ത് വാണിജ്യ കപ്പലുകളുടെ തിരക്ക്; ദക്ഷിണേഷ്യൻ ട്രാൻസ്ഷിപ്പ്മെന്റ് ഹബ്ബായി വളരുന്നു",
    lead: "പ്രതിമാസം കൈകാര്യം ചെയ്യുന്ന കണ്ടെയ്നറുകളുടെ എണ്ണത്തിൽ 45% വളർച്ച; അന്താരാഷ്ട്ര ഷിപ്പിംഗ് കമ്പനികൾ വിഴിഞ്ഞത്തെ പ്രധാന തുറമുഖമാക്കി മാറ്റി.",
    category: "ബിസിനസ്",
    categoryColor: "#005277",
    timeAgo: "1 മണിക്കൂർ മുൻപ്",
    publishedAt: "2025 മാർച്ച് 29, 08:30 AM",
    updatedAt: "2025 മാർച്ച് 29, 08:30 AM",
    imageUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
    readTime: "4 മിനിറ്റ് വായന",
    audioDuration: "03:15",
    author: {
      name: "അനുപമ മേനോൻ",
      designation: "ബിസിനസ് എഡിറ്റർ",
      location: "തിരുവനന്തപുരം",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxYYHCHhgyTEaleB6KsujrLK-JvitACp_ZFM9MzEdJHRi_d0C8VmnMzOMMK-u17yasy2NbId1bupaXx_4iKs7XB4NIsCyIMXn7JOo-i4lhEaGeuiJqzKaFNUK_uCGRG1iVGWYcRUi-lMTeHPm6pPJC6HutiF0Xl7HEQ7HuFeWxUUfN_nsHYk1DHLIWHirfqJMPcqiJ40oqxD3WwteEtcQZ7l_jZeoa1V71xJOQcf9qH8cfFOMF27T8",
      verified: true
    },
    district: "തിരുവനന്തപുരം",
    views: "28.4k",
    trending: true,
    paragraphs: [
      "വിഴിഞ്ഞം അന്താരാഷ്ട്ര തുറമുഖത്ത് ലോകത്തെ ഏറ്റവും വലിയ മദർഷിപ്പുകൾ ഉൾപ്പെടെ തുടർച്ചയായി ബെർത്ത് ചെയ്യുന്നതോടെ കേരളത്തിന്റെ സാമ്പത്തിക രംഗത്ത് വൻ കുതിച്ചുചാട്ടം.",
      "തുറമുഖവുമായി ബന്ധപ്പെട്ട് ലോജിസ്റ്റിക്സ് പാർക്കുകൾ, റോഡ്-റെയിൽ കണക്റ്റിവിറ്റി വികസനം എന്നിവ അതിവേഗം പുരോഗമിക്കുകയാണ്."
    ],
    tags: ["VizhinjamPort", "Shipping", "MaritimeTrade", "Economy", "BusinessNews"]
  },
  {
    id: "ipl-sanju-samson-century",
    customId: "ipl-sanju-samson-century",
    title: "ഐപിഎല്ലിൽ സഞ്ജു സാംസണിന്റെ ക്യാപ്റ്റൻ ഇന്നിംഗ്സ്: രാജസ്ഥാന് ത്രില്ലർ വിജയം",
    lead: "അവസാന ഓവറിൽ സിക്സറുകളുടെ പെരുമഴ തീർത്ത് സഞ്ജുവിന്റെ വെടിക്കെട്ട് പ്രകടനം; മലയാളി ക്രിക്കറ്റ് പ്രേമികൾക്ക് ആവേശപ്പൂരം.",
    category: "സ്പോർട്സ്",
    categoryColor: "#15803d",
    timeAgo: "2 മണിക്കൂർ മുൻപ്",
    publishedAt: "2025 മാർച്ച് 29, 07:30 AM",
    updatedAt: "2025 മാർച്ച് 29, 07:30 AM",
    imageUrl: "https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=800&q=80",
    readTime: "3 മിനിറ്റ് വായന",
    audioDuration: "02:30",
    author: {
      name: "അഭിലാഷ് നായർ",
      designation: "സ്പോർട്സ് എഡിറ്റർ",
      location: "തൃശ്ശൂർ",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxYYHCHhgyTEaleB6KsujrLK-JvitACp_ZFM9MzEdJHRi_d0C8VmnMzOMMK-u17yasy2NbId1bupaXx_4iKs7XB4NIsCyIMXn7JOo-i4lhEaGeuiJqzKaFNUK_uCGRG1iVGWYcRUi-lMTeHPm6pPJC6HutiF0Xl7HEQ7HuFeWxUUfN_nsHYk1DHLIWHirfqJMPcqiJ40oqxD3WwteEtcQZ7l_jZeoa1V71xJOQcf9qH8cfFOMF27T8",
      verified: true
    },
    district: "തൃശ്ശൂർ",
    views: "36.8k",
    trending: true,
    paragraphs: [
      "ഐപിഎല്ലിലെ ആവേശകരമായ മത്സരത്തിൽ രാജസ്ഥാൻ റോയൽസ് ക്യാപ്റ്റൻ സഞ്ജു സാംസൺ പുറത്തെടുത്ത മാസ്മരിക ഇന്നിംഗ്സ് ടീമിന് അവിസ്മരണീയ വിജയം സമ്മാനിച്ചു.",
      "48 പന്തിൽ നിന്ന് 92 റൺസ് അടിച്ചുകൂട്ടിയ സഞ്ജു മത്സരത്തിലെ താരമായി തെരഞ്ഞെടുക്കപ്പെട്ടു."
    ],
    tags: ["SanjuSamson", "IPL2025", "Cricket", "Sports"]
  },
  {
    id: "un-climate-summit-declaration",
    customId: "un-climate-summit-declaration",
    title: "ആഗോള കാലാവസ്ഥാ ഉച്ചകോടിയിൽ ചരിത്രപരമായ ധാരണാപത്രം: പുനരുപയോഗ ഊർജത്തിന് 100 ബില്യൺ ഡോളർ പാക്കേജ്",
    lead: "ആഗോളതാപനം 1.5 ഡിഗ്രിയിൽ താഴെ നിർത്താൻ വികസിത-വികസ്വര രാജ്യങ്ങൾ സംയുക്ത കർമപദ്ധതിക്ക് അംഗീകാരം നൽകി.",
    category: "ലോകം",
    categoryColor: "#006b9a",
    timeAgo: "3 മണിക്കൂർ മുൻപ്",
    publishedAt: "2025 മാർച്ച് 29, 06:30 AM",
    updatedAt: "2025 മാർച്ച് 29, 06:30 AM",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    readTime: "4 മിനിറ്റ് വായന",
    audioDuration: "03:10",
    author: {
      name: "ഡോ. ഗീത മേനോൻ",
      designation: "വിദേശകാര്യ പ്രതിനിധി",
      location: "ജനീവ",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxYYHCHhgyTEaleB6KsujrLK-JvitACp_ZFM9MzEdJHRi_d0C8VmnMzOMMK-u17yasy2NbId1bupaXx_4iKs7XB4NIsCyIMXn7JOo-i4lhEaGeuiJqzKaFNUK_uCGRG1iVGWYcRUi-lMTeHPm6pPJC6HutiF0Xl7HEQ7HuFeWxUUfN_nsHYk1DHLIWHirfqJMPcqiJ40oqxD3WwteEtcQZ7l_jZeoa1V71xJOQcf9qH8cfFOMF27T8",
      verified: true
    },
    views: "15.3k",
    paragraphs: [
      "ഐക്യരാഷ്ട്രസഭയുടെ ആഭിമുഖ്യത്തിൽ ജനീവയിൽ സമാപിച്ച അന്താരാഷ്ട്ര കാലാവസ്ഥാ ഉച്ചകോടിയിൽ കാർബൺ പുറന്തള്ളൽ ഗണ്യമായി കുറയ്ക്കാൻ ലക്ഷ്യമിട്ട് നിർണായക പ്രഖ്യാപനം.",
      "വികസ്വര രാജ്യങ്ങളിലെ ഹരിത ഊർജ പശ്ചാത്തല സൗകര്യങ്ങൾ വികസിപ്പിക്കുന്നതിനായി 100 ബില്യൺ ഡോളറിന്റെ പ്രത്യേക കാലാവസ്ഥാ ഫണ്ട് ഏർപ്പെടുത്താൻ വികസിത രാജ്യങ്ങൾ സമ്മതിച്ചു."
    ],
    tags: ["UNClimate", "GlobalAffairs", "GreenEnergy", "WorldNews"]
  },
  {
    id: "kerala-assembly-land-tribunal",
    customId: "kerala-assembly-land-tribunal",
    title: "നിയമസഭയിൽ നിർണായക ഭൂനിയമ ഭേദഗതി ബിൽ പാസാക്കി; കർഷകർക്ക് പട്ടയം വേഗത്തിലാക്കാൻ പ്രത്യേക ട്രൈബ്യൂണൽ",
    lead: "മലയോര മേഖലകളിലെ കർഷകരുടെ പതിറ്റാണ്ടുകളായുള്ള ഭൂപ്രശ്നങ്ങൾ പരിഹരിക്കാൻ ലക്ഷ്യമിട്ട് പ്രതിപക്ഷ സഹകരണത്തോടെ ബിൽ പാസാക്കി.",
    category: "രാഷ്ട്രീയം",
    categoryColor: "#C8102E",
    timeAgo: "3 മണിക്കൂർ മുൻപ്",
    publishedAt: "2025 മാർച്ച് 29, 06:15 AM",
    updatedAt: "2025 മാർച്ച് 29, 06:15 AM",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    readTime: "4 മിനിറ്റ് വായന",
    audioDuration: "03:30",
    author: {
      name: "എസ്. സുരേഷ് കുമാർ",
      designation: "സീനിയർ അസംബ്ലി കറസ്പോണ്ടന്റ്",
      location: "തിരുവനന്തപുരം",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxYYHCHhgyTEaleB6KsujrLK-JvitACp_ZFM9MzEdJHRi_d0C8VmnMzOMMK-u17yasy2NbId1bupaXx_4iKs7XB4NIsCyIMXn7JOo-i4lhEaGeuiJqzKaFNUK_uCGRG1iVGWYcRUi-lMTeHPm6pPJC6HutiF0Xl7HEQ7HuFeWxUUfN_nsHYk1DHLIWHirfqJMPcqiJ40oqxD3WwteEtcQZ7l_jZeoa1V71xJOQcf9qH8cfFOMF27T8",
      verified: true
    },
    district: "തിരുവനന്തപുരം",
    views: "17.8k",
    paragraphs: [
      "കേരള നിയമസഭയിൽ ദീർഘനേരം നീണ്ടുനിന്ന ചർച്ചകൾക്കൊടുവിൽ ചരിത്രപ്രസിദ്ധമായ ഭൂനിയമ ഭേദഗതി ബിൽ സഭ ഏകകണ്ഠമായി പാസാക്കി.",
      "ഇടുക്കി, വയനാട്, പത്തനംതിട്ട അടക്കമുള്ള മലയോര ജില്ലകളിലെ ആയിരക്കണക്കിന് ചെറുകിട കർഷകർക്ക് ഈ തീരുമാനം വലിയ ആശ്വാസമാകും."
    ],
    tags: ["KeralaAssembly", "LandReforms", "FarmersRights", "Politics"]
  },
  {
    id: "malayalam-cinema-global-box-office",
    customId: "malayalam-cinema-global-box-office",
    title: "മലയാള സിനിമയുടെ സുവർണകാലം: ആഗോള ബോക്സ് ഓഫീസിൽ 1,000 കോടി ക്ലബ്ബിലേക്ക് കുതിപ്പ്",
    lead: "തമിഴ്‌നാട്, കർണാടക, ഗൾഫ് മേഖലകളിൽ മലയാള സിനിമകളുടെ അഭൂതപൂർവമായ മുന്നേറ്റം; ആഗോള പ്രേക്ഷകരുടെ പ്രിയപ്പെട്ട ഇൻഡസ്ട്രിയായി മോളിവുഡ്.",
    category: "സിനിമ",
    categoryColor: "#B45309",
    timeAgo: "4 മണിക്കൂർ മുൻപ്",
    publishedAt: "2025 മാർച്ച് 29, 05:45 AM",
    updatedAt: "2025 മാർച്ച് 29, 05:45 AM",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    readTime: "4 മിനിറ്റ് വായന",
    audioDuration: "03:15",
    author: {
      name: "ദിലീപ് കുമാർ",
      designation: "സിനിമാ നിരൂപകൻ",
      location: "കൊച്ചി",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxYYHCHhgyTEaleB6KsujrLK-JvitACp_ZFM9MzEdJHRi_d0C8VmnMzOMMK-u17yasy2NbId1bupaXx_4iKs7XB4NIsCyIMXn7JOo-i4lhEaGeuiJqzKaFNUK_uCGRG1iVGWYcRUi-lMTeHPm6pPJC6HutiF0Xl7HEQ7HuFeWxUUfN_nsHYk1DHLIWHirfqJMPcqiJ40oqxD3WwteEtcQZ7l_jZeoa1V71xJOQcf9qH8cfFOMF27T8",
      verified: true
    },
    district: "എറണാകുളം",
    views: "42.5k",
    trending: true,
    paragraphs: [
      "കഥാകഥനത്തിലെ പുതുമയും യഥാർത്ഥ ജീവിതത്തോട് ചേർന്നുനിൽക്കുന്ന മേക്കിംഗും കൊണ്ട് ഇന്ത്യൻ സിനിമാ ലോകത്തെ അമ്പരപ്പിച്ചിരിക്കുകയാണ് മലയാള ചലച്ചിത്രങ്ങൾ.",
      "ഒടിടി പ്ലാറ്റ്‌ഫോമുകളിലും അന്താരാഷ്ട്ര തിയേറ്ററുകളിലും ഒരേപോലെ തരംഗം സൃഷ്ടിച്ചുകൊണ്ട് ഈ വർഷത്തെ കളക്ഷൻ റെക്കോർഡുകൾ ഭേദിക്കപ്പെട്ടു."
    ],
    tags: ["Mollywood", "BoxOffice", "MalayalamCinema", "Entertainment"]
  },
  {
    id: "pravasi-eid-holidays",
    customId: "pravasi-eid-holidays",
    title: "ഗൾഫിൽ ഈദ് അൽ ഫിത്തർ അവധികൾ പ്രഖ്യാപിച്ചു; യുഎഇയിൽ സർക്കാർ ജീവനക്കാർക്ക് 9 ദിവസത്തെ ദീർഘാവധി",
    lead: "ചന്ദ്രപ്പിറവി നിരീക്ഷണ സമിതികൾ യോഗം ചേരുന്നതോടെ പെരുന്നാൾ തീയതി അന്തിമമാക്കും; നാട്ടിലേക്കുള്ള വിമാന ടിക്കറ്റ് നിരക്കുകളിൽ വൻ വർധനവ്.",
    category: "പ്രവാസം",
    categoryColor: "#9e001f",
    timeAgo: "5 മണിക്കൂർ മുൻപ്",
    publishedAt: "2025 മാർച്ച് 29, 05:00 AM",
    updatedAt: "2025 മാർച്ച് 29, 05:00 AM",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    readTime: "3 മിനിറ്റ് വായന",
    audioDuration: "02:45",
    author: {
      name: "ഫൈസൽ ബാബു",
      designation: "ഗൾഫ് ബ്യൂറോ ചീഫ്",
      location: "ദുബായ്",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxYYHCHhgyTEaleB6KsujrLK-JvitACp_ZFM9MzEdJHRi_d0C8VmnMzOMMK-u17yasy2NbId1bupaXx_4iKs7XB4NIsCyIMXn7JOo-i4lhEaGeuiJqzKaFNUK_uCGRG1iVGWYcRUi-lMTeHPm6pPJC6HutiF0Xl7HEQ7HuFeWxUUfN_nsHYk1DHLIWHirfqJMPcqiJ40oqxD3WwteEtcQZ7l_jZeoa1V71xJOQcf9qH8cfFOMF27T8",
      verified: true
    },
    country: "uae",
    views: "24.6k",
    trending: true,
    paragraphs: [
      "യുണൈറ്റഡ് അറബ് എമിറേറ്റ്സ് ഫെഡറൽ അതോറിറ്റി സർക്കാർ, അർദ്ധസർക്കാർ മേഖലകൾക്കുള്ള ഈദ് അൽ ഫിത്തർ അവധികൾ പ്രഖ്യാപിച്ചു.",
      "പ്രവാസികൾ കുടുംബസമേതം ആഘോഷങ്ങളിലേക്ക് കടക്കുമ്പോൾ കേരളത്തിലേക്കുള്ള വിമാന സർവീസുകളിൽ സീറ്റുകൾ മുൻകൂട്ടി റിസർവ് ചെയ്യപ്പെട്ടു കഴിഞ്ഞു."
    ],
    tags: ["EidMubarak", "GulfNews", "UAEHolidays", "Pravasi"]
  },
  {
    id: "opinion-kerala-higher-education",
    customId: "opinion-kerala-higher-education",
    title: "ഉന്നതവിദ്യാഭ്യാസ രംഗത്ത് കേരളം സ്വീകരിക്കേണ്ട പുതിയ വഴികൾ: സമഗ്ര വിലയിരുത്തൽ",
    lead: "യുവജനങ്ങളുടെ വിദേശപഠന കുടിയേറ്റം തടയാൻ ഗവേഷണ സൗകര്യങ്ങളും വ്യവസായ-അക്കാദമിക് സംയോജനവും കൂടുതൽ ശക്തമാക്കണം.",
    category: "അഭിപ്രായം",
    categoryColor: "#854d0e",
    timeAgo: "6 മണിക്കൂർ മുൻപ്",
    publishedAt: "2025 മാർച്ച് 29, 04:00 AM",
    updatedAt: "2025 മാർച്ച് 29, 04:00 AM",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    readTime: "5 മിനിറ്റ് വായന",
    audioDuration: "04:00",
    author: {
      name: "പ്രൊഫ. എം. കെ. സാനു",
      designation: "വിദ്യാഭ്യാസ ചിന്തകൻ",
      location: "കൊച്ചി",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxYYHCHhgyTEaleB6KsujrLK-JvitACp_ZFM9MzEdJHRi_d0C8VmnMzOMMK-u17yasy2NbId1bupaXx_4iKs7XB4NIsCyIMXn7JOo-i4lhEaGeuiJqzKaFNUK_uCGRG1iVGWYcRUi-lMTeHPm6pPJC6HutiF0Xl7HEQ7HuFeWxUUfN_nsHYk1DHLIWHirfqJMPcqiJ40oqxD3WwteEtcQZ7l_jZeoa1V71xJOQcf9qH8cfFOMF27T8",
      verified: true
    },
    district: "എറണാകുളം",
    views: "9.2k",
    paragraphs: [
      "കേരളത്തിന്റെ ഉന്നത വിദ്യാഭ്യാസ രംഗം നേരിടുന്ന ഏറ്റവും വലിയ വെല്ലുവിളി പ്രതിഭാശാലികളായ വിദ്യാർത്ഥികളുടെ വൻതോതിലുള്ള വിദേശ കുടിയേറ്റമാണ്.",
      "അന്താരാഷ്ട്ര നിലവാരത്തിലുള്ള റിസർച്ച് ലാബുകളും സ്റ്റാർട്ടപ്പ് ഇൻകുബേറ്ററുകളും കാമ്പസുകളിൽ ഒരുക്കുക വഴി ഈ പ്രവണതയ്ക്ക് ഗുണപരമായ മാറ്റം കൊണ്ടുവരാൻ സാധിക്കും."
    ],
    tags: ["Education", "Opinion", "YouthMigration", "KeralaFuture"]
  }
];

