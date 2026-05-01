import { RealizationDto } from '../dto/realization';
import { RealizationSummaryDto } from '../dto/summary/realization';
import { Realization } from '../models/realization';
import { RealizationSummary } from '../models/summary/realization';
import { mapTechnology, mapTechnologySummary } from './technology';
import { mapSkill, mapSkillSummary } from './skill';

export function mapRealization(dto: RealizationDto): Realization {
  return {
    id: dto.id,
    title: dto.title,
    clientName: dto.client_name,
    clientUrl: dto.client_url,
    clientLogo: dto.client_logo,
    location: dto.location,
    thumbnail: dto.thumbnail,
    description: dto.description,
    order: dto.order,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    homePage: dto.home_page,
    published: dto.published,
    shortDesc: dto.short_desc,
    companyLink: dto.company_link,
    screenshots: dto.screenshots || [],
    technologies: (dto.technologies || []).map(mapTechnology),
    skills: (dto.skills || []).map(mapSkill),
    slug: dto.slug,
    seoEnabled: dto.seo_enabled,
    metaTitle: dto.seo_title,
    metaDescription: dto.seo_description,
  };
}

export function mapRealizationSummary(dto: RealizationSummaryDto): RealizationSummary {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    shortDesc: dto.short_desc,
    clientName: dto.client_name,
    clientUrl: dto.client_url,
    location: dto.location,
    thumbnail: dto.thumbnail,
    homePage: dto.home_page,
    published: dto.published,
    order: dto.order,
    technologies: (dto.technologies || []).map(mapTechnologySummary),
    skills: (dto.skills || []).map(mapSkillSummary),
  };
}
