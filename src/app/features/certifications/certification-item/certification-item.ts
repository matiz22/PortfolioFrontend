import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Certification } from '../../../core/models/certification';
import { CertificationSummary } from '../../../core/models/summary/certification';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { uniquePortfolioItems } from '../../../shared/portfolio/portfolio-metadata';

@Component({
  selector: 'app-certification-item',
  imports: [DatePipe, ImageUrlPipe, RouterLink],
  templateUrl: './certification-item.html',
  styleUrl: './certification-item.scss',
})
export class CertificationItem {
  @Input({ required: true }) certification!: Certification | CertificationSummary;

  protected get tags() {
    return uniquePortfolioItems([...this.certification.technologies, ...this.certification.skills]);
  }
}
