import React from 'react';
import { Home, MessageSquare, Briefcase, PlusCircle, Grid } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange }) => {
  const items = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'proyectos', label: 'Proyectos', icon: Briefcase },
    { id: 'imagenes', label: 'Crear', icon: PlusCircle },
    { id: 'galeria', label: 'Galería', icon: Grid },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#020617]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg text-xs transition-all ${
              isActive ? 'text-indigo-400 font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
