export default async function handler(req, res) {
  try {
    const { message } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // если API вернул ошибку
    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(500).json({
        reply: "Ошибка Gemini API. Проверь ключ или модель.",
      });
    }

    let reply = "AI не смог ответить.";

    if (data?.candidates?.[0]?.content?.parts) {
      reply = data.candidates[0].content.parts
        .map((p) => p.text || "")
        .join("");
    }

    res.status(200).json({ reply });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ reply: "Ошибка AI сервера." });
  }
}