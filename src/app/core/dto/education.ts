import {TechnologyDto} from './technology';
import {SkillDto} from './skill';

export interface EducationDto {
  id: number;
  institution: string;
  degree: string;
  field_of_study: string;
  grade: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  order: number;
  description: string;
  created_at: string;
  updated_at: string;
  thumbnail: string | null;
  home_page: boolean;
  published: boolean;
  technologies: TechnologyDto[];
  skills: SkillDto[];
}
