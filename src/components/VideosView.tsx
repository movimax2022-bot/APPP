import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Download,
  ArrowLeft,
  RefreshCw,
  Video,
  Clapperboard,
  Sliders,
  Volume2,
  Check,
} from 'lucide-react';
import { ApiKeys, Creation } from '../types';

interface VideosViewProps {
  onSaveCreation: (creation: Omit<Creation, 'id' | 'date'>) => void;
  onBack: () => void;
  apiKeys: ApiKeys;
}

export const VideosView: React.FC<VideosViewProps> = ({
  onSaveCreation,
  onBack,
  apiKeys,
}) => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('5');
  const [style, setStyle] = useState('cinematic');
  const [isGenerating, setIsGenerating] = useState(false);

  // Video playback state
  const [videoData, setVideoData] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const playbackIntervalRef = useRef<any>(null);

  const samplePrompts = [
    'Una cascada colosal en una selva tropical bioluminiscente, cámara paneando suavemente hacia arriba revelando un templo antiguo',
    'Un coche deportivo futurista acelerando en una autopista suspendida sobre una metrópoli de rascacielos con luces de neón',
    'Un dragón de fuego sobrevolando una cordillera nevada al atardecer con nieve cayendo en cámara lenta',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setVideoData(null);
    setIsPlaying(false);

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration,
          style,
          customReplicateKey: apiKeys.replicate || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al generar vídeo');
      }

      const data = await res.json();
      setVideoData(data);
      setCurrentFrameIndex(0);
      setPlaybackProgress(0);
      setIsPlaying(true);

      // Save to gallery
      onSaveCreation({
        type: 'video',
        title: data.title || prompt.slice(0, 40),
        prompt: prompt,
        url: data.posterUrl || data.frames?.[0] || '',
        metadata: {
          duration: data.duration,
          screenplay: data.screenplay,
          frames: data.frames,
        },
      });
    } catch (err: any) {
      alert(`Error al generar vídeo: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Video playback loop
  useEffect(() => {
    if (!videoData || !videoData.frames || videoData.frames.length === 0) return;

    if (isPlaying) {
      const frameDuration = (Number(videoData.duration) * 1000) / videoData.frames.length;
      playbackIntervalRef.current = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          const next = (prev + 1) % videoData.frames.length;
          return next;
        });
      }, frameDuration);
    } else {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    }

    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, [isPlaying, videoData]);

  // Smooth progress bar update
  useEffect(() => {
    if (!isPlaying || !videoData) return;
    const totalMs = Number(videoData.duration) * 1000;
    const interval = 100;
    const step = (interval / totalMs) * 100;

    const progressTimer = setInterval(() => {
      setPlaybackProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + step;
      });
    }, interval);

    return () => clearInterval(progressTimer);
  }, [isPlaying, videoData]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
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
              <Film className="w-5 h-5 text-pink-400" />
              CineMotion AI — Estudio de Vídeo
            </h1>
            <p className="text-xs text-white/50">
              Genera guiones cinematográficos, planos de cámara y animación visual con IA
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <label className="text-xs font-semibold text-white/80 block">
              Describe la escena de tu vídeo
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe la acción, personajes, entorno, ángulo de cámara y ambiente sonoro..."
              rows={4}
              className="w-full glass-input text-xs p-3.5 rounded-xl text-white placeholder:text-white/40 focus:outline-none resize-none"
            />

            {/* Quick samples */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-white/50 block font-medium">Ejemplos cinematográficos:</span>
              <div className="flex flex-col gap-1.5">
                {samplePrompts.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(s)}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all text-left line-clamp-1"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-2">Duración</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full glass-input text-xs p-2.5 rounded-xl text-white focus:outline-none cursor-pointer"
                >
                  <option value="5">5 segundos (Clip Rápido)</option>
                  <option value="10">10 segundos (Escena Completa)</option>
                  <option value="15">15 segundos (Trailer Épico)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-2">Estilo de Rodaje</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full glass-input text-xs p-2.5 rounded-xl text-white focus:outline-none cursor-pointer"
                >
                  <option value="cinematic">Cinemático 35mm</option>
                  <option value="hyperreal">Hiperrealista 8K</option>
                  <option value="scifi">Ciencia Ficción Neón</option>
                  <option value="documentary">Naturaleza Documental</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 text-white shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dirigiendo escena y generando planos...</span>
                </>
              ) : (
                <>
                  <Clapperboard className="w-4 h-4" />
                  <span>PRODUCIR VÍDEO CON IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Player & Screenplay */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
              <span className="font-semibold text-white/80">Reproductor de Cine AI</span>
              {videoData && (
                <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                  <Check className="w-3.5 h-3.5" /> Guardado en Galería
                </span>
              )}
            </div>

            {/* Simulated Dynamic Video Canvas */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center group shadow-2xl">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-3 border-pink-500/20 border-t-pink-400 animate-spin" />
                  <p className="text-xs font-semibold text-pink-300">Generando rodaje cinematográfico...</p>
                  <p className="text-[11px] text-white/50 max-w-xs">
                    Componiendo planos de cámara, transiciones e iluminación volumétrica.
                  </p>
                </div>
              ) : videoData && videoData.frames ? (
                <>
                  <img
                    src={videoData.frames[currentFrameIndex]}
                    alt="Escena actual"
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out scale-105 filter brightness-95 contrast-105"
                  />
                  {/* Subtle cinema bar overlays */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-black/80 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/80 pointer-events-none" />

                  {/* Scene Tag */}
                  <div className="absolute top-6 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-pink-300 font-mono border border-pink-500/30">
                    PLANO {currentFrameIndex + 1}/{videoData.frames.length} — 24 FPS
                  </div>

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 rounded-full bg-pink-600/90 hover:bg-pink-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setCurrentFrameIndex(0);
                        setPlaybackProgress(0);
                        setIsPlaying(true);
                      }}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shadow-md transition-transform"
                      title="Reiniciar"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-4 left-0 right-0 h-1.5 bg-white/20">
                    <div
                      className="h-full bg-pink-500 transition-all duration-100"
                      style={{ width: `${playbackProgress}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center p-6 text-white/40 space-y-2">
                  <Film className="w-12 h-12 mx-auto opacity-30 text-pink-400" />
                  <p className="text-xs">El vídeo producido aparecerá aquí</p>
                  <p className="text-[11px] opacity-60">Describe tu escena y pulsa Producir</p>
                </div>
              )}
            </div>

            {/* Playback Control Strip */}
            {videoData && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-all"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
                  </button>
                  <span className="text-xs text-white/60 font-mono">
                    Duración: {videoData.duration}s
                  </span>
                </div>

                <a
                  href={videoData.posterUrl || videoData.frames?.[0]}
                  download="cine-frame.png"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar Fotograma HD
                </a>
              </div>
            )}
          </div>

          {/* Director Screenplay Details */}
          {videoData && videoData.screenplay && (
            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3 animate-fadeIn text-xs">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <Clapperboard className="w-4 h-4 text-pink-400" />
                Guion y Desglose del Director ({videoData.title})
              </h3>

              <div className="space-y-2">
                {videoData.screenplay.scenes?.map((scene: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-pink-400 font-mono text-[11px]">
                      <span>{scene.timestamp || `Escena ${i + 1}`}</span>
                      <span>{scene.camera}</span>
                    </div>
                    <p className="text-white/80">{scene.action}</p>
                    {scene.audioDescription && (
                      <p className="text-white/50 text-[11px] flex items-center gap-1.5 italic">
                        <Volume2 className="w-3 h-3 text-pink-400/70 shrink-0" />
                        {scene.audioDescription}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
