import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  User,
  Bot,
  Copy,
  Check,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { marked } from 'marked';
import { ChatMessage, ApiKeys } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<void>;
  onClearChat: () => void;
  isLoading: boolean;
  onBack: () => void;
  apiKeys: ApiKeys;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  onBack,
  apiKeys,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    '💡 Explícame cómo funciona la computación cuántica de forma sencilla',
    '📝 Escribe un correo profesional para proponer una colaboración',
    '🚀 Genera 5 ideas de negocio innovadoras con bajo capital inicial',
    '💻 Escribe una función en TypeScript para calcular estadísticas de un array',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    onSendMessage(text);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Chat con Inteligencia Artificial
            </h1>
            <p className="text-xs text-white/50">
              {apiKeys.zhipu ? 'Motor Activo: Z.AI (GLM-4)' : 'Motor Activo: Google Gemini 3.8 Flash (Alta Velocidad)'}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all border border-red-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpiar
          </button>
        )}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 glass-panel rounded-2xl border border-white/10 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
              <Bot className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">¡Hola! ¿En qué puedo ayudarte hoy?</h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-md mb-6 leading-relaxed">
              Puedo redactar documentos, responder dudas complejas, generar ideas de proyectos, programar código o resumir textos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl text-left">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt)}
                  className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white/80 hover:text-white transition-all text-left flex items-start gap-2"
                >
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} group`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed relative ${
                    isUser
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20 rounded-tr-sm'
                      : 'glass-panel border border-white/10 text-slate-100 rounded-tl-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/10 text-[11px] opacity-70">
                    <span className="font-semibold">
                      {isUser ? 'Tú' : msg.provider || 'Asistente IA'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div
                      className="prose prose-invert prose-sm max-w-none text-white/90 space-y-2 overflow-x-auto"
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(msg.content) as string,
                      }}
                    />
                  )}

                  {!isUser && (
                    <div className="mt-2 pt-2 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="text-[11px] text-white/40 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copiar texto
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-panel p-3.5 rounded-2xl border border-white/10 text-xs text-emerald-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Pensando y redactando respuesta...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-3 pt-2">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Escribe tu mensaje aquí... (Enter para enviar, Shift+Enter para salto de línea)"
            rows={2}
            className="w-full glass-input rounded-xl p-3 pr-24 text-sm text-white placeholder:text-white/40 focus:outline-none resize-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2.5 bottom-2.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Enviar
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-white/40 px-1 mt-1">
          <span>Respuestas en tiempo real con Inteligencia Artificial</span>
          <span>Shift+Enter para nueva línea</span>
        </div>
      </div>
    </div>
  );
};
