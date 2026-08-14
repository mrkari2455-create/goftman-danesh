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
