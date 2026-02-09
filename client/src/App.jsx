import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './index.css'; // Make sure styles are applied

function App() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am DeepSeek R1 via OpenRouter. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Assuming backend runs on port 5000
      const response = await axios.post('https://deepseek-chatbot-cfmy.onrender.com/api/chat', { message: input });
      const botMessage = { role: 'bot', content: response.data.reply || "Thinking..." }; // Backend returns { reply: ... }

      // If backend logic is slightly different, adjust here. Assuming simple { reply: string }
      if (response.data.reply) {
        setMessages(prev => [...prev, { role: 'bot', content: response.data.reply }]);
      } else {
        // If streaming logic or structure is different, add error handling
        setMessages(prev => [...prev, { role: 'bot', content: "No response from AI." }]);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: 'bot', content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <header className="header">
        <h1>DeepSeek R1 Chat</h1>
      </header>

      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.role === 'bot' ? (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            ) : (
              msg.content
            )}
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <span className="typing-indicator">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          disabled={loading}
          autoFocus
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default App;
