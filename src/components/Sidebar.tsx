import React from 'react';
import {
  Home,
  MessageSquare,
  Briefcase,
  Image as ImageIcon,
  Film,
  Music,
  Grid,
  Sparkles,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  creationsCount: number;
  projectsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  creationsCount,
  projectsCount,
}) => {
  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Home, color: 'text-indigo-400' },
    { id: 'chat', label: 'Chat con IA', icon: MessageSquare, color: 'text-emerald-400' },
    {
      id: 'proyectos',
      label: 'Mis Proyectos',
      icon: Briefcase,
      color: 'text-amber-400',
      badge: projectsCount > 0 ? projectsCount : undefined,
    },
    { id: 'imagenes', label: 'Generar Imágenes', icon: ImageIcon, color: 'text-cyan-400' },
    { id: 'videos', label: 'Generar Vídeos', icon: Film, color: 'text-pink-400' },
    { id: 'musica', label: 'Generar Música', icon: Music, color: 'text-purple-400' },
    {
      id: 'galeria',
      label: 'Galería',
      icon: Grid,
      color: 'text-blue-400',
      badge: creationsCount > 0 ? creationsCount : undefined,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-[53px] bottom-0 w-64 bg-[#030712]/95 border-r border-white/10 p-4 z-30 overflow-y-auto">
      {/* Brand title */}
      <div className="flex items-center gap-3 px-3 py-3 mb-6 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-white/5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
            AI Studio PRO
          </h1>
          <p className="text-[10px] text-white/50 tracking-wider uppercase font-semibold">
            Suite Creativa Real
          </p>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex flex-col gap-1.5 flex-1">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-3 mb-1">
          Navegación
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white border border-indigo-500/30 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-white/50'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-4 border-t border-white/10 mt-4">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-white/60">
          <div className="flex items-center gap-2 text-white/80 font-semibold mb-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Versión 3.0 Pro
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed">
            Potenciado por Gemini 3.8 Flash, FLUX y sintetizador Web Audio.
          </p>
        </div>
      </div>
    </aside>
  );
};
