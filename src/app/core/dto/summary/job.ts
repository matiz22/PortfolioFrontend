import {TechnologySummaryDto} from './technology';
import {SkillSummaryDto} from './skill';

export interface JobSummaryDto {
  id: number;
  slug: string;
  title: string;
  short_desc: string;
  company_name: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  thumbnail: string;
  home_page: boolean;
  published: boolean;
  order: number;
  technologies: TechnologySummaryDto[];
  skills: SkillSummaryDto[];
}
