import {CertificationDto} from '../dto/certification';
import {Certification} from '../models/certification';
import {mapSkill} from './skill';
import {mapTechnology} from './technology';

export function mapCertification(dto: CertificationDto): Certification {
  return {
    id: dto.id,
    name: dto.name,
    issuingOrganization: dto.issuing_organization,
    issueDate: new Date(dto.issue_date),
    expirationDate: dto.expiration_date ? new Date(dto.expiration_date) : null,
    credentialId: dto.credential_id,
    credentialUrl: dto.credential_url,
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
