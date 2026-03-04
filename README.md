# KUAF Platform — Запуск сервера

## Требования
- Node.js версия 14 или выше

## Установка и запуск

```bash
# 1. Перейди в папку проекта
cd kuaf-platform

# 2. Запусти сервер
node server.js
```

## Откроется сайт по адресу:
👉 http://localhost:3000

## Структура проекта
```
kuaf-platform/
├── server.js          ← Node.js сервер (API ключ здесь)
├── package.json
└── project/           ← Фронтенд (HTML, CSS, JS)
    ├── index.html
    ├── js/
    │   └── gemini-chat.js   ← Чат-бот (без ключа)
    ├── css/
    └── pages/
```

## Как это работает
```
Браузер  →  /api/chat  →  server.js  →  Gemini API
                           (ключ здесь, 
                           браузер не видит)
```

## Смена API ключа
Открой `server.js` и измени строку:
```js
const API_KEY = 'твой_новый_ключ';
```
