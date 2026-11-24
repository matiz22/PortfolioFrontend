import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HomeCopy } from './home-copy';
import { HomeCopyConfig, HomeCopyRegistry } from './home-copy-registry';

@Component({
  imports: [HomeCopy],
  template: '@if (visible()) { <section [appHomeCopy]="config()"><h2>Deferred copy</h2></section> }',
})
class CopyHost {
  readonly visible = signal(false);
  readonly config = signal<HomeCopyConfig>({ heading: 'h2', effect: 'mask' });
}

describe('HomeCopy registrations', () => {
  it('registers deferred groups after render and releases replaced configurations and removed rows', async () => {
    TestBed.configureTestingModule({ providers: [HomeCopyRegistry] });
    const registry = TestBed.inject(HomeCopyRegistry);
    const add = jasmine.createSpy('add');
    const remove = jasmine.createSpy('remove');
    const unsubscribe = registry.subscribe({ add, remove });
    const fixture = TestBed.createComponent(CopyHost);
    await fixture.whenStable();
    expect(add).not.toHaveBeenCalled();
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();
    const registration = add.calls.mostRecent().args[0];
    expect(registration.element.querySelector('h2').textContent).toBe('Deferred copy');
    fixture.componentInstance.config.set({ heading: 'h2', effect: 'wipe' });
    await fixture.whenStable();
    expect(remove).toHaveBeenCalledOnceWith(registration);
    expect(add).toHaveBeenCalledTimes(2);
    fixture.componentInstance.visible.set(false);
    await fixture.whenStable();
    expect(remove).toHaveBeenCalledTimes(2);
    unsubscribe();
    const remaining = jasmine.createSpy('remaining');
    registry.subscribe({ add: remaining, remove: () => {} })();
    expect(remaining).not.toHaveBeenCalled();
  });

  it('keeps reused sections static outside a homepage registry', async () => {
    const fixture = TestBed.createComponent(CopyHost);
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('section');
    expect(section.querySelector('h2').textContent).toBe('Deferred copy');
    expect(section.getAttribute('style')).toBeNull();
  });
});
