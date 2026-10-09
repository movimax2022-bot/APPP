import React, { useState } from 'react';
import { Key, ChevronDown, ChevronUp, Save, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { ApiKeys } from '../types';

interface ApiHeaderProps {
  apiKeys: ApiKeys;
  onSaveKeys: (keys: ApiKeys) => void;
  hasGeminiKey: boolean;
}

export const ApiHeader: React.FC<ApiHeaderProps> = ({ apiKeys, onSaveKeys, hasGeminiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [keys, setKeys] = useState<ApiKeys>(apiKeys);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveKeys(keys);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#020617]/90 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-white/90">
                  Configuración de Motores IA
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" /> Gemini 3.8 Activo
                </span>
              </div>
              <p className="text-[11px] text-white/50 hidden sm:block">
                Todo funciona de inmediato. Opcionalmente puedes conectar tus claves gratuitas de Z.AI, Replicate y ElevenLabs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium animate-fadeIn">
                <CheckCircle className="w-3.5 h-3.5" /> ¡Guardado!
              </span>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-all"
            >
              <span>{isOpen ? 'Ocultar Claves' : 'Ver Claves API'}</span>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="mt-2 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn">
            {/* Z.AI (GLM-4) */}
            <div className="glass-card p-3 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Z.AI (GLM-4)
                </label>
                <a
                  href="https://z.ai/manage-apikey/apikey-list"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400/80 hover:text-emerald-300 underline"
                >
                  z.ai / Claves →
                </a>
              </div>
              <input
                type="password"
                value={keys.zhipu}
                onChange={(e) => setKeys({ ...keys, zhipu: e.target.value })}
                placeholder="sk-... (clave de z.ai)"
                className="w-full glass-input text-xs px-2.5 py-2 rounded-lg text-white placeholder:text-white/30 focus:outline-none"
              />
              <span className="text-[10px] text-white/40 mt-1 block">
                {keys.zhipu ? 'Clave Z.AI conectada' : 'Por defecto usa Gemini 3.8 Flash'}
              </span>
            </div>

            {/* Replicate */}
            <div className="glass-card p-3 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-pink-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-400"></span> Replicate (FLUX)
                </label>
                <a
                  href="https://replicate.com/account/api-tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-pink-400/80 hover:text-pink-300 underline"
                >
                  Créditos gratis →
                </a>
              </div>
              <input
                type="password"
                value={keys.replicate}
                onChange={(e) => setKeys({ ...keys, replicate: e.target.value })}
                placeholder="r8_..."
                className="w-full glass-input text-xs px-2.5 py-2 rounded-lg text-white placeholder:text-white/30 focus:outline-none"
              />
              <span className="text-[10px] text-white/40 mt-1 block">
                {keys.replicate ? 'Clave conectada' : 'Por defecto usa motor FLUX HD'}
              </span>
            </div>

            {/* ElevenLabs */}
            <div className="glass-card p-3 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span> ElevenLabs Música
                </label>
                <a
                  href="https://elevenlabs.io/api"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-purple-400/80 hover:text-purple-300 underline"
                >
                  10k/mes gratis →
                </a>
              </div>
              <input
                type="password"
                value={keys.eleven}
                onChange={(e) => setKeys({ ...keys, eleven: e.target.value })}
                placeholder="sk_..."
                className="w-full glass-input text-xs px-2.5 py-2 rounded-lg text-white placeholder:text-white/30 focus:outline-none"
              />
              <span className="text-[10px] text-white/40 mt-1 block">
                {keys.eleven ? 'Clave conectada' : 'Por defecto usa Sintetizador Web Audio'}
              </span>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 mt-1">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Save className="w-3.5 h-3.5" /> Guardar Preferencias
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
