import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbilitiesOverview } from './abilities-overview';

describe('AbilitiesOverview', () => {
  let fixture: ComponentFixture<AbilitiesOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AbilitiesOverview] }).compileComponents();
    fixture = TestBed.createComponent(AbilitiesOverview);
    fixture.detectChanges();
  });

  it('preserves the real phone proportions and corner geometry from mobile to desktop sizes', () => {
    const root: HTMLElement = fixture.nativeElement;
    const phone = root.querySelector<HTMLElement>('.overview-phone')!;

    for (const [width, height] of [[272, 256], [327, 256], [342, 256], [382, 256], [630, 464], [500, 368], [560, 422]]) {
      root.style.width = `${width}px`;
      root.style.height = `${height}px`;
      const styles = getComputedStyle(phone);

      expect(parseFloat(styles.width) / parseFloat(styles.height)).toBeCloseTo(462 / 978, 3);
      expect(parseFloat(styles.borderTopLeftRadius) / parseFloat(styles.width)).toBeCloseTo(65 / 462, 3);
      const screen = getComputedStyle(phone.querySelector('.phone-screen')!);
      const inset = parseFloat(styles.paddingTop) + parseFloat(styles.borderTopWidth);
      // Borders snap to physical pixels; calc() retains their fractional size.
      expect(Math.abs(parseFloat(screen.borderTopLeftRadius) - (parseFloat(styles.borderTopLeftRadius) - inset)))
        .toBeLessThan(1);
      expect(phone.offsetTop + phone.offsetHeight).toBeLessThanOrEqual(height);
    }
  });

  it('shows a distinct invoice extraction and accounting result instead of reusing the workflow demo', () => {
    const root: HTMLElement = fixture.nativeElement;
    const document = root.querySelector('.extraction-document')!;
    const card = root.querySelector('.extraction-card')!;

    expect(document.textContent).toContain('Invoice');
    expect(card.textContent).toContain('Extracted with AI');
    expect(Array.from(card.querySelectorAll('dt'), (field) => field.textContent))
      .toEqual(['Supplier', 'Total', 'Due date']);
    expect(Array.from(card.querySelectorAll('dd'), (field) => field.textContent))
      .toEqual(['Acme Studio', '€1,240.00', '12 Dec']);
    expect(root.querySelector('.extraction-saved')?.textContent).toContain('Saved to accounting');
    expect(root.querySelector('.workflow-steps, app-ai-workflow-preview')).toBeNull();
    expect(root.querySelector('.overview-label')).toBeNull();
  });

  it('keeps the extracted fields inside their card at compact and wide preview sizes', () => {
    const root: HTMLElement = fixture.nativeElement;
    for (const [width, height] of [[630, 464], [500, 368], [560, 422]]) {
      root.style.width = `${width}px`;
      root.style.height = `${height}px`;

      for (const field of root.querySelectorAll<HTMLElement>('.extraction-fields > div')) {
        expect(field.scrollWidth).toBeLessThanOrEqual(field.clientWidth);
      }
      const card = root.querySelector<HTMLElement>('.extraction-card')!;
      expect(card.scrollHeight).toBeLessThanOrEqual(card.clientHeight);
    }
  });
});
