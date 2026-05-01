import { TechnologySummary } from './technology';
import { SkillSummary } from './skill';

export interface RealizationSummary {
  id: number;
  slug: string;
  title: string;
  shortDesc: string;
  clientName: string;
  clientUrl: string | null;
  location: string | null;
  thumbnail: string;
  homePage: boolean;
  published: boolean;
  order: number;
  technologies: TechnologySummary[];
  skills: SkillSummary[];
}
