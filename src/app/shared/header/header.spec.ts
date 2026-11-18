import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {Header} from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    })
      .compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function menuHrefs(selector: string): (string | null)[] {
    const root: HTMLElement = fixture.nativeElement;
    const menu = root.querySelector(`nav ${selector}`);
    return Array.from(menu!.querySelectorAll(':scope > li > a'), (link) => link.getAttribute('href'));
  }

  it('keeps full-page links when used outside the homepage', () => {
    const routes = ['/projects', '/realizations', '/education', '/certifications', '/jobs'];
    expect(menuHrefs('.lg\\:flex ul')).toEqual(routes);
    expect(menuHrefs('details > ul')).toEqual(routes);
  });

  it('uses native anchors in chapter order and closes the mobile menu on activation', () => {
    fixture.componentRef.setInput('homeSections', true);
    fixture.detectChanges();

    const sections = ['#work', '#projects', '#certifications', '#experience', '#education'];
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('nav a')?.getAttribute('href')).toBe('#home');
    expect(menuHrefs('.lg\\:flex ul')).toEqual(sections);
    expect(menuHrefs('details > ul')).toEqual(sections);

    const menu = root.querySelector('details')!;
    const link = menu.querySelector('a')!;
    menu.open = true;
    // Suppress the real URL change in the test runner.
    link.addEventListener('click', event => event.preventDefault(), { once: true });
    link.click();
    expect(menu.open).toBeFalse();
  });
});
