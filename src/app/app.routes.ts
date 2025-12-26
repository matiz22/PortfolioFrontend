import { Routes } from '@angular/router';
import { HomePage } from './features/home-page/home-page';
import { ProjectsPage } from './features/projects/projects-page/projects-page';
import { ProjectDetailsPage } from './features/projects/project-details-page/project-details-page';
import { RealizationsPage } from './features/realizations/realizations-page/realizations-page';
import { RealizationDetailsPage } from './features/realizations/realization-details-page/realization-details-page';
import { EducationPage } from './features/education/education-page/education-page';
import { EducationDetailsPage } from './features/education/education-details-page/education-details-page';

export const routes: Routes = [
    {
        path: '',
        component: HomePage,
        data: { reuse: true }
    },
    {
        path: 'projects',
        component: ProjectsPage,
        data: { reuse: true }
    },
    {
        path: 'project/:id',
        component: ProjectDetailsPage
    },
    {
        path: 'realizations',
        component: RealizationsPage,
        data: { reuse: true }
    },
    {
        path: 'realization/:id',
        component: RealizationDetailsPage
    },
    {
        path: 'education',
        component: EducationPage,
        data: { reuse: true }
    },
    {
        path: 'education/:id',
        component: EducationDetailsPage
    },
];
