export type Status = 'not_started' | 'in_progress' | 'done';

export interface Topic {
  id: string;
  title: string;
  desc: string;
  hours: number;
  week: string;
  done: string;
  resources: string[];
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
