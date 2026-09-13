import './ServicesContentPage.css';

// ⚠️ مقادیر موقت — قبل از انتشار نهایی این دو مقدار رو با اطلاعات واقعی جایگزین کن
const CONTACT_TELEGRAM_ID = 'hoosein3515';
const CONTACT_WHATSAPP_NUMBER = '989178241874';
const SERVICES = [
  'مقاله اختصاصی',
  'عنوان و تیترهای مناسب',
  'مقدمه و جمع‌بندی',
  'نگارش روان',
  'ویرایش و بازبینی',
  'اصول پایه سئو',
];

const STEPS = [
  { title: 'ثبت درخواست', desc: 'موضوع، تعداد کلمات و توضیحات مورد نیازت رو برامون بفرست.' },
  { title: 'هماهنگی و تأیید', desc: 'جزئیات سفارش (موضوع، سبک نگارش، مهلت تحویل) رو با هم نهایی می‌کنیم.' },
  { title: 'نگارش و ویرایش', desc: 'محتوا نوشته و توسط ویراستار انسانی بازبینی می‌شه.' },
  { title: 'تحویل نهایی', desc: 'مقاله‌ی آماده و ویرایش‌شده رو دریافت می‌کنی.' },
];

const PORTFOLIO_SAMPLES = [
  { title: 'چرا خمیازه مسری‌ست؟', category: 'علوم پایه' },
  { title: 'مقدمه‌ای بر یادگیری ماشین', category: 'علوم مهندسی' },
  { title: 'اصول تغذیه سالم روزانه', category: 'علوم پزشکی' },
];

function ServicesContentPage({ onBack }) {
  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="services-page" dir="rtl">
      <button className="back-to-list" onClick={onBack}>
        ← بازگشت به فهرست مطالب
      </button>

      <section className="services-hero">
        <h2>محتوای حرفه‌ای برای سایت شما</h2>
        <p>
          تولید محتوای فارسی، روان و اصولی با کمک هوش مصنوعی و بازبینی و ویرایش نهایی توسط
          نیروی انسانی — محتوایی که هم برای خواننده جذاب باشه، هم برای گوگل قابل‌فهم.
        </p>
        <div className="services-cta">
          <button className="cta-btn cta-primary" onClick={() => scrollToId('services-contact')}>
            ثبت سفارش
          </button>
          <button className="cta-btn cta-secondary" onClick={() => scrollToId('services-portfolio')}>
            مشاهده نمونه‌کار
          </button>
        </div>
      </section>

      <section className="services-list-section">
        <h3>خدمات</h3>
        <ul className="services-checklist">
          {SERVICES.map((item) => (
            <li key={item}>
              <span className="check-icon">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="services-price-section">
        <h3>قیمت شروع</h3>
        <p className="price-tag">
          مقاله ۱۰۰۰ کلمه‌ای <span className="price-amount">۱۵۰ هزار تومان</span>
        </p>
      </section>

      <section className="services-how-section">
        <h3>چطور سفارش بدهم؟</h3>
        <ol className="steps-list">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="step-number">{i + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="services-portfolio" className="services-portfolio-section">
        <h3>نمونه‌کارها</h3>
        <div className="portfolio-grid">
          {PORTFOLIO_SAMPLES.map((sample) => (
            <div key={sample.title} className="portfolio-card">
              <span className="entry-category">{sample.category}</span>
              <h4>{sample.title}</h4>
            </div>
          ))}
        </div>
      </section>

      <section id="services-contact" className="services-contact-section">
        <h3>تماس با ما</h3>
        <p>برای ثبت سفارش یا هماهنگی، از راه‌های زیر با ما در ارتباط باشید:</p>
        <div className="share-buttons">
          <a
            href={`https://t.me/${CONTACT_TELEGRAM_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn share-telegram"
          >
            پیام در تلگرام
          </a>
          <a
            href={`https://wa.me/${CONTACT_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn share-whatsapp"
          >
            پیام در واتساپ
          </a>
        </div>
      </section>

      <button className="back-to-list" onClick={onBack}>
        ← بازگشت به فهرست مطالب
      </button>
    </div>
  );
}

export default ServicesContentPage;
