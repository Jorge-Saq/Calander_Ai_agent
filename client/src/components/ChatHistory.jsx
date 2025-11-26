import { useEffect, useRef } from 'react';

export function ChatHistory({ messages }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-0 right-0 w-96 h-screen overflow-y-auto z-10 bg-white/80 backdrop-blur-xl shadow-2xl border-l border-gray-200 p-6" ref={scrollRef}>
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
        <div className="text-gray-900">Activity Log</div>
      </div>
      
      <div className="space-y-3 pb-48">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-2xl p-3 text-sm ${
              msg.type === 'user'
                ? 'bg-blue-50 border border-blue-100'
                : msg.type === 'success'
                ? 'bg-green-50 border border-green-100'
                : msg.type === 'error'
                ? 'bg-red-50 border border-red-100'
                : 'bg-gray-50 border border-gray-100'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                {msg.type === 'user' && '👤'}
                {msg.type === 'system' && '🤖'}
                {msg.type === 'success' && '✅'}
                {msg.type === 'error' && '❌'}
              </div>
              <div className="flex-1">
                <div className={`${
                  msg.type === 'user' ? 'text-blue-900' :
                  msg.type === 'success' ? 'text-green-900' :
                  msg.type === 'error' ? 'text-red-900' :
                  'text-gray-700'
                }`}>
                  {msg.content}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {msg.timestamp.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
