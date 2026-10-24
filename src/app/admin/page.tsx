'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Flame,
  Radio,
  FileText,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  User,
  Layers,
  ChevronDown,
  RefreshCw,
  Send,
  MapPin,
  Check,
  Share2,
  Bookmark
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Article, KERALA_DISTRICTS } from '@/data/newsData';
import {
  getRealArticles,
  adminCreateArticle,
  adminUpdateArticle,
  adminDeleteArticle,
  adminGetRawBreaking,
  adminCreateBreaking,
  adminDeleteBreaking,
} from '@/lib/api';

const CATEGORY_OPTIONS = [
  { name: 'രാഷ്ട്രീയം', color: '#C8102E' },
  { name: 'വികസനം & അടിസ്ഥാനസൗകര്യം', color: '#006b9a' },
  { name: 'ഭരണം & നിയമസഭ', color: '#C8102E' },
  { name: 'നഗരവികസനം & പരിസ്ഥിതി', color: '#005277' },
  { name: 'ബിസിനസ് & സമ്പദ്‌വ്യവസ്ഥ', color: '#005277' },
  { name: 'സിനിമ & കലാരംഗം', color: '#B45309' },
  { name: 'സ്പോർട്സ് & ഗെയിംസ്', color: '#15803d' },
  { name: 'പ്രവാസം & ഗൾഫ്', color: '#006b9a' },
  { name: 'കാലാവസ്ഥ & പ്രകൃതി', color: '#006b9a' },
  { name: 'അഭിപ്രായം & എഡിറ്റോറിയൽ', color: '#854d0e' },
];

const PHOTO_PRESETS = [
  {
    name: 'സെക്രട്ടേറിയറ്റ് / ഭരണം',
    category: 'ഭരണം & നിയമസഭ',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    caption: 'തിരുവനന്തപുരം ഗവൺമെന്റ് സെക്രട്ടേറിയറ്റ് മന്ദിരം',
  },
  {
    name: 'കൊച്ചി മെട്രോ',
    category: 'വികസനം & അടിസ്ഥാനസൗകര്യം',
    url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    caption: 'കൊച്ചി മെട്രോ രണ്ടാം ഘട്ട കാക്കനാട് പാത നിർമാണം',
  },
  {
    name: 'വയനാട് തുരങ്കപാത',
    category: 'വികസനം & അടിസ്ഥാനസൗകര്യം',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    caption: 'വയനാട് - കോഴിക്കോട് ആനക്കാംപൊയിൽ-കള്ളാടി-മേപ്പാടി തുരങ്കപാത റൂട്ട്',
  },
  {
    name: 'നിയമസഭ / രാഷ്ട്രീയം',
    category: 'രാഷ്ട്രീയം',
    url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    caption: 'കേരള നിയമസഭാ സമ്മേളനം',
  },
  {
    name: 'ഗൾഫ് പ്രവാസം / ദുബായ്',
    category: 'പ്രവാസം & ഗൾഫ്',
    url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    caption: 'യുഎഇ ദുബായ് നഗരദൃശ്യം',
  },
  {
    name: 'സ്റ്റാർട്ടപ്പ് / ഐടി',
    category: 'ബിസിനസ് & സമ്പദ്‌വ്യവസ്ഥ',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    caption: 'കേരളത്തിലെ സ്റ്റാർട്ടപ്പ് മിഷൻ സംരംഭകർ',
  },
  {
    name: 'കായികം / ഫുട്ബോൾ',
    category: 'സ്പോർട്സ് & ഗെയിംസ്',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    caption: 'സന്തോഷ് ട്രോഫി ഫുട്ബോൾ മത്സരം',
  },
  {
    name: 'സിനിമ & സംസ്കാരം',
    category: 'സിനിമ & കലാരംഗം',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    caption: 'മലയാള ചലച്ചിത്ര രംഗത്തെ പുതിയ റിലീസുകൾ',
  },
];

type TabType = 'articles' | 'upload' | 'breaking';

