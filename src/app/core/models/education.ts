import {Technology} from './technology';
import {Skill} from './skill';

export interface Education {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  grade: string | null;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  order: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnail: string | null;
  homePage: boolean;
  published: boolean;
  technologies: Technology[];
  skills: Skill[];
}
