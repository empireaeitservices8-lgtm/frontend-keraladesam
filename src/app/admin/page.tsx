'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Plus,
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
  Send,
  Check,
  ChevronDown,
  ChevronUp,
  PlaySquare,
  Video,
  Star,
  Mail,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Article, VideoItem, KERALA_DISTRICTS } from '@/data/newsData';
import {
  getRealArticles,
  adminCreateArticle,
  adminUpdateArticle,
  adminDeleteArticle,
  adminToggleHeadline,
  adminGetRawBreaking,
  adminCreateBreaking,
  adminUpdateBreaking,
  adminDeleteBreaking,
  getRealVideos,
  adminCreateVideo,
  adminDeleteVideo,
  adminGetSubscribers,
  adminDeleteSubscriber,
  SubscriberItem,
  clearApiCache,
} from '@/lib/api';

interface CategoryGroup {
  id: string;
  name: string;
  color: string;
  subcategories: string[];
}

const ADMIN_CATEGORIES: CategoryGroup[] = [
  {
    id: 'kerala',
    name: 'KERALA',
    color: '#C8102E',
    subcategories: [
      'പൊതുവായത് (General)',
      'വികസനം & അടിസ്ഥാനസൗകര്യം',
      'ഭരണം & സെക്രട്ടേറിയറ്റ്',
      'ക്രമസമാധാനം & പോലീസ്',
      'വിദ്യാഭ്യാസം & തൊഴിൽ',
      'കാലാവസ്ഥ & ദുരന്തനിവാരണം',
      'ആരോഗ്യം',
      'കൃഷി & പരിസ്ഥിതി',
    ],
  },
  {
    id: 'international',
    name: 'INTERNATIONAL',
    color: '#C8102E',
    subcategories: [
      'ഗൾഫ് / പ്രവാസം',
      'ആഗോള രാഷ്ട്രീയം',
      'അമേരിക്ക & യൂറോപ്പ്',
      'പശ്ചിമേഷ്യ',
      'ഏഷ്യൻ വാർത്തകൾ',
    ],
  },
  {
    id: 'politics',
    name: 'POLITICS',
    color: '#006b9a',
    subcategories: [
      'ഭരണം & നിയമസഭ',
      'തെരഞ്ഞെടുപ്പ് വിശേഷങ്ങൾ',
      'മുന്നണി രാഷ്ട്രീയം',
      'ദേശീയ രാഷ്ട്രീയം',
      'പാർലമെന്റ് വാർത്തകൾ',
    ],
  },
  {
    id: 'special',
    name: 'SPECIAL REPORTS',
    color: '#991b1b',
    subcategories: [
      'അന്വേഷണാത്മക റിപ്പോർട്ട്',
      'പ്രത്യേക ഫീച്ചർ',
      'സമഗ്ര വിശകലനം',
      'മുഖാമുഖം / അഭിമുഖം',
    ],
  },
  {
    id: 'business',
    name: 'BUSINESS',
    color: '#005277',
    subcategories: [
      'സ്വർണ്ണവില & വിപണി',
      'ബാങ്കിംഗ് & ധനകാര്യം',
      'വ്യവസായം & വാണിജ്യം',
      'സ്റ്റാർട്ടപ്പ് & ഐ.ടി',
      'സമ്പദ്‌വ്യവസ്ഥ',
    ],
  },
  {
    id: 'cinema',
    name: 'CINEMA',
    color: '#B45309',
    subcategories: [
      'പുതിയ റിലീസുകൾ & റിവ്യൂ',
      'ബോക്സ് ഓഫീസ് റിപ്പോർട്ട്',
      'സിനിമാ വാർത്തകൾ & ഗോസിപ്പ്',
      'ഒ.ടി.ടി & വിനോദം',
      'താര അഭിമുഖങ്ങൾ',
    ],
  },
  {
    id: 'sports',
    name: 'SPORTS',
    color: '#059669',
    subcategories: [
      'ക്രിക്കറ്റ്',
      'ഫുട്ബോൾ',
      'അത്‌ലറ്റിക്സ്',
      'പ്രാദേശിക കായികമേളകൾ',
    ],
  },
];

type TabType = 'upload' | 'articles' | 'breaking' | 'videos' | 'subscribers';

