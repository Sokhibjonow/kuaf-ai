console.log("=== KUAF SERVER STARTED ===");

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

// ⚠️ ВСТАВЬ СЮДА СВОЙ АКТУАЛЬНЫЙ GEMINI API KEY
const API_KEY = "AIzaSyAH3FY6nSgVNdvfaOxYV737ZZbRdqdyr6U";

// ==============================
// MIME TYPES
// ==============================
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// ==============================
// GEMINI CALL (v1 - stable)
// ==============================
async function callGemini(messages) {
  const lastUserMessage = messages[messages.length - 1].content;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Отвечай строго на языке пользователя. Без переводов.\n\n" + lastUserMessage
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();

  console.log("STATUS:", response.status);
  console.log("RAW RESPONSE:", data);

  const reply =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!reply) {
    throw new Error(data?.error?.message || "Нет ответа от Gemini");
  }

  return reply;
}

// ==============================
// SERVER
// ==============================
const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // ==========================
  // API ROUTE
  // ==========================
  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const { messages } = JSON.parse(body);

        if (!messages || !Array.isArray(messages)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "messages обязателен" }));
          return;
        }

        const reply = await callGemini(messages);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ reply }));

      } catch (error) {
        console.error("Ошибка /api/chat:", error.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      }
    });

    return;
  }

  // ==========================
  // STATIC FILES
  // ==========================
  let urlPath = req.url.split("?")[0];
  if (urlPath === "/") urlPath = "/index.html";

  const filePath = path.join(__dirname, "project", urlPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath);
    const contentType =
      MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

// ==============================
// START
// ==============================
server.listen(PORT, () => {
  console.log(`✅ KUAF сервер запущен: http://localhost:${PORT}`);
  console.log("🤖 Gemini 2.5 Flash подключён");
});