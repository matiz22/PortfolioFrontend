import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, ElementRef, HostListener, input, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguagesSwitcher } from '../languages/languages-switcher/languages-switcher';

const links = {
  projects: { route: '/projects', label: $localize`:@@header.nav.projects:Projects` },
  work: {
    route: '/realizations',
    label: $localize`:@@header.nav.realizations:Realizations`,
    homeLabel: $localize`:@@home.next.work:Client work`,
  },
  education: { route: '/education', label: $localize`:@@header.nav.education:Education` },
  certifications: { route: '/certifications', label: $localize`:@@header.nav.certificates:Certificates` },
  experience: {
    route: '/jobs',
    label: $localize`:@@header.nav.jobs:Jobs`,
    homeLabel: $localize`:@@home.next.experience:Experience`,
  },
};

const archiveOrder = ['projects', 'work', 'education', 'certifications', 'experience'] as const;
const chapterOrder = ['work', 'projects', 'certifications', 'experience', 'education'] as const;

@Component({
  selector: 'app-header',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    LanguagesSwitcher
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    class: 'relative z-[9999] block'
  }
})
export class Header {
  readonly homeSections = input(false);
  protected readonly navigation = computed(() => {
    const isHome = this.homeSections();
    return (isHome ? chapterOrder : archiveOrder).map((chapter) => {
      const link = links[chapter];
      return {
        chapter,
        route: link.route,
        label: isHome && 'homeLabel' in link ? link.homeLabel : link.label,
      };
    });
  });

  @ViewChild('menuDetails') menuDetails!: ElementRef<HTMLDetailsElement>;

  @HostListener('document:click')
  closeOnAnyClick() {
    this.menuDetails?.nativeElement.removeAttribute('open');
  }
}
