module.exports = async function handler(req, res) {
  try {

    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Method not allowed" });
    }

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const message = body?.message;

    if (!message || message.trim() === "") {
      return res.status(400).json({ reply: "Сообщение пустое." });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: message }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("Gemini response:", data);

    if (data.error) {
      return res.status(500).json({
        reply: "Ошибка Gemini API. Проверь API ключ или модель."
      });
    }

    let reply = "AI не смог ответить.";

    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0].content.parts;
      reply = parts.map(p => p.text || "").join("");
    }

    res.status(200).json({ reply });

  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      reply: "Ошибка AI сервера."
    });
  }
};