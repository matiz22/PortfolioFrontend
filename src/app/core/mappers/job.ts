import {Job} from '../models/job';
import {JobDto} from '../dto/job';
import {mapSkill} from './skill';
import {mapTechnology} from './technology';

export function mapJob(dto: JobDto): Job {
  return {
    ...dto,
    companyName: dto.company_name,
    homePage: false, isCurrent: false,
    startDate: new Date(dto.start_date),
    endDate: dto.end_date ? new Date(dto.end_date) : null,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    technologies: dto.technologies.map(mapTechnology),
    skills: dto.skills.map(mapSkill)
  };
}
