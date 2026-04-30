import { Routes } from '@angular/router';
import { HomePage } from './features/home-page/home-page';
import { createSeoResolver, staticSeoResolver } from './core/resolvers/seo.resolver';
import { ProjectsService } from './core/services/projects.service';
import { RealizationsService } from './core/services/realizations.service';
import { EducationService } from './core/services/education.service';
import { CertificationsService } from './core/services/certifications.service';
import { JobsService } from './core/services/jobs.service';
import { Project } from './core/models/project';
import { Realization } from './core/models/realization';
import { Education } from './core/models/education';
import { Certification } from './core/models/certification';
import { Job } from './core/models/job';

export const routes: Routes = [
    // HomePage loads eagerly for fast initial load
    {
        path: '',
        component: HomePage,
        title: $localize`:@@homeTitleMeta:Mateusz Malich | Apps, Websites & AI Solutions`,
        resolve: { seo: staticSeoResolver },
        data: {
            reuse: true,
            seo: {
                title: $localize`:@@homeTitleMeta:Mateusz Malich | Apps, Websites & AI Solutions`,
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
        title: $localize`:@@projectsTitleMeta:Projects | Mateusz Malich`,
        resolve: { seo: staticSeoResolver },
        data: {
            reuse: true,
            seo: {
                title: $localize`:@@projectsTitleMeta:Projects | Mateusz Malich`,
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
            seo: createSeoResolver<Project>(ProjectsService, data => `${data.title} | Mateusz Malich`),
        },
    },
    {
        path: 'realizations',
        loadComponent: () =>
            import('./features/realizations/realizations-page/realizations-page').then(
                (m) => m.RealizationsPage
            ),
        title: $localize`:@@realizationsTitleMeta:Realizations | Mateusz Malich`,
        resolve: { seo: staticSeoResolver },
        data: {
            reuse: true,
            seo: {
                title: $localize`:@@realizationsTitleMeta:Realizations | Mateusz Malich`,
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
            seo: createSeoResolver<Realization>(RealizationsService, data => `${data.title} | Mateusz Malich`),
        },
    },
    {
        path: 'education',
        loadComponent: () =>
            import('./features/education/education-page/education-page').then(
                (m) => m.EducationPage
            ),
        title: $localize`:@@educationTitleMeta:Education | Mateusz Malich`,
        resolve: { seo: staticSeoResolver },
        data: {
            reuse: true,
            seo: {
                title: $localize`:@@educationTitleMeta:Education | Mateusz Malich`,
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
            seo: createSeoResolver<Education>(EducationService, data => `${data.degree} at ${data.institution} | Mateusz Malich`),
        },
    },
    {
        path: 'certifications',
        loadComponent: () =>
            import('./features/certifications/certifications-page/certifications-page').then(
                (m) => m.CertificationsPage
            ),
        title: $localize`:@@certificationsTitleMeta:Certifications | Mateusz Malich`,
        resolve: { seo: staticSeoResolver },
        data: {
            reuse: true,
            seo: {
                title: $localize`:@@certificationsTitleMeta:Certifications | Mateusz Malich`,
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
            seo: createSeoResolver<Certification>(CertificationsService, data => `${data.name} | Mateusz Malich`),
        },
    },
    {
        path: 'jobs',
        loadComponent: () =>
            import('./features/jobs/jobs-page/jobs-page').then((m) => m.JobsPage),
        title: $localize`:@@jobsTitleMeta:Experience | Mateusz Malich`,
        resolve: { seo: staticSeoResolver },
        data: {
            reuse: true,
            seo: {
                title: $localize`:@@jobsTitleMeta:Experience | Mateusz Malich`,
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
            seo: createSeoResolver<Job>(JobsService, data => `${data.title} at ${data.companyName} | Mateusz Malich`),
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
