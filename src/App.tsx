import React, { useState, useEffect } from 'react';
import { ApiHeader } from './components/ApiHeader';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { InicioView } from './components/InicioView';
import { ChatView } from './components/ChatView';
import { ProyectosView } from './components/ProyectosView';
import { ImagenesView } from './components/ImagenesView';
import { VideosView } from './components/VideosView';
import { MusicaView } from './components/MusicaView';
import { GaleriaView } from './components/GaleriaView';
import { ApiKeys, Creation, Project, ChatMessage } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);

  // 1. API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    return {
      zhipu: localStorage.getItem('clave_zhipu') || '',
      replicate: localStorage.getItem('clave_replicate') || '',
      eleven: localStorage.getItem('clave_eleven') || '',
    };
  });

  // 2. Creations State
  const [creations, setCreations] = useState<Creation[]>(() => {
    try {
      const saved = localStorage.getItem('mis_creaciones');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'c1',
        type: 'imagen',
        title: 'Metrópolis Cyberpunk Neón',
        prompt: 'Futuristic cyberpunk neon city with flying cars and holographic billboards, 8k resolution, cinematic lighting',
        url: 'https://image.pollinations.ai/prompt/Futuristic%20cyberpunk%20neon%20city%20with%20flying%20cars%20and%20holographic%20billboards,%208k%20resolution?width=1024&height=1024&seed=42&model=flux&nologo=true',
        date: 'Reciente',
      },
      {
        id: 'c2',
        type: 'imagen',
        title: 'Templo en el Bosque Mágico',
        prompt: 'Ancient zen temple hidden in an enchanted forest with golden morning mist, cherry blossoms and fireflies',
        url: 'https://image.pollinations.ai/prompt/Ancient%20zen%20temple%20hidden%20in%20an%20enchanted%20forest%20with%20golden%20morning%20mist?width=1024&height=1024&seed=88&model=flux&nologo=true',
        date: 'Reciente',
      },
    ];
  });

  // 3. Projects State
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('mis_proyectos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'proj_demo_1',
        name: 'Lanzamiento de Aplicación Web SaaS',
        description: 'Planificación completa de desarrollo, diseño de interfaces y estrategia de marketing con IA.',
        notes: 'Consejo IA: Centrarse en el MVP inicial y validar con los primeros 10 usuarios beta.',
        status: 'progress',
        tasks: [
          { id: 't1', text: 'Arquitectura de base de datos y esquemas', completed: true },
          { id: 't2', text: 'Integración de autenticación y roles', completed: true },
          { id: 't3', text: 'Diseño de interfaz con Tailwind CSS', completed: false },
          { id: 't4', text: 'Despliegue y pruebas de carga', completed: false },
        ],
        date: new Date().toLocaleDateString(),
        deliverables: ['Plataforma Web', 'Documentación API', 'Landing Page'],
        techStack: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
        estimatedDays: 14,
      },
    ];
  });

  // 4. Chat Messages State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('historial_chat');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [chatLoading, setChatLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('clave_zhipu', apiKeys.zhipu);
    localStorage.setItem('clave_replicate', apiKeys.replicate);
    localStorage.setItem('clave_eleven', apiKeys.eleven);
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('mis_creaciones', JSON.stringify(creations));
  }, [creations]);

  useEffect(() => {
    localStorage.setItem('mis_proyectos', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('historial_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Check backend health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasGeminiKey(data.hasGeminiKey);
      })
      .catch(() => {});
  }, []);

  // Handlers
  const handleSaveKeys = (newKeys: ApiKeys) => {
    setApiKeys(newKeys);
  };

  const handleSaveCreation = (newCreation: Omit<Creation, 'id' | 'date'>) => {
    const item: Creation = {
      ...newCreation,
      id: 'cr_' + Date.now(),
      date: new Date().toLocaleDateString(),
    };
    setCreations((prev) => [item, ...prev]);
  };

  const handleDeleteCreation = (id: string) => {
    setCreations((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClearCreations = () => {
    setCreations([]);
  };

  const handleSaveProject = (updated: Project) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      if (exists) {
        return prev.map((p) => (p.id === updated.id ? updated : p));
      }
      return [updated, ...prev];
    });
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Chat sender
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          customZhipuKey: apiKeys.zhipu || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: data.provider,
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: `⚠️ Hubo un problema al procesar el mensaje: ${err.message}. Verifica tu conexión o claves API.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('¿Deseas reiniciar la conversación de chat?')) {
      setChatMessages([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top API Keys Management Bar */}
      <ApiHeader
        apiKeys={apiKeys}
        onSaveKeys={handleSaveKeys}
        hasGeminiKey={hasGeminiKey}
      />

      <div className="flex-1 flex">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          creationsCount={creations.length}
          projectsCount={projects.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 md:ml-64 pb-24 md:pb-8 transition-all overflow-x-hidden">
          {activeTab === 'inicio' && (
            <InicioView
              onNavigate={setActiveTab}
              creations={creations}
              projects={projects}
              chatCount={chatMessages.length}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              isLoading={chatLoading}
              onBack={() => setActiveTab('inicio')}
              apiKeys={apiKeys}
            />
          )}

          {activeTab === 'proyectos' && (
            <ProyectosView
              projects={projects}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
              onBack={() => setActiveTab('inicio')}
            />
          )}

          {activeTab === 'imagenes' && (
            <ImagenesView
              onSaveCreation={handleSaveCreation}
              onBack={() => setActiveTab('inicio')}
              apiKeys={apiKeys}
            />
          )}

          {activeTab === 'videos' && (
            <VideosView
              onSaveCreation={handleSaveCreation}
              onBack={() => setActiveTab('inicio')}
              apiKeys={apiKeys}
            />
          )}

          {activeTab === 'musica' && (
            <MusicaView
              onSaveCreation={handleSaveCreation}
              onBack={() => setActiveTab('inicio')}
              apiKeys={apiKeys}
            />
          )}

          {activeTab === 'galeria' && (
            <GaleriaView
              creations={creations}
              onDeleteCreation={handleDeleteCreation}
              onClearAll={handleClearCreations}
              onBack={() => setActiveTab('inicio')}
              onNavigateCreate={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
