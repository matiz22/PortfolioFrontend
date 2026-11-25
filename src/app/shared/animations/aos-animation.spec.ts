import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AosAnimations } from './aos-animation';

@Component({
  imports: [AosAnimations],
  template: '<div appAosAnimations="reveal-elegant"></div>',
})
class TestHost {}

describe('AosAnimations', () => {
  it('applies the configured animation class and default delay', async () => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(element.classList).toContain('reveal-elegant');
    expect(element.style.animationDelay).toBe('150ms');
  });
});
