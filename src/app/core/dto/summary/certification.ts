import {TechnologySummaryDto} from './technology';
import {SkillSummaryDto} from './skill';

export interface CertificationSummaryDto {
  id: number;
  slug: string;
  name: string;
  short_desc: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date: string | null;
  thumbnail: string | null;
  home_page: boolean;
  published: boolean;
  order: number;
  technologies: TechnologySummaryDto[];
  skills: SkillSummaryDto[];
}
