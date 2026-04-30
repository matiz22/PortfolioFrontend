import {TechnologySummaryDto} from './technology';

export interface ProjectSummaryDto {
  id: number;
  slug: string;
  title: string;
  short_desc: string;
  thumbnail: string | null;
  live_url: string | null;
  repo_url: string | null;
  home_page: boolean;
  published: boolean;
  order: number;
  technologies: TechnologySummaryDto[];
}
