const chatInput = document.querySelector("#chat-input");
const sendBtn = document.querySelector("#chat-send");
const chatMessages = document.querySelector("#chat-messages");

function addMessage(text, type) {
  const msg = document.createElement("div");
  msg.className = "chat-message " + type;
  msg.innerText = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
  const message = chatInput.value.trim();

  if (!message) {
    addMessage("Сообщение пустое.", "bot");
    return;
  }

  addMessage(message, "user");
  chatInput.value = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      addMessage("Ошибка AI сервера.", "bot");
      console.error("Invalid JSON:", text);
      return;
    }

    addMessage(data.reply || "AI не ответил.", "bot");

  } catch (error) {
    console.error(error);
    addMessage("Ошибка соединения с сервером.", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});