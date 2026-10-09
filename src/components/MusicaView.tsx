import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  Download,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Volume2,
  Mic,
  Headphones,
  Check,
  Radio,
} from 'lucide-react';
import { ApiKeys, Creation } from '../types';
import { synth } from '../utils/audioSynth';

interface MusicaViewProps {
  onSaveCreation: (creation: Omit<Creation, 'id' | 'date'>) => void;
  onBack: () => void;
  apiKeys: ApiKeys;
}

export const MusicaView: React.FC<MusicaViewProps> = ({
  onSaveCreation,
  onBack,
  apiKeys,
}) => {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('synthwave');
  const [duration, setDuration] = useState('30');
  const [isVocal, setIsVocal] = useState(true);
  const [isComposing, setIsComposing] = useState(false);

  // Synthesizer playback state
  const [musicData, setMusicData] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBeat, setActiveBeat] = useState(0);
  const [downloadingWav, setDownloadingWav] = useState(false);
  const stopPlaybackRef = useRef<(() => void) | null>(null);

  const genreOptions = [
    { id: 'synthwave', name: 'Synthwave / Retro 80s', bpm: 124 },
    { id: 'pop', name: 'Pop Radiable Moderno', bpm: 120 },
    { id: 'lofi', name: 'Lofi Chill / Hip Hop', bpm: 85 },
    { id: 'orchestral', name: 'Cinemático Orquestal', bpm: 110 },
    { id: 'electronic', name: 'EDM / Dance Fest', bpm: 128 },
    { id: 'urban', name: 'Urbano / Reggaeton', bpm: 95 },
  ];

  const samplePrompts = [
    'Una canción synthwave nostálgica con sintetizadores analógicos, bajo potente y batería retro sobre conducir de noche',
    'Un tema pop veraniego con guitarra acústica, voz alegre y ritmo bailable sobre viajar a la playa',
    'Música lofi relajante con piano suave, lluvia de fondo y ritmo suave para estudiar o meditar',
  ];

  const handleCompose = async () => {
    if (!prompt.trim() || isComposing) return;
    setIsComposing(true);
    if (stopPlaybackRef.current) {
      stopPlaybackRef.current();
      setIsPlaying(false);
    }

    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: genre,
          duration,
          customElevenKey: apiKeys.eleven || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Error al componer música');
      }

      const data = await res.json();
      setMusicData(data);

      // Save to gallery
      onSaveCreation({
        type: 'musica',
        title: data.composition?.title || prompt.slice(0, 35),
        prompt: prompt,
        url: '',
        metadata: {
          composition: data.composition,
          duration: data.duration,
        },
      });
    } catch (err: any) {
      alert(`Error al generar música: ${err.message}`);
    } finally {
      setIsComposing(false);
    }
  };

  const handleTogglePlay = () => {
    if (!musicData?.composition) return;

    if (isPlaying) {
      if (stopPlaybackRef.current) stopPlaybackRef.current();
      setIsPlaying(false);
    } else {
      const comp = musicData.composition;
      stopPlaybackRef.current = synth.playTrack(
        comp.tempoBpm || 120,
        comp.chords || ['C', 'G', 'Am', 'F'],
        comp.synthNotes || [],
        (beat) => setActiveBeat(beat),
        () => setIsPlaying(false)
      );
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (stopPlaybackRef.current) stopPlaybackRef.current();
    };
  }, []);

  // Export actual .wav file
  const handleExportWav = async () => {
    if (!musicData?.composition || downloadingWav) return;
    setDownloadingWav(true);
    try {
      const comp = musicData.composition;
      const wavUrl = await synth.exportWav(
        comp.tempoBpm || 120,
        comp.chords || ['C', 'G', 'Am', 'F'],
        comp.synthNotes || [],
        Number(duration) || 15
      );
      const a = document.createElement('a');
      a.href = wavUrl;
      a.download = `${(comp.title || 'cancion-ai').replace(/\s+/g, '-').toLowerCase()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert('Error exportando audio');
    } finally {
      setDownloadingWav(false);
    }
  };

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
              <Music className="w-5 h-5 text-purple-400" />
              Estudio de Composición y Música AI
            </h1>
            <p className="text-xs text-white/50">
              {apiKeys.eleven ? 'Motor Activo: Conexión ElevenLabs' : 'Motor Activo: Sintetizador Web Audio Estéreo + Letras AI'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <label className="text-xs font-semibold text-white/80 block">
              Describe tu canción o pista musical
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe el estilo, instrumentos, tono emocional, temática y tempo deseado..."
              rows={4}
              className="w-full glass-input text-xs p-3.5 rounded-xl text-white placeholder:text-white/40 focus:outline-none resize-none"
            />

            {/* Quick samples */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-white/50 block font-medium">Ideas de composiciones:</span>
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
            {/* Genre */}
            <div>
              <label className="text-xs font-semibold text-white/80 block mb-2">Género Musical</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {genreOptions.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGenre(g.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      genre === g.id
                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="block text-xs font-semibold">{g.name}</span>
                    <span className="block text-[10px] text-white/40">{g.bpm} BPM</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-2">Duración</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full glass-input text-xs p-2.5 rounded-xl text-white focus:outline-none cursor-pointer"
                >
                  <option value="15">15 segundos</option>
                  <option value="30">30 segundos</option>
                  <option value="60">60 segundos (Pista Completa)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-2">Modalidad</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVocal(true)}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      isVocal
                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                        : 'bg-white/[0.02] border-white/5 text-white/60'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-purple-400" /> Letra
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVocal(false)}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      !isVocal
                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                        : 'bg-white/[0.02] border-white/5 text-white/60'
                    }`}
                  >
                    <Headphones className="w-3.5 h-3.5 text-purple-400" /> Pista
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleCompose}
              disabled={!prompt.trim() || isComposing}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              {isComposing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Componiendo melodía, acordes y letra...</span>
                </>
              ) : (
                <>
                  <Music className="w-4 h-4" />
                  <span>COMPONER Y SINTETIZAR CANCIÓN</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Player & Lyrics */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
              <span className="font-semibold text-white/80">Reproductor de Sonido AI</span>
              {musicData && (
                <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                  <Check className="w-3.5 h-3.5" /> Guardado en Galería
                </span>
              )}
            </div>

            {/* Visualizer & Deck */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-950/40 to-black/60 border border-purple-500/20 text-center space-y-4 shadow-xl">
              {isComposing ? (
                <div className="py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full border-3 border-purple-500/20 border-t-purple-400 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-purple-300">Generando pista de audio...</p>
                  <p className="text-[11px] text-white/50">Calculando frecuencias, escala y compás armónico.</p>
                </div>
              ) : musicData && musicData.composition ? (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {musicData.composition.title}
                    </h3>
                    <p className="text-xs text-purple-300 font-medium">
                      {musicData.composition.genre} • {musicData.composition.tempoBpm} BPM • Escala: {musicData.composition.scale}
                    </p>
                  </div>

                  {/* Audio Visualizer Bars */}
                  <div className="flex items-end justify-center gap-1.5 h-20 py-2">
                    {[12, 28, 45, 65, 90, 75, 55, 40, 70, 85, 95, 60, 45, 30, 15].map((h, idx) => {
                      const dynamicHeight = isPlaying
                        ? Math.min(100, Math.max(15, h * (0.5 + Math.sin(activeBeat + idx) * 0.5)))
                        : 15;
                      return (
                        <div
                          key={idx}
                          className="w-2.5 rounded-full bg-gradient-to-t from-purple-600 via-pink-500 to-indigo-400 transition-all duration-150"
                          style={{ height: `${dynamicHeight}%` }}
                        />
                      );
                    })}
                  </div>

                  {/* Play Controls */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <button
                      onClick={handleTogglePlay}
                      className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-transform hover:scale-105"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>
                    <button
                      onClick={handleExportWav}
                      disabled={downloadingWav}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
                    >
                      {downloadingWav ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      <span>Descargar WAV</span>
                    </button>
                  </div>

                  {/* Chords Sequence */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <span className="text-[11px] text-white/50">Acordes:</span>
                    {musicData.composition.chords?.map((ch: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-12 space-y-2 text-white/40">
                  <Music className="w-12 h-12 mx-auto opacity-30 text-purple-400" />
                  <p className="text-xs">Tu canción y reproductor aparecerán aquí</p>
                  <p className="text-[11px] opacity-60">Describe tu idea musical y pulsa Componer</p>
                </div>
              )}
            </div>

            {/* Lyrics Card */}
            {musicData?.composition?.lyrics && (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 animate-fadeIn">
                <span className="font-semibold text-white/80 text-xs flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-purple-400" /> Letra y Estructura Generada por IA
                </span>
                <div className="text-xs text-white/70 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto pr-1 font-sans">
                  {musicData.composition.lyrics}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
