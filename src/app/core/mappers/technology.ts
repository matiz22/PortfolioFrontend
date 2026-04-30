import {Technology} from '../models/technology';
import {TechnologySummary} from '../models/summary/technology';
import {TechnologyDto} from '../dto/technology';
import {TechnologySummaryDto} from '../dto/summary/technology';

export function mapTechnology(dto: TechnologyDto): Technology {
  return {
    id: dto.id,
    name: dto.name,
    icon: dto.icon,
    proficiencyId: dto.proficiency_id,
    order: dto.order
  };
}

export function mapTechnologySummary(dto: TechnologySummaryDto): TechnologySummary {
  return {
    id: dto.id,
    name: dto.name
  };
}
