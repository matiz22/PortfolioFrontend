import { Routes } from '@angular/router';
import { HomePage } from './features/home-page/home-page';
import { ProjectsPage } from './features/projects/projects-page/projects-page';
import { ProjectDetailsPage } from './features/projects/project-details-page/project-details-page';

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
    }
];
