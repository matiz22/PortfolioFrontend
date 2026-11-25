import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Footer } from './footer';

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('presents the closing links on one shared glass panel', () => {
    const root: HTMLElement = fixture.nativeElement;
    const panel = root.querySelector<HTMLElement>('.container.home-glass')!;
    expect(panel).not.toBeNull();
    expect(panel.classList).toContain('glass');
    expect(panel.classList).toContain('home-copy-panel');
    expect(panel.querySelector('a[routerlink="/privacy-policy"], a[routerLink="/privacy-policy"]'))
      .not.toBeNull();
    expect(root.querySelectorAll('.container.home-glass').length).toBe(1);
  });
});
