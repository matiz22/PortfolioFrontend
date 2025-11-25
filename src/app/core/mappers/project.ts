import {Project} from '../models/project';
import {ProjectDto} from '../dto/project';
import {mapTechnology} from './technology';

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
    technologies: dto.technologies.map(mapTechnology)
  };
}
