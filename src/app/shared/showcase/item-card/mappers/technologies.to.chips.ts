import {Chip} from '../models/chip';
import {Technology} from '../../../../core/models/technology';

export function mapTechnologyToChip(technology: Technology): Chip {
  return {
    id: technology.id,
    name: technology.name,
    icon: technology.icon,
  }
}
