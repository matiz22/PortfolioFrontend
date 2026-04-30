import {TechnologySummaryDto} from './technology';
import {SkillSummaryDto} from './skill';

export interface EducationSummaryDto {
  id: number;
  slug: string;
  institution: string;
  degree: string;
  field_of_study: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  thumbnail: string | null;
  home_page: boolean;
  published: boolean;
  order: number;
  technologies: TechnologySummaryDto[];
  skills: SkillSummaryDto[];
}
