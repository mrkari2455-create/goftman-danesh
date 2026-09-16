import './ServicesContentPage.css';

const BASE_PATH = '/goftman-danesh';

const CONTACT_TELEGRAM_ID = 'hoosein3515';
const CONTACT_WHATSAPP_NUMBER = '989178241874';
const ORDER_MESSAGE = `سلام، برای سفارش تولید محتوا پیام می‌دهم.

موضوع مقاله:
تعداد کلمات:
موضوع یا حوزه سایت:
زمان موردنیاز برای تحویل:
توضیحات و نکات موردنظر:
`;
const SERVICES = [
  'مقاله اختصاصی',
  'عنوان و تیترهای مناسب',
  'مقدمه و جمع‌بندی',
  'نگارش روان',
  'ویرایش و بازبینی',
  'اصول پایه سئو',
];

const STEPS = [
  {
    title: 'ثبت درخواست',
    desc: 'موضوع، تعداد کلمات و توضیحات مورد نیازت رو برامون بفرست.',
  },
  {
    title: 'هماهنگی و تأیید',
    desc: 'جزئیات سفارش، سبک نگارش و مهلت تحویل رو با هم نهایی می‌کنیم.',
  },
  {
    title: 'نگارش و ویرایش',
    desc: 'محتوا نوشته و بازبینی و ویرایش می‌شه.',
  },
  {
    title: 'تحویل نهایی',
    desc: 'مقاله آماده و ویرایش‌شده رو دریافت می‌کنی.',
  },
];

const PORTFOLIO_SAMPLES = [
  {
    title: 'مقدمه‌ای بر یادگیری ماشین؛ از داده تا پیش‌بینی',
    category: 'علوم مهندسی',
    id: '9073d220-efdf-4962-8fce-50759b689cda',
  },
  {
    title: 'اصول تغذیه سالم روزانه',
    category: 'علوم پزشکی',
  },
];

function openPortfolioArticle(id) {
  if (!id) return;

  window.history.pushState(
    {},
    '',
    `${BASE_PATH}/article/${id}`
  );

  window.dispatchEvent(new PopStateEvent('popstate'));

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

export default function ServicesContentPage({ onBack }) {
  function goToContact() {
    document
      .getElementById('services-contact')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  }

  function goToPortfolio() {
    document
      .getElementById('services-portfolio')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  }

  return (
    <section className="services-page">

      <button
        className="back-to-list"
        onClick={onBack}
      >
        ← بازگشت به مقالات
      </button>

      <section className="services-hero">
        <span className="services-badge">
          خدمات تولید محتوا
        </span>

        <h2>
          محتوای حرفه‌ای برای سایت شما
        </h2>

        <p>
  یک مقاله آماده انتشار برای سایت شما؛
  شامل عنوان و تیترهای مناسب، مقدمه، بدنه مقاله،
  جمع‌بندی، ویرایش و اصول پایه سئو.
</p>

<p>
  ✨ تولید با کمک هوش مصنوعی + ویرایش و بازبینی انسانی
</p>

        <div className="services-cta">
          <button
            className="share-btn share-telegram"
            onClick={goToContact}
          >
            ثبت سفارش و مشاوره
          </button>

          <button
            className="share-btn"
            onClick={goToPortfolio}
          >
            مشاهده نمونه‌کار
          </button>
        </div>
      </section>
      <section className="services-section">
  <h3>چرا گفتمان دانش؟</h3>

  <div className="services-list">
    <div className="service-item">
      <span className="service-check">✓</span>
      <span>محتوای اختصاصی متناسب با موضوع شما</span>
    </div>

    <div className="service-item">
      <span className="service-check">✓</span>
      <span>استفاده از هوش مصنوعی برای سرعت بیشتر در تولید</span>
    </div>

    <div className="service-item">
      <span className="service-check">✓</span>
      <span>ویرایش و بازبینی انسانی</span>
    </div>

    <div className="service-item">
      <span className="service-check">✓</span>
      <span>رعایت اصول پایه سئو</span>
    </div>

    <div className="service-item">
      <span className="service-check">✓</span>
      <span>تحویل محتوای آماده انتشار</span>
    </div>
  </div>
</section>
      <section className="services-section">
        <h3>چه خدماتی ارائه می‌دهیم؟</h3>

        <div className="services-list">
          {SERVICES.map((service) => (
            <div
              key={service}
              className="service-item"
            >
              <span className="service-check">✓</span>
              <span>{service}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="services-price">
        <span className="price-label">
          قیمت شروع
        </span>

        <h3>
          مقاله ۱۰۰۰ کلمه‌ای
        </h3>

        <div className="price">
          ۱۵۰ هزار تومان
        </div>

        <p>
          شامل عنوان، تیترهای مناسب، مقدمه،
          بدنه مقاله، جمع‌بندی، ویرایش و اصول پایه سئو.
        </p>
      </section>
      <div className="services-note">
  <strong>🎯 مناسب برای سایت‌ها و کسب‌وکارهای اینترنتی</strong>
  <p>
    محتوایی منظم، روان و آماده انتشار دریافت می‌کنید؛
    بدون نیاز به درگیری با مراحل نگارش و ویرایش.
  </p>
</div>
      <section className="services-section">
        <h3>روند انجام سفارش</h3>

        <div className="steps-list">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="step-item"
            >
              <div className="step-number">
                {index + 1}
              </div>

              <div className="step-content">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="services-portfolio"
        className="services-portfolio-section"
      >
        <h3>نمونه‌کارها</h3>

        <p className="section-description">
          بخشی از نمونه‌های محتوایی تولیدشده در گفتمان دانش.
        </p>

        <div className="portfolio-grid">
          {PORTFOLIO_SAMPLES.map((sample) => (
            <div
              key={sample.title}
              className="portfolio-card"
              onClick={() => openPortfolioArticle(sample.id)}
              style={{
                cursor: sample.id ? 'pointer' : 'default',
              }}
            >
              <span className="entry-category">
                {sample.category}
              </span>

              <h4>{sample.title}</h4>

              {sample.id && (
                <span className="portfolio-link">
                  مشاهده مقاله ←
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section
        id="services-contact"
        className="services-contact-section"
      >
        <h3>تماس و ثبت سفارش</h3>

        <p>
          برای ثبت سفارش، موضوع مقاله، تعداد کلمات
          و توضیحات مورد نیازت رو ارسال کن.
        </p>
        <div className="order-info">
  <h4>برای ثبت سفارش این موارد را ارسال کنید:</h4>
  <p>📝 موضوع مقاله</p>
  <p>📏 تعداد کلمات</p>
  <p>🌐 موضوع یا حوزه سایت</p>
  <p>⏰ زمان موردنیاز برای تحویل</p>
  <p>📌 هر توضیح یا نکته‌ای که باید در مقاله رعایت شود</p>
</div>
        <div className="share-buttons">

          <a
            className="share-btn share-telegram"
            href={`https://t.me/${CONTACT_TELEGRAM_ID}?text=${encodeURIComponent(ORDER_MESSAGE)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            تلگرام
          </a>

          <a
            className="share-btn share-whatsapp"
            href={`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(ORDER_MESSAGE)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            واتساپ
          </a>

        </div>
      </section>

      <button
        className="back-to-list"
        onClick={onBack}
      >
        ← بازگشت به مقالات
      </button>

    </section>
  );
}