export default function AdminPortalPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAdminAuth();

  const [articles, setArticles] = useState<Article[]>([]);
  const [breakingList, setBreakingList] = useState<Array<{ _id: string; headline: string; active: boolean }>>([]);
  const [videosList, setVideosList] = useState<VideoItem[]>([]);
  const [subscribersList, setSubscribersList] = useState<SubscriberItem[]>([]);
  const [subscribersSearch, setSubscribersSearch] = useState('');
  const [copiedSubscribers, setCopiedSubscribers] = useState(false);
  const [deletingSubscriberId, setDeletingSubscriberId] = useState<string | null>(null);
  const [refreshingSubscribers, setRefreshingSubscribers] = useState(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('upload');

  // Search & Filter in Manage tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modal State for Edit Article
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [submittingArticle, setSubmittingArticle] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Success Feedback Card for newly published article
  const [lastPublished, setLastPublished] = useState<Article | null>(null);

  // Hierarchical Article Category State - Main Category -> Corresponding Subcategory only
  const [customCategories, setCustomCategories] = useState<CategoryGroup[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#C8102E');
  const [newCatSubcategories, setNewCatSubcategories] = useState('');
  const [isCustomSubcategory, setIsCustomSubcategory] = useState(false);
  const [customSubcategoryText, setCustomSubcategoryText] = useState('');

  const [formTitle, setFormTitle] = useState('');
  const [formMainCategory, setFormMainCategory] = useState(ADMIN_CATEGORIES[0].name);
  const [formSubCategory, setFormSubCategory] = useState(ADMIN_CATEGORIES[0].subcategories[0]);
  const [formCategoryColor, setFormCategoryColor] = useState(ADMIN_CATEGORIES[0].color);
  const [formDistrict, setFormDistrict] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCustomLead, setFormCustomLead] = useState('');
  const [showLeadAccordion, setShowLeadAccordion] = useState(false);

  // Image Upload or URL State
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState('');
  const [formImageCaption, setFormImageCaption] = useState('');

  // Frontpage & Ribbon Options
  const [formHeadline, setFormHeadline] = useState(false);
  const [formTrending, setFormTrending] = useState(false);
  const [formBreaking, setFormBreaking] = useState(false);

  // Clean Video Form State - Essential inputs only
  const [formVideoTitle, setFormVideoTitle] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formVideoThumbnail, setFormVideoThumbnail] = useState('');
  const [formVideoThumbnailFile, setFormVideoThumbnailFile] = useState<File | null>(null);
  const [formVideoThumbnailPreview, setFormVideoThumbnailPreview] = useState('');
  const [submittingVideo, setSubmittingVideo] = useState(false);

  // Breaking news quick input
  const [newBreakingText, setNewBreakingText] = useState('');
  const [submittingBreaking, setSubmittingBreaking] = useState(false);
  const [editingBreakingId, setEditingBreakingId] = useState<string | null>(null);
  const [editingBreakingText, setEditingBreakingText] = useState('');

  // Global Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth Redirect guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  // Load articles, breaking news, videos, and subscribers
  const loadPortalData = async () => {
    try {
      setLoadingData(true);
      const [artList, brkList, vidList, subRes] = await Promise.all([
        getRealArticles({ limit: 100 }),
        adminGetRawBreaking(),
        getRealVideos({ limit: 100 }),
        adminGetSubscribers(token || undefined),
      ]);
      setArticles(artList);
      setBreakingList(brkList);
      setVideosList(vidList);
      if (subRes && subRes.success) {
        setSubscribersList(subRes.subscribers);
      }
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const loadSubscribersData = async () => {
    try {
      setRefreshingSubscribers(true);
      const subRes = await adminGetSubscribers(token || undefined);
      if (subRes && subRes.success) {
        setSubscribersList(subRes.subscribers);
      }
    } catch (err) {
      console.error('Failed to load subscribers:', err);
    } finally {
      setRefreshingSubscribers(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPortalData();
    }
  }, [isAuthenticated, token]);

  // Auto reload subscribers when opening subscribers tab
  useEffect(() => {
    if (activeTab === 'subscribers') {
      loadSubscribersData();
    }
  }, [activeTab]);

  // Load custom categories from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('keraladesam_custom_categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCustomCategories(parsed);
        }
      }
    } catch {}
  }, []);

  // Combined categories list (System default + Admin custom created)
  const allCategories = useMemo(() => {
    return [...ADMIN_CATEGORIES, ...customCategories];
  }, [customCategories]);

  // Active subcategories based strictly on the selected Main Category
  const activeSubcategories = useMemo(() => {
    const group = allCategories.find((c) => c.name === formMainCategory);
    return group && group.subcategories && group.subcategories.length > 0
      ? group.subcategories
      : ['പൊതുവായത് (General)'];
  }, [allCategories, formMainCategory]);

  const handleCreateCustomCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      alert('ദയവായി പുതിയ കാറ്റഗറിയുടെ പേര് നൽകുക.');
      return;
    }

    const exists = allCategories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showToast('ഈ കാറ്റഗറി ഇതിനകം ലഭ്യമാണ്!', 'warning');
      setFormMainCategory(trimmed);
      setShowAddCategoryModal(false);
      return;
    }

    const subList = newCatSubcategories.trim()
      ? newCatSubcategories.split(',').map((s) => s.trim()).filter(Boolean)
      : ['പൊതുവായത് (General)'];

    if (!subList.includes('പൊതുവായത് (General)')) {
      subList.unshift('പൊതുവായത് (General)');
    }

    const newGroup: CategoryGroup = {
      id: `custom-${Date.now()}`,
      name: trimmed,
      color: newCatColor || '#C8102E',
      subcategories: subList,
    };

    const updated = [...customCategories, newGroup];
    setCustomCategories(updated);
    try {
      localStorage.setItem('keraladesyam_custom_categories', JSON.stringify(updated));
    } catch {}

    setFormMainCategory(newGroup.name);
    setFormCategoryColor(newGroup.color);
    setFormSubCategory(newGroup.subcategories[0]);
    setIsCustomSubcategory(false);
    setCustomSubcategoryText('');
    setNewCatName('');
    setNewCatSubcategories('');
    setShowAddCategoryModal(false);
    showToast(`പുതിയ കാറ്റഗറി '${trimmed}' വിജയകരമായി ചേർത്തു!`, 'success');
  };

  // Reset Form for Creating New Article - completely clean
  const handleResetForm = () => {
    setEditingArticleId(null);
    setFormTitle('');
    setFormMainCategory(ADMIN_CATEGORIES[0].name);
    setFormSubCategory(ADMIN_CATEGORIES[0].subcategories[0]);
    setFormCategoryColor(ADMIN_CATEGORIES[0].color);
    setIsCustomSubcategory(false);
    setCustomSubcategoryText('');
    setShowAddCategoryModal(false);
    setFormDistrict('');
    setFormContent('');
    setFormCustomLead('');
    setShowLeadAccordion(false);
    setFormImageUrl('');
    setFormImageFile(null);
    setFormImagePreview('');
    setFormImageCaption('');
    setFormHeadline(false);
    setFormTrending(false);
    setFormBreaking(false);
    setModalFeedback(null);
    setLastPublished(null);
  };

  // Open Modal for Editing an Existing Article
  const handleOpenEdit = (art: Article) => {
    setEditingArticleId(art._id || art.id);
    setFormTitle(art.title);

    let foundGroup = allCategories.find((g) => g.name.toLowerCase() === (art.category || '').toLowerCase());
    let foundSub = 'പൊതുവായത് (General)';
    if (foundGroup) {
      foundSub = foundGroup.subcategories[0] || 'പൊതുവായത് (General)';
    } else {
      for (const g of allCategories) {
        const subMatch = g.subcategories.find((s) =>
          (art.category || '').toLowerCase().includes(s.toLowerCase().replace(/\s*\(.*?\)/, ''))
        );
        if (subMatch) {
          foundGroup = g;
          foundSub = subMatch;
          break;
        }
      }
    }
    if (!foundGroup) {
      const customName = art.category || 'KERALA';
      foundGroup = {
        id: `auto-${Date.now()}`,
        name: customName,
        color: art.categoryColor || '#C8102E',
        subcategories: ['പൊതുവായത് (General)'],
      };
      foundSub = 'പൊതുവായത് (General)';
    }
    setFormMainCategory(foundGroup.name);
    setFormSubCategory(foundSub);
    setFormCategoryColor(art.categoryColor || foundGroup.color);
    setIsCustomSubcategory(false);
    setCustomSubcategoryText('');
    setShowAddCategoryModal(false);

    setFormDistrict(art.district || '');
    setFormContent(art.paragraphs?.join('\n\n') || art.lead || '');
    setFormCustomLead(art.lead || '');
    setShowLeadAccordion(Boolean(art.lead));
    setFormImageUrl(art.imageUrl || '');
    setFormImageFile(null);
    setFormImagePreview(art.imageUrl || '');
    setFormImageCaption(art.imageCaption || '');
    setFormHeadline(Boolean(art.isHeadline));
    setFormTrending(Boolean(art.trending));
    setFormBreaking(Boolean(art.breaking));
    setModalFeedback(null);
    setIsModalOpen(true);
  };

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFormImagePreview(dataUrl);
      setFormImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Remove chosen image
  const handleRemoveImage = () => {
    setFormImageFile(null);
    setFormImagePreview('');
    setFormImageUrl('');
    setFormImageCaption('');
  };

  // Handle smart paste into content textarea (strips website copy-protection watermarks)
  const handleContentPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasteData = e.clipboardData.getData('text');
    if (!pasteData) return;

    // Detect Mathrubhumi / Manorama / News copy-protection watermarks
    if (/read more at:\s*https?:\/\//i.test(pasteData)) {
      showToast(
        'ശ്രദ്ധിക്കുക: ന്യൂസ് വെബ്‌സൈറ്റിലെ കോപ്പി-നിയന്ത്രണം കാരണം ടെക്സ്റ്റ് ഭാഗികമായിട്ടാണ് ലഭിച്ചത്. വാട്ടർമാർക്ക് ഓട്ടോമാറ്റിക്കായി നീക്കം ചെയ്തു.',
        'warning'
      );
      const cleaned = pasteData.replace(/\.\.\.\s*read more at:\s*https?:\/\/\S+/i, '').trim();
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const newVal = val.substring(0, start) + cleaned + val.substring(end);
      setFormContent(newVal);
    }
  };

  // Submit Article (Create or Update)
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setModalFeedback({ type: 'error', text: 'ലോഗിൻ സെഷൻ ലഭ്യമല്ല. ദയവായി വീണ്ടും ലോഗിൻ ചെയ്യുക.' });
      return;
    }

    if (!formTitle.trim()) {
      setModalFeedback({ type: 'error', text: 'വാർത്താ തലക്കെട്ട് നൽകുക.' });
      return;
    }

    if (!formContent.trim()) {
      setModalFeedback({ type: 'error', text: 'വാർത്തയുടെ ഉള്ളടക്കം (News Content) നൽകുക.' });
      return;
    }

    setSubmittingArticle(true);
    setModalFeedback(null);

    // Parse paragraphs cleanly from content
    const paragraphs = formContent
      .split(/\r?\n\s*\r?\n|\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    // Auto-generate card summary lead from first paragraph if not custom
    const lead = formCustomLead.trim() || (paragraphs[0] ? paragraphs[0].slice(0, 250) : formTitle.trim());

    // Approximate read time based on word count
    const totalWords = formContent.trim().split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(totalWords / 90));
    const readTime = `${readTimeMinutes} മിനിറ്റ് വായന`;

    const subCategoryName = isCustomSubcategory && customSubcategoryText.trim()
      ? customSubcategoryText.trim()
      : formSubCategory.replace(/\s*\(.*?\)/, '').trim();
    const categoryToSave = formSubCategory.startsWith('പൊതുവായത്') || !subCategoryName ? formMainCategory : subCategoryName;

    const payload: Partial<Article> = {
      title: formTitle.trim(),
      lead,
      category: categoryToSave,
      categoryColor: formCategoryColor,
      district: formDistrict.trim() || undefined,
      tags: [formMainCategory, subCategoryName].filter(Boolean),
      imageUrl: formImageUrl.trim() || '',
      imageCaption: formImageCaption.trim(),
      readTime,
      paragraphs: paragraphs.length > 0 ? paragraphs : [lead],
      isHeadline: formHeadline,
      trending: formTrending,
      breaking: formBreaking,
    };

    try {
      let result;
      if (editingArticleId) {
        result = await adminUpdateArticle(editingArticleId, payload, token, formImageFile || undefined);
      } else {
        result = await adminCreateArticle(payload, token, formImageFile || undefined);
      }

      if (result.success && result.article) {
        showToast(
          editingArticleId
            ? 'വാർത്ത വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു!'
            : 'വാർത്ത വിജയകരമായി തത്സമയം പ്രസിദ്ധീകരിച്ചു!'
        );

        // Auto-add to breaking ribbon if checked
        if (formBreaking) {
          try {
            await adminCreateBreaking(formTitle.trim(), token);
            clearApiCache();
            window.dispatchEvent(new CustomEvent('keraladesyam_breaking_updated'));
            try {
              localStorage.setItem('keraladesyam_breaking_last_updated', Date.now().toString());
            } catch {}
          } catch (e) {
            console.error('Breaking ticker auto-add error:', e);
          }
        }

        clearApiCache();
        if (editingArticleId) {
          setArticles((prev) =>
            prev.map((a) => (a.id === editingArticleId || a._id === editingArticleId ? result.article! : a))
          );
        } else {
          setArticles((prev) => [result.article!, ...prev]);
        }

        // Real-time broadcast for notification & breaking updates across all open tabs
        window.dispatchEvent(new CustomEvent('keraladesyam_articles_updated'));
        try {
          localStorage.setItem('keraladesyam_articles_last_updated', Date.now().toString());
        } catch {}

        setLastPublished(result.article);
        setIsModalOpen(false);
        handleResetForm();
        await loadPortalData();
        window.scrollTo({ top: 100, behavior: 'smooth' });
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
        clearApiCache();
        showToast('വാർത്ത ഡാറ്റാബേസിൽ നിന്ന് നീക്കം ചെയ്തു.');
        setArticles((prev) => prev.filter((a) => a.id !== id && a._id !== id));
        window.dispatchEvent(new CustomEvent('keraladesyam_articles_updated'));
        try {
          localStorage.setItem('keraladesyam_articles_last_updated', Date.now().toString());
        } catch {}
      } else {
        showToast(res.error || 'വാർത്ത നീക്കം ചെയ്യാൻ കഴിഞ്ഞില്ല.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Delete error', 'error');
    }
  };

  // Toggle Main Headline
  const handleToggleHeadline = async (art: Article) => {
    if (!token) return;
    const targetStatus = !art.isHeadline;
    const res = await adminToggleHeadline(art.id, token);
    if (res.success) {
      clearApiCache();
      showToast(
        targetStatus
          ? 'പ്രധാന വാർത്തയായി (Main Headline) പിൻ ചെയ്തു!'
          : 'പ്രധാന വാർത്താ പദവിയിൽ നിന്ന് മാറ്റി.'
      );
      setArticles((prev) =>
        prev.map((a) => ({
          ...a,
          isHeadline: a.id === art.id ? targetStatus : false,
        }))
      );
      window.dispatchEvent(new CustomEvent('keraladesyam_articles_updated'));
      try {
        localStorage.setItem('keraladesyam_articles_last_updated', Date.now().toString());
      } catch {}
      await loadPortalData();
    } else {
      showToast(res.error || 'പ്രധാന വാർത്ത മാറ്റാൻ കഴിഞ്ഞില്ല.', 'error');
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
      clearApiCache();
      showToast('ബ്രേക്കിംഗ് ന്യൂസ് ടിക്കറിൽ ചേർത്തു!');
      setNewBreakingText('');
      const updated = await adminGetRawBreaking();
      setBreakingList(updated);
      window.dispatchEvent(new CustomEvent('keraladesyam_breaking_updated'));
      try {
        localStorage.setItem('keraladesyam_breaking_last_updated', Date.now().toString());
      } catch {}
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
        clearApiCache();
        showToast('ബ്രേക്കിംഗ് ന്യൂസ് നീക്കം ചെയ്തു.');
        setBreakingList((prev) => prev.filter((b) => b._id !== id));
        window.dispatchEvent(new CustomEvent('keraladesyam_breaking_updated'));
        try {
          localStorage.setItem('keraladesyam_breaking_last_updated', Date.now().toString());
        } catch {}
      }
    } catch (err) {
      console.error('Delete breaking error:', err);
    }
  };

  // Update Breaking News Headline
  const handleUpdateBreaking = async (id: string) => {
    if (!token || !editingBreakingText.trim()) return;
    try {
      const res = await adminUpdateBreaking(id, { headline: editingBreakingText.trim() }, token);
      if (res.success) {
        showToast('ബ്രേക്കിംഗ് ന്യൂസ് അപ്‌ഡേറ്റ് ചെയ്തു!');
        setEditingBreakingId(null);
        setEditingBreakingText('');
        const updated = await adminGetRawBreaking();
        setBreakingList(updated);
        window.dispatchEvent(new CustomEvent('keraladesyam_breaking_updated'));
        try {
          localStorage.setItem('keraladesyam_breaking_last_updated', Date.now().toString());
        } catch {}
      } else {
        alert(res.error || 'Failed to update breaking headline');
      }
    } catch (err) {
      console.error('Update breaking error:', err);
    }
  };

  // Toggle Breaking News Active Status
  const handleToggleActiveBreaking = async (id: string, currentActive: boolean) => {
    if (!token) return;
    try {
      const res = await adminUpdateBreaking(id, { active: !currentActive }, token);
      if (res.success) {
        showToast(!currentActive ? 'ടിക്കറിൽ സജീവമാക്കി' : 'ടിക്കറിൽ നിന്ന് മാറ്റി');
        const updated = await adminGetRawBreaking();
        setBreakingList(updated);
        window.dispatchEvent(new CustomEvent('keraladesyam_breaking_updated'));
        try {
          localStorage.setItem('keraladesyam_breaking_last_updated', Date.now().toString());
        } catch {}
      }
    } catch (err) {
      console.error('Toggle breaking error:', err);
    }
  };


  // Handle Video Thumbnail file change
  const handleVideoThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('ലഘുചിത്രം 10MB-യിൽ കുറവായിരിക്കണം.', 'warning');
        return;
      }
      setFormVideoThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormVideoThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Create Video
  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formVideoTitle.trim() || !formVideoUrl.trim()) {
      showToast('വീഡിയോ തലക്കെട്ടും ലിങ്കും നിർബന്ധമാണ്.', 'error');
      return;
    }
    try {
      setSubmittingVideo(true);
      const res = await adminCreateVideo(
        {
          title: formVideoTitle.trim(),
          category: 'KERALA',
          videoUrl: formVideoUrl.trim(),
          thumbnail: formVideoThumbnail.trim(),
        },
        token,
        formVideoThumbnailFile || undefined
      );

      if (res.success && res.video) {
        showToast('വീഡിയോ വിജയകരമായി പ്രസിദ്ധീകരിച്ചു!');
        setVideosList((prev) => [res.video!, ...prev]);
        setFormVideoTitle('');
        setFormVideoUrl('');
        setFormVideoThumbnail('');
        setFormVideoThumbnailFile(null);
        setFormVideoThumbnailPreview('');
      } else {
        showToast(res.error || 'വീഡിയോ അപ്‌ലോഡ് പരാജയപ്പെട്ടു', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'വീഡിയോ അപ്‌ലോഡ് പരാജയപ്പെട്ടു', 'error');
    } finally {
      setSubmittingVideo(false);
    }
  };

  // Delete Video
  const handleDeleteVideo = async (id: string) => {
    if (!token) return;
    if (!confirm('ഈ വീഡിയോ നീക്കം ചെയ്യണമെന്ന് ഉറപ്പാണോ?')) return;
    try {
      const res = await adminDeleteVideo(id, token);
      if (res.success) {
        showToast('വീഡിയോ നീക്കം ചെയ്തു.');
        setVideosList((prev) => prev.filter((v) => v.id !== id && v._id !== id));
      } else {
        showToast(res.error || 'വീഡിയോ നീക്കം ചെയ്യൽ പരാജയപ്പെട്ടു', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Delete video error', 'error');
    }
  };

  // Subscriber Handlers
  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`'${email}' എന്ന ഇമെയിൽ വരിക്കാരെ ലിസ്റ്റിൽ നിന്നും നീക്കം ചെയ്യണമെന്ന് ഉറപ്പാണോ?`)) return;
    try {
      setDeletingSubscriberId(id);
      const res = await adminDeleteSubscriber(id, token || undefined);
      if (res.success) {
        setSubscribersList((prev) => prev.filter((s) => s._id !== id));
        showToast('ഇമെയിൽ വിലാസം നീക്കം ചെയ്തു', 'success');
      } else {
        showToast(res.error || 'വരിക്കാരെ നീക്കം ചെയ്യാനായില്ല', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting subscriber', 'error');
    } finally {
      setDeletingSubscriberId(null);
    }
  };

  const handleCopyAllEmails = async () => {
    if (!subscribersList.length) return;
    const allEmails = subscribersList.map((s) => s.email).join(', ');
    try {
      await navigator.clipboard.writeText(allEmails);
      setCopiedSubscribers(true);
      showToast(`${subscribersList.length} ഇമെയിൽ വിലാസങ്ങൾ കോപ്പി ചെയ്തു!`, 'success');
      setTimeout(() => setCopiedSubscribers(false), 2500);
    } catch (err) {
      showToast('ഇമെയിൽ കോപ്പി ചെയ്യാൻ സാധിച്ചില്ല', 'error');
    }
  };

  const filteredSubscribers = useMemo(() => {
    if (!subscribersSearch.trim()) return subscribersList;
    const q = subscribersSearch.toLowerCase().trim();
    return subscribersList.filter((s) => s.email.toLowerCase().includes(q));
  }, [subscribersList, subscribersSearch]);

  // Filtered articles in management table
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchSearch =
        !searchQuery.trim() ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.lead.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (art.district && art.district.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategoryFilter === 'all' ||
        art.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase()) ||
        Boolean(art.tags?.some((t) => t.toLowerCase().includes(selectedCategoryFilter.toLowerCase())));

      return matchSearch && matchCategory;
    });
  }, [articles, searchQuery, selectedCategoryFilter]);

  // Derived live statistics from content
  const contentStats = useMemo(() => {
    const paras = formContent
      .split(/\r?\n\s*\r?\n|\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    const words = formContent.trim() ? formContent.trim().split(/\s+/).length : 0;
    const chars = formContent.length;
    return { parasCount: paras.length, words, chars };
  }, [formContent]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-3 p-4">
        <div className="p-4 rounded-2xl bg-editorial-crimson/15 border border-editorial-crimson/30 mb-2">
          <ShieldAlert className="w-10 h-10 text-editorial-crimson animate-pulse" />
        </div>
        <h2 className="font-headline text-lg font-bold">അഡ്മിൻ പ്രവേശനം പരിശോധിക്കുന്നു...</h2>
        <p className="text-xs text-slate-400">ലോഗിൻ ചെയ്യാതെ അഡ്മിൻ കൺസോൾ തുറക്കാൻ സാധിക്കില്ല.</p>
        <Loader2 className="w-6 h-6 animate-spin text-editorial-crimson mt-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-20">
      {/* Toast alert */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold transition-all ${
            toastMessage.type === 'error'
              ? 'bg-red-700 text-white'
              : toastMessage.type === 'warning'
              ? 'bg-amber-600 text-white'
              : 'bg-emerald-700 text-white'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-200" />
          ) : toastMessage.type === 'warning' ? (
            <AlertCircle className="w-4 h-4 text-amber-200" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Editorial Header */}
      <header className="bg-ink-midnight text-white border-b border-white/10 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="font-headline text-lg sm:text-xl font-bold tracking-tight text-white hover:text-red-400 transition-colors">
              കേരളദേശം
            </Link>
            <span className="h-4 w-[1px] bg-white/20" />
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-editorial-crimson shrink-0" />
              <span className="hidden sm:inline">വാർത്താ പാനൽ</span>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300 font-mono">CMS</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors font-medium text-xs"
              title="വെബ്‌സൈറ്റ് കാണുക"
            >
              <ExternalLink className="w-3.5 h-3.5 text-editorial-crimson shrink-0" />
              <span className="hidden md:inline">വെബ്‌സൈറ്റ് കാണുക</span>
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-white/10 text-slate-300">
              <span className="font-semibold text-white text-xs hidden sm:inline">{user?.name || 'Chief Editor'}</span>
              <span className="text-[10px] bg-editorial-crimson/90 px-2 py-0.5 rounded text-white font-mono uppercase font-bold">
                {user?.role === 'admin' ? 'ADMIN' : 'EDITOR'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="ലോഗ് ഔട്ട്"
              className="p-1.5 rounded hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Modern Tabs - Full-width 5-column balanced grid */}
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 w-full">
            <button
              onClick={() => setActiveTab('upload')}
              className={`h-11 sm:h-12 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 whitespace-nowrap shadow-xs ${
                activeTab === 'upload'
                  ? 'bg-editorial-crimson text-white shadow-sm ring-1 ring-editorial-crimson'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>പുതിയ വാർത്ത ചേർക്കുക</span>
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`h-11 sm:h-12 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 whitespace-nowrap shadow-xs ${
                activeTab === 'articles'
                  ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>വാർത്തകൾ</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'articles' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {articles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('breaking')}
              className={`h-11 sm:h-12 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 whitespace-nowrap shadow-xs ${
                activeTab === 'breaking'
                  ? 'bg-red-700 text-white shadow-sm ring-1 ring-red-700'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Radio className="w-4 h-4 shrink-0" />
              <span>ബ്രേക്കിംഗ് ന്യൂസ്</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'breaking' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {breakingList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`h-11 sm:h-12 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 whitespace-nowrap shadow-xs ${
                activeTab === 'videos'
                  ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-600'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <PlaySquare className="w-4 h-4 shrink-0" />
              <span>വീഡിയോകൾ</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'videos' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {videosList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('subscribers')}
              className={`col-span-2 sm:col-span-1 h-11 sm:h-12 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 whitespace-nowrap shadow-xs ${
                activeTab === 'subscribers'
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-600'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>ഇമെയിൽ വരിക്കാർ</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'subscribers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {subscribersList.length}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: WRITE & PUBLISH NEWS (Clean, distraction-free CMS) */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {/* Published Success Banner */}
            {lastPublished && (
              <div className="bg-emerald-900 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div>
                  <h4 className="font-bold text-sm text-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    വാർത്ത വിജയകരമായി പ്രസിദ്ധീകരിച്ചു!
                  </h4>
                  <p className="text-xs text-white/90 line-clamp-1 mt-0.5 font-headline font-semibold">
                    "{lastPublished.title}"
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/article/${lastPublished.id}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                  >
                    വാർത്ത കാണുക
                  </Link>
                  <button
                    onClick={() => setLastPublished(null)}
                    className="p-1.5 text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Main Article Editor Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-7">
              {modalFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 mb-5 ${
                    modalFeedback.type === 'error'
                      ? 'bg-red-50 border border-red-300 text-red-700 font-semibold'
                      : 'bg-emerald-50 border border-emerald-300 text-emerald-700'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalFeedback.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmitArticle} className="space-y-6">
                {/* 1. Headline */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    വാർത്താ തലക്കെട്ട് (News Headline) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="വാർത്താ തലക്കെട്ട് ഇവിടെ ടൈപ്പ് ചെയ്യുക..."
                    className="w-full bg-slate-50/70 border border-slate-300 rounded-xl p-3.5 text-sm sm:text-base font-headline font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-editorial-crimson focus:border-editorial-crimson leading-snug transition-all"
                  />
                </div>

                {/* 2. Category, Subcategory & District */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        പ്രധാന വിഭാഗം (Category) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryModal(!showAddCategoryModal)}
                        className="text-[11px] font-bold text-editorial-crimson hover:underline flex items-center gap-1 transition"
                        title="പുതിയ കസ്റ്റം കാറ്റഗറി ചേർക്കുക"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ പുതിയത്</span>
                      </button>
                    </div>
                    <select
                      value={formMainCategory}
                      onChange={(e) => {
                        const sel = e.target.value;
                        if (sel === '__ADD_NEW__') {
                          setShowAddCategoryModal(true);
                          return;
                        }
                        setFormMainCategory(sel);
                        const group = allCategories.find((c) => c.name === sel);
                        if (group) {
                          setFormCategoryColor(group.color);
                          setFormSubCategory(group.subcategories[0]);
                          setIsCustomSubcategory(false);
                          setCustomSubcategoryText('');
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-editorial-crimson transition"
                    >
                      <optgroup label="നിലവിലെ വിഭാഗങ്ങൾ (Default)">
                        {ADMIN_CATEGORIES.map((cat) => (
                          <option key={cat.name} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </optgroup>

                      {customCategories.length > 0 && (
                        <optgroup label="കസ്റ്റം വിഭാഗങ്ങൾ (Custom Created)">
                          {customCategories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              ★ {cat.name}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      <option value="__ADD_NEW__" className="text-editorial-crimson font-bold">
                        + പുതിയ കാറ്റഗറി ഉണ്ടാക്കുക...
                      </option>
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        ഉപവിഭാഗം (Sub Category) *
                      </label>
                      {isCustomSubcategory ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomSubcategory(false);
                            setCustomSubcategoryText('');
                          }}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
                        >
                          ഡ്രോപ്ഡൗൺ
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomSubcategory(true);
                            setCustomSubcategoryText('');
                          }}
                          className="text-[11px] font-bold text-editorial-crimson hover:underline"
                        >
                          + ടൈപ്പ് ചെയ്യുക
                        </button>
                      )}
                    </div>

                    {isCustomSubcategory ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={customSubcategoryText}
                          onChange={(e) => setCustomSubcategoryText(e.target.value)}
                          placeholder="കസ്റ്റം ഉപവിഭാഗം ടൈപ്പ് ചെയ്യുക..."
                          className="flex-1 bg-white border-2 border-editorial-crimson rounded-xl p-2 text-xs text-slate-900 font-medium focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomSubcategory(false);
                            setCustomSubcategoryText('');
                          }}
                          className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800 rounded-lg bg-slate-100 font-bold"
                          title="ഡ്രോപ്ഡൗണിലേക്ക് മടങ്ങുക"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <select
                        value={formSubCategory}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__CUSTOM_SUB__') {
                            setIsCustomSubcategory(true);
                            setCustomSubcategoryText('');
                          } else {
                            setFormSubCategory(val);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-editorial-crimson transition"
                      >
                        {activeSubcategories.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                        <option value="__CUSTOM_SUB__" className="text-editorial-crimson font-bold">
                          + പുതിയ ഉപവിഭാഗം ടൈപ്പ് ചെയ്യുക...
                        </option>
                      </select>
                    )}
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      ജില്ല / പ്രദേശം (District - ഓപ്ഷണൽ)
                    </label>
                    <select
                      value={formDistrict}
                      onChange={(e) => setFormDistrict(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-editorial-crimson"
                    >
                      <option value="">കേരളം (പൊതുവായത്)</option>
                      {KERALA_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                      <option value="പ്രവാസം / ഗൾഫ്">പ്രവാസം / ഗൾഫ്</option>
                      <option value="ദേശീയം">ദേശീയം</option>
                      <option value="അന്തർദേശീയം">അന്തർദേശീയം</option>
                    </select>
                  </div>
                </div>

                {/* Inline Quick Card for Creating New Custom Category */}
                {showAddCategoryModal && (
                  <div className="p-4 bg-gradient-to-r from-red-50/90 via-slate-50 to-red-50/60 rounded-xl border-2 border-dashed border-red-300 animate-in fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-ink-midnight flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-editorial-crimson" />
                        പുതിയ കസ്റ്റം കാറ്റഗറി സൃഷ്ടിക്കുക (Add Custom Category)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryModal(false)}
                        className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1"
                        title="ക്ലോസ് ചെയ്യുക"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          കാറ്റഗറിയുടെ പേര് *
                        </label>
                        <input
                          type="text"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="e.g. ടെക്നോളജി, പരിസ്ഥിതി, ആരോഗ്യം..."
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-editorial-crimson font-medium"
                          autoFocus
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          ഉപവിഭാഗങ്ങൾ (ഓപ്ഷണൽ - കോമ ഇട്ട് നൽകാം)
                        </label>
                        <input
                          type="text"
                          value={newCatSubcategories}
                          onChange={(e) => setNewCatSubcategories(e.target.value)}
                          placeholder="e.g. മൊബൈൽ, എ.ഐ, ഗാഡ്‌ജെറ്റ്"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-editorial-crimson"
                        />
                      </div>

                      <div className="sm:col-span-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCreateCustomCategory()}
                          className="flex-1 px-4 py-2 bg-editorial-crimson hover:bg-red-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>ചേർക്കുക</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddCategoryModal(false)}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs rounded-lg transition"
                        >
                          റദ്ദാക്കുക
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Featured Photo (Optional - Clean Upload or URL) */}
                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-slate-600" />
                      <label className="text-xs font-bold text-slate-800">
                        വാർത്താ ചിത്രം (Featured Photo)
                      </label>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                        ഓപ്ഷണൽ
                      </span>
                    </div>

                    {formImagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-xs text-red-600 hover:underline font-bold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>ചിത്രം ഒഴിവാക്കുക</span>
                      </button>
                    )}
                  </div>

                  {formImagePreview ? (
                    <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
                      <img
                        src={formImagePreview}
                        alt="Selected Photo"
                        className="w-24 h-16 object-cover rounded-md border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-emerald-700 font-bold block mb-1">
                          ✓ ചിത്രം ചേർത്തു
                        </span>
                        <input
                          type="text"
                          value={formImageCaption}
                          onChange={(e) => setFormImageCaption(e.target.value)}
                          placeholder="ചിത്രത്തിന്റെ അടിക്കുറിപ്പ് (Photo Caption - ഓപ്ഷണൽ)..."
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Option A: Direct File Upload */}
                      <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-editorial-crimson hover:bg-red-50/20 transition-all text-center">
                        <Upload className="w-4 h-4 text-editorial-crimson" />
                        <span className="text-xs font-semibold text-slate-700">
                          ഡിവൈസിൽ നിന്ന് ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      {/* Option B: Direct Image URL */}
                      <div className="flex items-center">
                        <input
                          type="url"
                          value={formImageUrl}
                          onChange={(e) => {
                            setFormImageUrl(e.target.value);
                            setFormImagePreview(e.target.value);
                          }}
                          placeholder="അല്ലെങ്കിൽ ഇമേജ് URL നൽകാം (https://...)"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-editorial-crimson"
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500">
                    ℹ️ ചിത്രം നൽകിയില്ലെങ്കിലും വാർത്ത സാധാരണപോലെ വെബ്‌സൈറ്റിൽ പ്രസിദ്ധീകരിക്കപ്പെടും.
                  </p>
                </div>

                {/* 4. Full Article Body (Spacious, unlimited copy-paste) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      വാർത്താ വിവരണം (Full Article Body / Content) *
                    </label>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                      {contentStats.parasCount} ഖണ്ഡികകൾ • {contentStats.words} വാക്കുകൾ
                    </span>
                  </div>

                  <textarea
                    rows={12}
                    required
                    value={formContent}
                    onPaste={handleContentPaste}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="വാർത്തയുടെ പൂർണ്ണ വിവരങ്ങൾ ഇവിടെ പേസ്റ്റ് ചെയ്യുക അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യുക...&#10;&#10;എത്ര വലിയ വാർത്തയും ഖണ്ഡികകളും ഇവിടെ നൽകാം (ക്യാരക്ടർ ലിമിറ്റില്ല)."
                    className="w-full bg-slate-50/70 border border-slate-300 rounded-xl p-4 text-xs sm:text-sm text-slate-900 leading-relaxed font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-editorial-crimson focus:border-editorial-crimson transition-all"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>💡 വാക്യങ്ങൾക്കിടയിലെ പുതിയ വരികൾ (Line breaks) തനിയെ അടുത്ത ഖണ്ഡികയായി മാറും.</span>
                    <span className="font-mono text-slate-400">{contentStats.chars} അക്ഷരങ്ങൾ</span>
                  </p>
                </div>

                {/* 5. Optional Custom Lead Summary Accordion */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowLeadAccordion(!showLeadAccordion)}
                    className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition"
                  >
                    <span>പ്രധാന പേജിലെ കാർഡ് ആമുഖം മാറ്റണോ? (Optional Custom Lead)</span>
                    {showLeadAccordion ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  {showLeadAccordion && (
                    <div className="p-4 bg-white border-t border-slate-200 space-y-2">
                      <p className="text-[11px] text-slate-500">
                        നൽകിയില്ലെങ്കിൽ വാർത്തയുടെ ആദ്യ ഖണ്ഡിക തനിയെ ഹോംപേജ് കാർഡിലെ ആമുഖമായി എടുക്കും.
                      </p>
                      <textarea
                        rows={2}
                        value={formCustomLead}
                        onChange={(e) => setFormCustomLead(e.target.value)}
                        placeholder="പ്രത്യേക ആമുഖം ആവശ്യമെങ്കിൽ മാത്രം ഇവിടെ 1-2 വാക്യത്തിൽ നൽകാം..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-editorial-crimson"
                      />
                    </div>
                  )}
                </div>

                {/* 6. Frontpage Options */}
                <div className="p-4 bg-red-50/50 rounded-xl border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-xs text-editorial-crimson block font-headline">
                      മുൻഗണനാ ക്രമീകരണങ്ങൾ
                    </span>
                    <span className="text-[11px] text-slate-600">
                      വാർത്തയ്ക്ക് പ്രത്യേക ശ്രദ്ധ ലഭിക്കാൻ താഴെയുള്ളവ തിരഞ്ഞെടുക്കാം
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900 text-xs bg-amber-100/70 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300 transition shadow-sm">
                      <input
                        type="checkbox"
                        checked={formHeadline}
                        onChange={(e) => setFormHeadline(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded accent-amber-600"
                      />
                      <span className="flex items-center gap-1">⭐ പ്രധാന വാർത്ത (Main Headline)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                      <input
                        type="checkbox"
                        checked={formTrending}
                        onChange={(e) => setFormTrending(e.target.checked)}
                        className="w-4 h-4 text-editorial-crimson rounded accent-editorial-crimson"
                      />
                      <span>🔥 ട്രെൻഡിംഗ്</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                      <input
                        type="checkbox"
                        checked={formBreaking}
                        onChange={(e) => setFormBreaking(e.target.checked)}
                        className="w-4 h-4 text-editorial-crimson rounded accent-editorial-crimson"
                      />
                      <span>🚨 ബ്രേക്കിംഗ് ടിക്കർ</span>
                    </label>
                  </div>
                </div>

                {/* 7. Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs transition text-center"
                  >
                    ശൂന്യമാക്കുക (Clear)
                  </button>

                  <button
                    type="submit"
                    disabled={submittingArticle}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-editorial-crimson via-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {submittingArticle ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>പ്രസിദ്ധീകരിക്കുന്നു...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>തത്സമയം പ്രസിദ്ധീകരിക്കുക (Publish News)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE ARTICLES */}
        {activeTab === 'articles' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col gap-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="തലക്കെട്ടോ ജില്ലയോ തിരയുക..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-500 font-semibold shrink-0">വിഭാഗം:</span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
                >
                  <option value="all">എല്ലാ വിഭാഗങ്ങളും</option>
                  {ADMIN_CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Articles List / Table */}
            {loadingData ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-editorial-crimson" />
                <span>വാർത്തകൾ ലോഡ് ചെയ്യുന്നു...</span>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
                <FileText className="w-8 h-8 text-slate-300" />
                <p>വാർത്തകളൊന്നും കണ്ടെത്താനായില്ല.</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="text-xs font-bold text-editorial-crimson hover:underline"
                >
                  + പുതിയ വാർത്ത എഴുതുക
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Cards View (Visible on small screens) */}
                <div className="sm:hidden divide-y divide-slate-100">
                  {filteredArticles.map((art) => (
                    <div key={art.id} className="py-3.5 space-y-2.5">
                      <div className="flex items-start gap-3">
                        {art.imageUrl ? (
                          <img
                            src={art.imageUrl}
                            alt={art.title}
                            className="w-16 h-14 object-cover rounded-lg shrink-0 bg-slate-100 border border-slate-200"
                          />
                        ) : (
                          <div className="w-16 h-14 rounded-lg shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                            NEWS
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/article/${art.id}`}
                            target="_blank"
                            className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug hover:text-editorial-crimson"
                          >
                            {art.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase"
                              style={{ backgroundColor: art.categoryColor || '#C8102E' }}
                            >
                              {art.category}
                            </span>
                            {art.district && (
                              <span className="text-[10px] text-slate-500">
                                📍 {art.district}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              • {art.timeAgo || art.publishedAt || 'ഇപ്പോൾ'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Actions Toolbar */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 text-xs">
                        <div className="flex items-center gap-1.5">
                          {art.isHeadline && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-600" /> പ്രധാന വാർത്ത
                            </span>
                          )}
                          {art.trending && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                              <Flame className="w-3 h-3 text-editorial-crimson" /> ട്രെൻഡിംഗ്
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            onClick={() => handleToggleHeadline(art)}
                            title={art.isHeadline ? 'പ്രധാന വാർത്ത ഒഴിവാക്കുക' : 'പ്രധാന വാർത്തയാക്കുക'}
                            className={`p-1.5 rounded transition ${
                              art.isHeadline
                                ? 'bg-amber-100 text-amber-700'
                                : 'hover:bg-amber-50 text-slate-400'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${art.isHeadline ? 'fill-amber-500 text-amber-600' : ''}`} />
                          </button>
                          <Link
                            href={`/article/${art.id}`}
                            target="_blank"
                            title="കാണുക"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(art)}
                            title="എഡിറ്റ് ചെയ്യുക"
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-700"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id, art.title)}
                            title="ഡിലീറ്റ് ചെയ്യുക"
                            className="p-1.5 rounded hover:bg-red-50 text-editorial-crimson"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Full Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">വാർത്ത</th>
                        <th className="py-3 px-4 w-40">വിഭാഗം</th>
                        <th className="py-3 px-4 w-40">റിപ്പോർട്ടർ</th>
                        <th className="py-3 px-4 w-36">തീയതി</th>
                        <th className="py-3 px-4 text-center w-36">നടപടികൾ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredArticles.map((art) => (
                        <tr key={art.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="py-3.5 px-4 max-w-md align-middle">
                            <div className="flex items-start gap-3">
                              {art.imageUrl ? (
                                <img
                                  src={art.imageUrl}
                                  alt={art.title}
                                  className="w-12 h-10 object-cover rounded shrink-0 bg-slate-100 border border-slate-200"
                                />
                              ) : (
                                <div className="w-12 h-10 rounded shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] text-slate-400 font-bold">
                                  NEWS
                                </div>
                              )}
                              <div>
                                <Link
                                  href={`/article/${art.id}`}
                                  target="_blank"
                                  className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug"
                                >
                                  {art.title}
                                </Link>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  {art.isHeadline && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wide text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded shadow-xs">
                                      <Star className="w-3 h-3 fill-amber-500 text-amber-600" /> പ്രധാന വാർത്ത
                                    </span>
                                  )}
                                  {art.trending && (
                                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                                      <Flame className="w-3 h-3" /> ട്രെൻഡിംഗ്
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold text-white inline-block"
                              style={{ backgroundColor: art.categoryColor || '#C8102E' }}
                            >
                              {art.category}
                            </span>
                            {art.district && (
                              <span className="block text-[10px] text-slate-500 mt-1">
                                📍 {art.district}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                            <span className="font-semibold text-slate-800 block text-xs">
                              {art.author?.name || 'കേരളദേശം ഡെസ്ക്'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-xs align-middle">
                            {art.timeAgo || art.publishedAt || 'ഇപ്പോൾ'}
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleToggleHeadline(art)}
                                title={
                                  art.isHeadline
                                    ? 'പ്രധാന വാർത്താ പദവി ഒഴിവാക്കുക'
                                    : 'പ്രധാന വാർത്തയായി സെറ്റ് ചെയ്യുക (Set as Main Headline)'
                                }
                                className={`p-1.5 rounded-lg transition ${
                                  art.isHeadline
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 ring-1 ring-amber-400'
                                    : 'hover:bg-amber-50 text-slate-400 hover:text-amber-600'
                                }`}
                              >
                                <Star className={`w-4 h-4 ${art.isHeadline ? 'fill-amber-500 text-amber-600' : ''}`} />
                              </button>

                              <Link
                                href={`/article/${art.id}`}
                                target="_blank"
                                title="സൈറ്റിൽ കാണുക"
                                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>

                              <button
                                onClick={() => handleOpenEdit(art)}
                                title="എഡിറ്റ് ചെയ്യുക"
                                className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-700 transition"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteArticle(art.id, art.title)}
                                title="ഡിലീറ്റ് ചെയ്യുക"
                                className="p-1.5 rounded-lg hover:bg-red-100 text-editorial-crimson transition"
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
              </>
            )}
          </div>
        )}

        {/* TAB 3: BREAKING NEWS TICKER */}
        {activeTab === 'breaking' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
            <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl">
              <h4 className="font-bold text-sm text-editorial-crimson flex items-center gap-2 mb-1.5 font-headline">
                <Radio className="w-4 h-4 animate-pulse" />
                തത്സമയ ബ്രേക്കിംഗ് ന്യൂസ് ചേർക്കുക (Breaking News Ticker)
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
                  placeholder="ബ്രേക്കിംഗ് ന്യൂസ് തലക്കെട്ട് ഇവിടെ നൽകുക..."
                  className="flex-1 bg-white border border-red-300 rounded-lg py-2 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-editorial-crimson"
                />
                <button
                  type="submit"
                  disabled={submittingBreaking}
                  className="px-5 py-2 rounded-lg bg-editorial-crimson hover:bg-red-700 text-white font-bold text-xs transition shadow-sm disabled:opacity-50 shrink-0 flex items-center gap-1.5 justify-center"
                >
                  {submittingBreaking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>ബ്രോഡ്കാസ്റ്റ് ചെയ്യുക</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">
                നിലവിലെ ബ്രേക്കിംഗ് തലക്കെട്ടുകൾ ({breakingList.length})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {breakingList.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">നിലവിൽ ബ്രേക്കിംഗ് വാർത്തകളൊന്നുമില്ല.</p>
                ) : (
                  breakingList.map((item) => (
                    <div
                      key={item._id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      {editingBreakingId === item._id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editingBreakingText}
                            onChange={(e) => setEditingBreakingText(e.target.value)}
                            className="flex-1 bg-white border border-editorial-crimson rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateBreaking(item._id)}
                            className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                            title="സേവ് ചെയ്യുക"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingBreakingId(null);
                              setEditingBreakingText('');
                            }}
                            className="p-1.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition"
                            title="റദ്ദാക്കുക"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => handleToggleActiveBreaking(item._id, item.active)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 transition ${
                                item.active
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                              title={item.active ? 'ടിക്കറിൽ നിന്ന് താൽക്കാലികമായി മാറ്റാൻ ക്ലിക്ക് ചെയ്യുക' : 'ടിക്കറിൽ സജീവമാക്കാൻ ക്ലിക്ക് ചെയ്യുക'}
                            >
                              {item.active ? 'ലൈവ്' : 'മാറ്റി'}
                            </button>
                            <span className={`text-xs font-semibold leading-snug truncate ${item.active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                              {item.headline}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setEditingBreakingId(item._id);
                                setEditingBreakingText(item.headline);
                              }}
                              className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition"
                              title="എഡിറ്റ് ചെയ്യുക"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBreaking(item._id)}
                              className="p-1.5 rounded hover:bg-red-100 text-editorial-crimson transition"
                              title="നീക്കം ചെയ്യുക"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VIDEO SHORTS STUDIO */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            {/* Upload Video Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <PlaySquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline text-base sm:text-lg font-bold text-slate-900">
                    പുതിയ വീഡിയോ ഷോർട്ട് ചേർക്കുക (Upload Video)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ഹോംപേജിൽ പ്രദർശിപ്പിക്കേണ്ട YouTube ഷോർട്ട്സ്, വീഡിയോ അല്ലെങ്കിൽ direct MP4 ലിങ്കുകൾ ചേർക്കുക.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateVideo} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    വീഡിയോ തലക്കെട്ട് (Video Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formVideoTitle}
                    onChange={(e) => setFormVideoTitle(e.target.value)}
                    placeholder="ഉദാ: വയനാട് തുരങ്കപാത: റൂട്ട് മാപ്പും 3D ദൃശ്യങ്ങളും..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    വീഡിയോ ലിങ്ക് (YouTube Shorts / Video URL / MP4) *
                  </label>
                  <input
                    type="url"
                    required
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... അല്ലെങ്കിൽ https://youtube.com/shorts/..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    💡 YouTube ലിങ്ക് നൽകുമ്പോൾ കവർ ചിത്രം (thumbnail) സ്വയമേവ ലഭ്യമാക്കും.
                  </p>
                </div>

                {/* Optional Custom Thumbnail */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="block text-xs font-bold text-slate-800 mb-1.5">
                    പ്രത്യേക ലഘുചിത്രം (Custom Thumbnail - ഓപ്ഷണൽ)
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2.5 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVideoThumbnailChange}
                      className="w-full sm:w-auto text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 hidden sm:inline">അല്ലെങ്കിൽ</span>
                    <input
                      type="url"
                      value={formVideoThumbnail}
                      onChange={(e) => setFormVideoThumbnail(e.target.value)}
                      placeholder="ചിത്രത്തിന്റെ വെബ് ലിങ്ക് (Image URL)"
                      className="w-full sm:flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {formVideoThumbnailPreview && (
                    <div className="mt-3 relative w-32 aspect-video rounded-lg overflow-hidden border border-slate-300 shadow-xs">
                      <img
                        src={formVideoThumbnailPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormVideoThumbnailFile(null);
                          setFormVideoThumbnailPreview('');
                        }}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingVideo}
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    {submittingVideo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>അപ്‌ലോഡ് ചെയ്യുന്നു...</span>
                      </>
                    ) : (
                      <>
                        <PlaySquare className="w-4 h-4" />
                        <span>വീഡിയോ പ്രസിദ്ധീകരിക്കുക (Publish Video)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* List Existing Videos */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-headline text-base sm:text-lg font-bold text-slate-900">
                    നിലവിലെ വീഡിയോകൾ (Active Videos - {videosList.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    ഹോംപേജിൽ തത്സമയം ലഭ്യമായിട്ടുള്ള എല്ലാ വീഡിയോകളുടെയും പട്ടിക.
                  </p>
                </div>
              </div>

              {loadingData ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                  <span>വീഡിയോകൾ ലോഡ് ചെയ്യുന്നു...</span>
                </div>
              ) : videosList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
                  <PlaySquare className="w-8 h-8 text-slate-300" />
                  <p>ഡാറ്റാബേസിൽ വീഡിയോകളൊന്നും ലഭ്യമല്ല. മുകളിൽ പുതിയ വീഡിയോ ചേർക്കുക.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {videosList.map((vid) => (
                    <div
                      key={vid.id || vid._id}
                      className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white flex flex-col shadow-xs hover:shadow-md transition"
                    >
                      {/* Thumbnail frame */}
                      <div className="relative aspect-[9/13] bg-neutral-900 overflow-hidden">
                        <img
                          src={vid.thumbnail}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                        {/* Duration badge */}
                        <span className="absolute top-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur">
                          {vid.duration}
                        </span>

                        {/* Title at bottom of thumbnail */}
                        <div className="absolute bottom-2 left-2 right-2 text-white">
                          <h4 className="text-xs font-bold line-clamp-2 leading-snug">
                            {vid.title}
                          </h4>
                          <span className="text-[10px] text-amber-300 mt-1 flex items-center gap-1 font-medium">
                            <Eye className="w-3 h-3" /> {vid.views}
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                        <a
                          href={vid.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-semibold text-slate-700 hover:text-amber-700 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> കാണുക
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteVideo(vid.id || vid._id || '')}
                          className="p-1 rounded text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                          title="വീഡിയോ നീക്കം ചെയ്യുക"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SUBSCRIBERS MANAGEMENT */}
        {activeTab === 'subscribers' && (
          <div className="space-y-4">
            {/* Top Info & Action Card */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-headline">
                    വാർത്താ വരിക്കാർ (Newsletter Subscribers)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    വെബ്‌സൈറ്റിന്റെ ഫൂട്ടർ ഫോമിലൂടെ രജിസ്റ്റർ ചെയ്ത വായനക്കാരുടെ ഇമെയിൽ ലിസ്റ്റ്.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={loadSubscribersData}
                  disabled={refreshingSubscribers}
                  className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-300 shadow-2xs"
                  title="ലിസ്റ്റ് റീഫ്രഷ് ചെയ്യുക"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingSubscribers ? 'animate-spin text-blue-600' : ''}`} />
                  <span>റീഫ്രഷ്</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyAllEmails}
                  disabled={!subscribersList.length}
                  className="h-10 flex-1 sm:flex-none px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm"
                >
                  {copiedSubscribers ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>കോപ്പി ചെയ്തു!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>എല്ലാ ഇമെയിലുകളും കോപ്പി ചെയ്യുക</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List & Search Container */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Search Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={subscribersSearch}
                    onChange={(e) => setSubscribersSearch(e.target.value)}
                    placeholder="ഇമെയിൽ വിലാസം തിരയുക..."
                    className="w-full pl-9 pr-8 h-10 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                  {subscribersSearch && (
                    <button
                      onClick={() => setSubscribersSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 self-end sm:self-center">
                  <span className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs flex items-center gap-1.5">
                    ആകെ വരിക്കാർ: <strong className="text-slate-900 font-bold font-mono text-sm">{subscribersList.length}</strong>
                  </span>
                  {subscribersSearch && (
                    <span className="h-10 px-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 font-semibold flex items-center gap-1">
                      ഫലം: <strong className="font-bold">{filteredSubscribers.length}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Table / Empty State */}
              {loadingData ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span>വരിക്കാരുടെ ലിസ്റ്റ് ലോഡ് ചെയ്യുന്നു...</span>
                </div>
              ) : filteredSubscribers.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">
                    {subscribersSearch ? 'തിരഞ്ഞ ഇമെയിൽ കണ്ടെത്താനായില്ല' : 'ഇതുവരെ വരിക്കാർ ആരും രജിസ്റ്റർ ചെയ്തിട്ടില്ല'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    {subscribersSearch
                      ? 'മറ്റൊരു ഇമെയിൽ നൽകി തിരഞ്ഞുനോക്കുക.'
                      : 'വെബ്‌സൈറ്റിന്റെ ഫൂട്ടറിലുള്ള ന്യൂസ്‌ലെറ്റർ ബോക്സ് വഴി വായനക്കാർ ഇമെയിൽ നൽകുമ്പോൾ അവ ഇവിടെ ദൃശ്യമാകും.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Subscribers Cards View */}
                  <div className="sm:hidden divide-y divide-slate-100 p-1">
                    {filteredSubscribers.map((sub, idx) => {
                      const dateStr = sub.createdAt
                        ? new Date(sub.createdAt).toLocaleDateString('ml-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'ലഭ്യമല്ല';

                      return (
                        <div key={sub._id} className="p-3 flex items-center justify-between gap-2.5">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className="text-slate-400 font-mono text-[11px] pt-0.5">#{idx + 1}</span>
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 select-all font-mono text-xs block truncate">
                                {sub.email}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                                <span>{dateStr}</span>
                                <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-emerald-700 font-bold">സജീവം</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={`mailto:${sub.email}`}
                              className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                              title="ഇമെയിൽ അയക്കുക"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubscriber(sub._id, sub.email)}
                              disabled={deletingSubscriberId === sub._id}
                              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                              title="ലിസ്റ്റിൽ നിന്ന് നീക്കം ചെയ്യുക"
                            >
                              {deletingSubscriberId === sub._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Full Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 w-16 text-center">#</th>
                          <th className="py-3 px-4 text-left">ഇമെയിൽ വിലാസം</th>
                          <th className="py-3 px-4 text-left w-56">രജിസ്റ്റർ ചെയ്ത തീയതി</th>
                          <th className="py-3 px-4 text-center w-36">അവസ്ഥ</th>
                          <th className="py-3 px-4 text-center w-28">നടപടി</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {filteredSubscribers.map((sub, idx) => {
                          const dateStr = sub.createdAt
                            ? new Date(sub.createdAt).toLocaleDateString('ml-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'ലഭ്യമല്ല';

                          return (
                            <tr key={sub._id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs align-middle">
                                {idx + 1}
                              </td>
                              <td className="py-3.5 px-4 text-left align-middle">
                                <span className="font-bold text-slate-900 select-all font-mono text-xs">
                                  {sub.email}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-left text-slate-600 text-xs align-middle font-medium">
                                {dateStr}
                              </td>
                              <td className="py-3.5 px-4 text-center align-middle">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  സജീവം (Active)
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center align-middle">
                                <div className="inline-flex items-center justify-center gap-1.5">
                                  <a
                                    href={`mailto:${sub.email}`}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                    title="ഇമെയിൽ അയക്കുക"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubscriber(sub._id, sub.email)}
                                    disabled={deletingSubscriberId === sub._id}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                    title="ലിസ്റ്റിൽ നിന്ന് നീക്കം ചെയ്യുക"
                                  >
                                    {deletingSubscriberId === sub._id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* EDIT ARTICLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-ink-midnight text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-editorial-crimson" />
                <h3 className="font-headline text-base font-bold text-white">
                  വാർത്ത തിരുത്തുക (Edit Article)
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  വാർത്താ തലക്കെട്ട് *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-headline font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-editorial-crimson"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      പ്രധാന വിഭാഗം *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(!showAddCategoryModal)}
                      className="text-[11px] font-bold text-editorial-crimson hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ പുതിയത്</span>
                    </button>
                  </div>
                  <select
                    value={formMainCategory}
                    onChange={(e) => {
                      const sel = e.target.value;
                      if (sel === '__ADD_NEW__') {
                        setShowAddCategoryModal(true);
                        return;
                      }
                      setFormMainCategory(sel);
                      const group = allCategories.find((c) => c.name === sel);
                      if (group) {
                        setFormCategoryColor(group.color);
                        setFormSubCategory(group.subcategories[0]);
                        setIsCustomSubcategory(false);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs text-slate-800 font-semibold"
                  >
                    <optgroup label="നിലവിലെ വിഭാഗങ്ങൾ (Default)">
                      {ADMIN_CATEGORIES.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </optgroup>

                    {customCategories.length > 0 && (
                      <optgroup label="കസ്റ്റം വിഭാഗങ്ങൾ (Custom Created)">
                        {customCategories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            ★ {cat.name}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    <option value="__ADD_NEW__" className="text-editorial-crimson font-bold">
                      + പുതിയ കാറ്റഗറി ഉണ്ടാക്കുക...
                    </option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      ഉപവിഭാഗം *
                    </label>
                    {isCustomSubcategory ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomSubcategory(false);
                          setCustomSubcategoryText('');
                        }}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
                      >
                        ഡ്രോപ്ഡൗൺ
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomSubcategory(true);
                          setCustomSubcategoryText('');
                        }}
                        className="text-[11px] font-bold text-editorial-crimson hover:underline"
                      >
                        + ടൈപ്പ് ചെയ്യുക
                      </button>
                    )}
                  </div>
                  {isCustomSubcategory ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={customSubcategoryText}
                        onChange={(e) => setCustomSubcategoryText(e.target.value)}
                        placeholder="കസ്റ്റം ഉപവിഭാഗം..."
                        className="flex-1 bg-white border-2 border-editorial-crimson rounded-lg p-1.5 text-xs text-slate-900 font-medium focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomSubcategory(false);
                          setCustomSubcategoryText('');
                        }}
                        className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded bg-slate-100 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formSubCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__CUSTOM_SUB__') {
                          setIsCustomSubcategory(true);
                          setCustomSubcategoryText('');
                        } else {
                          setFormSubCategory(val);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs text-slate-800"
                    >
                      {activeSubcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                      <option value="__CUSTOM_SUB__" className="text-editorial-crimson font-bold">
                        + പുതിയ ഉപവിഭാഗം ടൈപ്പ് ചെയ്യുക...
                      </option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ജില്ല / പ്രദേശം
                  </label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs text-slate-800"
                  >
                    <option value="">കേരളം (പൊതുവായത്)</option>
                    {KERALA_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                    <option value="പ്രവാസം / ഗൾഫ്">പ്രവാസം / ഗൾഫ്</option>
                    <option value="ദേശീയം">ദേശീയം</option>
                    <option value="അന്തർദേശീയം">അന്തർദേശീയം</option>
                  </select>
                </div>
              </div>

              {/* Image URL & Caption */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800">
                      ചിത്രത്തിന്റെ URL (ഓപ്ഷണൽ)
                    </label>
                    {formImageUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-[11px] text-red-600 hover:underline font-bold"
                      >
                        ചിത്രം നീക്കം ചെയ്യുക
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://... (ചിത്രമില്ലെങ്കിൽ ശൂന്യമായി വിടാം)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ചിത്രത്തിന്റെ അടിക്കുറിപ്പ്
                  </label>
                  <input
                    type="text"
                    value={formImageCaption}
                    onChange={(e) => setFormImageCaption(e.target.value)}
                    placeholder="അടിക്കുറിപ്പ്..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Full Article Content */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  വാർത്താ വിവരണം (Full Article Body) *
                </label>
                <textarea
                  rows={10}
                  required
                  value={formContent}
                  onPaste={handleContentPaste}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-800 leading-relaxed font-sans"
                />
              </div>

              {/* Frontpage Checkboxes */}
              <div className="flex items-center gap-5 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={formTrending}
                    onChange={(e) => setFormTrending(e.target.checked)}
                    className="w-4 h-4 text-editorial-crimson rounded accent-editorial-crimson"
                  />
                  <span>🔥 ട്രെൻഡിംഗ് വാർത്ത</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={formBreaking}
                    onChange={(e) => setFormBreaking(e.target.checked)}
                    className="w-4 h-4 text-editorial-crimson rounded accent-editorial-crimson"
                  />
                  <span>🚨 ബ്രേക്കിംഗ് ടിക്കർ</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  റദ്ദാക്കുക
                </button>
                <button
                  type="submit"
                  disabled={submittingArticle}
                  className="px-6 py-2 rounded-lg bg-editorial-crimson hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {submittingArticle ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>അപ്‌ഡേറ്റ് ചെയ്യുന്നു...</span>
                    </>
                  ) : (
                    <span>അപ്‌ഡേറ്റ് ചെയ്യുക</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
