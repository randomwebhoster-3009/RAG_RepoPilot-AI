import { useState } from "react";
import "../styles/AIChat.css";

function AIChat() {
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hello — ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const newMessages = [...messages, { from: "user", text: userText }];
    setMessages(newMessages);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();
      setMessages((m) => [...m, { from: "ai", text: data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { from: "ai", text: "Error contacting chat server." }]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-root">
      <div className="chat-header">AI Assistant</div>

      <div className="messages" id="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your question and press Enter"
        />
        <button onClick={sendMessage} disabled={sending}>
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}

export default AIChat;
