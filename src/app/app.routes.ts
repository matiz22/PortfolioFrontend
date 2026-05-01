import { Routes } from '@angular/router';
import { HomePage } from './features/home-page/home-page';
import { createEntityResolver, staticSeoResolver } from './core/resolvers/seo.resolver';
import { ProjectsService } from './core/services/projects.service';
import { RealizationsService } from './core/services/realizations.service';
import { EducationService } from './core/services/education.service';
import { CertificationsService } from './core/services/certifications.service';
import { JobsService } from './core/services/jobs.service';

export const routes: Routes = [
    // HomePage loads eagerly for fast initial load
    {
        path: '',
        component: HomePage,
        title: $localize`:@@homeTitleMeta:Apps, Websites & AI Solutions`,
        resolve: { seo: staticSeoResolver },
        data: {
            reuse: true,
            seo: {
                title: $localize`:@@homeTitleMeta:Apps, Websites & AI Solutions`,
                description: $localize`:@@homeDescriptionMeta:I build intelligent applications and modern websites that drive business. Leverage the potential of AI and modern technologies in your company. Check it out!`,
                robots: 'index, follow'
            }
        },
    },
    {
        path: 'projects',
        loadComponent: () =>
            import('./features/projects/projects-page/projects-page').then(
                (m) => m.ProjectsPage
            ),
        title: $localize`:@@projectsTitleMeta:Projects`,
        resolve: { seo: staticSeoResolver },
        data: {
            reuse: true,
            seo: {
                title: $localize`:@@projectsTitleMeta:Projects`,
                description: $localize`:@@projectsDescriptionMeta:Discover my portfolio of personal and professional projects that showcase my skills in web development, backend engineering, and AI integration.`,
                robots: 'index, follow'
            }
        },
    },
    {
        path: 'project/:slug',
        loadComponent: () =>
            import('./features/projects/project-details-page/project-details-page').then(
                (m) => m.ProjectDetailsPage
            ),
        resolve: {
            projectState: createEntityResolver(ProjectsService, data => `${data.title}`),
        },
    },
    {
        path: 'realizations',
        loadComponent: () =>
            import('./features/realizations/realizations-page/realizations-page').then(
                (m) => m.RealizationsPage
            ),
        title: $localize`:@@realizationsTitleMeta:Realizations`,
        resolve: { seo: staticSeoResolver },
        data: {
            reuse: true,
            seo: {
                title: $localize`:@@realizationsTitleMeta:Realizations`,
                description: $localize`:@@realizationsDescriptionMeta:View a collection of completed projects for clients, freelance work, and commercial applications I have delivered.`,
                robots: 'index, follow'
            }
        },
    },
    {
        path: 'realization/:slug',
        loadComponent: () =>
            import('./features/realizations/realization-details-page/realization-details-page').then(
                (m) => m.RealizationDetailsPage
            ),
        resolve: {
            realizationState: createEntityResolver(RealizationsService, data => `${data.title}`),
        },
    },
    {
        path: 'education',
        loadComponent: () =>
            import('./features/education/education-page/education-page').then(
                (m) => m.EducationPage
            ),
        title: $localize`:@@educationTitleMeta:Education`,
        resolve: { seo: staticSeoResolver },
        data: {
            reuse: true,
            seo: {
                title: $localize`:@@educationTitleMeta:Education`,
                description: $localize`:@@educationDescriptionMeta:Learn more about my academic background, degrees, and computer science studies that form the foundation of my technical knowledge.`,
                robots: 'index, follow'
            }
        },
    },
    {
        path: 'education/:slug',
        loadComponent: () =>
            import('./features/education/education-details-page/education-details-page').then(
                (m) => m.EducationDetailsPage
            ),
        resolve: {
            educationState: createEntityResolver(EducationService, data => `${data.degree} at ${data.institution}`),
        },
    },
    {
        path: 'certifications',
        loadComponent: () =>
            import('./features/certifications/certifications-page/certifications-page').then(
                (m) => m.CertificationsPage
            ),
        title: $localize`:@@certificationsTitleMeta:Certifications`,
        resolve: { seo: staticSeoResolver },
        data: {
            reuse: true,
            seo: {
                title: $localize`:@@certificationsTitleMeta:Certifications`,
                description: $localize`:@@certificationsDescriptionMeta:Review my professional certifications and achievements in continuous skill improvement across various technologies and methodologies.`,
                robots: 'index, follow'
            }
        },
    },
    {
        path: 'certification/:slug',
        loadComponent: () =>
            import('./features/certifications/certification-detail-page/certification-detail-page').then(
                (m) => m.CertificationDetailPage
            ),
        resolve: {
            certificationState: createEntityResolver(CertificationsService, data => `${data.name}`),
        },
    },
    {
        path: 'jobs',
        loadComponent: () =>
            import('./features/jobs/jobs-page/jobs-page').then((m) => m.JobsPage),
        title: $localize`:@@jobsTitleMeta:Experience`,
        resolve: { seo: staticSeoResolver },
        data: {
            reuse: true,
            seo: {
                title: $localize`:@@jobsTitleMeta:Experience`,
                description: $localize`:@@jobsDescriptionMeta:Get to know my professional experience as a software engineer, my roles, scope of responsibilities, and key achievements.`,
                robots: 'index, follow'
            }
        },
    },
    {
        path: 'job/:slug',
        loadComponent: () =>
            import('./features/jobs/job-details-page/job-details-page').then(
                (m) => m.JobDetailsPage
            ),
        resolve: {
            jobState: createEntityResolver(JobsService, data => `${data.title} at ${data.companyName}`),
        },
    },
    {
        path: 'privacy-policy',
        loadComponent: () =>
            import('./shared/privacy-policy/privacy-policy').then(
                (m) => m.PrivacyPolicy
            ),
        title: $localize`:@@privacyPolicyTitleMeta:Privacy Policy`,
        resolve: { seo: staticSeoResolver },
        data: {
            seo: {
                title: $localize`:@@privacyPolicyTitleMeta:Privacy Policy`,
                description: $localize`:@@privacyPolicyDescriptionMeta:Privacy policy and data protection information for Malich.dev.`,
                robots: 'index, follow'
            }
        },
    },
];
