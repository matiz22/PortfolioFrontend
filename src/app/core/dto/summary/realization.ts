import { TechnologySummaryDto } from './technology';
import { SkillSummaryDto } from './skill';

export interface RealizationSummaryDto {
  id: number;
  slug: string;
  title: string;
  short_desc: string;
  client_name: string;
  client_url: string | null;
  location: string | null;
  thumbnail: string;
  home_page: boolean;
  published: boolean;
  order: number;
  technologies: TechnologySummaryDto[];
  skills: SkillSummaryDto[];
}
