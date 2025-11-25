import {Technology} from './technology';

export interface Project {
  id: number;
  title: string;
  shortDesc: string;
  slug: string;
  thumbnail?: string | null;
  liveUrl?: string | null;
  repoUrl?: string | null;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  screenshots: string[];
  technologies: Technology[];
}
