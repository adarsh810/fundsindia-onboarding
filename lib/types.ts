export type Status = 'not_started' | 'in_progress' | 'done';

export interface Resource {
  label: string;
  url?: string;
}

export interface Topic {
  id: string;
  title: string;
  desc: string;
  hours: number;
  week: string;
  done: string;
  resources: Resource[];
  artifact: string;
}

export interface Category {
  name: string;
  topics: Topic[];
}

export interface L1Track {
  id: string;
  label: string;
  hours: number;
  color: string;
  accent: string;
  categories: Category[];
}

export interface Week {
  week: string;
  weekday: string;
  weekend: string;
  artifacts: string;
}

export type ProgressMap = Record<string, Status>;

export interface GeneratedResource {
  label: string;
  url: string;
  type: 'video' | 'article' | 'doc' | 'book' | 'tool';
}

export interface ResourceBatch {
  id: string;
  resources: GeneratedResource[];
  generated_at: string;
}
