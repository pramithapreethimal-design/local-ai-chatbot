
import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://127.0.0.1:8000";


const sendMessage = async () => {
  if (!message.trim() || loading) return;

  const userMessage = message;

  const updatedMessages = [
    ...messages,
    { role: "user", content: userMessage }
  ];

  setMessages([
    ...updatedMessages,
    { role: "assistant", content: "" }
  ]);

  setMessage("");
  setLoading(true);

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: updatedMessages
      })
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Streaming response is not available.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let aiReply = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      aiReply += chunk;

      setMessages(previous => {
        const updated = [...previous];

        updated[updated.length - 1] = {
          role: "assistant",
          content: aiReply
        };

        return updated;
      });
    }

    aiReply += decoder.decode();

    setMessages(previous => {
      const updated = [...previous];

      updated[updated.length - 1] = {
        role: "assistant",
        content: aiReply
      };

      return updated;
    });

  } catch (error) {
    console.error("API Error:", error);

    setMessages(previous => {
      const updated = [...previous];

      updated[updated.length - 1] = {
        role: "assistant",
        content: `Error: ${error.message}`
      };

      return updated;
    });

  } finally {
    setLoading(false);
  }
};


  const clearChat = () => {
  setMessages([]);
  setMessage("");
};


  return (
    <div className="app">

      <header>
        <h1>Local AI Chatbot</h1>
        <p>Powered by LM Studio and FastAPI</p>

          <button onClick={clearChat}>
            + New Chat
          </button>


      </header>

      <div className="chat-container">

        <div className="messages">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`message ${msg.role}`}
            >
              <strong>
                {msg.role === "user" ? "You" : "AI"}
              </strong>

              <p>{msg.content}</p>
            </div>

          ))}

          {loading && (
  <div className="message assistant loading">
    <strong>AI</strong>
    <p>AI is thinking...</p>
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
)}

        </div>

        <div className="input-area">

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Ask me anything..."
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
          >
            {loading ? "Sending..." : "Send"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default App;
