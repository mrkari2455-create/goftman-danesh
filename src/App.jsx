import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CATEGORIES = [
  { key: 'all', label: 'همه' },
  { key: 'engineering', label: 'علوم مهندسی' },
  { key: 'basic', label: 'علوم پایه' },
  { key: 'medical', label: 'علوم پزشکی' },
];

const ADMIN_PASSWORD = '1234';
const PAGE_SIZE = 6;

function getAparatEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/aparat\.com\/v\/([a-zA-Z0-9]+)/);
  if (match) {
    return `https://www.aparat.com/video/video/embed/videohash/${match[1]}/vt/frame`;
  }
  return null;
}

function getReadingTime(text) {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return minutes < 1 ? 1 : minutes;
}

function getExcerpt(text, maxLength = 120) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

function getShareLinks(title, url) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  return {
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };
}

function App() {
  const [entries, setEntries] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntryId, setSelectedEntryId] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [form, setForm] = useState({
    id: null,
    title: '',
    content: '',
    category: 'engineering',
    image_url: '',
    video_url: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setEntries(data || []);
    setLoading(false);
  }

  const filteredEntries =
    activeCategory === 'all'
      ? entries
      : entries.filter((e) => e.category === activeCategory);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const pagedEntries = filteredEntries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function goToCategory(key) {
    setActiveCategory(key);
    setCurrentPage(1);
    setSelectedEntryId(null);
  }

  function openEntry(id) {
    setSelectedEntryId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeEntry() {
    setSelectedEntryId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToPage(page) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAdminLogin() {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginError('');
      setPasswordInput('');
    } else {
      setLoginError('رمز اشتباه است');
    }
  }

  async function handleImageUpload(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('article-images')
      .upload(fileName, file);
    if (error) {
      alert('خطا در آپلود عکس: ' + error.message);
      return null;
    }
    const { data } = supabase.storage
      .from('article-images')
      .getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);

    let imageUrl = form.image_url;
    if (imageFile) {
      const uploadedUrl = await handleImageUpload(imageFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const payload = {
      title: form.title,
      content: form.content,
      category: form.category,
      image_url: imageUrl,
      video_url: form.video_url,
    };

    let error;
    if (form.id) {
      ({ error } = await supabase.from('entries').update(payload).eq('id', form.id));
    } else {
      ({ error } = await supabase.from('entries').insert(payload));
    }

    if (error) {
      alert('خطا: ' + error.message);
    } else {
      resetForm();
      fetchEntries();
    }
    setUploading(false);
  }

  function resetForm() {
    setForm({ id: null, title: '', content: '', category: 'engineering', image_url: '', video_url: '' });
    setImageFile(null);
  }

  function startEdit(entry) {
    setForm({
      id: entry.id,
      title: entry.title || '',
      content: entry.content || '',
      category: entry.category
