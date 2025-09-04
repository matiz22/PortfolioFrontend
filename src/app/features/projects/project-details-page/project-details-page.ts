import {Component, inject} from '@angular/core';
import {HeroSection} from '../../../shared/hero/hero-section/hero-section';
import {ProjectService} from '../../../core/services/project.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';
import {of, switchMap} from 'rxjs';
import {ImageUrlPipe} from '../../../shared/pipes/image-url-pipe';
import {MatChip, MatChipAvatar, MatChipSet} from '@angular/material/chips';
import {MatButtonModule, MatFabButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MarkdownComponent} from 'ngx-markdown';
import {ScreenshotsSection} from '../../../shared/screenshots/screenshots-section/screenshots-section';

@Component({
  selector: 'app-project-details-page',
  imports: [
    HeroSection,
    ImageUrlPipe,
    MatChip,
    MatChipAvatar,
    MatChipSet,
    MatFabButton,
    MatButtonModule, MatIconModule, MarkdownComponent, ScreenshotsSection],
  templateUrl: './project-details-page.html',
  styleUrl: './project-details-page.scss'
})
export class ProjectDetailsPage {
  private projectService: ProjectService = inject(ProjectService);
  private route: ActivatedRoute = inject(ActivatedRoute);

  project = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        return id ? this.projectService.getProjectById(id) : of(null);
      })
    ),
    {initialValue: null}
  );
}
