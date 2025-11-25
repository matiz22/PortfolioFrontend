import {TechnologyDto} from './technology';
import {SkillDto} from './skill';

export interface JobDto {
  id: number;
  company_name: string;
  title: string;
  thumbnail: string;
  published: boolean;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
  home_page: boolean;
  technologies: TechnologyDto[];
  skills: SkillDto[];
}
