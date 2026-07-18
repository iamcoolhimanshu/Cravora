import React, { useState } from 'react';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([
    { text: "Hello! Ask me any questions about Cravora recommendations, pizza deals, active offers, or support issues!", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userText })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { text: data.answer, isBot: true }]);
      } else {
        setMessages(prev => [...prev, { text: "Sorry, I am facing server issues. Try asking about Pizza or Discounts!", isBot: true }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { text: "Error connecting to AI bot.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9000 }}>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            border: 'none',
            color: 'white',
            fontSize: '1.8rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px var(--primary-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: '0.2s'
          }}
          className="pulse-button"
        >
          🤖
        </button>
      )}

      {/* Chat Window Popup */}
      {isOpen && (
        <div
          className="glass-card"
          style={{
            width: '320px',
            height: '420px',
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            gap: '0.8rem',
            position: 'absolute',
            bottom: '0',
            right: '0',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            border: '1px solid var(--border-light)'
          }}
        >
          {/* Chat Window Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🤖</span>
              <strong style={{ fontSize: '0.95rem' }}>Cravora AI Assistant</strong>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              &times;
            </button>
          </div>

          {/* Messages Log area */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.2rem' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.isBot ? 'flex-start' : 'flex-end',
                  background: msg.isBot ? 'rgba(255,255,255,0.04)' : 'var(--primary-color)',
                  color: 'white',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '12px',
                  borderBottomLeftRadius: msg.isBot ? '2px' : '12px',
                  borderBottomRightRadius: msg.isBot ? '12px' : '2px',
                  maxWidth: '85%',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  border: msg.isBot ? '1px solid var(--border-light)' : 'none'
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.8rem', paddingLeft: '0.5rem' }}>
                Typing...
              </div>
            )}
          </div>

          {/* User Input Form */}
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Ask about foods or coupons..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="form-control"
              style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
