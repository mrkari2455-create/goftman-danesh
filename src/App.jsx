import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [entries, setEntries] = useState([]);
  const [glosses, setGlosses] = useState([]);
  const [discourse, setDiscourse] = useState(null);
  const [voices, setVoices] = useState([]);

  const [adminOpen, setAdminOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [passHash, setPassHash] = useState('');
  const [tab, setTab] = useState('entries');
  const [saveFlash, setSaveFlash] = useState('');

  const flash = (msg) => { setSaveFlash(msg); setTimeout(() => setSaveFlash(''), 1800); };

  const reloadAll = async () => {
    const [e, g, d, v, s] = await Promise.all([
      supabase.from('entries').select('*').order('created_at', { ascending: false }),
      supabase.from('glosses').select('*').order('created_at', { ascending: false }),
      supabase.from('discourse').select('*').eq('id', 1).single(),
      supabase.from('voices').select('*').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('admin_pass_hash').eq('id', 1).single(),
    ]);
    if (e.error || g.error || d.error || v.error || s.error) {
      setLoadError('اتصال به پایگاه‌داده برقرار نشد. تنظیمات Supabase را بررسی کنید.');
    } else {
      setEntries(e.data || []);
      setGlosses(g.data || []);
      setDiscourse(d.data || null);
      setVoices(v.data || []);
      setPassHash(s.data?.admin_pass_hash || '');
    }
    setLoading(false);
  };

  useEffect(() => { reloadAll(); }, []);

  const tryLogin = async () => {
    const h = await sha256(passInput);
    if (h === passHash) { setAuthed(true); setAuthError(''); }
    else setAuthError('رمز عبور نادرست است.');
  };

  const changePass = async (newPass) => {
    const h = await sha256(newPass);
    const { error } = await supabase.from('site_settings').update({ admin_pass_hash: h }).eq('id', 1);
    if (!error) { setPassHash(h); flash('رمز عبور تغییر کرد'); }
    return !error;
  };

  // ----- entries CRUD -----
  const addEntry = async (draft) => {
    const { error } = await supabase.from('entries').insert([draft]);
    if (!error) { await reloadAll(); flash('یادداشت اضافه شد'); }
  };
  const updateEntry = async (id, patch) => {
    const { error } = await supabase.from('entries').update(patch).eq('id', id);
    if (!error) { setEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e)); flash('ذخیره شد'); }
  };
  const removeEntry = async (id) => {
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (!error) { setEntries(prev => prev.filter(e => e.id !== id)); flash('حذف شد'); }
  };

  // ----- glosses CRUD -----
  const addGloss = async (draft) => {
    const { error } = await supabase.from('glosses').insert([draft]);
    if (!error) { await reloadAll(); flash('حاشیه اضافه شد'); }
  };
  const updateGloss = async (id, patch) => {
    const { error } = await supabase.from('glosses').update(patch).eq('id', id);
    if (!error) { setGlosses(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g)); flash('ذخیره شد'); }
  };
  const removeGloss = async (id) => {
    const { error } = await supabase.from('glosses').delete().eq('id', id);
    if (!error) { setGlosses(prev => prev.filter(g => g.id !== id)); flash('حذف شد'); }
  };

  // ----- discourse -----
  const saveDiscourse = async (patch) => {
    const { error } = await supabase.from('discourse').update(patch).eq('id', 1);
    if (!error) { setDiscourse(prev => ({ ...prev, ...patch })); flash('میدان مجادله ذخیره شد'); }
  };

  // ----- voices CRUD -----
  const addVoice = async (draft) => {
    const { error } = await supabase.from('voices').insert([draft]);
    if (!error) { await reloadAll(); flash('صدا اضافه شد'); }
  };
  const updateVoice = async (id, patch) => {
    const { error } = await supabase.from('voices').update(patch).eq('id', id);
    if (!error) { setVoices(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v)); flash('ذخیره شد'); }
  };
  const removeVoice = async (id) => {
    const { error } = await supabase.from('voices').delete().eq('id', id);
    if (!error) { setVoices(prev => prev.filter(v => v.id !== id)); flash('حذف شد'); }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EDE7D9', fontFamily: 'Vazirmatn, sans-serif', color: '#1B1F2A' }}>در حال بارگذاری…</div>;
  }

  if (loadError) {
    return (
      <div dir="rtl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EDE7D9', fontFamily: 'Vazirmatn, sans-serif', color: '#1B1F2A', padding: 40, textAlign: 'center' }}>
        <div style={{ maxWidth: 480 }}>
          <h2 style={{ marginBottom: 12 }}>خطا در اتصال</h2>
          <p style={{ lineHeight: 2, fontSize: '0.95rem' }}>{loadError}</p>
          <p style={{ fontSize: '0.8rem', color: '#5C6B5D', marginTop: 16 }}>
            مطمئن شوید متغیرهای VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY درست تنظیم شده‌اند و اسکریپت supabase-schema.sql روی پروژه‌ی Supabase اجرا شده است.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif", background: '#EDE7D9', color: '#1B1F2A', minHeight: '100vh' }}>
      <GlobalStyle />
      {saveFlash && <FlashToast msg={saveFlash} />}
      <Header onAdmin={() => setAdminOpen(true)} />
      <Hero />
      <Manuscript entries={entries} glosses={glosses} />
      {discourse && <Discourse d={discourse} />}
      <Voices voices={voices} />
      <Footer />
      {adminOpen && (
        <AdminModal
          onClose={() => setAdminOpen(false)}
          authed={authed} passInput={passInput} setPassInput={setPassInput}
          authError={authError} tryLogin={tryLogin}
          tab={tab} setTab={setTab}
          entries={entries} addEntry={addEntry} updateEntry={updateEntry} removeEntry={removeEntry}
          glosses={glosses} addGloss={addGloss} updateGloss={updateGloss} removeGloss={removeGloss}
          discourse={discourse} saveDiscourse={saveDiscourse}
          voices={voices} addVoice={addVoice} updateVoice={updateVoice} removeVoice={removeVoice}
          changePass={changePass}
        />
      )}
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      body { margin: 0; }
      .serif { font-family: 'Noto Naskh Arabic', serif; }
      ::selection { background: #B8863E; color: #EDE7D9; }
      input, textarea { font-family: 'Vazirmatn', sans-serif; }
      button { cursor: pointer; font-family: 'Vazirmatn', sans-serif; }
    `}</style>
  );
}

function FlashToast({ msg }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, insetInlineStart: '50%', transform: 'translateX(50%)', background: '#1B1F2A', color: '#EDE7D9', padding: '10px 22px', borderRadius: 4, fontSize: 14, zIndex: 999, boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>{msg}</div>
  );
}

function Header({ onAdmin }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(237,231,217,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(27,31,42,0.15)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 800, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 26, height: 26, border: '1.5px solid #1B1F2A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>گ</span>
          گفتمان دانش
        </div>
        <nav style={{ display: 'flex', gap: 28, alignItems: 'center', fontSize: '0.92rem', fontWeight: 500 }}>
          <a href="#manuscript" style={{ color: 'inherit', textDecoration: 'none' }}>نوشتار</a>
          <a href="#discourse" style={{ color: 'inherit', textDecoration: 'none' }}>مجادله</a>
          <a href="#voices" style={{ color: 'inherit', textDecoration: 'none' }}>صداها</a>
          <button onClick={onAdmin} style={{ background: '#1B1F2A', color: '#EDE7D9', border: 'none', padding: '9px 18px', borderRadius: 2, fontSize: '0.85rem', fontWeight: 600 }}>مدیریت سایت</button>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section style={{ maxWidth: 1160, margin: '0 auto', padding: '90px 32px 70px' }}>
      <div style={{ fontSize: '0.85rem', color: '#9C5A48', fontWeight: 600, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 40, height: 1, background: '#9C5A48' }}></span>
        فضایی برای اندیشیدن درباره‌ی اندیشیدن
      </div>
      <h1 className="serif" style={{ fontWeight: 700, fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)', lineHeight: 1.35, maxWidth: 900 }}>
        دانش را نه به عنوان پاسخ،<br />بلکه به عنوان <span style={{ color: '#9C5A48' }}>گفت‌وگو</span> بخوانیم.
      </h1>
      <p style={{ marginTop: 30, fontSize: '1.1rem', lineHeight: 2, maxWidth: 600, color: 'rgba(27,31,42,0.78)' }}>
        گفتمان دانش مجموعه‌ای‌ست از یادداشت‌ها، مجادله‌ها و حاشیه‌نویسی‌های فکری درباره‌ی معرفت، یقین و مرزهای آنچه می‌دانیم.
      </p>
    </section>
  );
}

function Manuscript({ entries, glosses }) {
  return (
    <section id="manuscript" style={{ maxWidth: 1160, margin: '0 auto', padding: '50px 32px 100px', display: 'grid', gridTemplateColumns: '1fr 240px', gap: 48, borderTop: '1px solid rgba(27,31,42,0.15)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 32, paddingTop: 50 }}>
          <span style={{ fontSize: '0.8rem', color: '#B8863E', fontWeight: 700 }}>۰۱</span>
          <h2 className="serif" style={{ fontSize: '1.8rem', fontWeight: 700 }}>یادداشت‌های اخیر</h2>
        </div>
        {entries.length === 0 && <p style={{ color: '#5C6B5D' }}>هنوز یادداشتی ثبت نشده است.</p>}
        {entries.map((e, i) => (
          <article key={e.id} style={{ padding: i === 0 ? '0 0 34px' : '34px 0', borderBottom: '1px solid rgba(27,31,42,0.15)' }}>
            <span style={{ fontSize: '0.78rem', color: '#5C6B5D', fontWeight: 600, marginBottom: 10, display: 'inline-block', padding: '3px 10px', border: '1px solid #5C6B5D', borderRadius: 20 }}>{e.label}</span>
            <h3 className="serif" style={{ fontSize: '1.4rem', fontWeight: 600, lineHeight: 1.6, margin: '12px 0' }}>{e.title}</h3>
            {e.image_url && (
              <img src={e.image_url} alt={e.title} style={{ maxWidth: '100%', borderRadius: 4, margin: '14px 0', display: 'block' }} />
            )}
            <p style={{ fontSize: '1rem', lineHeight: 2, color: 'rgba(27,31,42,0.82)', maxWidth: 620 }}>{e.body}</p>
            {e.video_url && (
              <div style={{ margin: '18px 0', maxWidth: 620, aspectRatio: '16/9' }}>
                <iframe src={e.video_url} allowFullScreen style={{ width: '100%', height: '100%', border: 'none', borderRadius: 4 }} title={e.title} />
              </div>
            )}
            <div style={{ marginTop: 16, fontSize: '0.85rem', color: '#5C6B5D', display: 'flex', gap: 16 }}>
              <span>{e.minutes} دقیقه خواندن</span>
              <span>{e.comments} نظر</span>
            </div>
          </article>
        ))}
      </div>
      <aside style={{ borderInlineStart: '1px solid rgba(27,31,42,0.15)', paddingInlineStart: 32, paddingTop: 50 }}>
        {glosses.map(g => (
          <div key={g.id} style={{ fontSize: '0.85rem', lineHeight: 1.9, color: '#9C5A48', paddingBottom: 30, fontWeight: 500 }}>
            <div className="serif" style={{ fontSize: '1.1rem', opacity: 0.6, marginBottom: 6 }}>«</div>
            {g.text}
            <span style={{ display: 'block', fontSize: '0.72rem', color: '#5C6B5D', fontWeight: 700, marginTop: 8 }}>{g.tag}</span>
          </div>
        ))}
      </aside>
    </section>
  );
}

function Discourse({ d }) {
  return (
    <section id="discourse" style={{ background: '#1B1F2A', color: '#EDE7D9', padding: '90px 32px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: '0.8rem', color: '#B8863E', fontWeight: 700 }}>۰۲</span>
          <h2 className="serif" style={{ fontSize: '1.8rem', fontWeight: 700, margin: '10px 0' }}>{d.title}</h2>
          <p style={{ color: 'rgba(237,231,217,0.65)', maxWidth: 460, margin: '14px auto 0', lineHeight: 1.9, fontSize: '0.95rem' }}>{d.intro}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 36, alignItems: 'start' }}>
          <div style={{ background: 'rgba(237,231,217,0.04)', border: '1px solid rgba(237,231,217,0.14)', padding: '32px 26px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#B8863E', marginBottom: 16, display: 'block' }}>تز</span>
            <h4 className="serif" style={{ fontSize: '1.2rem', marginBottom: 12, lineHeight: 1.7 }}>{d.thesis_title}</h4>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.95, color: 'rgba(237,231,217,0.72)' }}>{d.thesis_body}</p>
          </div>
          <div className="serif" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: '#B8863E', paddingTop: 44 }}>در برابر</div>
          <div style={{ background: 'rgba(237,231,217,0.04)', border: '1px solid rgba(237,231,217,0.14)', padding: '32px 26px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9C5A48', marginBottom: 16, display: 'block' }}>آنتی‌تز</span>
            <h4 className="serif" style={{ fontSize: '1.2rem', marginBottom: 12, lineHeight: 1.7 }}>{d.antithesis_title}</h4>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.95, color: 'rgba(237,231,217,0.72)' }}>{d.antithesis_body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Voices({ voices }) {
  return (
    <section id="voices" style={{ maxWidth: 1160, margin: '0 auto', padding: '90px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 40 }}>
        <span style={{ fontSize: '0.8rem', color: '#B8863E', fontWeight: 700 }}>۰۳</span>
        <h2 className="serif" style={{ fontSize: '1.8rem', fontWeight: 700 }}>صداهای این گفتمان</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 1, background: 'rgba(27,31,42,0.15)', border: '1px solid rgba(27,31,42,0.15)' }}>
        {voices.map(v => (
          <div key={v.id} style={{ background: '#EDE7D9', padding: '32px 28px' }}>
            <div className="serif" style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 6 }}>{v.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#9C5A48', fontWeight: 600, marginBottom: 14 }}>{v.role}</div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.9, color: 'rgba(27,31,42,0.75)' }}>{v.quote}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(27,31,42,0.15)', padding: '50px 32px 30px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: '0.85rem', color: '#5C6B5D' }}>
        <span>گفتمان دانش — فضایی مستقل برای تأمل فلسفی</span>
        <span>© ۱۴۰۴ — به‌روزرسانی می‌شود</span>
      </div>
    </footer>
  );
}

// ================= ADMIN =================

function AdminModal(props) {
  const { onClose, authed } = props;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,31,42,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#EDE7D9', width: '100%', maxWidth: 780, maxHeight: '86vh', overflow: 'auto', borderRadius: 4, border: '1px solid rgba(27,31,42,0.2)' }}>
        {!authed ? <LoginPane {...props} /> : <AdminPane {...props} />}
      </div>
    </div>
  );
}

function LoginPane({ onClose, passInput, setPassInput, authError, tryLogin }) {
  return (
    <div style={{ padding: '44px 40px' }}>
      <h3 className="serif" style={{ fontSize: '1.4rem', marginBottom: 6 }}>ورود به پنل مدیریت</h3>
      <p style={{ fontSize: '0.88rem', color: '#5C6B5D', marginBottom: 24 }}>برای ویرایش محتوای سایت، رمز عبور را وارد کنید.</p>
      <input type="password" value={passInput} onChange={e => setPassInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && tryLogin()} placeholder="رمز عبور" autoFocus
        style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(27,31,42,0.35)', background: 'transparent', fontSize: '1rem', marginBottom: 10 }} />
      {authError && <div style={{ color: '#9C5A48', fontSize: '0.85rem', marginBottom: 10 }}>{authError}</div>}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={tryLogin} style={{ background: '#1B1F2A', color: '#EDE7D9', border: 'none', padding: '11px 28px', fontWeight: 600 }}>ورود</button>
        <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(27,31,42,0.3)', padding: '11px 22px' }}>انصراف</button>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#5C6B5D', marginTop: 20, lineHeight: 1.7 }}>
        رمز پیش‌فرض: <code>gooftman1404</code> — پیشنهاد می‌شود پس از ورود آن را از تب «تنظیمات» تغییر دهید.
      </p>
    </div>
  );
}

function AdminPane(props) {
  const { onClose, tab, setTab } = props;
  const tabs = [['entries', 'یادداشت‌ها'], ['glosses', 'حاشیه‌ها'], ['discourse', 'مجادله'], ['voices', 'صداها'], ['settings', 'تنظیمات']];
  return (
    <div>
      <div style={{ position: 'sticky', top: 0, background: '#EDE7D9', padding: '20px 28px 0', borderBottom: '1px solid rgba(27,31,42,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 className="serif" style={{ fontSize: '1.2rem' }}>پنل مدیریت</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', color: '#5C6B5D' }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
          {tabs.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: '9px 16px', border: 'none', background: 'transparent', borderBottom: tab === key ? '2px solid #9C5A48' : '2px solid transparent', fontWeight: tab === key ? 700 : 500, fontSize: '0.88rem', whiteSpace: 'nowrap' }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: 28 }}>
        {tab === 'entries' && <EntriesAdmin {...props} />}
        {tab === 'glosses' && <GlossesAdmin {...props} />}
        {tab === 'discourse' && <DiscourseAdmin {...props} />}
        {tab === 'voices' && <VoicesAdmin {...props} />}
        {tab === 'settings' && <SettingsAdmin {...props} />}
      </div>
    </div>
  );
}

const fieldStyle = { width: '100%', padding: '10px 12px', border: '1px solid rgba(27,31,42,0.3)', background: 'transparent', fontSize: '0.92rem', marginBottom: 10 };
const btnPrimary = { background: '#1B1F2A', color: '#EDE7D9', border: 'none', padding: '9px 18px', fontSize: '0.85rem', fontWeight: 600 };
const btnDanger = { background: 'transparent', color: '#9C5A48', border: '1px solid #9C5A48', padding: '7px 14px', fontSize: '0.8rem' };
const cardStyle = { border: '1px solid rgba(27,31,42,0.15)', padding: 16, marginBottom: 14, background: 'rgba(255,255,255,0.3)' };

async function uploadEntryImage(file) {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('article-images').upload(path, file);
  if (error) { alert('خطا در آپلود عکس: ' + error.message); return null; }
  const { data } = supabase.storage.from('article-images').getPublicUrl(path);
  return data?.publicUrl || null;
}

function ImageField({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    const url = await uploadEntryImage(file);
    setBusy(false);
    if (url) onChange(url);
  };
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: '0.78rem', color: '#5C6B5D', display: 'block', marginBottom: 4 }}>تصویر</label>
      <input type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0])} style={{ fontSize: '0.82rem', marginBottom: 6 }} />
      {busy && <div style={{ fontSize: '0.78rem', color: '#5C6B5D' }}>در حال آپلود…</div>}
      {value && <img src={value} alt="" style={{ maxWidth: '100%', maxHeight: 140, display: 'block', marginTop: 6, borderRadius: 3 }} />}
    </div>
  );
}

function EntriesAdmin({ entries, addEntry, updateEntry, removeEntry }) {
  const [draft, setDraft] = useState({ label: '', title: '', body: '', minutes: 5, comments: 0, image_url: '', video_url: '' });
  const add = () => {
    if (!draft.title.trim()) return;
    addEntry({ ...draft, minutes: Number(draft.minutes) || 5, comments: Number(draft.comments) || 0 });
    setDraft({ label: '', title: '', body: '', minutes: 5, comments: 0, image_url: '', video_url: '' });
  };
  return (
    <div>
      <div style={cardStyle}>
        <strong style={{ display: 'block', marginBottom: 10, fontSize: '0.85rem' }}>یادداشت تازه</strong>
        <input style={fieldStyle} placeholder="برچسب (مثلا معرفت‌شناسی)" value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} />
        <input style={fieldStyle} placeholder="عنوان" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
        <textarea style={{ ...fieldStyle, minHeight: 80 }} placeholder="متن یادداشت" value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} />
        <div style={{ display: 'flex', gap: 10 }}>
          <input style={fieldStyle} type="number" placeholder="دقیقه" value={draft.minutes} onChange={e => setDraft({ ...draft, minutes: e.target.value })} />
          <input style={fieldStyle} type="number" placeholder="نظرات" value={draft.comments} onChange={e => setDraft({ ...draft, comments: e.target.value })} />
        </div>
        <ImageField value={draft.image_url} onChange={url => setDraft(d => ({ ...d, image_url: url }))} />
        <input style={fieldStyle} placeholder="لینک ویدئو (مثلا از آپارات)" value={draft.video_url} onChange={e => setDraft({ ...draft, video_url: e.target.value })} />
        <button style={btnPrimary} onClick={add}>افزودن یادداشت</button>
      </div>
      {entries.map(e => (
        <div key={e.id} style={cardStyle}>
          <input style={fieldStyle} defaultValue={e.label} onBlur={ev => updateEntry(e.id, { label: ev.target.value })} />
          <input style={fieldStyle} defaultValue={e.title} onBlur={ev => updateEntry(e.id, { title: ev.target.value })} />
          <textarea style={{ ...fieldStyle, minHeight: 70 }} defaultValue={e.body} onBlur={ev => updateEntry(e.id, { body: ev.target.value })} />
          <ImageField value={e.image_url} onChange={url => updateEntry(e.id, { image_url: url })} />
          <input style={fieldStyle} placeholder="لینک ویدئو (مثلا از آپارات)" defaultValue={e.video_url} onBlur={ev => updateEntry(e.id, { video_url: ev.target.value })} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, fontSize: '0.8rem', color: '#5C6B5D' }}>
              <span>{e.minutes} دقیقه</span><span>{e.comments} نظر</span>
            </div>
            <button style={btnDanger} onClick={() => removeEntry(e.id)}>حذف</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function GlossesAdmin({ glosses, addGloss, updateGloss, removeGloss }) {
  const [draft, setDraft] = useState({ text: '', tag: '' });
  const add = () => {
    if (!draft.text.trim()) return;
    addGloss(draft);
    setDraft({ text: '', tag: '' });
  };
  return (
    <div>
      <div style={cardStyle}>
        <strong style={{ display: 'block', marginBottom: 10, fontSize: '0.85rem' }}>حاشیه‌ی تازه</strong>
        <textarea style={{ ...fieldStyle, minHeight: 60 }} placeholder="متن حاشیه" value={draft.text} onChange={e => setDraft({ ...draft, text: e.target.value })} />
        <input style={fieldStyle} placeholder="برچسب" value={draft.tag} onChange={e => setDraft({ ...draft, tag: e.target.value })} />
        <button style={btnPrimary} onClick={add}>افزودن حاشیه</button>
      </div>
      {glosses.map(g => (
        <div key={g.id} style={cardStyle}>
          <textarea style={{ ...fieldStyle, minHeight: 50 }} defaultValue={g.text} onBlur={ev => updateGloss(g.id, { text: ev.target.value })} />
          <input style={fieldStyle} defaultValue={g.tag} onBlur={ev => updateGloss(g.id, { tag: ev.target.value })} />
          <div style={{ textAlign: 'left' }}><button style={btnDanger} onClick={() => removeGloss(g.id)}>حذف</button></div>
        </div>
      ))}
    </div>
  );
}

function DiscourseAdmin({ discourse, saveDiscourse }) {
  const [d, setD] = useState(discourse);
  useEffect(() => setD(discourse), [discourse]);
  const set = (k, v) => setD({ ...d, [k]: v });
  return (
    <div style={cardStyle}>
      <label style={{ fontSize: '0.8rem', color: '#5C6B5D' }}>عنوان بخش</label>
      <input style={fieldStyle} value={d.title} onChange={e => set('title', e.target.value)} />
      <label style={{ fontSize: '0.8rem', color: '#5C6B5D' }}>مقدمه</label>
      <textarea style={{ ...fieldStyle, minHeight: 60 }} value={d.intro} onChange={e => set('intro', e.target.value)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 10 }}>
        <div>
          <strong style={{ fontSize: '0.85rem', color: '#B8863E' }}>تز</strong>
          <input style={fieldStyle} placeholder="عنوان تز" value={d.thesis_title} onChange={e => set('thesis_title', e.target.value)} />
          <textarea style={{ ...fieldStyle, minHeight: 70 }} placeholder="متن تز" value={d.thesis_body} onChange={e => set('thesis_body', e.target.value)} />
        </div>
        <div>
          <strong style={{ fontSize: '0.85rem', color: '#9C5A48' }}>آنتی‌تز</strong>
          <input style={fieldStyle} placeholder="عنوان آنتی‌تز" value={d.antithesis_title} onChange={e => set('antithesis_title', e.target.value)} />
          <textarea style={{ ...fieldStyle, minHeight: 70 }} placeholder="متن آنتی‌تز" value={d.antithesis_body} onChange={e => set('antithesis_body', e.target.value)} />
        </div>
      </div>
      <button style={{ ...btnPrimary, marginTop: 14 }} onClick={() => saveDiscourse(d)}>ذخیره‌ی مجادله</button>
    </div>
  );
}

function VoicesAdmin({ voices, addVoice, updateVoice, removeVoice }) {
  const [draft, setDraft] = useState({ name: '', role: '', quote: '' });
  const add = () => {
    if (!draft.name.trim()) return;
    addVoice(draft);
    setDraft({ name: '', role: '', quote: '' });
  };
  return (
    <div>
      <div style={cardStyle}>
        <strong style={{ display: 'block', marginBottom: 10, fontSize: '0.85rem' }}>صدای تازه</strong>
        <input style={fieldStyle} placeholder="نام" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
        <input style={fieldStyle} placeholder="سمت / معرفی کوتاه" value={draft.role} onChange={e => setDraft({ ...draft, role: e.target.value })} />
        <textarea style={{ ...fieldStyle, minHeight: 60 }} placeholder="نقل‌قول" value={draft.quote} onChange={e => setDraft({ ...draft, quote: e.target.value })} />
        <button style={btnPrimary} onClick={add}>افزودن</button>
      </div>
      {voices.map(v => (
        <div key={v.id} style={cardStyle}>
          <input style={fieldStyle} defaultValue={v.name} onBlur={ev => updateVoice(v.id, { name: ev.target.value })} />
          <input style={fieldStyle} defaultValue={v.role} onBlur={ev => updateVoice(v.id, { role: ev.target.value })} />
          <textarea style={{ ...fieldStyle, minHeight: 50 }} defaultValue={v.quote} onBlur={ev => updateVoice(v.id, { quote: ev.target.value })} />
          <div style={{ textAlign: 'left' }}><button style={btnDanger} onClick={() => removeVoice(v.id)}>حذف</button></div>
        </div>
      ))}
    </div>
  );
}

function SettingsAdmin({ changePass }) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [msg, setMsg] = useState('');
  const change = async () => {
    if (p1.length < 4) { setMsg('رمز باید حداقل ۴ کاراکتر باشد.'); return; }
    if (p1 !== p2) { setMsg('رمزهای واردشده یکسان نیستند.'); return; }
    const ok = await changePass(p1);
    if (ok) { setP1(''); setP2(''); setMsg('رمز عبور با موفقیت تغییر کرد.'); }
    else setMsg('خطا در ذخیره‌ی رمز جدید.');
  };
  return (
    <div style={cardStyle}>
      <strong style={{ display: 'block', marginBottom: 10, fontSize: '0.85rem' }}>تغییر رمز پنل مدیریت</strong>
      <input style={fieldStyle} type="password" placeholder="رمز جدید" value={p1} onChange={e => setP1(e.target.value)} />
      <input style={fieldStyle} type="password" placeholder="تکرار رمز جدید" value={p2} onChange={e => setP2(e.target.value)} />
      {msg && <div style={{ fontSize: '0.82rem', color: '#9C5A48', marginBottom: 10 }}>{msg}</div>}
      <button style={btnPrimary} onClick={change}>ذخیره‌ی رمز جدید</button>
      <p style={{ fontSize: '0.75rem', color: '#5C6B5D', marginTop: 18, lineHeight: 1.8 }}>
        توجه: این رمز هش‌شده در دیتابیس نگه‌داری می‌شود، اما بررسی آن هنوز در مرورگر انجام می‌شود، بنابراین یک لایه‌ی امنیتی پایه است، نه سیستم ورود سمت سرور با درجه‌ی امنیت بالا.
      </p>
    </div>
  );
}
