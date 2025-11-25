import {Technology} from './technology';
import {Skill} from './skill';

export interface Certification {
  id: number;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate: Date | null;
  credentialId: string;
  credentialUrl: string;
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
