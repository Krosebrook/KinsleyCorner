import React, { useState, useRef, useEffect } from 'react';
import { AppMode, ChatMessage } from '../types';
import { chatWithBot } from '../services/geminiService';
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot } from 'lucide-react';

interface ChatBotProps {
  mode: AppMode;
}

export const ChatBot: React.FC<ChatBotProps> = ({ mode }) => {
  const isKid = mode === AppMode.Kid;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: isKid 
        ? "Hi! I'm your mindfulness buddy. How are you feeling? 🌟" 
        : "Hello. I'm your mindfulness coach. How can I help you today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Filter history for API
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      
      const responseText = await chatWithBot(userMsg.text, history, isKid);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      // Optional error handling UI
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-transform hover:scale-105 z-40 flex items-center gap-2 ${
          isKid 
            ? 'bg-kid-primary text-white border-4 border-white' 
            : 'bg-indigo-600 text-white'
        }`}
      >
        <MessageCircle size={28} />
        <span className="font-bold pr-2">{isKid ? 'Chat Buddy' : 'AI Coach'}</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-80 md:w-96 h-[500px] flex flex-col rounded-2xl shadow-2xl z-40 overflow-hidden ${
      isKid ? 'bg-white border-4 border-kid-primary' : 'bg-white border border-slate-200'
    }`}>
      {/* Header */}
      <div className={`p-4 flex justify-between items-center ${
        isKid ? 'bg-kid-primary text-white' : 'bg-indigo-600 text-white'
      }`}>
        <div className="flex items-center gap-2">
          <Bot size={24} />
          <h3 className="font-bold">{isKid ? 'Mindful Buddy' : 'Meditation Coach'}</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user'
                  ? (isKid ? 'bg-kid-primary text-white rounded-br-none' : 'bg-indigo-600 text-white rounded-br-none')
                  : (isKid ? 'bg-white border-2 border-slate-100 text-slate-800 rounded-bl-none shadow-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm')
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-200 p-3 rounded-2xl rounded-bl-none animate-pulse">
              <span className="opacity-0">...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isKid ? "Say something..." : "Type your question..."}
            className="flex-1 px-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-full transition-colors ${
              isKid 
               ? 'bg-kid-secondary text-white hover:bg-amber-500' 
               : 'bg-indigo-600 text-white hover:bg-indigo-700'
            } disabled:opacity-50`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};