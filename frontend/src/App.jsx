
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

        const updatedMessages = [
      ...messages,
      { role: "user", content: userMessage }
    ];

        const response = await axios.post(
          `${API_URL}/chat`,
          { messages: updatedMessages }
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

  let errorMessage = "Something went wrong.";

  if (error.response) {
    errorMessage = `Server Error: ${
      error.response.data.detail || error.response.statusText
    }`;
  } else if (error.request) {
    errorMessage = "Cannot connect to the backend. Please check whether FastAPI is running.";
  } else {
    errorMessage = error.message;
  }

  setMessages((previous) => [
    ...previous,
    {
      role: "assistant",
      content: errorMessage
    }
  ]);
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
