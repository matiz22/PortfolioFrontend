import {TechnologySummary} from './technology';

export interface ProjectSummary {
  id: number;
  slug: string;
  title: string;
  shortDesc: string;
  thumbnail?: string | null;
  liveUrl?: string | null;
  repoUrl?: string | null;
  homePage: boolean;
  published: boolean;
  order: number;
  technologies: TechnologySummary[];
}
