export interface ApiKeys {
  zhipu: string;
  replicate: string;
  eleven: string;
}

export interface ProjectTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  notes: string;
  status: 'plan' | 'progress' | 'done';
  tasks: ProjectTask[];
  date: string;
  deliverables?: string[];
  techStack?: string[];
  estimatedDays?: number;
}

export interface Creation {
  id: string;
  type: 'imagen' | 'video' | 'musica';
  title: string;
  prompt: string;
  url: string;
  date: string;
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  provider?: string;
}
