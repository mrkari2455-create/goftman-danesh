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
      category: entry.category || 'engineering',
      image_url: entry.image_url || '',
      video_url: entry.video_url || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (!confirm('این مطلب حذف شود؟')) return;
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (error) alert('خطا در حذف: ' + error.message);
    else {
      if (selectedEntryId === id) setSelectedEntryId(null);
      fetchEntries();
    }
  }

  function renderEntryCard(entry, isFullView) {
    const readingTime = getReadingTime(entry.content);
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareLinks = getShareLinks(entry.title, pageUrl);

    const relatedEntries = entries
      .filter((e) => e.category === entry.category && e.id !== entry.id)
      .slice(0, 3);

    return (
      <article key={entry.id} className={`entry-card cat-${entry.category}`}>
        <div className="entry-meta">
          <span className="entry-category">
            {CATEGORIES.find((c) => c.key === entry.category)?.label || entry.category}
          </span>
          <span className="entry-reading-time">⏱ {readingTime} دقیقه مطالعه</span>
        </div>

        {isFullView ? (
          <h2>{entry.title}</h2>
        ) : (
          <h3
            className="entry-title-link"
            onClick={() => openEntry(entry.id)}
            role="button"
            tabIndex={0}
          >
            {entry.title}
          </h3>
        )}

        {!isFullView && <p className="entry-excerpt">{getExcerpt(entry.content)}</p>}

        {entry.image_url && (
          <img src={entry.image_url} alt={entry.title} className="entry-img" />
        )}
        {entry.video_url && getAparatEmbedUrl(entry.video_url) && (
          <div className="video-wrapper">
            <iframe
              src={getAparatEmbedUrl(entry.video_url)}
              className="entry-video"
              allowFullScreen
              frameBorder="0"
              title={entry.title}
            ></iframe>
          </div>
        )}

        {isFullView && <p>{entry.content}</p>}

        <div className="share-buttons">
          <a
            href={shareLinks.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn share-telegram"
          >
            اشتراک در تلگرام
          </a>
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn share-whatsapp"
          >
            اشتراک در واتساپ
          </a>
        </div>

        {isFullView && relatedEntries.length > 0 && (
          <div className="related-articles">
            <h4>مقالات مرتبط</h4>
            <ul>
              {relatedEntries.map((rel) => (
                <li
                  key={rel.id}
                  className="related-link"
                  onClick={() => openEntry(rel.id)}
                  role="button"
                  tabIndex={0}
                >
                  {rel.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isFullView && (
          <button className="back-to-list" onClick={closeEntry}>
            ← بازگشت به فهرست مطالب
          </button>
        )}

        {isAdmin && (
          <div className="entry-actions">
            <button onClick={() => startEdit(entry)}>ویرایش</button>
            <button onClick={() => handleDelete(entry.id)}>حذف</button>
          </div>
        )}
      </article>
    );
  }

  const selectedEntry = selectedEntryId
    ? entries.find((e) => e.id === selectedEntryId)
    : null;

  return (
    <div className="app" dir="rtl">
      <header className="site-header">
        <h1>گفتمان دانش</h1>
        {!isAdmin && (
          <button className="admin-link" onClick={() => setShowLogin(true)}>
            ورود مدیر
          </button>
        )}
        {isAdmin && (
          <button className="admin-link" onClick={() => setIsAdmin(false)}>
            خروج از پنل مدیریت
          </button>
        )}
      </header>

      {showLogin && !isAdmin && (
        <div className="login-box">
          <input
            type="password"
            placeholder="رمز عبور"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button onClick={handleAdminLogin}>ورود</button>
          <button onClick={() => setShowLogin(false)}>انصراف</button>
          {loginError && <p className="error">{loginError}</p>}
        </div>
      )}

      {!selectedEntry && (
        <nav className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={
                activeCategory === cat.key
                  ? `tab active cat-${cat.key}`
                  : `tab cat-${cat.key}`
              }
              onClick={() => goToCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </nav>
      )}

      {isAdmin && (
        <form className="entry-form" onSubmit={handleSubmit}>
          <h2>{form.id ? 'ویرایش مطلب' : 'مطلب جدید'}</h2>
          <input
            type="text"
            placeholder="عنوان"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <textarea
            placeholder="متن مطلب"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={6}
            required
          />
          <label>
            تصویر:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </label>
          {form.image_url && !imageFile && (
            <img src={form.image_url} alt="preview" className="preview-img" />
          )}
          <input
            type="text"
            placeholder="لینک آپارات (مثل https://www.aparat.com/v/xxxxxxx)"
            value={form.video_url}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
          />
          <div className="form-actions">
            <button type="submit" disabled={uploading}>
              {uploading ? 'در حال ذخیره...' : form.id ? 'به‌روزرسانی' : 'انتشار'}
            </button>
            {form.id && (
              <button type="button" onClick={resetForm}>
                لغو ویرایش
              </button>
            )}
          </div>
        </form>
      )}

      <main className="entries-list">
        {loading && <p>در حال بارگذاری...</p>}

        {!loading && selectedEntry && renderEntryCard(selectedEntry, true)}

        {!loading && !selectedEntry && filteredEntries.length === 0 && (
          <p>مطلبی در این دسته یافت نشد.</p>
        )}

        {!loading &&
          !selectedEntry &&
          pagedEntries.map((entry) => renderEntryCard(entry, false))}

        {!loading && !selectedEntry && totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              قبلی
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={page === currentPage ? 'page-btn active' : 'page-btn'}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              بعدی
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
