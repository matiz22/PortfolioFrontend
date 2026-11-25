import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeMetadataPills } from './home-metadata-pills';

@Component({
  imports: [HomeMetadataPills],
  template: '<ul appHomeMetadataPills [items]="items" [kind]="kind()"></ul>',
})
class MetadataPreview {
  readonly items = [
    { id: 1, name: 'Angular' }, { id: 2, name: 'TypeScript' }, { id: 3, name: 'GSAP' },
  ];
  readonly kind = input<'technologies' | 'skills'>('technologies');
}

describe('HomeMetadataPills', () => {
  let fixture: ComponentFixture<MetadataPreview>;
  let list: HTMLUListElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MetadataPreview] }).compileComponents();
    fixture = TestBed.createComponent(MetadataPreview);
    await fixture.whenStable();
    list = fixture.nativeElement.querySelector('ul');
  });

  it('renders a labelled, non-interactive list of individual pills', () => {
    expect(list.tagName).toBe('UL');
    expect(list.getAttribute('aria-label')).toBe('Technologies');
    expect(Array.from(list.querySelectorAll('li'), item => item.textContent)).toEqual([
      'Angular', 'TypeScript', 'GSAP',
    ]);
    expect(list.querySelector('button, a, [tabindex]')).toBeNull();
    expect(getComputedStyle(list.querySelector('li')!).borderTopLeftRadius).toBe('999px');
    expect(getComputedStyle(list).flexWrap).toBe('wrap');
  });

  it('wraps onto new rows without shortening long labels', () => {
    list.style.width = '64px';
    const pills = Array.from(list.querySelectorAll('li'));
    expect(pills[1].getBoundingClientRect().top).toBeGreaterThan(pills[0].getBoundingClientRect().top);
    expect(pills[1].textContent).toBe('TypeScript');
    expect(pills[1].scrollWidth).toBeLessThanOrEqual(pills[1].clientWidth);
  });

  it('uses the chapter accent for both groups and gives skills a quieter fill', async () => {
    const pill = list.querySelector('li')!;
    const fill = () => getComputedStyle(pill).backgroundColor;
    list.parentElement!.style.setProperty('--home-metadata-accent', 'rgb(67 128 231)');
    const blue = fill();
    list.parentElement!.style.setProperty('--home-metadata-accent', 'rgb(143 98 223)');
    const violet = fill();
    expect(violet).not.toBe(blue);
    const violetText = getComputedStyle(pill).color;
    fixture.componentRef.setInput('kind', 'skills');
    await fixture.whenStable();
    expect(list.getAttribute('aria-label')).toBe('Skills');
    expect(fill()).not.toBe(violet);
    expect(getComputedStyle(pill).color).toBe(violetText);
  });
});
