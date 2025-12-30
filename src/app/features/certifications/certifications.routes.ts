import { Routes } from '@angular/router';

export const CERTIFICATIONS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./certifications-page/certifications-page').then(
                (m) => m.CertificationsPage
            ),
        data: { reuse: true },
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./certification-detail-page/certification-detail-page').then(
                (m) => m.CertificationDetailPage
            ),
    },
];
