import { useState, useRef } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';

export function ChatBar({ onSend, isProcessing }) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || selectedImage) {
      onSend(message, selectedImage || undefined);
      setMessage('');
      setSelectedImage(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-96 z-20 bg-white/80 backdrop-blur-xl border-t border-gray-200 p-6">
      {/* Image Preview */}
      {selectedImage && (
        <div className="mb-3 flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl w-fit">
          <div className="text-sm text-gray-600">📎 {selectedImage.name}</div>
          <button
            onClick={() => setSelectedImage(null)}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Chat Bar */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="bg-white rounded-full shadow-lg border border-gray-200 flex items-center gap-3 px-6 py-4">
          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            disabled={isProcessing}
            title="Upload schedule image"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            disabled={isProcessing}
          />
          
          {/* Text Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask to schedule... (e.g., 'CS meeting with professor on Monday, make it green')"
            className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
            disabled={isProcessing}
          />
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={(!message.trim() && !selectedImage) || isProcessing}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Helper Text */}
        <div className="text-center mt-3 text-xs text-gray-500">
          Try: "Weekly CS meeting on Mondays until Dec 30, make it green" or upload a schedule screenshot
        </div>
      </form>
    </div>
  );
}
