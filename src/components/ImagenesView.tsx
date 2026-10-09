import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Maximize2,
  Share2,
  Sliders,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { ApiKeys, Creation } from '../types';

interface ImagenesViewProps {
  onSaveCreation: (creation: Omit<Creation, 'id' | 'date'>) => void;
  onBack: () => void;
  apiKeys: ApiKeys;
}

export const ImagenesView: React.FC<ImagenesViewProps> = ({
  onSaveCreation,
  onBack,
  apiKeys,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [style, setStyle] = useState('cinematic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  const styleOptions = [
    { id: 'cinematic', name: 'Cinemático 8K', desc: 'Iluminación dramática y atmósfera de película' },
    { id: 'photoreal', name: 'Fotografía Realista', desc: 'Lente 85mm, bokeh suave, textura natural' },
    { id: '3d_render', name: 'Render 3D Octane', desc: 'Modelado volumétrico digital de alta fidelidad' },
    { id: 'anime', name: 'Anime Studio Ghibli', desc: 'Ilustración artística japonesa detallada' },
    { id: 'cyberpunk', name: 'Cyberpunk Neón', desc: 'Luces de neón nocturnas, lluvia y reflejos' },
    { id: 'fantasy', name: 'Fantasía Épica', desc: 'Magia, criaturas míticas y paisajes de ensueño' },
  ];

  const samplePrompts = [
    'Un bosque mágico con luces doradas al amanecer, niebla suave, árboles antiguos y luciérnagas',
    'Retrato cinematográfico de un astronauta en Marte contemplando la Tierra en el horizonte',
    'Ciberpunk Tokio en una noche lluviosa, coches voladores y reflejos de neón en el asfalto',
    'Gato samurái con armadura de placas doradas y katana mística en un templo zen',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setProgressStep(1);

    // Simulated progress steps for great UX
    const timer1 = setTimeout(() => setProgressStep(2), 1200);
    const timer2 = setTimeout(() => setProgressStep(3), 2800);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          style,
          customReplicateKey: apiKeys.replicate || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error del servidor: ${res.status}`);
      }

      const data = await res.json();
      setCurrentImage(data.imageUrl);
      setEnhancedPrompt(data.enhancedPrompt || prompt);

      // Automatically save to user gallery
      onSaveCreation({
        type: 'imagen',
        title: prompt.slice(0, 45) + (prompt.length > 45 ? '...' : ''),
        prompt: data.enhancedPrompt || prompt,
        url: data.imageUrl,
        metadata: {
          aspectRatio,
          style,
          provider: data.provider,
        },
      });
    } catch (err: any) {
      alert(`Error al generar imagen: ${err.message}`);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
      setProgressStep(0);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(enhancedPrompt || prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!currentImage) return;
    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `ai-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback
      window.open(currentImage, '_blank');
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
              <ImageIcon className="w-5 h-5 text-cyan-400" />
              Generador de Imágenes FLUX Neural
            </h1>
            <p className="text-xs text-white/50">
              {apiKeys.replicate ? 'Motor Activo: Replicate Token' : 'Motor Activo: FLUX.1 Engine (Gratis y sin límites)'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Prompt input */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
              <span>Descripción de la imagen (Prompt)</span>
              <span className="text-[11px] text-cyan-400 flex items-center gap-1 font-normal">
                <Sparkles className="w-3 h-3" /> Optimizado automáticamente por Gemini
              </span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe lo que imaginas con lujo de detalles (iluminación, escenario, personaje, colores)..."
              rows={4}
              className="w-full glass-input text-xs p-3.5 rounded-xl text-white placeholder:text-white/40 focus:outline-none resize-none"
            />

            {/* Prompt suggestions pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-white/50 block font-medium">Sugerencias rápidas:</span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(s)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all text-left truncate max-w-full"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Settings Grid: Aspect Ratio & Style */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-semibold text-white/80 block mb-2">
                Relación de Aspecto
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '1:1', label: '1:1 Cuadrado', sub: '1024x1024' },
                  { id: '16:9', label: '16:9 Paisaje', sub: '1280x720' },
                  { id: '9:16', label: '9:16 Vertical', sub: '720x1280' },
                  { id: '4:3', label: '4:3 Estándar', sub: '1024x768' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspectRatio(item.id as any)}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      aspectRatio === item.id
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="block text-xs font-bold">{item.id}</span>
                    <span className="block text-[10px] opacity-70 truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Styles */}
            <div>
              <label className="text-xs font-semibold text-white/80 block mb-2">
                Estilo Visual Artístico
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {styleOptions.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStyle(st.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      style === st.id
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="block text-xs font-semibold">{st.name}</span>
                    <span className="block text-[10px] text-white/40 truncate">{st.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {progressStep === 1 && '1/3 Analizando y mejorando prompt...'}
                  {progressStep === 2 && '2/3 Sintetizando píxeles FLUX...'}
                  {progressStep === 3 && '3/3 Finalizando resolución HD...'}
                  {progressStep === 0 && 'Generando imagen...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>GENERAR IMAGEN EN ALTA RESOLUCIÓN</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Result Preview */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 h-full flex flex-col justify-between min-h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
              <span className="font-semibold text-white/80">Vista Previa del Resultado</span>
              {currentImage && (
                <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                  <Check className="w-3.5 h-3.5" /> Guardada en Galería
                </span>
              )}
            </div>

            <div className="flex-1 flex items-center justify-center my-4 overflow-hidden rounded-xl bg-black/40 border border-white/5 relative group min-h-[280px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full border-3 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                  <p className="text-xs font-semibold text-cyan-300">Generando tu imagen...</p>
                  <p className="text-[11px] text-white/50 max-w-xs">
                    El motor FLUX está calculando los tensores de difusión. Toma de 3 a 7 segundos.
                  </p>
                </div>
              ) : currentImage ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={currentImage}
                    alt={prompt}
                    className="max-h-[380px] w-auto object-contain rounded-lg shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              ) : (
                <div className="text-center p-6 text-white/40 space-y-2">
                  <ImageIcon className="w-12 h-12 mx-auto opacity-30 text-cyan-400" />
                  <p className="text-xs">Tu imagen generada se mostrará aquí</p>
                  <p className="text-[11px] opacity-60">
                    Escribe un prompt a la izquierda y pulsa en Generar
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            {currentImage && !isGenerating && (
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-600/20"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar Imagen HD
                  </button>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs transition-all"
                    title="Copiar prompt mejorado"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                {enhancedPrompt && (
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] text-white/60">
                    <span className="font-semibold text-white/80 block mb-0.5">Prompt mejorado por IA:</span>
                    <p className="line-clamp-2">{enhancedPrompt}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
