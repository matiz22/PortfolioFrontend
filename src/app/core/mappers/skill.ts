import {SkillDto} from '../dto/skill';
import {SkillSummaryDto} from '../dto/summary/skill';
import {Skill} from '../models/skill';
import {SkillSummary} from '../models/summary/skill';

export function mapSkill(dto: SkillDto): Skill {
  return {
    id: dto.id,
    name: dto.name,
    icon: dto.icon,
    proficiencyId: dto.proficiency_id,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    order: dto.order,
    pivot: {
      realizationId: dto.pivot.realization_id,
      skillId: dto.pivot.skill_id,
    },
  };
}

export function mapSkillSummary(dto: SkillSummaryDto): SkillSummary {
  return {
    id: dto.id,
    name: dto.name,
  };
}
