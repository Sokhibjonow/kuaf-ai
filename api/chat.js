module.exports = async function handler(req, res) {
  try {

    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Method not allowed" });
    }

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    console.log("Request body:", body);

    const message =
      body.message ||
      body.text ||
      body.prompt ||
      "";

    if (!message.trim()) {
      return res.status(400).json({
        reply: "Сообщение пустое."
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    console.log("Gemini:", data);

    if (data.error) {
      return res.status(500).json({
        reply: "Ошибка Gemini API"
      });
    }

    let reply = "AI не смог ответить.";

    if (data.candidates?.length) {
      reply = data.candidates[0].content.parts
        .map(p => p.text || "")
        .join("");
    }

    res.status(200).json({ reply });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      reply: "Ошибка AI сервера."
    });
  }
};