import { Routes } from '@angular/router';

export const REALIZATIONS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./realizations-page/realizations-page').then(
                (m) => m.RealizationsPage
            ),
        data: { reuse: true },
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./realization-details-page/realization-details-page').then(
                (m) => m.RealizationDetailsPage
            ),
    },
];
