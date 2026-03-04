// Gemini Chatbot for KUAF Platform
// API ключ хранится на сервере — в браузере не виден!
(function () {
  const HISTORY_KEY = 'kuaf_chat_history';

  const SYSTEM_PROMPT = `Ты — AI-помощник образовательной IT-платформы KUAF. Ты помогаешь ученикам изучать компьютерные технологии: устройство ПК, ноутбуков, смартфонов, моноблоков. Ты объясняешь технические термины простым языком, помогаешь с выбором комплектующих, отвечаешь на вопросы о курсах платформы. Отвечай на том языке, на котором пишет пользователь (русский, узбекский или английский). Будь дружелюбным и поддерживающим.`;

  let chatHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  let isOpen = false;
  let isTyping = false;

  // =============================================
  //  ВЫЗОВ СЕРВЕРА (не Gemini напрямую!)
  // =============================================
  async function askGemini(message) {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory.slice(0, -1).map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.parts[0].text
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    const data = await response.json();
    if (data.error) {
      console.log(data);
      throw new Error(data.error);
    }
    return data.reply;
  }

  // =============================================
  //  UI
  // =============================================
  function createChatUI() {
    const style = document.createElement('style');
    style.textContent = `
      #kuaf-chat-btn {
        position: fixed;
        bottom: 28px;
        right: 28px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        border-radius: 50%;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(239,68,68,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        z-index: 9999;
        transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease;
      }
      #kuaf-chat-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 28px rgba(239,68,68,0.5);
      }
      #kuaf-chat-btn .chat-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 18px;
        height: 18px;
        background: #22c55e;
        border-radius: 50%;
        border: 2px solid white;
        animation: pulse-badge 2s infinite;
      }
      @keyframes pulse-badge {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.8; }
      }
      #kuaf-chat-window {
        position: fixed;
        bottom: 100px;
        right: 28px;
        width: 370px;
        max-height: 560px;
        background: #fff;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        z-index: 9998;
        overflow: hidden;
        transform: scale(0.8) translateY(30px);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.35s cubic-bezier(.34,1.56,.64,1), opacity 0.25s ease;
        font-family: 'Inter', sans-serif;
      }
      #kuaf-chat-window.open {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: all;
      }
      .chat-header {
        background: linear-gradient(135deg, #111827, #1f2937);
        padding: 16px 18px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .chat-header-avatar {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
      }
      .chat-header-info { flex: 1; }
      .chat-header-name {
        color: white;
        font-weight: 700;
        font-size: 15px;
        line-height: 1.2;
      }
      .chat-header-status {
        color: #9ca3af;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
      }
      .status-dot {
        width: 7px;
        height: 7px;
        background: #22c55e;
        border-radius: 50%;
        display: inline-block;
      }
      .chat-header-close {
        background: rgba(255,255,255,0.1);
        border: none;
        color: #9ca3af;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s, color 0.2s;
      }
      .chat-header-close:hover { background: rgba(255,255,255,0.2); color: white; }
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 300px;
        max-height: 380px;
        scroll-behavior: smooth;
      }
      .chat-messages::-webkit-scrollbar { width: 4px; }
      .chat-messages::-webkit-scrollbar-track { background: transparent; }
      .chat-messages::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
      .msg {
        display: flex;
        gap: 8px;
        animation: msg-in 0.3s cubic-bezier(.34,1.56,.64,1);
      }
      @keyframes msg-in {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .msg.user { flex-direction: row-reverse; }
      .msg-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .msg.bot  .msg-avatar { background: linear-gradient(135deg, #ef4444, #dc2626); }
      .msg.user .msg-avatar { background: linear-gradient(135deg, #3b82f6, #2563eb); }
      .msg-bubble {
        max-width: 82%;
        padding: 10px 14px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.55;
        word-break: break-word;
      }
      .msg.bot  .msg-bubble { background: #f3f4f6; color: #111827; border-bottom-left-radius: 4px; }
      .msg.user .msg-bubble { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border-bottom-right-radius: 4px; }
      .typing-indicator { display: flex; gap: 5px; align-items: center; padding: 12px 14px; }
      .typing-dot { width: 7px; height: 7px; background: #9ca3af; border-radius: 50%; animation: typing 1.2s infinite; }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
        30% { transform: translateY(-5px); opacity: 1; }
      }
      .chat-footer-actions {
        display: flex;
        justify-content: flex-end;
        padding: 6px 14px 0;
      }
      .chat-clear-btn {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 6px;
        font-family: inherit;
        transition: color 0.2s, background 0.2s;
      }
      .chat-clear-btn:hover { color: #ef4444; background: #fef2f2; }
      .chat-input-area {
        padding: 12px 14px;
        border-top: 1px solid #f3f4f6;
        display: flex;
        gap: 8px;
        align-items: flex-end;
        background: white;
      }
      .chat-input {
        flex: 1;
        border: 1.5px solid #e5e7eb;
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 14px;
        font-family: inherit;
        outline: none;
        resize: none;
        max-height: 90px;
        line-height: 1.5;
        transition: border-color 0.2s;
        color: #111827;
      }
      .chat-input:focus { border-color: #ef4444; }
      .chat-input::placeholder { color: #9ca3af; }
      .chat-send {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        border: none;
        border-radius: 12px;
        color: white;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .chat-send:hover { transform: scale(1.08); box-shadow: 0 4px 12px rgba(239,68,68,0.4); }
      .chat-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      .chat-welcome {
        text-align: center;
        color: #6b7280;
        font-size: 13px;
        padding: 24px 10px 10px;
      }
      .chat-welcome-icon { font-size: 40px; margin-bottom: 10px; }
      .chat-welcome h4 { color: #111827; font-size: 15px; margin-bottom: 6px; }
      @media (max-width: 430px) {
        #kuaf-chat-window { width: calc(100vw - 24px); right: 12px; bottom: 90px; }
        #kuaf-chat-btn { right: 16px; bottom: 20px; }
      }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'kuaf-chat-btn';
    btn.title = 'AI-помощник KUAF';
    btn.innerHTML = `🤖<span class="chat-badge"></span>`;
    btn.onclick = toggleChat;
    document.body.appendChild(btn);

    const win = document.createElement('div');
    win.id = 'kuaf-chat-window';
    win.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-avatar">🤖</div>
        <div class="chat-header-info">
          <div class="chat-header-name">KUAF AI-помощник</div>
          <div class="chat-header-status"><span class="status-dot"></span> На связи · Gemini 1.5 Flash</div>
        </div>
        <button class="chat-header-close" onclick="document.getElementById('kuaf-chat-window').classList.remove('open')">✕</button>
      </div>
      <div class="chat-footer-actions">
        <button class="chat-clear-btn" onclick="kuafClearHistory()">🗑 Очистить чат</button>
      </div>
      <div class="chat-messages" id="kuaf-chat-messages">
        <div class="chat-welcome">
          <div class="chat-welcome-icon">🤖</div>
          <h4>Привет! Я AI-помощник KUAF</h4>
          <p>Спроси меня о курсах, комплектующих или IT-технологиях!</p>
        </div>
      </div>
      <div class="chat-input-area">
        <textarea class="chat-input" id="kuaf-chat-input" placeholder="Напиши свой вопрос..." rows="1"></textarea>
        <button class="chat-send" id="kuaf-chat-send" title="Отправить">➤</button>
      </div>
    `;
    document.body.appendChild(win);

    const textarea = document.getElementById('kuaf-chat-input');
    textarea.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 90) + 'px';
    });
    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    document.getElementById('kuaf-chat-send').onclick = sendMessage;

    if (chatHistory.length > 0) {
      const messagesEl = document.getElementById('kuaf-chat-messages');
      messagesEl.innerHTML = '';
      chatHistory.forEach(m => appendMessage(m.role === 'user' ? 'user' : 'bot', m.parts[0].text, false));
    }
  }

  function toggleChat() {
    isOpen = !isOpen;
    document.getElementById('kuaf-chat-window').classList.toggle('open', isOpen);
    if (isOpen) { setTimeout(() => document.getElementById('kuaf-chat-input').focus(), 300); scrollToBottom(); }
  }

  window.kuafClearHistory = function () {
    chatHistory = [];
    localStorage.removeItem(HISTORY_KEY);
    document.getElementById('kuaf-chat-messages').innerHTML = `
      <div class="chat-welcome">
        <div class="chat-welcome-icon">🤖</div>
        <h4>Привет! Я AI-помощник KUAF</h4>
        <p>Спроси меня о курсах, комплектующих или IT-технологиях!</p>
      </div>`;
  };

  function appendMessage(role, text, save = true) {
    const messagesEl = document.getElementById('kuaf-chat-messages');
    const welcome = messagesEl.querySelector('.chat-welcome');
    if (welcome) welcome.remove();
    const msg = document.createElement('div');
    msg.className = `msg ${role}`;
    msg.innerHTML = `
      <div class="msg-avatar">${role === 'bot' ? '🤖' : '👤'}</div>
      <div class="msg-bubble">${escapeHtml(text).replace(/\n/g, '<br>')}</div>`;
    messagesEl.appendChild(msg);
    scrollToBottom();
    if (save) {
      chatHistory.push({ role: role === 'user' ? 'user' : 'model', parts: [{ text }] });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(chatHistory));
    }
  }

  function showTyping() {
    const messagesEl = document.getElementById('kuaf-chat-messages');
    const el = document.createElement('div');
    el.className = 'msg bot'; el.id = 'kuaf-typing';
    el.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function hideTyping() { const el = document.getElementById('kuaf-typing'); if (el) el.remove(); }
  function scrollToBottom() { const el = document.getElementById('kuaf-chat-messages'); if (el) el.scrollTop = el.scrollHeight; }
  function escapeHtml(str) { return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  async function sendMessage() {
    if (isTyping) return;
    const input = document.getElementById('kuaf-chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = ''; input.style.height = 'auto';
    appendMessage('user', text);
    isTyping = true;
    document.getElementById('kuaf-chat-send').disabled = true;
    showTyping();
    try {
      const reply = await askGemini(text);
      hideTyping();
      appendMessage('bot', reply);
    } catch (err) {
      hideTyping();
      appendMessage('bot', `⚠️ Ошибка: ${err.message}`);
    } finally {
      isTyping = false;
      document.getElementById('kuaf-chat-send').disabled = false;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatUI);
  } else {
    createChatUI();
  }
})();
