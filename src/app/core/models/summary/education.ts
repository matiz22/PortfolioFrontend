import {TechnologySummary} from './technology';
import {SkillSummary} from './skill';

export interface EducationSummary {
  id: number;
  slug: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  grade: string | null;
  description: string;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  thumbnail: string | null;
  homePage: boolean;
  published: boolean;
  order: number;
  technologies: TechnologySummary[];
  skills: SkillSummary[];
}