export default function AdminPortalPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAdminAuth();

  const [articles, setArticles] = useState<Article[]>([]);
  const [breakingList, setBreakingList] = useState<Array<{ _id: string; headline: string; active: boolean }>>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('upload');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modal State for Edit Article
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [submittingArticle, setSubmittingArticle] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Success Feedback Card for newly published article
  const [lastPublished, setLastPublished] = useState<Article | null>(null);

  // Article Form State
  const [formTitle, setFormTitle] = useState('');
  const [formLead, setFormLead] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORY_OPTIONS[0].name);
  const [formCategoryColor, setFormCategoryColor] = useState(CATEGORY_OPTIONS[0].color);
  const [formDistrict, setFormDistrict] = useState('എറണാകുളം');
  const [formCountry, setFormCountry] = useState('');
  const [formImageUrl, setFormImageUrl] = useState(PHOTO_PRESETS[0].url);
  const [formImageCaption, setFormImageCaption] = useState(PHOTO_PRESETS[0].caption);
  const [formReadTime, setFormReadTime] = useState('3 മിനിറ്റ് വായന');
  const [formHighlights, setFormHighlights] = useState<string[]>(['']);
  const [formParagraphs, setFormParagraphs] = useState<string[]>([
    'സംസ്ഥാനത്ത് സുപ്രധാന വികസന പദ്ധതികൾക്ക് വേഗമേറ്റാൻ മന്ത്രിസഭാ യോഗം തീരുമാനിച്ചു.',
    'വിവിധ മേഖലകളിലെ വിദഗ്ധരുടെ നിർദേശങ്ങൾ പരിഗണിച്ചാണ് പദ്ധതി രൂപരേഖ തയ്യാറാക്കിയിട്ടുള്ളത്.',
  ]);
  const [formTags, setFormTags] = useState('Kerala, News, Latest');
  const [formTrending, setFormTrending] = useState(true);
  const [formBreaking, setFormBreaking] = useState(false);

  // Breaking news quick input
  const [newBreakingText, setNewBreakingText] = useState('');
  const [submittingBreaking, setSubmittingBreaking] = useState(false);

  // Global Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auth Redirect guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load articles and breaking news
  const loadPortalData = async () => {
    try {
      setLoadingData(true);
      const [artList, brkList] = await Promise.all([
        getRealArticles({ limit: 100 }),
        adminGetRawBreaking(),
      ]);
      setArticles(artList);
      setBreakingList(brkList);
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPortalData();
    }
  }, [isAuthenticated]);

  // Reset Form for Creating New Article
  const handleResetForm = () => {
    setEditingArticleId(null);
    setFormTitle('');
    setFormLead('');
    setFormCategory(CATEGORY_OPTIONS[0].name);
    setFormCategoryColor(CATEGORY_OPTIONS[0].color);
    setFormDistrict('എറണാകുളം');
    setFormCountry('');
    setFormImageUrl(PHOTO_PRESETS[0].url);
    setFormImageCaption(PHOTO_PRESETS[0].caption);
    setFormReadTime('3 മിനിറ്റ് വായന');
    setFormHighlights(['']);
    setFormParagraphs(['', '']);
    setFormTags('Kerala, News, Latest');
    setFormTrending(false);
    setFormBreaking(false);
    setModalFeedback(null);
    setLastPublished(null);
  };

  // Switch to Upload Tab
  const handleOpenUploadTab = () => {
    handleResetForm();
    setActiveTab('upload');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Open Modal for Editing an Existing Article
  const handleOpenEdit = (art: Article) => {
    setEditingArticleId(art.id);
    setFormTitle(art.title);
    setFormLead(art.lead);
    setFormCategory(art.category);
    setFormCategoryColor(art.categoryColor || '#C8102E');
    setFormDistrict(art.district || '');
    setFormCountry(art.country || '');
    setFormImageUrl(art.imageUrl);
    setFormImageCaption(art.imageCaption || '');
    setFormReadTime(art.readTime || '3 മിനിറ്റ് വായന');
    setFormHighlights(art.highlights && art.highlights.length > 0 ? art.highlights : ['']);
    setFormParagraphs(art.paragraphs && art.paragraphs.length > 0 ? art.paragraphs : [art.lead]);
    setFormTags(art.tags?.join(', ') || '');
    setFormTrending(Boolean(art.trending));
    setFormBreaking(Boolean(art.breaking));
    setModalFeedback(null);
    setIsModalOpen(true);
  };

  // Submit Article (Create or Update)
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setModalFeedback({ type: 'error', text: 'ലോഗിൻ സെഷൻ ലഭ്യമല്ല. ദയവായി വീണ്ടും ലോഗിൻ ചെയ്യുക.' });
      return;
    }

    if (!formTitle.trim() || !formLead.trim() || !formCategory.trim()) {
      setModalFeedback({ type: 'error', text: 'ദയവായി വാർത്താ തലക്കെട്ടും ആമുഖവും വിഭാഗവും നൽകുക.' });
      return;
    }

    setSubmittingArticle(true);
    setModalFeedback(null);

    const payload: Partial<Article> = {
      title: formTitle.trim(),
      lead: formLead.trim(),
      category: formCategory,
      categoryColor: formCategoryColor,
      district: formDistrict.trim() || undefined,
      country: formCountry.trim() || undefined,
      imageUrl: formImageUrl.trim() || PHOTO_PRESETS[0].url,
      imageCaption: formImageCaption.trim(),
      readTime: formReadTime.trim() || '3 മിനിറ്റ് വായന',
      highlights: formHighlights.map((h) => h.trim()).filter(Boolean),
      paragraphs: formParagraphs.map((p) => p.trim()).filter(Boolean),
      tags: formTags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean),
      trending: formTrending,
      breaking: formBreaking,
    };

    try {
      let result;
      if (editingArticleId) {
        result = await adminUpdateArticle(editingArticleId, payload, token);
      } else {
        result = await adminCreateArticle(payload, token);
      }

      if (result.success && result.article) {
        showToast(
          editingArticleId
            ? 'വാർത്ത വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു!'
            : 'വാർത്ത വിജയകരമായി മുൻപേജിൽ പ്രസിദ്ധീകരിച്ചു!'
        );

        // Also if breaking was checked, inject into breaking news ticker
        if (formBreaking && !editingArticleId) {
          try {
            await adminCreateBreaking(formTitle.trim(), token);
          } catch (e) {
            console.error('Breaking ticker auto-add error:', e);
          }
        }

        setLastPublished(result.article);
        setIsModalOpen(false);
        await loadPortalData();
        window.scrollTo({ top: 350, behavior: 'smooth' });
      } else {
        setModalFeedback({ type: 'error', text: result?.error || 'വാർത്ത സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല.' });
      }
    } catch (err: any) {
      setModalFeedback({ type: 'error', text: err.message || 'Error saving article' });
    } finally {
      setSubmittingArticle(false);
    }
  };

  // Delete Article
  const handleDeleteArticle = async (id: string, title: string) => {
    if (!token) return;
    const confirmDelete = window.confirm(`ഈ വാർത്ത ഡാറ്റാബേസിൽ നിന്ന് നീക്കം ചെയ്യണമെന്ന് ഉറപ്പാണോ?\n\n"${title}"`);
    if (!confirmDelete) return;

    try {
      const res = await adminDeleteArticle(id, token);
      if (res.success) {
        showToast('വാർത്ത ഡാറ്റാബേസിൽ നിന്ന് നീക്കം ചെയ്തു.');
        setArticles((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert(res.error || 'Failed to delete article');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Add Breaking News
  const handleAddBreaking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newBreakingText.trim()) return;

    setSubmittingBreaking(true);
    const res = await adminCreateBreaking(newBreakingText.trim(), token);
    setSubmittingBreaking(false);

    if (res.success) {
      showToast('ബ്രേക്കിംഗ് ന്യൂസ് ടിക്കറിൽ തത്സമയം ചേർത്തു!');
      setNewBreakingText('');
      const updated = await adminGetRawBreaking();
      setBreakingList(updated);
    } else {
      alert(res.error || 'Failed to add breaking headline');
    }
  };

  // Delete Breaking News
  const handleDeleteBreaking = async (id: string) => {
    if (!token) return;
    try {
      const res = await adminDeleteBreaking(id, token);
      if (res.success) {
        showToast('ബ്രേക്കിംഗ് ന്യൂസ് നീക്കം ചെയ്തു.');
        setBreakingList((prev) => prev.filter((b) => b._id !== id));
      }
    } catch (err) {
      console.error('Delete breaking error:', err);
    }
  };

  // Filtered articles in management table
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchSearch =
        !searchQuery.trim() ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.lead.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (art.district && art.district.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategoryFilter === 'all' || art.category === selectedCategoryFilter;

      return matchSearch && matchCategory;
    });
  }, [articles, searchQuery, selectedCategoryFilter]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-editorial-crimson" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 pb-16">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-xl border border-emerald-500/40 flex items-center gap-2 animate-in slide-in-from-top-3 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navigation Bar */}
      <header className="bg-ink-midnight text-white border-b border-white/10 sticky top-0 z-40 shadow-md">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-headline text-lg sm:text-xl font-bold tracking-tight text-white hover:text-red-400 transition-colors">
                കേരളദേശം
              </span>
            </Link>
            <span className="h-4 w-[1px] bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-editorial-crimson" />
              <span className="font-bold text-white hidden sm:inline">എഡിറ്റോറിയൽ കൺസോൾ</span>
              <span className="text-[10px] bg-editorial-crimson/90 px-2 py-0.5 rounded font-mono uppercase text-white font-bold">
                {user?.role === 'admin' ? 'CHIEF ADMIN' : 'STAFF EDITOR'}
              </span>
            </div>
          </div>

          {/* User profile & Actions */}
          <div className="flex items-center gap-3 text-xs">
            {/* View Reader Portal */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-colors border border-white/10 font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5 text-editorial-crimson" />
              <span>വാർത്താ പോർട്ടൽ കാണുക</span>
            </Link>

            {/* User profile pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={user?.name || 'User'}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30"
              />
              <span className="font-medium text-slate-200 hidden sm:inline">
                {user?.name}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="ലോഗ് ഔട്ട് ചെയ്യുക"
              className="p-1.5 rounded hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1400px] mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">പ്രസിദ്ധീകരിച്ച വാർത്തകൾ</p>
              <h3 className="text-2xl font-black text-ink-midnight mt-1 font-headline">{articles.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-primary rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">സജീവ ബ്രേക്കിംഗ്</p>
              <h3 className="text-2xl font-black text-editorial-crimson mt-1 font-headline">{breakingList.length}</h3>
            </div>
            <div className="p-3 bg-red-50 text-editorial-crimson rounded-xl">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ട്രെൻഡിംഗ് വാർത്തകൾ</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1 font-headline">
                {articles.filter((a) => a.trending).length}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">നിങ്ങളുടെ പദവി</p>
              <h3 className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {user?.role === 'admin' ? 'ചീഫ് അഡ്മിൻ' : 'സ്റ്റാഫ് എഡിറ്റർ'}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          {/* Tabs */}
          <div className="flex items-center flex-wrap gap-2">
            {/* TAB 1: UPLOAD NEWS STUDIO */}
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-editorial-crimson to-rose-700 text-white shadow-md shadow-red-500/25 ring-2 ring-red-400/40'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span>വാർത്ത അപ്‌ലോഡ് ചെയ്യുക (Publish News)</span>
            </button>

            {/* TAB 2: ARTICLES LIST */}
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'articles'
                  ? 'bg-ink-midnight text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>വാർത്തകൾ മാനേജ് ചെയ്യുക ({articles.length})</span>
            </button>

            {/* TAB 3: BREAKING NEWS */}
            <button
              onClick={() => setActiveTab('breaking')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'breaking'
                  ? 'bg-editorial-crimson text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>ബ്രേക്കിംഗ് ന്യൂസ് ({breakingList.length})</span>
            </button>
          </div>

          {/* Refresh Action */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={loadPortalData}
              title="റീഫ്രഷ്"
              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span>ഡാറ്റ റീഫ്രഷ്</span>
            </button>
          </div>
        </div>
        {activeTab === 'upload' && (
          <div className="flex flex-col gap-6">
            {/* Success Celebration Alert if an article was just published */}
            {lastPublished && (
              <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/40">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      ✓ തത്സമയം വെബ്‌സൈറ്റിൽ പ്രസിദ്ധീകരിച്ചു (LIVE ON FRONTEND)
                    </span>
                    <h3 className="font-headline text-lg sm:text-xl font-bold text-white mt-1.5 line-clamp-2">
                      {lastPublished.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      വിഭാഗം: <span className="font-bold text-white">{lastPublished.category}</span> • {lastPublished.district ? `ജില്ല: ${lastPublished.district} •` : ''} ഇപ്പോൾ തന്നെ വായനക്കാർക്ക് ലഭ്യമാണ്.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                  <Link
                    href="/"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-105"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>പ്രധാന പേജിൽ കാണുക (View on Home)</span>
                  </Link>

                  <Link
                    href={`/article/${lastPublished.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
                  >
                    <span>വാർത്താ പേജ് തുറക്കുക</span>
                  </Link>

                  <button
                    onClick={handleResetForm}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
                  >
                    + മറ്റൊരു വാർത്ത ചേർക്കുക
                  </button>
                </div>
              </div>
            )}

            {/* The Main 2-Column Upload Studio */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column (2 Cols): Rich Form Input */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-editorial-crimson text-white">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h2 className="font-headline text-xl font-bold text-ink-midnight">
                      പുതിയ വാർത്താ അപ്‌ലോഡർ (Latest News Upload Studio)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    ഇവിടെ നൽകുന്ന വാർത്തകൾ തത്സമയം കേരളദേശം ഡാറ്റാബേസിലും പ്രധാന പേജിലും (Home) കാറ്റഗറികളിലും പ്രസിദ്ധീകരിക്കപ്പെടും.
                  </p>
                </div>

                {modalFeedback && (
                  <div
                    className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                      modalFeedback.type === 'error'
                        ? 'bg-red-50 border border-red-300 text-red-700'
                        : 'bg-emerald-50 border border-emerald-300 text-emerald-700'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="font-medium">{modalFeedback.text}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitArticle} className="space-y-6 text-xs">
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800">
                        വാർത്താ തലക്കെട്ട് (News Headline) *
                      </label>
                      <span className="text-[11px] font-mono text-slate-400">
                        {formTitle.length} അക്ഷരങ്ങൾ
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="ഉദാ: വയനാട് തുരങ്കപാത നിർമാണത്തിന് കേന്ദ്ര പരിസ്ഥിതി അനുമതി ലഭിച്ചു; ടെൻഡർ നടപടികൾ വേഗത്തിലാക്കാൻ നിർദേശം..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm sm:text-base font-headline font-bold text-ink-midnight focus:outline-none focus:ring-2 focus:ring-editorial-crimson shadow-xs"
                    />
                    <p className="text-[11px] text-slate-500">
                      വായനക്കാരെ ആകർഷിക്കുന്ന കൃത്യമായ മലയാളം തലക്കെട്ട് നൽകുക.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      വിഭാഗം തിരഞ്ഞെടുക്കുക (Select Category) *
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORY_OPTIONS.map((cat) => {
                        const isSelected = formCategory === cat.name;
                        return (
                          <button
                            type="button"
                            key={cat.name}
                            onClick={() => {
                              setFormCategory(cat.name);
                              setFormCategoryColor(cat.color);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'text-white shadow-xs scale-105'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                            }`}
                            style={{
                              backgroundColor: isSelected ? cat.color : undefined,
                            }}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                            <span>{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      ജില്ല / പ്രദേശം (District or Region)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFormDistrict('')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          !formDistrict
                            ? 'bg-slate-800 text-white font-bold'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        സംസ്ഥാനം മുഴുവൻ
                      </button>
                      {KERALA_DISTRICTS.map((dist) => {
                        const isSelected = formDistrict === dist;
                        return (
                          <button
                            type="button"
                            key={dist}
                            onClick={() => setFormDistrict(dist)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-editorial-crimson text-white font-bold shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {dist}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setFormDistrict('പ്രവാസം / ഗൾഫ്')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          formDistrict === 'പ്രവാസം / ഗൾഫ്'
                            ? 'bg-blue-700 text-white font-bold shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        പ്രവാസം / ഗൾഫ്
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      വാർത്താ ആമുഖം (Lead Paragraph / Summary) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formLead}
                      onChange={(e) => setFormLead(e.target.value)}
                      placeholder="വാർത്തയുടെ സംഗ്രഹം 1-2 വാക്യങ്ങളിൽ ഇവിടെ നൽകുക (പ്രധാന പേജിലെ കാർഡുകളിൽ ഇത് തെളിഞ്ഞുനിൽക്കും)..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-editorial-crimson"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800">
                        വിശദമായ വാർത്താ വിവരണം (Full Article Paragraphs)
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormParagraphs([...formParagraphs, ''])}
                        className="text-xs text-editorial-crimson hover:underline font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>അടുത്ത ഖണ്ഡിക ചേർക്കുക</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formParagraphs.map((para, idx) => (
                        <div key={idx} className="relative">
                          <textarea
                            rows={3}
                            value={para}
                            onChange={(e) => {
                              const updated = [...formParagraphs];
                              updated[idx] = e.target.value;
                              setFormParagraphs(updated);
                            }}
                            placeholder={`ഖണ്ഡിക ${idx + 1} വിശദാംശങ്ങൾ...`}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-editorial-crimson"
                          />
                          {formParagraphs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setFormParagraphs(formParagraphs.filter((_, i) => i !== idx))}
                              className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-red-600 rounded bg-white/80 shadow-xs"
                              title="ഈ ഖണ്ഡിക ഒഴിവാക്കുക"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-bold text-slate-800">
                      പ്രധാന വാർത്താ ചിത്രം (Featured Photo)
                    </label>

                    {/* Presets Gallery */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 mb-2 block">
                        തയ്യാറാക്കിയ വാർത്താ ചിത്രങ്ങളിൽ നിന്ന് തിരഞ്ഞെടുക്കാം (1-Click Presets):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PHOTO_PRESETS.map((preset) => (
                          <div
                            key={preset.name}
                            onClick={() => {
                              setFormImageUrl(preset.url);
                              setFormImageCaption(preset.caption);
                              setFormCategory(preset.category);
                            }}
                            className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all hover:border-editorial-crimson bg-white flex flex-col gap-1 ${
                              formImageUrl === preset.url
                                ? 'border-editorial-crimson ring-2 ring-red-400/30'
                                : 'border-slate-200'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-14 object-cover rounded"
                            />
                            <span className="text-[10px] font-bold text-slate-800 truncate">
                              {preset.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Custom Image URL */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-slate-500 shrink-0" />
                        <input
                          type="url"
                          value={formImageUrl}
                          onChange={(e) => setFormImageUrl(e.target.value)}
                          placeholder="ചിത്രത്തിന്റെ URL നൽകുക (https://...)"
                          className="flex-1 bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-editorial-crimson"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          ചിത്രത്തിന്റെ അടിക്കുറിപ്പ് (Photo Caption)
                        </label>
                        <input
                          type="text"
                          value={formImageCaption}
                          onChange={(e) => setFormImageCaption(e.target.value)}
                          placeholder="ഉദാ: പദ്ധതി പ്രദേശത്തെ ആകാശ ദൃശ്യം"
                          className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          വായനാ സമയം (Read Time)
                        </label>
                        <input
                          type="text"
                          value={formReadTime}
                          onChange={(e) => setFormReadTime(e.target.value)}
                          placeholder="3 മിനിറ്റ് വായന"
                          className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50/50 rounded-xl border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-xs text-editorial-crimson block font-headline">
                        മുൻപേജ് മുൻഗണന (Frontpage Visibility & Alerts)
                      </span>
                      <span className="text-[11px] text-slate-600">
                        വാർത്ത പ്രധാന പേജിൽ ഏറ്റവും മുകളിലായി വരാൻ ക്രമീകരിക്കുക
                      </span>
                    </div>

                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                        <input
                          type="checkbox"
                          checked={formTrending}
                          onChange={(e) => setFormTrending(e.target.checked)}
                          className="w-4 h-4 text-editorial-crimson rounded"
                        />
                        <span>🔥 ട്രെൻഡിംഗ് വാർത്ത</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                        <input
                          type="checkbox"
                          checked={formBreaking}
                          onChange={(e) => setFormBreaking(e.target.checked)}
                          className="w-4 h-4 text-editorial-crimson rounded"
                        />
                        <span>🚨 ബ്രേക്കിംഗ് ടിക്ക്ർ (Add to Breaking Ribbon)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors"
                    >
                      റീസെറ്റ് ചെയ്യുക (Reset)
                    </button>

                    <button
                      type="submit"
                      disabled={submittingArticle}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-editorial-crimson via-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {submittingArticle ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>പ്രസിദ്ധീകരിക്കുന്നു...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>തത്സമയം പ്രസിദ്ധീകരിക്കുക (Publish Now to Frontend)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column (1 Col): Live Broadsheet Preview Card & Quick Actions */}
              <div className="space-y-5 sticky top-20">
                {/* Live Card Preview */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-editorial-crimson" />
                      ലൈവ് ഫ്രണ്ട് പേജ് പ്രിവ്യൂ (Live Reader Preview)
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                      തത്സമയം
                    </span>
                  </div>

                  {/* Card Simulation */}
                  <div className="bg-parchment-base/50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className="text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-xs"
                        style={{ backgroundColor: formCategoryColor || '#C8102E' }}
                      >
                        {formCategory}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {formDistrict || 'കേരളം'} • ഇപ്പോൾ
                      </span>
                    </div>

                    <h3 className="font-headline font-bold text-base sm:text-lg text-ink-midnight line-clamp-3 leading-snug">
                      {formTitle || 'ഇവിടെ നിങ്ങൾ നൽകുന്ന വാർത്താ തലക്കെട്ട് കാണാം...'}
                    </h3>

                    {formImageUrl && (
                      <div className="relative rounded-lg overflow-hidden aspect-video bg-slate-200">
                        <img
                          src={formImageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur">
                          {formReadTime}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                      {formLead || 'വാർത്തയുടെ ആമുഖം ഇവിടെ ദൃശ്യമാകും. വായനക്കാർക്ക് ആദ്യകാഴ്ചയിൽ തന്നെ പൂർണ്ണ വിവരങ്ങൾ ലഭ്യമാകും...'}
                    </p>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">
                        റിപ്പോർട്ടർ: {user?.name || 'കേരളദേശം ന്യൂസ് ഡെസ്ക്'}
                      </span>
                      <span className="text-primary font-bold">തുടർന്ന് വായിക്കുക →</span>
                    </div>
                  </div>

                  {/* Quick Action Box */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                    <span className="font-bold text-slate-800 block">
                      📌 എഡിറ്റർമാർ ശ്രദ്ധിക്കുക:
                    </span>
                    <p className="leading-relaxed text-[11px]">
                      ‘പ്രസിദ്ധീകരിക്കുക’ ക്ലിക്ക് ചെയ്യുമ്പോൾ തന്നെ വാർത്ത നേരിട്ട് MongoDB ഡാറ്റാബേസിൽ സേവ് ചെയ്യപ്പെടുകയും, വായനക്കാരുടെ ഹോംപേജിൽ തത്സമയം ഏറ്റവും മുകളിലായി എത്തുകയും ചെയ്യും.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col gap-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="വാർത്തകൾ തിരയുക..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                <span className="text-xs text-slate-500 font-semibold shrink-0">വിഭാഗം:</span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">എല്ലാ വിഭാഗങ്ങളും</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Articles Table */}
            {loadingData ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span>ഡാറ്റാബേസിൽ നിന്ന് വാർത്തകൾ ലഭ്യമാക്കുന്നു...</span>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
                <FileText className="w-8 h-8 text-slate-300" />
                <p>വാർത്തകളൊന്നും കണ്ടെത്താനായില്ല.</p>
                <button
                  onClick={handleOpenUploadTab}
                  className="text-xs font-bold text-editorial-crimson hover:underline"
                >
                  + പുതിയ വാർത്ത ചേർക്കുക
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3">വാർത്ത</th>
                      <th className="py-3 px-3">വിഭാഗം</th>
                      <th className="py-3 px-3">റിപ്പോർട്ടർ</th>
                      <th className="py-3 px-3">സമയം</th>
                      <th className="py-3 px-3 text-right">നടപടികൾ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredArticles.map((art) => (
                      <tr key={art.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3 px-3 max-w-md">
                          <div className="flex items-start gap-3">
                            <img
                              src={art.imageUrl}
                              alt={art.title}
                              className="w-14 h-11 object-cover rounded shrink-0 bg-slate-100 border border-slate-200"
                            />
                            <div>
                              <Link
                                href={`/article/${art.id}`}
                                target="_blank"
                                className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug"
                              >
                                {art.title}
                              </Link>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                {art.trending && (
                                  <span className="text-amber-600 font-bold flex items-center gap-0.5">
                                    <Flame className="w-3 h-3" /> ട്രെൻഡിംഗ്
                                  </span>
                                )}
                                <span>• {art.views} views</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                            style={{ backgroundColor: art.categoryColor || '#C8102E' }}
                          >
                            {art.category}
                          </span>
                          {art.district && (
                            <span className="block text-[10px] text-slate-400 mt-1">
                              📍 {art.district}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 block">
                            {art.author?.name || 'കേരളദേശം ഡെസ്ക്'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {art.author?.designation}
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap text-[11px] text-slate-500">
                          {art.timeAgo}
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/article/${art.id}`}
                              target="_blank"
                              title="വായനക്കാരന്റെ കാഴ്ചയിൽ കാണുക"
                              className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleOpenEdit(art)}
                              title="എഡിറ്റ് ചെയ്യുക"
                              className="p-1.5 rounded hover:bg-blue-100 text-blue-700 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteArticle(art.id, art.title)}
                              title="ഡിലീറ്റ് ചെയ്യുക"
                              className="p-1.5 rounded hover:bg-red-100 text-editorial-crimson transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'breaking' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col gap-6">
            {/* Quick Add Breaking Form */}
            <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl">
              <h4 className="font-bold text-sm text-editorial-crimson flex items-center gap-2 mb-2 font-headline">
                <Radio className="w-4 h-4 animate-pulse" />
                തത്സമയ ബ്രേക്കിംഗ് ന്യൂസ് ചേർക്കുക (Instant Ticker Broadcast)
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                ഇവിടെ നൽകുന്ന വാർത്താ തലക്കെട്ട് തത്സമയം വെബ്‌സൈറ്റിന്റെ ഏറ്റവും മുകളിലെ ചുവപ്പ് ടിക്കറിൽ സ്ക്രോൾ ചെയ്യപ്പെടും.
              </p>
              <form onSubmit={handleAddBreaking} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  value={newBreakingText}
                  onChange={(e) => setNewBreakingText(e.target.value)}
                  placeholder="ബ്രേക്കിംഗ് ന്യൂസ് തലക്കെട്ട് ഇവിടെ ടൈപ്പ് ചെയ്യുക..."
                  className="flex-1 bg-white border border-red-300 rounded-lg py-2 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-editorial-crimson"
                />
                <button
                  type="submit"
                  disabled={submittingBreaking}
                  className="px-4 py-2 rounded-lg bg-editorial-crimson hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 shrink-0 flex items-center gap-1.5 justify-center"
                >
                  {submittingBreaking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>ബ്രോഡ്കാസ്റ്റ് ചെയ്യുക</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Current Active Breaking Headlines */}
            <div>
              <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">
                നിലവിലെ ബ്രേക്കിംഗ് തലക്കെട്ടുകൾ ({breakingList.length})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {breakingList.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">നിലവിൽ ബ്രേക്കിംഗ് തലക്കെട്ടുകളൊന്നുമില്ല.</p>
                ) : (
                  breakingList.map((item) => (
                    <div
                      key={item._id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-editorial-crimson animate-ping shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 leading-snug">
                          {item.headline}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteBreaking(item._id)}
                        className="p-1.5 rounded hover:bg-red-100 text-editorial-crimson transition-colors shrink-0"
                        title="നീക്കം ചെയ്യുക"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-ink-midnight text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-editorial-crimson text-white">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline text-base font-bold text-white">
                    വാർത്ത തിരുത്തുക (Edit Article)
                  </h3>
                  <span className="text-[11px] text-slate-300">
                    ഡാറ്റാബേസിൽ തത്സമയം അപ്‌ഡേറ്റ് ചെയ്യപ്പെടും
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitArticle} className="p-6 overflow-y-auto space-y-5 text-xs">
              {modalFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    modalFeedback.type === 'error'
                      ? 'bg-red-50 border border-red-300 text-red-700'
                      : 'bg-emerald-50 border border-emerald-300 text-emerald-700'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalFeedback.text}</span>
                </div>
              )}

              {/* Title & Headline */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  വാർത്താ തലക്കെട്ട് (Title / Headline) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-headline font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-editorial-crimson"
                />
              </div>

              {/* Category & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    വിഭാഗം (Category) *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const sel = CATEGORY_OPTIONS.find((c) => c.name === e.target.value);
                      setFormCategory(e.target.value);
                      if (sel) setFormCategoryColor(sel.color);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-editorial-crimson"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ജില്ല (District / Region)
                  </label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-editorial-crimson"
                  >
                    <option value="">കേരളം (പൊതുവായത്)</option>
                    {KERALA_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                    <option value="പ്രവാസം / ഗൾഫ്">പ്രവാസം / ഗൾഫ്</option>
                  </select>
                </div>
              </div>

              {/* Lead Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  വാർത്താ ആമുഖം (Lead Paragraph) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formLead}
                  onChange={(e) => setFormLead(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-editorial-crimson"
                />
              </div>

              {/* Image URL & Caption */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ചിത്രത്തിന്റെ URL (Image URL)
                  </label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ചിത്രത്തിന്റെ അടിക്കുറിപ്പ് (Caption)
                  </label>
                  <input
                    type="text"
                    value={formImageCaption}
                    onChange={(e) => setFormImageCaption(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Paragraphs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    വാർത്താ ഖണ്ഡികകൾ (Paragraphs)
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormParagraphs([...formParagraphs, ''])}
                    className="text-[11px] text-editorial-crimson hover:underline font-bold"
                  >
                    + ഖണ്ഡിക ചേർക്കുക
                  </button>
                </div>
                <div className="space-y-2">
                  {formParagraphs.map((para, idx) => (
                    <div key={idx} className="relative">
                      <textarea
                        rows={3}
                        value={para}
                        onChange={(e) => {
                          const updated = [...formParagraphs];
                          updated[idx] = e.target.value;
                          setFormParagraphs(updated);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 leading-relaxed"
                      />
                      {formParagraphs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFormParagraphs(formParagraphs.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold text-xs"
                >
                  റദ്ദാക്കുക
                </button>
                <button
                  type="submit"
                  disabled={submittingArticle}
                  className="px-5 py-2 rounded-lg bg-editorial-crimson hover:bg-red-700 text-white font-bold text-xs"
                >
                  {submittingArticle ? 'സേവ് ചെയ്യുന്നു...' : 'മാറ്റങ്ങൾ സൂക്ഷിക്കുക'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
