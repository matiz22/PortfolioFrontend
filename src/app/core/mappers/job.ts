import {Job} from '../models/job';
import {JobDto} from '../dto/job';
import {mapSkill} from './skill';
import {mapTechnology} from './technology';

export function mapJob(dto: JobDto): Job {
  return {
    ...dto,
    start_date: new Date(dto.start_date),
    end_date: dto.end_date ? new Date(dto.end_date) : null,
    created_at: new Date(dto.created_at),
    updated_at: new Date(dto.updated_at),
    technologies: dto.technologies.map(mapTechnology),
    skills: dto.skills.map(mapSkill),
  };
}
