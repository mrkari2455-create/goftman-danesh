import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'تنظیمات Supabase یافت نشد. لطفاً VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY را در فایل .env یا در تنظیمات Netlify وارد کنید.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
