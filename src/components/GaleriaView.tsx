import React, { useState } from 'react';
import {
  Grid,
  Image as ImageIcon,
  Film,
  Music,
  Trash2,
  Download,
  Search,
  ExternalLink,
  Play,
  ArrowLeft,
  X,
  Sparkles,
} from 'lucide-react';
import { Creation } from '../types';
import { synth } from '../utils/audioSynth';

interface GaleriaViewProps {
  creations: Creation[];
  onDeleteCreation: (id: string) => void;
  onClearAll: () => void;
  onBack: () => void;
  onNavigateCreate: (tab: string) => void;
}

export const GaleriaView: React.FC<GaleriaViewProps> = ({
  creations,
  onDeleteCreation,
  onClearAll,
  onBack,
  onNavigateCreate,
}) => {
  const [filter, setFilter] = useState<'all' | 'imagen' | 'video' | 'musica'>('all');
  const [search, setSearch] = useState('');
  const [previewItem, setPreviewItem] = useState<Creation | null>(null);

  const filtered = creations.filter((c) => {
    const matchesType = filter === 'all' || c.type === filter;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.prompt.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDownload = (item: Creation) => {
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.download = `ai-creation-${item.type}-${item.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Grid className="w-5 h-5 text-blue-400" />
              Mi Galería de Creaciones ({creations.length})
            </h1>
            <p className="text-xs text-white/50">
              Todas las imágenes, vídeos y canciones guardados localmente en tu navegador
            </p>
          </div>
        </div>

        {creations.length > 0 && (
          <button
            onClick={() => {
              if (confirm('¿Estás seguro de que quieres borrar todas tus creaciones?')) {
                onClearAll();
              }
            }}
            className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all border border-red-500/20 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Vaciar Galería
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'Todas', count: creations.length },
            { id: 'imagen', label: 'Imágenes', count: creations.filter((c) => c.type === 'imagen').length },
            { id: 'video', label: 'Vídeos', count: creations.filter((c) => c.type === 'video').length },
            { id: 'musica', label: 'Música', count: creations.filter((c) => c.type === 'musica').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-70 px-1 py-0.2 rounded-full bg-white/10">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por prompt o título..."
            className="w-full glass-input text-xs pl-8 pr-3 py-2 rounded-xl text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Creations */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-white/40">
            <Grid className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No hay creaciones en esta sección</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              Empieza a generar contenido con nuestras herramientas de Inteligencia Artificial.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => onNavigateCreate('imagenes')}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all shadow-md shadow-cyan-600/20"
            >
              Generar Imagen
            </button>
            <button
              onClick={() => onNavigateCreate('videos')}
              className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-all shadow-md shadow-pink-600/20"
            >
              Generar Vídeo
            </button>
            <button
              onClick={() => onNavigateCreate('musica')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20"
            >
              Generar Música
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="glass-panel rounded-2xl overflow-hidden border border-white/10 group flex flex-col justify-between hover:border-indigo-500/40 transition-all hover:translate-y-[-2px]"
            >
              {/* Media Preview */}
              <div
                onClick={() => setPreviewItem(item)}
                className="relative aspect-video bg-black/50 cursor-pointer overflow-hidden flex items-center justify-center"
              >
                {item.type === 'imagen' && item.url ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : item.type === 'video' ? (
                  <div className="w-full h-full relative">
                    <img
                      src={item.url || item.metadata?.frames?.[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-90"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-950/60 to-indigo-950/60 p-4 text-center">
                    <Music className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-white truncate max-w-full">
                      {item.metadata?.composition?.title || item.title}
                    </span>
                    <span className="text-[10px] text-purple-300 mt-0.5">
                      {item.metadata?.composition?.genre || 'Pista de Audio'}
                    </span>
                  </div>
                )}

                {/* Badge Type */}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                      item.type === 'imagen'
                        ? 'bg-cyan-500/80 text-white'
                        : item.type === 'video'
                        ? 'bg-pink-500/80 text-white'
                        : 'bg-purple-500/80 text-white'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
              </div>

              {/* Information & Action footer */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-white line-clamp-1 mb-1">{item.title}</h4>
                  <p className="text-xs text-white/50 line-clamp-2">{item.prompt}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-white/40">
                  <span>{item.date}</span>
                  <div className="flex items-center gap-1">
                    {item.url && (
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-1.5 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                        title="Descargar"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteCreation(item.id)}
                      className="p-1.5 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-3xl w-full p-6 rounded-2xl border border-white/10 space-y-4 animate-fadeIn relative">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white pr-8">{previewItem.title}</h3>

            <div className="rounded-xl overflow-hidden bg-black/60 max-h-[480px] flex items-center justify-center">
              {previewItem.type === 'imagen' && previewItem.url && (
                <img
                  src={previewItem.url}
                  alt={previewItem.title}
                  className="max-h-[480px] w-auto object-contain rounded-lg"
                />
              )}
              {previewItem.type === 'video' && (
                <div className="relative w-full aspect-video flex items-center justify-center">
                  <img
                    src={previewItem.url || previewItem.metadata?.frames?.[0]}
                    alt={previewItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <p className="text-xs text-pink-300 font-mono">Vídeo Cinematográfico Guardado</p>
                  </div>
                </div>
              )}
              {previewItem.type === 'musica' && (
                <div className="p-8 text-center space-y-3 w-full">
                  <Music className="w-12 h-12 text-purple-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">
                    {previewItem.metadata?.composition?.title || previewItem.title}
                  </h4>
                  <p className="text-xs text-purple-300">
                    {previewItem.metadata?.composition?.genre} • {previewItem.metadata?.composition?.tempoBpm} BPM
                  </p>
                  {previewItem.metadata?.composition?.lyrics && (
                    <div className="text-xs text-white/60 max-h-40 overflow-y-auto whitespace-pre-line text-left p-3 rounded-lg bg-white/5">
                      {previewItem.metadata.composition.lyrics}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-semibold text-white/80 block">Prompt utilizado:</span>
              <p className="text-white/60 bg-white/[0.03] p-2.5 rounded-lg">{previewItem.prompt}</p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-white/40">Guardado el {previewItem.date}</span>
              {previewItem.url && (
                <button
                  onClick={() => handleDownload(previewItem)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar Archivo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
