import {RealizationDto} from '../dto/realization';
import {Realization} from '../models/realization';
import {mapTechnology} from './technology';
import {mapSkill} from './skill';

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
    technologies: dto.technologies.map(mapTechnology),
    skills: dto.skills.map(mapSkill),
  };
}
