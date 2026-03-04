// i18n.js (updated) — loads translations from assets/data/translations.json
class I18n {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'language';
    this.currentLang = localStorage.getItem(this.storageKey) || 'ru';
    this.translations = options.translations || null;
    this.translationPaths = options.translationPaths || [
      'assets/data/translations.json',
      '../assets/data/translations.json',
      '../../assets/data/translations.json',
      '../../../assets/data/translations.json'
    ];
    this.init();
  }

  async init() {
    await this.loadTranslations();
    this.translatePage();
    this.bindLanguageButtons();
    this.updateActiveButton();
  }

  async loadTranslations() {
    if (this.translations) return;

    const candidates = [];
    if (window.TRANSLATIONS_URL) candidates.push(window.TRANSLATIONS_URL);
    candidates.push(...this.translationPaths);

    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) continue;
        this.translations = await res.json();
        return;
      } catch (e) {}
    }

    this.translations = { ru: { site_title: document.title }, uz: { site_title: document.title }, en: { site_title: document.title } };
  }

  getValue(lang, key) {
    const dict = (this.translations && this.translations[lang]) ? this.translations[lang] : null;
    if (!dict) return null;

    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];

    const parts = key.split('.');
    let cur = dict;
    for (const p of parts) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
      else return null;
    }
    return (typeof cur === 'string') ? cur : null;
  }

  translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const t = this.getValue(this.currentLang, key);
      if (!t) return;

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = t;
      else el.textContent = t;
    });

    const titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
      const t = this.getValue(this.currentLang, titleEl.getAttribute('data-i18n'));
      if (t) document.title = t;
    }

    document.documentElement.lang = this.currentLang;
  }

  bindLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        if (!lang) return;
        this.currentLang = lang;
        localStorage.setItem(this.storageKey, this.currentLang);
        this.translatePage();
        this.updateActiveButton();
      });
    });
  }

  updateActiveButton() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === this.currentLang);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new I18n());
} else {
  new I18n();
}

console.log('i18n system loaded (updated)');
