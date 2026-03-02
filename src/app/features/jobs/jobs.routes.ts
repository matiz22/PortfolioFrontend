import { Routes } from '@angular/router';

export const JOBS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./jobs-page/jobs-page').then((m) => m.JobsPage),
        title: $localize`:@@jobsTitleMeta:Experience | Mateusz Malich`,
        data: { reuse: true },
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./job-details-page/job-details-page').then(
                (m) => m.JobDetailsPage
            ),
    },
];
