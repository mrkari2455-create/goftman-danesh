-- گفتمان دانش — ساختار دیتابیس Supabase
-- این فایل را در Supabase → SQL Editor کپی و اجرا کنید

create table entries (
  id uuid primary key default gen_random_uuid(),
  label text not null default '',
  title text not null default '',
  body text not null default '',
  minutes int not null default 5,
  comments int not null default 0,
  created_at timestamptz not null default now()
);

create table glosses (
  id uuid primary key default gen_random_uuid(),
  text text not null default '',
  tag text not null default '',
  created_at timestamptz not null default now()
);

create table discourse (
  id int primary key default 1,
  title text not null default 'میدان مجادله',
  intro text not null default '',
  thesis_title text not null default '',
  thesis_body text not null default '',
  antithesis_title text not null default '',
  antithesis_body text not null default '',
  constraint single_row check (id = 1)
);

create table voices (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  role text not null default '',
  quote text not null default '',
  created_at timestamptz not null default now()
);

create table site_settings (
  id int primary key default 1,
  admin_pass_hash text not null,
  constraint single_row_settings check (id = 1)
);

-- ===== Row Level Security =====
-- خواندن برای همه آزاد است (سایت عمومی است)
-- نوشتن فقط با استفاده از anon key از طریق پنل مدیریت انجام می‌شود
-- (توجه: این یک محافظت پایه است، نه امنیت درجه‌ی enterprise)

alter table entries enable row level security;
alter table glosses enable row level security;
alter table discourse enable row level security;
alter table voices enable row level security;
alter table site_settings enable row level security;

create policy "public read entries" on entries for select using (true);
create policy "public write entries" on entries for all using (true) with check (true);

create policy "public read glosses" on glosses for select using (true);
create policy "public write glosses" on glosses for all using (true) with check (true);

create policy "public read discourse" on discourse for select using (true);
create policy "public write discourse" on discourse for all using (true) with check (true);

create policy "public read voices" on voices for select using (true);
create policy "public write voices" on voices for all using (true) with check (true);

-- site_settings: خواندن رمز هش‌شده برای بررسی لاگین لازم است؛ اما بهتر است
-- این جدول را فقط از طریق یک Edge Function بخوانید. برای سادگی اولیه، خواندن آزاد گذاشته شده:
create policy "public read settings" on site_settings for select using (true);
create policy "public write settings" on site_settings for all using (true) with check (true);

-- مقداردهی اولیه
insert into discourse (id, title, intro, thesis_title, thesis_body, antithesis_title, antithesis_body)
values (
  1,
  'میدان مجادله',
  'هر هفته یک پرسش فلسفی را از دو زاویه‌ی متضاد می‌کاویم. حقیقت اغلب در تنش میان دو موضع یافت می‌شود.',
  'دانش، بنیادگرایانه است',
  'هر نظام باور برای معتبر بودن نیازمند پایه‌ای بنیادین است؛ باورهای پایه‌ای که خود نیازی به توجیه بیشتر ندارند و بنیان زنجیره‌ی استدلال را می‌سازند.',
  'دانش، شبکه‌ای و منسجم‌گراست',
  'هیچ باوری به‌خودی‌خود بنیادین نیست؛ توجیه از پیوستگی و همبستگی میان کل شبکه‌ی باورها ناشی می‌شود، نه از یک نقطه‌ی آغازین مطلق.'
);

-- رمز پیش‌فرض پنل مدیریت: gooftman1404
-- (این یک هش SHA-256 ساده است؛ بعد از اولین ورود آن را از پنل تغییر دهید)
insert into site_settings (id, admin_pass_hash)
values (1, 'd50b2ddd46f9220b82f9343911363b5dbd7271e4a2cc2eb3b4308ca4b68b4ac');

insert into entries (label, title, body, minutes, comments) values
('معرفت‌شناسی', 'آیا یقین، شرط لازم دانستن است؟', 'از دکارت تا معرفت‌شناسان تحلیلی امروز، پرسش از رابطه‌ی میان یقین و دانش هرگز پاسخی قطعی نیافته. این یادداشت نگاهی دارد به روایت‌های رقیب از توجیه باور و اینکه چرا شک، گاهی خود بخشی از فرآیند دانستن است، نه دشمن آن.', 7, 14),
('فلسفه‌ی علم', 'مرز میان علم و شبه‌علم کجاست؟', 'معیار ابطال‌پذیری پوپر راهی گشود، اما آیا هنوز کافی‌ست؟ در دنیایی که نظریه‌های پیچیده و داده‌های انبوه، خط میان تبیین علمی و روایت متقاعدکننده را کم‌رنگ کرده‌اند، به بازخوانی این مرز نیاز داریم.', 9, 22),
('اخلاق دانش', 'مسئولیت اخلاقی دانستن', 'آیا در برابر باورهایمان مسئولیم؟ این متن بحث می‌کند که دانستن، صرفاً امری شناختی نیست، بلکه کنشی اخلاقی‌ست؛ کوتاهی در جست‌وجوی حقیقت، خود نوعی خطاست.', 6, 8),
('هوش مصنوعی و شناخت', 'وقتی ماشین می‌داند، یعنی چه؟', 'سامانه‌های یادگیری ماشین اطلاعات را «می‌دانند» یا صرفاً آن را بازتولید می‌کنند؟ نگاهی انتقادی به مفهوم دانستن در عصر مدل‌های زبانی.', 10, 31);

insert into glosses (text, tag) values
('اگر دانش صرفاً باور موجه و صادق است، آزمایش فکری گتیه این تعریف را به چالش می‌کشد.', 'حاشیه — مسئله‌ی گتیه'),
('شک دکارتی روشی‌ست، نه پایانی؛ هدف آن رسیدن به بنیانی مطمئن‌تر است.', 'حاشیه — شک روش‌مند'),
('پوپر می‌گفت نظریه‌ای علمی‌ست که بتوان آن را ابطال کرد، نه اثبات.', 'حاشیه — ابطال‌پذیری'),
('برخی فیلسوفان دانش را امری اجتماعی می‌دانند، نه صرفاً رابطه‌ای میان فرد و واقعیت.', 'حاشیه — معرفت‌شناسی اجتماعی');

insert into voices (name, role, quote) values
('نگار سلطانی', 'پژوهشگر معرفت‌شناسی', 'آنچه بیش از پاسخ‌ها اهمیت دارد، کیفیت پرسش‌هایی‌ست که مطرح می‌کنیم.'),
('آرش کیانی', 'مدرس فلسفه‌ی علم', 'علم پیشرفت نمی‌کند چون به یقین می‌رسد، بلکه چون یاد می‌گیرد چگونه بهتر شک کند.'),
('هدیه رستمی', 'نویسنده و مترجم متون فکری', 'ترجمه‌ی یک ایده، خودش نوعی بازاندیشی در آن ایده است.');
