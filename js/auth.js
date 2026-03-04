/**
 * KUAF Platform — Auth Guard + User Menu
 * Подключить этот скрипт в index.html (и других страницах) перед </body>
 */

(function() {
    'use strict';

    const AUTH_KEY = 'kuaf_logged_in';
    const USER_KEY = 'kuaf_current_user';

    // ── 1. При первом визите (нет записи) → редирект на auth.html ──────────
    const loggedIn = localStorage.getItem(AUTH_KEY);

    // Не редиректим, если мы уже на странице auth
    const isAuthPage = window.location.pathname.endsWith('auth.html');

    if (!loggedIn && !isAuthPage) {
        window.location.href = getRootPath() + 'auth.html';
        return; // стоп, дальше не выполняем
    }

    // ── 2. Дождаться загрузки DOM, потом встроить UI ─────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        injectUserUI();
    });

    // ── Вычислить относительный путь до корня (для вложенных страниц) ────
    function getRootPath() {
        const depth = (window.location.pathname.match(/\//g) || []).length - 1;
        if (depth <= 0) return '';
        return '../'.repeat(depth);
    }

    // ── 3. Добавить кнопку пользователя / выхода в .nav-actions ──────────
    function injectUserUI() {
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        const userRaw = localStorage.getItem(USER_KEY);
        let user = null;
        try { user = JSON.parse(userRaw); } catch(e) {}

        const displayName = user ? user.firstName : 'Профиль';

        // Создаём контейнер
        const wrap = document.createElement('div');
        wrap.id = 'auth-user-wrap';
        wrap.style.cssText = 'display:flex;align-items:center;gap:8px;';

        wrap.innerHTML = `
            <div id="auth-user-btn" style="
                display:flex;align-items:center;gap:8px;
                padding:8px 14px;
                background:#ef4444;color:#fff;
                border-radius:8px;font-weight:600;font-size:0.875rem;
                cursor:pointer;border:none;font-family:inherit;
                transition:background 0.2s,transform 0.2s;
                position:relative;
            " title="Аккаунт">
                <span style="font-size:1.1rem">👤</span>
                <span id="auth-name-label">${escapeHTML(displayName)}</span>
                <span style="font-size:0.7rem;opacity:0.8">▾</span>
            </div>
            <div id="auth-dropdown" style="
                display:none;position:absolute;top:calc(100% + 8px);right:0;
                background:#fff;border:1px solid #e5e7eb;border-radius:10px;
                box-shadow:0 10px 25px rgba(0,0,0,0.12);min-width:200px;
                z-index:9999;overflow:hidden;
            ">
                <div style="padding:14px 16px;border-bottom:1px solid #f3f4f6;background:#fafafa;">
                    <div style="font-weight:700;font-size:0.95rem;color:#111827">${user ? escapeHTML(user.firstName + ' ' + user.lastName) : '—'}</div>
                    <div style="font-size:0.8rem;color:#6b7280;margin-top:2px">${user ? escapeHTML(user.email) : ''}</div>
                </div>
                <a href="${getRootPath()}pages/profile/index.html" style="
                    display:flex;align-items:center;gap:10px;
                    padding:12px 16px;text-decoration:none;color:#374151;font-size:0.9rem;
                    transition:background 0.15s;
                " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''"
                >📋 <span>Мой профиль</span></a>
                <button onclick="kuafLogout()" style="
                    width:100%;display:flex;align-items:center;gap:10px;
                    padding:12px 16px;background:none;border:none;cursor:pointer;
                    font-family:inherit;font-size:0.9rem;color:#ef4444;font-weight:600;
                    border-top:1px solid #f3f4f6;transition:background 0.15s;
                " onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background=''"
                >🚪 <span>Выйти</span></button>
            </div>
        `;

        // Позиция relative для dropdown
        const btn = wrap.querySelector('#auth-user-btn');
        btn.style.position = 'relative';
        const dropdown = wrap.querySelector('#auth-dropdown');

        // Переместить dropdown на body-уровень чтобы не обрезался
        document.body.appendChild(dropdown);

        // Toggle dropdown
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const rect = btn.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + window.scrollY + 8) + 'px';
            dropdown.style.right = (window.innerWidth - rect.right) + 'px';
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', function() {
            dropdown.style.display = 'none';
        });

        // Hover эффект кнопки
        btn.addEventListener('mouseenter', () => { btn.style.background = '#dc2626'; btn.style.transform = 'translateY(-1px)'; });
        btn.addEventListener('mouseleave', () => { btn.style.background = '#ef4444'; btn.style.transform = ''; });

        // Вставить в nav перед language-switcher
        navActions.insertBefore(wrap, navActions.firstChild);
    }

    // ── 4. Выход ─────────────────────────────────────────────────────────
    window.kuafLogout = function() {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = getRootPath() + 'auth.html';
    };

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;');
    }

})();