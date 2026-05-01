/**
 * KUAF Platform — Auth Guard
 * Подключить этот скрипт в index.html (и других страницах) перед </body>
 */

(function() {
    'use strict';

    const AUTH_KEY = 'kuaf_logged_in';
    const USER_KEY = 'kuaf_current_user';

    const loggedIn = localStorage.getItem(AUTH_KEY);
    const isAuthPage = window.location.pathname.endsWith('auth.html');

    if (!loggedIn && !isAuthPage) {
        window.location.href = getRootPath() + 'auth.html';
        return;
    }

    function getRootPath() {
        const depth = (window.location.pathname.match(/\//g) || []).length - 1;
        if (depth <= 0) return '';
        return '../'.repeat(depth);
    }

    window.kuafLogout = function() {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = getRootPath() + 'auth.html';
    };

})();