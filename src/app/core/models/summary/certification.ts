import {TechnologySummary} from './technology';
import {SkillSummary} from './skill';

export interface CertificationSummary {
  id: number;
  slug: string;
  name: string;
  shortDesc: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate: Date | null;
  thumbnail: string | null;
  homePage: boolean;
  published: boolean;
  order: number;
  technologies: TechnologySummary[];
  skills: SkillSummary[];
}
