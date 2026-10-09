import React from 'react';
import {
  MessageSquare,
  Briefcase,
  Image as ImageIcon,
  Film,
  Music,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  FolderPlus,
  Play,
} from 'lucide-react';
import { Creation, Project } from '../types';

interface InicioViewProps {
  onNavigate: (tab: string) => void;
  creations: Creation[];
  projects: Project[];
  chatCount: number;
}

export const InicioView: React.FC<InicioViewProps> = ({
  onNavigate,
  creations,
  projects,
  chatCount,
}) => {
  const imgCount = creations.filter((c) => c.type === 'imagen').length;
  const vidCount = creations.filter((c) => c.type === 'video').length;
  const musCount = creations.filter((c) => c.type === 'musica').length;

  const stats = [
    { label: 'Conversaciones', value: chatCount, icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Imágenes FLUX', value: imgCount, icon: ImageIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Vídeos Creados', value: vidCount, icon: Film, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
    { label: 'Pistas Musicales', value: musCount, icon: Music, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-white/10 bg-gradient-to-br from-indigo-950/40 via-[#020617] to-purple-950/30">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> AI Studio PRO v3.0 Funcional 100%
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Crea contenido profesional con{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Inteligencia Artificial Real
            </span>
          </h1>
          <p className="text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed mb-6">
            Todo el ecosistema activo: Chatea con Gemini 3.8 Flash, genera imágenes con motor FLUX,
            diseña vídeos con guion cinematográfico, sintetiza pistas de música y organiza tus proyectos con IA.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('chat')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <MessageSquare className="w-4 h-4" /> Iniciar Chat IA
            </button>
            <button
              onClick={() => onNavigate('imagenes')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl border border-white/15 transition-all hover:scale-[1.02]"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" /> Generar Imagen FLUX
            </button>
            <button
              onClick={() => onNavigate('proyectos')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl border border-white/15 transition-all hover:scale-[1.02]"
            >
              <Briefcase className="w-4 h-4 text-amber-400" /> Nuevo Proyecto
            </button>
          </div>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`glass-card p-4 rounded-xl border ${stat.bg} transition-all hover:scale-[1.01]`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white/60">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Access Modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" /> Módulos de Creación
          </h2>
          <span className="text-xs text-white/50">Elige una herramienta para empezar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chat */}
          <div
            onClick={() => onNavigate('chat')}
            className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-emerald-500/40 cursor-pointer transition-all hover:translate-y-[-2px] group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1 flex items-center justify-between">
              Chat Inteligente
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Conversa con Gemini 3.8 Flash o Z.AI (GLM-4). Redacción, análisis, programación y resolución de dudas.
            </p>
          </div>

          {/* Imagenes */}
          <div
            onClick={() => onNavigate('imagenes')}
            className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan-500/40 cursor-pointer transition-all hover:translate-y-[-2px] group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1 flex items-center justify-between">
              Generador de Imágenes
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Motor FLUX Neural en alta resolución con soporte de relación de aspecto 1:1, 16:9 y 9:16.
            </p>
          </div>

          {/* Vídeos */}
          <div
            onClick={() => onNavigate('videos')}
            className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-pink-500/40 cursor-pointer transition-all hover:translate-y-[-2px] group"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1 flex items-center justify-between">
              CineMotion Studio
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-pink-400" />
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Convierte prompts en guiones de cine con desglose de cámara, planos dinámicos y animación visual.
            </p>
          </div>

          {/* Música */}
          <div
            onClick={() => onNavigate('musica')}
            className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-purple-500/40 cursor-pointer transition-all hover:translate-y-[-2px] group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Music className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1 flex items-center justify-between">
              Sintetizador de Música
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Composición musical asistida por IA con acordes, bajo, arpegios y exportación en formato WAV.
            </p>
          </div>

          {/* Proyectos */}
          <div
            onClick={() => onNavigate('proyectos')}
            className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-amber-500/40 cursor-pointer transition-all hover:translate-y-[-2px] group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1 flex items-center justify-between">
              Gestor de Proyectos
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Asistente de planificación que transforma cualquier idea en un plan de acción con tareas interactivas.
            </p>
          </div>

          {/* Galería */}
          <div
            onClick={() => onNavigate('galeria')}
            className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-blue-500/40 cursor-pointer transition-all hover:translate-y-[-2px] group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1 flex items-center justify-between">
              Mi Galería
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Explora, reproduce y descarga todas tus creaciones almacenadas en tu navegador sin límite.
            </p>
          </div>
        </div>
      </div>

      {/* Guide and status */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10">
        <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Estado de Motores de Inteligencia Artificial
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="font-semibold text-emerald-400 block mb-1">🟢 Chat & Textos</span>
            <p className="text-white/60">
              Conectado a Google Gemini 3.8 Flash en el servidor Express. Respuestas rápidas en español con Markdown.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="font-semibold text-cyan-400 block mb-1">🟢 Imágenes FLUX</span>
            <p className="text-white/60">
              Generación neural real de 1024x1024 y 16:9 con enriquecedor de prompts cinematográficos.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="font-semibold text-purple-400 block mb-1">🟢 Audio & Sintetizador</span>
            <p className="text-white/60">
              Motor Web Audio en tiempo real que produce audio estéreo de 44.1kHz descargable en WAV.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
