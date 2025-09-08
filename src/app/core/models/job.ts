import {Technology} from './technology';
import {Skill} from './skill';

export interface Job {
  id: number;
  company_name: string;
  title: string;
  location: string;
  start_date: Date;
  end_date: Date | null;
  is_current: boolean;
  description: string | null;
  order: number;
  created_at: Date;
  updated_at: Date;
  home_page: boolean;
  technologies: Technology[];
  skills: Skill[];
}
