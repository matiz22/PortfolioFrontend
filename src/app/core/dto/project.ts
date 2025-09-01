import {TechnologyDto} from './technology';

export interface ProjectDto {
  id: number;
  title: string;
  short_desc: string;
  slug: string;
  thumbnail: string | null;
  live_url: string | null;
  repo_url: string | null;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
  screenshots: string[];
  technologies: TechnologyDto[];
}
