import {TechnologyDto} from './technology';
import {SkillDto} from './skill';

export interface RealizationDto {
  id: number;
  title: string;
  client_name: string;
  client_url: string;
  client_logo: string;
  location: string | null;
  thumbnail: string;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
  home_page: boolean;
  published: boolean;
  short_desc: string;
  technologies: TechnologyDto[];
  skills: SkillDto[];
}
