import { Routes } from '@angular/router';

export const PROJECTS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./projects-page/projects-page').then((m) => m.ProjectsPage),
        title: $localize`:@@projectsTitleMeta:Projects | Mateusz Malich`,
        data: { reuse: true },
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./project-details-page/project-details-page').then(
                (m) => m.ProjectDetailsPage
            ),
    },
];
