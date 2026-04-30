import {TechnologySummary} from './technology';
import {SkillSummary} from './skill';

export interface JobSummary {
  id: number;
  slug: string;
  title: string;
  shortDesc: string;
  companyName: string;
  location: string;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  thumbnail: string;
  homePage: boolean;
  published: boolean;
  order: number;
  technologies: TechnologySummary[];
  skills: SkillSummary[];
}
