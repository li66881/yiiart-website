/**
 * Simple client-side i18n (no build tools)
 * - Default language: English
 * - Auto-detect from browser language
 * - Manual switcher (8 languages)
 * - RTL support for Arabic
 */

(function () {
  const STORAGE_KEY = 'yiiart_lang';

  const LANGS = [
    { code: 'en', label: 'English', dir: 'ltr' },
    { code: 'zh', label: '中文', dir: 'ltr' },
    { code: 'ar', label: 'العربية', dir: 'rtl' },
    { code: 'es', label: 'Español', dir: 'ltr' },
    { code: 'fr', label: 'Français', dir: 'ltr' },
    { code: 'de', label: 'Deutsch', dir: 'ltr' },
    { code: 'ja', label: '日本語', dir: 'ltr' },
    { code: 'ko', label: '한국어', dir: 'ltr' },
  ];

  // Minimal dictionary for key UI text.
  // Keep keys stable; add more as you expand pages.
  const DICT = {
    en: {
      'nav.explore': 'Explore',
      'nav.homeScenes': 'Home Scenes',
      'nav.abstract': 'Abstract',
      'nav.texture': 'Texture',
      'nav.artists': 'Artists',
      'nav.collections': 'Collections',

      'hero.kicker': 'Art for Home',
      'hero.titleLine1': 'Choose a scene first,',
      'hero.titleEm': 'then choose art',
      'hero.desc': 'Start from real home spaces to quickly find the right size, tone, and mood.',
      'hero.ctaPrimary': 'Browse home scenes',
      'hero.ctaSecondary': 'View all artworks',

      'trust.original.title': '100% Original',
      'trust.original.desc': 'Each artwork includes a signed certificate of authenticity',
      'trust.shipping.title': 'Free Global Shipping',
      'trust.shipping.desc': 'Professional packaging, delivered worldwide',
      'trust.return.title': '30-Day Trial',
      'trust.return.desc': 'Full refund if it does not fit your space',
      'trust.support.title': 'Support Artists',
      'trust.support.desc': '80% of sales go directly to creators',

      'scenes.kicker': 'Shop by Home Scene',
      'scenes.title': 'Home scenes',
      'scenes.desc': 'Pick your space and jump into artwork suggestions that feel right at home.',
      'scenes.living.title': 'Elevate your living room',
      'scenes.bedroom.title': 'A softer bedroom mood',
      'scenes.study.title': 'Focus-friendly inspiration',
      'scenes.enter': 'Enter scene',
      'scenes.living.tag': 'Living room',
      'scenes.bedroom.tag': 'Bedroom',
      'scenes.study.tag': 'Study',

      'collections.kicker': 'Curated Collections',
      'collections.title': 'Collections',
      'collections.desc': 'Hand-picked selections that tell a distinct story',
      'collections.explore': 'Explore collection',

      'newsletter.title': 'Join the art journey',
      'newsletter.desc': 'Get curated picks, artist stories, and collecting guides',
      'newsletter.placeholder': 'Enter your email',
      'newsletter.submit': 'Subscribe',

      'footer.rights': 'All rights reserved.',

      'lang.label': 'Language'
    },

    zh: {
      'nav.explore': '探索',
      'nav.homeScenes': '家庭场景',
      'nav.abstract': '抽象艺术',
      'nav.texture': '纹理艺术',
      'nav.artists': '艺术家',
      'nav.collections': '策展',

      'hero.kicker': 'Art for Home',
      'hero.titleLine1': '先选场景，',
      'hero.titleEm': '再选艺术',
      'hero.desc': '用真实家庭空间做参考，快速找到尺寸、色调与氛围都合适的作品。',
      'hero.ctaPrimary': '浏览家庭场景',
      'hero.ctaSecondary': '直接看作品',

      'trust.original.title': '100% 原创真迹',
      'trust.original.desc': '每件作品均附有艺术家签名与真品证书',
      'trust.shipping.title': '全球免费配送',
      'trust.shipping.desc': '专业包装，安全送达世界任何角落',
      'trust.return.title': '30天鉴赏期',
      'trust.return.desc': '不满意即可全额退款，无后顾之忧',
      'trust.support.title': '支持艺术家',
      'trust.support.desc': '80%销售额直接回馈创作者',

      'scenes.kicker': '按家庭场景选购',
      'scenes.title': '家庭场景',
      'scenes.desc': '选择你的空间，直接进入更贴近真实家居的作品展示',
      'scenes.living.title': '让客厅更高级',
      'scenes.bedroom.title': '更温柔的氛围',
      'scenes.study.title': '更专注的灵感',
      'scenes.enter': '进入场景',
      'scenes.living.tag': '客厅',
      'scenes.bedroom.tag': '卧室',
      'scenes.study.tag': '书房',

      'collections.kicker': '策展专题',
      'collections.title': '策展专题',
      'collections.desc': '由专业策展人精心挑选，每一组作品都讲述独特的故事',
      'collections.explore': '探索系列',

      'newsletter.title': '加入艺术之旅',
      'newsletter.desc': '订阅我们的通讯，获取独家艺术品推荐、艺术家访谈和收藏指南',
      'newsletter.placeholder': '输入你的邮箱地址',
      'newsletter.submit': '订阅',

      'footer.rights': '保留所有权利。',
      'lang.label': '语言'
    },

    ar: {
      'nav.explore': 'استكشف',
      'nav.homeScenes': 'مشاهد المنزل',
      'nav.abstract': 'تجريدي',
      'nav.texture': 'ملمس',
      'nav.artists': 'الفنانون',
      'nav.collections': 'المجموعات',

      'hero.kicker': 'فن للمنزل',
      'hero.titleLine1': 'اختر المشهد أولاً،',
      'hero.titleEm': 'ثم اختر العمل',
      'hero.desc': 'ابدأ من مساحات منزلية حقيقية للعثور بسرعة على الحجم واللون والمزاج المناسب.',
      'hero.ctaPrimary': 'تصفح مشاهد المنزل',
      'hero.ctaSecondary': 'عرض جميع الأعمال',

      'trust.original.title': 'أصلي 100%',
      'trust.original.desc': 'كل عمل يتضمن شهادة أصالة موقعة',
      'trust.shipping.title': 'شحن مجاني عالميًا',
      'trust.shipping.desc': 'تغليف احترافي وتسليم إلى كل مكان',
      'trust.return.title': 'تجربة لمدة 30 يومًا',
      'trust.return.desc': 'استرداد كامل إذا لم يناسب مساحتك',
      'trust.support.title': 'دعم الفنانين',
      'trust.support.desc': '80% من المبيعات تذهب مباشرة إلى المبدعين',

      'scenes.kicker': 'تسوق حسب مشهد المنزل',
      'scenes.title': 'مشاهد المنزل',
      'scenes.desc': 'اختر مساحتك وانتقل إلى اقتراحات تناسب المنزل.',
      'scenes.living.title': 'ارفع مستوى غرفة المعيشة',
      'scenes.bedroom.title': 'مزاج أكثر هدوءًا لغرفة النوم',
      'scenes.study.title': 'إلهام للتركيز',
      'scenes.enter': 'الدخول',
      'scenes.living.tag': 'غرفة المعيشة',
      'scenes.bedroom.tag': 'غرفة النوم',
      'scenes.study.tag': 'المكتب',

      'collections.kicker': 'مجموعات مختارة',
      'collections.title': 'المجموعات',
      'collections.desc': 'اختيارات منسقة تروي قصة مميزة',
      'collections.explore': 'استكشف المجموعة',

      'newsletter.title': 'انضم إلى رحلة الفن',
      'newsletter.desc': 'احصل على ترشيحات مختارة وقصص الفنانين وأدلة الاقتناء',
      'newsletter.placeholder': 'أدخل بريدك الإلكتروني',
      'newsletter.submit': 'اشتراك',

      'footer.rights': 'جميع الحقوق محفوظة.',
      'lang.label': 'اللغة'
    }
  };

  function getPreferredLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DICT[saved]) return saved;

    const browser = (navigator.language || 'en').toLowerCase();
    if (browser.startsWith('zh')) return 'zh';
    if (browser.startsWith('ar')) return 'ar';
    if (browser.startsWith('es')) return 'es';
    if (browser.startsWith('fr')) return 'fr';
    if (browser.startsWith('de')) return 'de';
    if (browser.startsWith('ja')) return 'ja';
    if (browser.startsWith('ko')) return 'ko';
    return 'en';
  }

  function setHtmlDir(lang) {
    const meta = LANGS.find(l => l.code === lang) || LANGS[0];
    document.documentElement.setAttribute('dir', meta.dir);
    document.documentElement.setAttribute('lang', lang);
  }

  function t(lang, key) {
    return (DICT[lang] && DICT[lang][key]) || (DICT.en && DICT.en[key]) || '';
  }

  function applyTranslations(lang) {
    setHtmlDir(lang);

    document.querySelectorAll('[data-i18n]')?.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = t(lang, key);
      if (!value) return;
      el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]')?.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = t(lang, key);
      if (!value) return;
      el.setAttribute('placeholder', value);
    });
  }

  function mountSwitcher(lang) {
    const host = document.querySelector('[data-lang-switcher]');
    if (!host) return;

    host.innerHTML = '';

    const label = document.createElement('span');
    label.className = 'lang-switcher__label';
    label.setAttribute('data-i18n', 'lang.label');
    label.textContent = t(lang, 'lang.label');

    const select = document.createElement('select');
    select.className = 'lang-switcher__select';
    select.setAttribute('aria-label', 'Language');

    LANGS.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.code;
      opt.textContent = l.label;
      if (l.code === lang) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', () => {
      const next = select.value;
      localStorage.setItem(STORAGE_KEY, next);
      applyTranslations(next);
      mountSwitcher(next);
    });

    host.appendChild(label);
    host.appendChild(select);
  }

  window.YiiArtI18n = {
    apply: (lang) => {
      const next = lang || getPreferredLang();
      localStorage.setItem(STORAGE_KEY, next);
      applyTranslations(next);
      mountSwitcher(next);
    },
    detect: getPreferredLang,
  };

  // boot
  const initial = getPreferredLang();
  applyTranslations(initial);
  mountSwitcher(initial);
})();
