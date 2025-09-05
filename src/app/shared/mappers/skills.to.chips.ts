import {Skill} from '../../core/models/skill';
import {Chip} from '../models/chip';

export function mapSkillToChip(skill: Skill): Chip {
  return {
    id: skill.id,
    name: skill.name,
    icon: skill.icon,
  }
}
