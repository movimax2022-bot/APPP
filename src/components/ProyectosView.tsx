import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Sparkles,
  CheckCircle2,
  Circle,
  Trash2,
  FileText,
  Calendar,
  Layers,
  Download,
  Check,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Cpu,
  Clock,
} from 'lucide-react';
import { Project, ProjectTask } from '../types';

interface ProyectosViewProps {
  projects: Project[];
  onSaveProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onBack: () => void;
}

export const ProyectosView: React.FC<ProyectosViewProps> = ({
  projects,
  onSaveProject,
  onDeleteProject,
  onBack,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );

  // New project modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // AI Assistant state
  const [aiIdea, setAiIdea] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState<any | null>(null);
  const [newTaskInput, setNewTaskInput] = useState('');

  const activeProject = projects.find((p) => p.id === selectedProjectId) || null;

  // Ask AI for help
  const handleAskAi = async () => {
    if (!aiIdea.trim() || aiLoading) return;
    setAiLoading(true);
    setAiPlan(null);

    try {
      const res = await fetch('/api/project-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: aiIdea.trim(),
          currentTasks: activeProject?.tasks || [],
        }),
      });

      if (!res.ok) {
        throw new Error('Error al conectar con el asistente de proyectos');
      }

      const data = await res.json();
      setAiPlan(data.plan);
    } catch (err: any) {
      alert(err.message || 'Error en el asistente');
    } finally {
      setAiLoading(false);
    }
  };

  // Convert AI plan into a brand new project
  const handleCreateProjectFromAi = () => {
    if (!aiPlan) return;
    const allTasks: ProjectTask[] = [];
    if (aiPlan.phases && Array.isArray(aiPlan.phases)) {
      aiPlan.phases.forEach((ph: any) => {
        if (ph.tasks && Array.isArray(ph.tasks)) {
          ph.tasks.forEach((t: string) => {
            allTasks.push({
              id: 'task_' + Math.random().toString(36).substring(2, 9),
              text: `${ph.name}: ${t}`,
              completed: false,
            });
          });
        }
      });
    }

    const newProj: Project = {
      id: 'proj_' + Date.now(),
      name: aiPlan.title || 'Proyecto IA',
      description: aiPlan.summary || '',
      notes: `💡 Consejo Clave:\n${aiPlan.actionableAdvice || ''}\n\nTecnologías:\n${(aiPlan.techStack || []).join(', ')}`,
      status: 'plan',
      tasks: allTasks,
      date: new Date().toLocaleDateString(),
      deliverables: aiPlan.deliverables || [],
      techStack: aiPlan.techStack || [],
      estimatedDays: aiPlan.estimatedDays || 14,
    };

    onSaveProject(newProj);
    setSelectedProjectId(newProj.id);
    setAiPlan(null);
    setAiIdea('');
  };

  // Add AI tasks to current active project
  const handleAddAiTasksToActive = () => {
    if (!activeProject || !aiPlan) return;
    const addedTasks: ProjectTask[] = [];
    if (aiPlan.phases && Array.isArray(aiPlan.phases)) {
      aiPlan.phases.forEach((ph: any) => {
        if (ph.tasks && Array.isArray(ph.tasks)) {
          ph.tasks.forEach((t: string) => {
            addedTasks.push({
              id: 'task_' + Math.random().toString(36).substring(2, 9),
              text: `${ph.name}: ${t}`,
              completed: false,
            });
          });
        }
      });
    }

    const updated: Project = {
      ...activeProject,
      tasks: [...activeProject.tasks, ...addedTasks],
      notes: activeProject.notes + `\n\n[Plan IA Agregado]:\n${aiPlan.actionableAdvice || ''}`,
    };

    onSaveProject(updated);
    setAiPlan(null);
  };

  // Create manual project
  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProj: Project = {
      id: 'proj_' + Date.now(),
      name: newTitle.trim(),
      description: newDesc.trim(),
      notes: '',
      status: 'plan',
      tasks: [
        { id: 't1', text: 'Definir objetivos principales', completed: false },
        { id: 't2', text: 'Elaborar especificación técnica o diseño', completed: false },
        { id: 't3', text: 'Construir primer prototipo funcional', completed: false },
      ],
      date: new Date().toLocaleDateString(),
      deliverables: ['Prototipo v1.0'],
      techStack: ['Full-stack'],
      estimatedDays: 7,
    };

    onSaveProject(newProj);
    setSelectedProjectId(newProj.id);
    setNewTitle('');
    setNewDesc('');
    setShowNewModal(false);
  };

  // Toggle task checkbox
  const handleToggleTask = (taskId: string) => {
    if (!activeProject) return;
    const updatedTasks = activeProject.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updated: Project = { ...activeProject, tasks: updatedTasks };
    onSaveProject(updated);
  };

  // Add single task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !newTaskInput.trim()) return;
    const updated: Project = {
      ...activeProject,
      tasks: [
        ...activeProject.tasks,
        {
          id: 'task_' + Date.now(),
          text: newTaskInput.trim(),
          completed: false,
        },
      ],
    };
    onSaveProject(updated);
    setNewTaskInput('');
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    if (!activeProject) return;
    const updated: Project = {
      ...activeProject,
      tasks: activeProject.tasks.filter((t) => t.id !== taskId),
    };
    onSaveProject(updated);
  };

  // Update status
  const handleStatusChange = (status: 'plan' | 'progress' | 'done') => {
    if (!activeProject) return;
    onSaveProject({ ...activeProject, status });
  };

  // Update notes
  const handleNotesChange = (notes: string) => {
    if (!activeProject) return;
    onSaveProject({ ...activeProject, notes });
  };

  const getProgress = (proj: Project) => {
    if (proj.tasks.length === 0) return 0;
    const done = proj.tasks.filter((t) => t.completed).length;
    return Math.round((done / proj.tasks.length) * 100);
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
              <Briefcase className="w-5 h-5 text-amber-400" />
              Mis Proyectos & Planificador IA
            </h1>
            <p className="text-xs text-white/50">
              Crea, desglosa y gestiona tus ideas con ayuda de inteligencia artificial
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Nuevo Proyecto
        </button>
      </div>

      {/* AI Project Planner Box */}
      <div className="glass-panel p-5 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/[0.04] via-transparent to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Consultor IA de Proyectos</h2>
        </div>
        <p className="text-xs text-white/60 mb-3">
          Escribe tu idea (ej. "Una aplicación web de gestión de turnos para clínicas" o "Un canal de YouTube sobre historia con IA") y el modelo estructurará fases, tareas recomendadas y tecnologías.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={aiIdea}
            onChange={(e) => setAiIdea(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
            placeholder="Escribe tu idea de negocio o proyecto..."
            className="flex-1 glass-input rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none"
          />
          <button
            onClick={handleAskAi}
            disabled={!aiIdea.trim() || aiLoading}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-amber-600/20"
          >
            {aiLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analizando...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Planificar con IA
              </>
            )}
          </button>
        </div>

        {/* AI Result Card */}
        {aiPlan && (
          <div className="mt-4 p-4 rounded-xl bg-white/[0.04] border border-amber-500/30 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div>
                <h3 className="text-base font-bold text-amber-300">{aiPlan.title}</h3>
                <p className="text-xs text-white/70 mt-1">{aiPlan.summary}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateProjectFromAi}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-lg transition-all"
                >
                  Crear como Nuevo Proyecto
                </button>
                {activeProject && (
                  <button
                    onClick={handleAddAiTasksToActive}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-all"
                  >
                    Sumar Tareas al Proyecto Actual
                  </button>
                )}
              </div>
            </div>

            {/* Phases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
              {aiPlan.phases?.map((ph: any, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="font-semibold text-white/90 block mb-1">{ph.name}</span>
                  <ul className="space-y-1 text-white/60">
                    {ph.tasks?.map((t: string, j: number) => (
                      <li key={j} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Extras */}
            <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-white/10 text-[11px] text-white/50">
              {aiPlan.estimatedDays && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5">
                  <Clock className="w-3 h-3 text-amber-400" /> Estimado: {aiPlan.estimatedDays} días
                </span>
              )}
              {aiPlan.techStack?.map((tech: string, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Projects List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-white/60 font-medium px-1">
            <span>Proyectos Guardados ({projects.length})</span>
          </div>

          {projects.length === 0 ? (
            <div className="glass-panel p-6 rounded-2xl text-center text-white/40 text-xs">
              No tienes proyectos creados aún. Pulsa en "Nuevo Proyecto" o pídele al consultor IA arriba.
            </div>
          ) : (
            projects.map((proj) => {
              const isSelected = proj.id === selectedProjectId;
              const progress = getProgress(proj);
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'glass-panel border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm text-white">{proj.name}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        proj.status === 'done'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : proj.status === 'progress'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {proj.status === 'done' ? 'Completado' : proj.status === 'progress' ? 'En Progreso' : 'Planificación'}
                    </span>
                  </div>

                  <p className="text-xs text-white/60 line-clamp-2 mb-3">
                    {proj.description || 'Sin descripción'}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-white/50">
                      <span>Progreso ({proj.tasks.filter((t) => t.completed).length}/{proj.tasks.length})</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Columns: Active Project Workspace */}
        <div className="lg:col-span-2">
          {activeProject ? (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
              {/* Project Title & Actions */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{activeProject.name}</h2>
                  <p className="text-xs text-white/60 max-w-xl">{activeProject.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={activeProject.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="glass-input text-xs px-3 py-1.5 rounded-lg text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="plan">Planificación</option>
                    <option value="progress">En Progreso</option>
                    <option value="done">Completado</option>
                  </select>

                  <button
                    onClick={() => onDeleteProject(activeProject.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-red-500/20"
                    title="Eliminar proyecto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tasks Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    Lista de Tareas ({activeProject.tasks.filter((t) => t.completed).length}/{activeProject.tasks.length})
                  </h3>
                </div>

                {/* Add task input */}
                <form onSubmit={handleAddTask} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    placeholder="Escribe una nueva tarea y pulsa Enter..."
                    className="flex-1 glass-input text-xs px-3.5 py-2 rounded-xl text-white placeholder:text-white/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition-all"
                  >
                    Añadir
                  </button>
                </form>

                {/* Task list items */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {activeProject.tasks.length === 0 ? (
                    <p className="text-xs text-white/40 py-4 text-center">No hay tareas. ¡Añade una arriba!</p>
                  ) : (
                    activeProject.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                          task.completed
                            ? 'bg-emerald-500/[0.04] border-emerald-500/20 text-white/50 line-through'
                            : 'bg-white/[0.02] border-white/5 text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <div
                          onClick={() => handleToggleTask(task.id)}
                          className="flex items-center gap-2.5 cursor-pointer flex-1"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-white/40 shrink-0" />
                          )}
                          <span>{task.text}</span>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-white/30 hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notes & Documentation */}
              <div>
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" /> Notas y Documentación del Proyecto
                </h3>
                <textarea
                  value={activeProject.notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Anota aquí especificaciones, ideas, enlaces de interés, avances y notas del proyecto..."
                  rows={5}
                  className="w-full glass-input text-xs p-3.5 rounded-xl text-white placeholder:text-white/40 focus:outline-none resize-y font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center text-white/40 text-sm">
              Selecciona o crea un proyecto para ver sus detalles.
            </div>
          )}
        </div>
      </div>

      {/* Create Manual Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-white/10 space-y-4 animate-fadeIn">
            <h2 className="text-lg font-bold text-white">Crear Nuevo Proyecto</h2>
            <form onSubmit={handleCreateManual} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-white/70 block mb-1">Nombre del Proyecto *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Plataforma SaaS de Gestión"
                  className="w-full glass-input text-xs px-3 py-2 rounded-xl text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/70 block mb-1">Descripción</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Objetivos y alcance del proyecto..."
                  rows={3}
                  className="w-full glass-input text-xs px-3 py-2 rounded-xl text-white placeholder:text-white/40 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-amber-600/20"
                >
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
