import {Technology} from './technology';
import {Skill} from './skill';

export interface Job {
  id: number;
  companyName: string;
  title: string;
  thumbnail: string;
  published: boolean;
  location: string;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  homePage: boolean;
  technologies: Technology[];
  skills: Skill[];
}
