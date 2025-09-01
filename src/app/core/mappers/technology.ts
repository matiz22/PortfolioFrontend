import {Technology} from '../models/technology';
import {TechnologyDto} from '../dto/technology';

export function mapTechnology(dto: TechnologyDto): Technology {
  return {
    id: dto.id,
    name: dto.name,
    icon: dto.icon,
    proficiencyId: dto.proficiency_id,
    order: dto.order
  };
}
