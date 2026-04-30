import {EducationDto} from '../dto/education';
import {EducationSummaryDto} from '../dto/summary/education';
import {mapSkill, mapSkillSummary} from './skill';
import {mapTechnology, mapTechnologySummary} from './technology';
import {Education} from '../models/education';
import {EducationSummary} from '../models/summary/education';

export function mapEducation(dto: EducationDto): Education {
  return {
    id: dto.id,
    slug: dto.slug,
    institution: dto.institution,
    degree: dto.degree,
    fieldOfStudy: dto.field_of_study,
    grade: dto.grade,
    startDate: new Date(dto.start_date),
    endDate: dto.end_date ? new Date(dto.end_date) : null,
    isCurrent: dto.is_current,
    order: dto.order,
    description: dto.description,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    thumbnail: dto.thumbnail,
    homePage: dto.home_page,
    published: dto.published,
    technologies: dto.technologies.map(mapTechnology),
    skills: dto.skills.map(mapSkill),
    seoEnabled: dto.seo_enabled,
    metaTitle: dto.seo_title,
    metaDescription: dto.seo_description,
    metaKeywords: dto.seo_keywords,
  };
}

export function mapEducationSummary(dto: EducationSummaryDto): EducationSummary {
  return {
    id: dto.id,
    slug: dto.slug,
    institution: dto.institution,
    degree: dto.degree,
    fieldOfStudy: dto.field_of_study,
    description: dto.description,
    startDate: new Date(dto.start_date),
    endDate: dto.end_date ? new Date(dto.end_date) : null,
    isCurrent: dto.is_current,
    thumbnail: dto.thumbnail,
    homePage: dto.home_page,
    published: dto.published,
    order: dto.order,
    technologies: dto.technologies.map(mapTechnologySummary),
    skills: dto.skills.map(mapSkillSummary),
  };
}
