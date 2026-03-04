// Система интернационализации
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'ru';
        this.translations = {};
        this.init();
    }

    async init() {
        try {
            // Загружаем переводы
            const response = await fetch('data/translations.json');
            this.translations = await response.json();
            
            // Применяем сохраненный язык
            this.setLanguage(this.currentLang);
            
            // Настраиваем обработчики кнопок
            this.setupLanguageButtons();
        } catch (error) {
            console.error('Ошибка загрузки переводов:', error);
        }
    }

    setupLanguageButtons() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });
    }

    setLanguage(lang) {
        if (!this.translations[lang]) {
            console.error(`Язык ${lang} не найден`);
            return;
        }

        this.currentLang = lang;
        localStorage.setItem('language', lang);
        
        // Обновляем активную кнопку
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });

        // Применяем переводы
        this.applyTranslations();
        
        // Обновляем атрибут lang у html
        document.documentElement.setAttribute('lang', lang);
    }

    applyTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                // Для input и textarea используем placeholder
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                console.warn(`Перевод не найден для ключа: ${key}`);
                return null;
            }
        }
        
        return value;
    }

    // Метод для получения текущего языка
    getCurrentLanguage() {
        return this.currentLang;
    }

    // Метод для использования в других скриптах
    t(key) {
        return this.getTranslation(key);
    }
}

// Создаем глобальный экземпляр
const i18n = new I18n();

// Экспортируем для использования в других скриптах
window.i18n = i18n;