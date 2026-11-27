import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutMeSection } from './about-me-section';

describe('AboutMeSection', () => {
  let fixture: ComponentFixture<AboutMeSection>;
  let root: HTMLElement;
  let desktop: boolean;
  let media: MediaQueryList;

  const pointer = (target: Element, type: string, pointerType = 'mouse') =>
    target.dispatchEvent(new PointerEvent(type, { pointerType }));
  const row = (service: string) => root.querySelector<HTMLElement>(`#about-${service} .about-service-copy`)!;
  const button = (service: string) => row(service).querySelector<HTMLButtonElement>('button')!;
  const visiblePreview = () => root.querySelector('.about-panel.is-visible');

  beforeEach(async () => {
    desktop = true;
    media = new EventTarget() as MediaQueryList;
    Object.defineProperty(media, 'matches', { get: () => desktop });
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) =>
      query === '(min-width: 64rem)' ? media : matchMedia(query));

    await TestBed.configureTestingModule({ imports: [AboutMeSection] }).compileComponents();
    fixture = TestBed.createComponent(AboutMeSection);
    root = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('starts with the original combined idle scene and three readable service rows, without rotation or a pin', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(root.querySelector('.about-overview.is-visible app-abilities-overview')).not.toBeNull();
    expect(root.querySelector('.overview-browser')).not.toBeNull();
    expect(root.querySelector('.overview-phone')).not.toBeNull();
    expect(root.querySelector('.overview-workflow')).not.toBeNull();
    expect(root.querySelector('.overview-label')).toBeNull();
    expect(visiblePreview()).toBeNull();
    expect(Array.from(root.querySelectorAll('.about-service'), (item) => item.id))
      .toEqual(['about-web', 'about-apps', 'about-ai']);
    expect(root.querySelectorAll('.about-service-copy p').length).toBe(3);
    expect(root.querySelector('.about-index, .about-track, .about-is-pinned, .orbit-scene, .about-preview-controls')).toBeNull();
    expect(root.querySelector<HTMLElement>('.about-section')!.style.height).toBe('');
  });

  it('puts the service summaries and original full descriptions on glass without frosting the heading', () => {
    expect(root.querySelectorAll('.about-service-copy.glass.home-glass').length).toBe(3);
    expect(root.querySelectorAll('.about-panel-copy.glass.home-glass').length).toBe(3);
    expect(root.querySelector('.about-header.home-glass')).toBeNull();
    const filter = getComputedStyle(row('web')).backdropFilter;
    if (CSS.supports('-moz-appearance', 'none')) {
      expect(filter).toBe('none');
    } else {
      expect(filter).toContain('blur(');
    }
    expect(root.querySelector('#about-web-preview .about-panel-copy')?.textContent).toContain('Need a company website');
    expect(root.querySelector('#about-apps-preview .about-panel-copy')?.textContent).toContain('efficient use of system resources');
    expect(root.querySelector('#about-ai-preview .about-panel-copy')?.textContent).toContain('wait for approval before acting');
  });

  it('limits the Firefox fallback to text panels and preserves their glass styling', () => {
    const fallback = Array.from(document.styleSheets)
      .flatMap((sheet) => Array.from(sheet.cssRules))
      .find((rule): rule is CSSSupportsRule => rule instanceof CSSSupportsRule
        && rule.conditionText.includes('-moz-appearance')
        && rule.cssText.includes('about-service-copy'));
    expect(fallback).toBeDefined();
    if (!fallback) return;

    // Exercise this engine-specific branch even when Karma runs in Chromium.
    const style = document.createElement('style');
    style.textContent = Array.from(fallback.cssRules, (rule) => rule.cssText).join('\n');
    document.head.append(style);
    try {
      for (const panel of root.querySelectorAll('.about-service-copy, .about-panel-copy')) {
        const styles = getComputedStyle(panel);
        expect(styles.backdropFilter).toBe('none');
        expect(styles.backgroundImage).toContain('linear-gradient');
        expect(styles.boxShadow).not.toBe('none');
      }
      expect(getComputedStyle(root.querySelector('.about-ai-visual')!).backdropFilter).toContain('blur(');
    } finally {
      style.remove();
    }
  });

  it('selects each existing preview on hover and keeps the other previews asleep', () => {
    for (const service of ['web', 'apps', 'ai']) {
      pointer(row(service), 'pointerenter');
      fixture.detectChanges();
      expect(visiblePreview()?.id).toBe(`about-${service}-preview`);
      expect(visiblePreview()?.querySelector('.about-panel-copy p')).not.toBeNull();
      expect(button(service).getAttribute('aria-expanded')).toBe('true');
      expect(root.querySelector('.about-overview')!.getAttribute('aria-hidden')).toBe('true');
      for (const panel of root.querySelectorAll<HTMLElement>('.about-panel')) {
        const selected = panel.id === `about-${service}-preview`;
        expect(panel.inert).toBe(!selected);
        expect(panel.getAttribute('aria-hidden')).toBe(String(!selected));
      }
    }
  });

  it('retains the preview across the interaction area, then returns to the combined scene after leaving', async () => {
    const explorer = root.querySelector('.about-explorer')!;
    pointer(row('web'), 'pointerenter');
    fixture.detectChanges();
    pointer(root.querySelector('#about-web-preview')!, 'pointerenter');
    expect(visiblePreview()?.id).toBe('about-web-preview');
    pointer(explorer, 'pointerleave');
    fixture.detectChanges();
    expect(visiblePreview()?.id).toBe('about-web-preview');
    await new Promise((resolve) => setTimeout(resolve, 280));
    fixture.detectChanges();
    expect(visiblePreview()).toBeNull();
    expect(root.querySelector('.about-overview.is-visible')).not.toBeNull();
  });

  it('cancels the idle reset when the pointer re-enters', async () => {
    const explorer = root.querySelector('.about-explorer')!;
    pointer(row('apps'), 'pointerenter');
    pointer(explorer, 'pointerleave');
    pointer(explorer, 'pointerenter');
    await new Promise((resolve) => setTimeout(resolve, 280));
    fixture.detectChanges();
    expect(visiblePreview()?.id).toBe('about-apps-preview');
  });

  it('previews on keyboard focus and restores idle on blur, including after Enter', () => {
    const trigger = button('ai');
    spyOn(trigger, 'matches').and.returnValue(true);
    trigger.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(visiblePreview()?.id).toBe('about-ai-preview');
    expect(button('ai').getAttribute('aria-expanded')).toBe('true');
    trigger.click();
    trigger.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(visiblePreview()).toBeNull();
    expect(button('ai').getAttribute('aria-expanded')).toBe('false');
    expect(root.querySelector('.about-overview.is-visible')).not.toBeNull();
  });

  it('does not let mouse focus prevent returning to idle', () => {
    const trigger = button('web');
    spyOn(trigger, 'matches').and.returnValue(false);
    trigger.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(visiblePreview()).toBeNull();
  });

  it('expands one inline preview at a time on touch layouts and supports closing it', () => {
    desktop = false;
    media.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    pointer(row('web'), 'pointerenter', 'touch');
    fixture.detectChanges();
    expect(visiblePreview()).toBeNull();
    for (const service of ['web', 'apps', 'ai']) {
      button(service).click();
      fixture.detectChanges();
      expect(visiblePreview()?.id).toBe(`about-${service}-preview`);
      expect(button(service).getAttribute('aria-expanded')).toBe('true');
      expect(root.querySelectorAll('[aria-expanded="true"]').length).toBe(1);
    }
    button('ai').click();
    fixture.detectChanges();
    expect(visiblePreview()).toBeNull();
    expect(button('ai').getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps one native trigger per card with its summary as the accessible description', () => {
    for (const service of ['web', 'apps', 'ai']) {
      const card = row(service);
      const trigger = button(service);
      expect(card.querySelectorAll('button').length).toBe(1);
      expect(trigger.type).toBe('button');
      expect(trigger.getAttribute('aria-describedby')).toBe(card.querySelector('p')!.id);
      expect(trigger.getAttribute('aria-controls')).toBe(`about-${service}-preview`);
    }
  });

  it('clears a selected preview on Escape and when crossing the layout breakpoint', () => {
    pointer(row('web'), 'pointerenter');
    button('web').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(visiblePreview()).toBeNull();
    pointer(row('apps'), 'pointerenter');
    desktop = false;
    media.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(visiblePreview()).toBeNull();
  });

  it('selects a service fragment without adding scroll travel', () => {
    const originalUrl = location.href;
    const scroll = spyOn(Element.prototype, 'scrollIntoView');
    try {
      history.replaceState(null, '', '#about-ai');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      fixture.detectChanges();
      expect(visiblePreview()?.id).toBe('about-ai-preview');
      expect(scroll).toHaveBeenCalledWith({ behavior: 'instant', block: 'center' });
      expect(document.activeElement).toBe(button('ai'));
      expect(root.querySelector<HTMLElement>('.about-section')!.style.height).toBe('');
    } finally {
      history.replaceState(null, '', originalUrl);
    }
  });
});
