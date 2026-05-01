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
                description: $localize`:@@homeDescriptionMeta:Tworzę inteligentne aplikacje i nowoczesne strony, które napędzają biznes. Wykorzystaj potencjał AI i nowoczesnych technologii w swojej firmie. Sprawdź!`,
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
                description: $localize`:@@projectsDescriptionMeta:Odkryj moje portfolio projektów osobistych i zawodowych, które prezentują moje umiejętności w programowaniu webowym, inżynierii backendowej oraz integracji AI.`,
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
                description: $localize`:@@realizationsDescriptionMeta:Zobacz kolekcję zrealizowanych projektów dla klientów, prac jako freelancer oraz aplikacji komercyjnych, które dostarczyłem.`,
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
                description: $localize`:@@educationDescriptionMeta:Dowiedz się więcej o moim wykształceniu akademickim, dyplomach i studiach informatycznych, które stanowią fundament mojej wiedzy technicznej.`,
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
                description: $localize`:@@certificationsDescriptionMeta:Przejrzyj moje profesjonalne certyfikaty oraz osiągnięcia w ciągłym doskonaleniu umiejętności w zakresie różnych technologii i metodyk.`,
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
                description: $localize`:@@jobsDescriptionMeta:Zapoznaj się z moim doświadczeniem zawodowym jako inżynier oprogramowania, moimi rolami, zakresem obowiązków i kluczowymi osiągnięciami.`,
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
    },
];
