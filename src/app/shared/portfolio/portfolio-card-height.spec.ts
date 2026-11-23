import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiState } from '../../core/models/api.state';
import { CertificationsService } from '../../core/services/certifications.service';
import { EducationService } from '../../core/services/education.service';
import { JobsService } from '../../core/services/jobs.service';
import { ProjectsService } from '../../core/services/projects.service';
import { CertificationItem } from '../../features/certifications/certification-item/certification-item';
import { CertificationsSection } from '../../features/certifications/certifications-section/certifications-section';
import { EducationItem } from '../../features/education/education-item/education-item';
import { EducationSection } from '../../features/education/education-section/education-section';
import { JobItem } from '../../features/jobs/job-item/job-item';
import { JobTimelineSection } from '../../features/jobs/job-timeline-section/job-timeline-section';
import { ProjectItem } from '../../features/projects/project-item/project-item';
import { ProjectsHomeSection } from '../../features/projects/projects-home-section/projects-home-section';

const longTitle = 'A long portfolio example with a title that takes several lines at narrow widths';
const date = new Date(2025, 0, 1);
const entry = {
  id: 1, slug: 'example', title: longTitle, degree: longTitle, name: longTitle,
  shortDesc: longTitle.repeat(4), description: longTitle, thumbnail: '',
  liveUrl: 'https://example.com',
  institution: 'Example Academy', fieldOfStudy: longTitle, grade: 'A',
  issuingOrganization: 'Example Academy', issueDate: date, expirationDate: null,
  companyName: 'Example Company', location: 'Remote',
  startDate: date, endDate: null, isCurrent: true, createdAt: date, updatedAt: date,
  published: true, homePage: true, order: 0, seoEnabled: false, metaTitle: null, metaDescription: null,
  technologies: Array.from({ length: 12 }, (_, id) => ({ id, name: `Technology ${id}`, order: id })),
  skills: [],
};
const entries = [entry, {
  ...entry, id: 2, slug: 'short', title: 'Short title', degree: 'Short degree', name: 'Short certificate',
  shortDesc: '', fieldOfStudy: '', liveUrl: '', location: '', technologies: [],
}];

@Component({
  imports: [
    CertificationItem, CertificationsSection, EducationItem, EducationSection,
    JobItem, JobTimelineSection, ProjectItem, ProjectsHomeSection,
  ],
  styleUrl: './_archive.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <app-projects-home-section />
    <app-certifications-section />
    <app-education-section />
    <app-job-timeline-section />
    <div class="archive-grid">
      @for (entry of entries; track entry.id) { <app-project-item [project]="entry" /> }
    </div>
    <div class="archive-grid">
      @for (entry of entries; track entry.id) { <app-certification-item [certification]="entry" /> }
    </div>
    <div class="archive-grid">
      @for (entry of entries; track entry.id) { <app-education-item [education]="entry" /> }
    </div>
    <div class="archive-grid">
      @for (entry of entries; track entry.id) { <app-job-item [job]="entry" /> }
    </div>
  `,
})
class CardHeightFixture {
  readonly entries = entries;
}

describe('portfolio collection card heights', () => {
  it('equalizes cards inside each collection without making job cards as tall as projects', () => {
    const homeSummary = { getHomeSummaryItems: () => of(ApiState.success(entries)) };
    TestBed.configureTestingModule({
      imports: [CardHeightFixture],
      providers: [
        provideRouter([]),
        { provide: CertificationsService, useValue: homeSummary },
        { provide: EducationService, useValue: homeSummary },
        { provide: JobsService, useValue: homeSummary },
        { provide: ProjectsService, useValue: homeSummary },
      ],
    });
    const fixture = TestBed.createComponent(CardHeightFixture);
    const root: HTMLElement = fixture.nativeElement;
    fixture.detectChanges();
    const heightOfCollection = (selector: string) => {
      const heights = Array.from(root.querySelectorAll<HTMLElement>(selector), card => card.offsetHeight);
      expect(heights.length).withContext(selector).toBe(2);
      expect(heights[0]).withContext(selector).toBeGreaterThan(0);
      expect(new Set(heights).size).withContext(selector).toBe(1);
      return heights[0];
    };

    const homeProjectHeight = heightOfCollection('.project-preview');
    const homeJobHeight = heightOfCollection('.jobs-card');
    const archiveProjectHeight = heightOfCollection('app-project-item .archive-card');
    const archiveJobHeight = heightOfCollection('app-job-item .archive-card');
    heightOfCollection('.certificate-link');
    heightOfCollection('.education-card');
    heightOfCollection('app-certification-item .archive-card');
    heightOfCollection('app-education-item .archive-card');

    expect(homeJobHeight).toBeLessThan(homeProjectHeight);
    expect(archiveJobHeight).toBeLessThan(archiveProjectHeight);
  });
});
