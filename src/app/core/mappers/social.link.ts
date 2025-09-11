import {SocialLinkDto} from '../dto/social.link';
import {SocialLink} from '../models/social.link';

export function mapSocialLink(dto: SocialLinkDto): SocialLink {
  return {
    id: dto.id,
    name: dto.name,
    url: dto.url,
    icon: dto.icon,
    order: dto.order,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}
