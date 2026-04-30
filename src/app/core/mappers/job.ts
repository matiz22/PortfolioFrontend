import {Job} from '../models/job';
import {JobSummary} from '../models/summary/job';
import {JobDto} from '../dto/job';
import {JobSummaryDto} from '../dto/summary/job';
import {mapSkill, mapSkillSummary} from './skill';
import {mapTechnology, mapTechnologySummary} from './technology';

export function mapJob(dto: JobDto): Job {
  return {
    id: dto.id,
    slug: dto.slug,
    companyName: dto.company_name,
    title: dto.title,
    thumbnail: dto.thumbnail,
    published: dto.published,
    location: dto.location,
    startDate: new Date(dto.start_date),
    endDate: dto.end_date ? new Date(dto.end_date) : null,
    isCurrent: dto.is_current,
    description: dto.description,
    order: dto.order,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    homePage: dto.home_page,
    technologies: dto.technologies.map(mapTechnology),
    skills: dto.skills.map(mapSkill),
    seoEnabled: dto.seo_enabled,
    metaTitle: dto.seo_title,
    metaDescription: dto.seo_description,
    metaKeywords: dto.seo_keywords,
  };
}

export function mapJobSummary(dto: JobSummaryDto): JobSummary {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    shortDesc: dto.short_desc,
    companyName: dto.company_name,
    location: dto.location,
    startDate: new Date(dto.start_date),
    endDate: dto.end_date ? new Date(dto.end_date) : null,
    isCurrent: dto.is_current,
    thumbnail: dto.thumbnail,
    homePage: dto.home_page,
    published: dto.published,
    order: dto.order,
    technologies: dto.technologies.map(mapTechnologySummary),
    skills: dto.skills.map(mapSkillSummary)
  };
}
