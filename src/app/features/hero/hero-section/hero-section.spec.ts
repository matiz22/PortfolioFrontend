import { DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { HeroSection } from './hero-section';

describe('HeroSection', () => {
  it('renders its priority portrait before any deferred blocks are triggered', async () => {
    TestBed.configureTestingModule({ imports: [HeroSection], deferBlockBehavior: DeferBlockBehavior.Manual });
    const fixture = TestBed.createComponent(HeroSection);
    await fixture.whenStable();
    const image: HTMLImageElement = fixture.nativeElement.querySelector('.hero-portrait img');
    expect(image).not.toBeNull();
    expect(image.getAttribute('src')).toBe('hero.png');
    expect(image.getAttribute('fetchpriority')).toBe('high');
    expect(image.getAttribute('loading')).toBe('eager');
    expect(image.getAttribute('alt')).toBe('');
    expect(fixture.nativeElement.querySelector('.hero-name')?.textContent).toContain('Mateusz Malich');
    expect(fixture.nativeElement.querySelector('.hero-photo.skeleton')).toBeNull();
  });
});
