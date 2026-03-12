// i18n.js — universal translation system for KUAF

class I18n {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'language';
    this.currentLang = localStorage.getItem(this.storageKey) || 'uz';

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

    if (window.TRANSLATIONS_URL) {
      candidates.push(window.TRANSLATIONS_URL);
    }

    candidates.push(...this.translationPaths);

    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) continue;

        this.translations = await res.json();
        console.log("Translations loaded:", url);
        return;
      } catch (e) {
        console.warn("Translation load failed:", url);
      }
    }

    console.warn("No translations file found");
    this.translations = {
      uz: {},
      ru: {},
      en: {}
    };
  }

  getValue(lang, key) {
    const dict = this.translations?.[lang];
    if (!dict) return null;

    if (Object.prototype.hasOwnProperty.call(dict, key)) {
      return dict[key];
    }

    const parts = key.split('.');
    let cur = dict;

    for (const p of parts) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
        cur = cur[p];
      } else {
        return null;
      }
    }

    return typeof cur === 'string' ? cur : null;
  }

  translatePage() {

    document.querySelectorAll('[data-i18n], [data-translate]').forEach(el => {

      const key =
        el.getAttribute('data-i18n') ||
        el.getAttribute('data-translate');

      if (!key) return;

      const text = this.getValue(this.currentLang, key);

      if (!text) return;

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }

    });

    const titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
      const t = this.getValue(
        this.currentLang,
        titleEl.getAttribute('data-i18n')
      );
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

        localStorage.setItem(this.storageKey, lang);

        this.translatePage();
        this.updateActiveButton();

      });

    });

  }

  updateActiveButton() {

    document.querySelectorAll('.lang-btn').forEach(btn => {

      btn.classList.toggle(
        'active',
        btn.getAttribute('data-lang') === this.currentLang
      );

    });

  }
}

if (document.readyState === 'loading') {

  document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18n();
  });

} else {

  window.i18n = new I18n();

}

console.log("KUAF i18n system loaded");