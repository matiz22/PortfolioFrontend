import {Project} from '../models/project';
import {ProjectSummary} from '../models/summary/project';
import {ProjectDto} from '../dto/project';
import {ProjectSummaryDto} from '../dto/summary/project';
import {mapTechnology, mapTechnologySummary} from './technology';

export function mapProject(dto: ProjectDto): Project {
  return {
    id: dto.id,
    title: dto.title,
    shortDesc: dto.short_desc,
    slug: dto.slug,
    thumbnail: dto.thumbnail,
    liveUrl: dto.live_url,
    repoUrl: dto.repo_url,
    description: dto.description,
    order: dto.order,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    screenshots: dto.screenshots,
    technologies: dto.technologies.map(mapTechnology),
    homePage: dto.home_page,
    published: dto.published,
    seoEnabled: dto.seo_enabled,
    metaTitle: dto.seo_title,
    metaDescription: dto.seo_description,
  };
}

export function mapProjectSummary(dto: ProjectSummaryDto): ProjectSummary {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    shortDesc: dto.short_desc,
    thumbnail: dto.thumbnail,
    liveUrl: dto.live_url,
    repoUrl: dto.repo_url,
    homePage: dto.home_page,
    published: dto.published,
    order: dto.order,
    technologies: dto.technologies.map(mapTechnologySummary)
  };
}
