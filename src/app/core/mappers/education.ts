import {EducationDto} from '../dto/education';
import {mapSkill} from './skill';
import {mapTechnology} from './technology';
import {Education} from '../models/education';

export function mapEducation(dto: EducationDto): Education {
  return {
    id: dto.id,
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
  };
}
