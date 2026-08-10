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

// رمز ادمین - این را با رمز واقعی خودتان جایگزین کنید
const ADMIN_PASSWORD = '1234';

function App() {
  const [entries, setEntries] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

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
    else fetchEntries();
  }

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

      <nav className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={activeCategory === cat.key ? 'tab active' : 'tab'}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </nav>

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
            placeholder="لینک ویدیو (اختیاری)"
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
        {!loading && filteredEntries.length === 0 && <p>مطلبی در این دسته یافت نشد.</p>}
        {filteredEntries.map((entry) => (
          <article key={entry.id} className="entry-card">
            <span className="entry-category">
              {CATEGORIES.find((c) => c.key === entry.category)?.label || entry.category}
            </span>
            <h3>{entry.title}</h3>
            {entry.image_url && (
              <img src={entry.image_url} alt={entry.title} className="entry-img" />
            )}
            {entry.video_url && (
              <video src={entry.video_url} controls className="entry-video" />
            )}
            <p>{entry.content}</p>
            {isAdmin && (
              <div className="entry-actions">
                <button onClick={() => startEdit(entry)}>ویرایش</button>
                <button onClick={() => handleDelete(entry.id)}>حذف</button>
              </div>
            )}
          </article>
        ))}
      </main>
    </div>
  );
}

export default App;
