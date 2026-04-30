import {CertificationDto} from '../dto/certification';
import {CertificationSummaryDto} from '../dto/summary/certification';
import {Certification} from '../models/certification';
import {CertificationSummary} from '../models/summary/certification';
import {mapSkill, mapSkillSummary} from './skill';
import {mapTechnology, mapTechnologySummary} from './technology';

export function mapCertification(dto: CertificationDto): Certification {
  return {
    id: dto.id,
    slug: dto.slug,
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
    seoEnabled: dto.seo_enabled,
    metaTitle: dto.seo_title,
    metaDescription: dto.seo_description,
    metaKeywords: dto.seo_keywords,
  };
}

export function mapCertificationSummary(dto: CertificationSummaryDto): CertificationSummary {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    shortDesc: dto.short_desc,
    issuingOrganization: dto.issuing_organization,
    issueDate: new Date(dto.issue_date),
    expirationDate: dto.expiration_date ? new Date(dto.expiration_date) : null,
    thumbnail: dto.thumbnail,
    homePage: dto.home_page,
    published: dto.published,
    order: dto.order,
    technologies: dto.technologies.map(mapTechnologySummary),
    skills: dto.skills.map(mapSkillSummary),
  };
}
