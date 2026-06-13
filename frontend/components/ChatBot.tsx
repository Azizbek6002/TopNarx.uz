'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Salom boss 😎 TopNarx.uz da ko\'rganimdan hursandman . Men senin narx ovchingman — bir xil taomga ikki xil narx berishayotganini ko\'rsam ichim achib ketadi 😤 | Qani, bugun nima qidiramiz?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessageCount(prev => prev + 1);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          messageCount
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Server birozgina chetga chiqdi 😅 Bir soniya… narxlarni yig\'ib qaytaman!'
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Internet tiqilib qoldi shekilli 📡 Lekin men ketmadim — refresh bosib qayt, davom etamiz!'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label="Chat ochish"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #c9a84c 0%, #8a6a25 100%)',
          border: '2px solid rgba(201,168,76,0.45)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.45), 0 0 0 2px rgba(201,168,76,0.18)',
          transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.12) rotate(-5deg)';
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.55), 0 0 0 3px rgba(201,168,76,0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.45), 0 0 0 2px rgba(201,168,76,0.18)';
        }}
      >
        {isOpen ? (
          <svg width="22" height="22" fill="none" stroke="white" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="26" height="26" fill="none" stroke="white" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      <div style={{
        position: 'fixed',
        bottom: '100px',
        right: '28px',
        width: '390px',
        height: '570px',
        background: '#0c0c0c',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 999,
        boxShadow: '0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.15)',
        overflow: 'hidden',
        transformOrigin: 'bottom right',
        transition: 'transform 0.3s cubic-bezier(.34,1.56,.64,1), opacity 0.25s ease',
        transform: isOpen ? 'scale(1)' : 'scale(0.85)',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none'
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 18px 14px',
          background: 'linear-gradient(160deg, #181818 0%, #111 100%)',
          borderBottom: '1px solid rgba(201,168,76,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Avatar */}
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a84c, #8a6a25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
            boxShadow: '0 0 0 2px rgba(201,168,76,0.25)'
          }}>
            🔍
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '2px'
            }}>
              <span style={{
                fontFamily: "'Sora', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: '15px',
                color: '#f5f0e8',
                letterSpacing: '-0.01em'
              }}>TopNarx Assistant</span>
              <span style={{
                fontSize: '10px',
                background: 'rgba(201,168,76,0.15)',
                border: '1px solid rgba(201,168,76,0.3)',
                color: '#c9a84c',
                borderRadius: '6px',
                padding: '1px 6px',
                fontFamily: 'monospace',
                letterSpacing: '0.05em'
              }}>AI</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontFamily: "'Sora', system-ui, sans-serif",
              fontSize: '11px',
              color: '#6b6b6b'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#52b788',
                display: 'inline-block',
                boxShadow: '0 0 6px #52b788'
              }} />
              Narxlarni kuzatyapman…
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '16px',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(201,168,76,0.12)';
              e.currentTarget.style.color = '#c9a84c';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = '#666';
            }}
          >✕</button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: '#080808',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(201,168,76,0.15) transparent'
        }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '8px',
                alignItems: 'flex-end',
                animation: 'slideIn 0.28s cubic-bezier(.34,1.2,.64,1) both'
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c9a84c, #6a4f1a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  flexShrink: 0,
                  marginBottom: '2px'
                }}>🔍</div>
              )}
              <div style={{
                maxWidth: '78%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user'
                  ? '18px 18px 4px 18px'
                  : '18px 18px 18px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #c9a84c 0%, #9a7530 100%)'
                  : 'rgba(255,255,255,0.04)',
                border: msg.role === 'assistant'
                  ? '1px solid rgba(255,255,255,0.07)'
                  : 'none',
                color: msg.role === 'user' ? '#0c0c0c' : '#e8e2d8',
                fontFamily: "'Sora', system-ui, sans-serif",
                fontSize: '13.5px',
                lineHeight: 1.55,
                fontWeight: msg.role === 'user' ? 600 : 400,
                letterSpacing: '-0.005em'
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #c9a84c, #6a4f1a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                flexShrink: 0
              }}>🔍</div>
              <div style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '18px 18px 18px 4px',
                display: 'flex',
                gap: '5px',
                alignItems: 'center'
              }}>
                {[0, 0.18, 0.36].map((delay, i) => (
                  <div key={i} style={{
                    width: '7px',
                    height: '7px',
                    background: '#c9a84c',
                    borderRadius: '50%',
                    animation: `bounce 1.2s ${delay}s infinite ease-in-out`
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div style={{
          padding: '8px 14px 0',
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          background: '#080808'
        }}>
          {['🍔 Burger qidiraylik', '💸 Arzon taom', '📍 Yaqinimdagi', '⭐ Reytingli joy'].map(chip => (
            <button
              key={chip}
              onClick={() => setInput(chip.slice(2).trim())}
              style={{
                padding: '5px 11px',
                background: 'rgba(201,168,76,0.07)',
                border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: '20px',
                color: '#c9a84c',
                fontSize: '11px',
                fontFamily: "'Sora', system-ui, sans-serif",
                cursor: 'pointer',
                transition: 'all 0.18s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(201,168,76,0.15)';
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(201,168,76,0.07)';
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)';
              }}
            >{chip}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: '#0c0c0c',
          marginTop: '8px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Taom yoki restoran yoz…"
              style={{
                flex: 1,
                padding: '11px 15px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '25px',
                color: '#f0ece4',
                fontFamily: "'Sora', system-ui, sans-serif",
                fontSize: '13px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: input.trim() && !isLoading
                  ? 'linear-gradient(135deg, #c9a84c 0%, #8a6a25 100%)'
                  : 'rgba(255,255,255,0.06)',
                border: 'none',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.22s cubic-bezier(.34,1.56,.64,1)',
                flexShrink: 0
              }}
              onMouseEnter={e => {
                if (!isLoading && input.trim()) {
                  e.currentTarget.style.transform = 'scale(1.08)';
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(201,168,76,0.45)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="17" height="17" fill="none" stroke={input.trim() && !isLoading ? '#0c0c0c' : '#444'} strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
            40% { transform: translateY(-7px) scale(1.1); opacity: 1; }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(8px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </>
  );
}