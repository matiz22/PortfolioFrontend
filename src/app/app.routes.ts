import {Routes} from '@angular/router';
import {HomePage} from './features/home-page/home-page';
import {ProjectDetailsPage} from './features/projects/project-details-page/project-details-page';
import {ProjectListPage} from './features/projects/project-list-page/project-list-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    data: {reuse: true}
  },
  {
    path: 'project/:id',
    component: ProjectDetailsPage
  },
  {
    path: 'projects',
    component: ProjectListPage
  }
];
