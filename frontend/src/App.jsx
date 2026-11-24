
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

    setMessages((previous) => [
      ...previous,
      { role: "user", content: userMessage }
    ]);

    setMessage("");
    setLoading(true);

    try {

      const response = await axios.post(
        `${API_URL}/chat`,
        {
          message: userMessage
        }
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.data.ai_response
        }
      ]);

    } catch (error) {

      console.error("API Error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please check the backend."
        }
      ]);

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="app">

      <header>
        <h1>Local AI Chatbot</h1>
        <p>Powered by LM Studio and FastAPI</p>
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
            <div className="message assistant">
              <strong>AI</strong>
              <p>Thinking...</p>
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
