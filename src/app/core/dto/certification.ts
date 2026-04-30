import {TechnologyDto} from './technology';
import {SkillDto} from './skill';

export interface CertificationDto {
  id: number;
  slug: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date: string | null;
  credential_id: string;
  credential_url: string;
  order: number;
  description: string;
  created_at: string;
  updated_at: string;
  thumbnail: string | null;
  home_page: boolean;
  published: boolean;
  technologies: TechnologyDto[];
  skills: SkillDto[];
  seo_enabled: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
}
