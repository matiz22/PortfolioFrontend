import {Technology} from './technology';
import {Skill} from './skill';


export interface Realization {
  id: number;
  title: string;
  clientName: string;
  clientUrl: string;
  clientLogo: string;
  location: string | null;
  thumbnail: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  homePage: boolean;
  published: boolean;
  shortDesc: string;
  technologies: Technology[];
  skills: Skill[];
}
