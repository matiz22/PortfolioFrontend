import {Component, inject, InjectionToken} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, RouteReuseStrategy, Router} from '@angular/router';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {App} from './app';
import {HomePage} from './features/home-page/home-page';
import {CustomRouteReuseStrategy} from './route.reuse.strategy';
import {afterNextRenderMotion} from './shared/animations/lazy-motion';

@Component({template: '<h1>Test page</h1>'})
class TestPage {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([{path: 'test', component: TestPage}])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the active route', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    await TestBed.inject(Router).navigateByUrl('/test');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toBe('Test page');
  });
});

type TestMotionSetup = (element: HTMLElement, firstActivation: boolean) => () => void;
const TEST_MOTION_LOADER = new InjectionToken<() => Promise<TestMotionSetup>>('test home motion');

@Component({ selector: 'app-test-home-motion', template: 'Home motion' })
class TestHomeMotion {
  constructor() {
    afterNextRenderMotion(inject(TEST_MOTION_LOADER), 'Test motion failed to load.');
  }
}

describe('Cached home route motion', () => {
  let load: jasmine.Spy<() => Promise<TestMotionSetup>>;
  let setup: jasmine.Spy<TestMotionSetup>;

  beforeEach(() => {
    gsap.registerPlugin(ScrollTrigger);
    setup = jasmine.createSpy<TestMotionSetup>('setup').and.callFake((element) => {
      const context = gsap.context(() => {
        gsap.set(element, { x: 16 });
        ScrollTrigger.create({ trigger: element, start: 'top top', end: '+=200' });
      });
      return () => context.revert();
    });
    load = jasmine.createSpy('load').and.resolveTo(setup);
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', component: HomePage, data: { reuse: true } },
          { path: 'test', component: TestPage },
        ]),
        { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
        { provide: TEST_MOTION_LOADER, useValue: load },
      ],
    }).overrideComponent(HomePage, {
      set: { imports: [TestHomeMotion], template: '<app-test-home-motion />' },
    });
  });

  function triggers(target: HTMLElement): ScrollTrigger[] {
    return ScrollTrigger.getAll().filter((trigger) => trigger.trigger === target);
  }

  it('reverts triggers when Home is detached and rebuilds them once on the retained view', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await fixture.whenStable();
    await router.navigateByUrl('/');
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement.querySelector('app-test-home-motion');
    expect(triggers(element).length).toBe(1);
    expect(setup).toHaveBeenCalledOnceWith(element, true);

    for (let i = 0; i < 2; i++) {
      await router.navigateByUrl('/test');
      await fixture.whenStable();
      expect(element.isConnected).toBeFalse();
      expect(element.style.transform).toBe('');
      expect(triggers(element)).toEqual([]);

      await router.navigateByUrl('/');
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('app-test-home-motion')).toBe(element);
      expect(triggers(element).length).toBe(1);
      expect(setup.calls.mostRecent().args).toEqual([element, false]);
    }
    expect(load).toHaveBeenCalledTimes(1);
    expect(setup).toHaveBeenCalledTimes(3);
  });

  it('retains an initializer that finishes loading while Home is detached', async () => {
    let finishLoading!: (setup: TestMotionSetup) => void;
    load.and.returnValue(new Promise((resolve) => { finishLoading = resolve; }));
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await fixture.whenStable();
    await router.navigateByUrl('/');
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement.querySelector('app-test-home-motion');
    expect(load).toHaveBeenCalledTimes(1);
    expect(setup).not.toHaveBeenCalled();

    await router.navigateByUrl('/test');
    finishLoading(setup);
    await fixture.whenStable();
    expect(setup).not.toHaveBeenCalled();
    expect(triggers(element)).toEqual([]);

    await router.navigateByUrl('/');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-test-home-motion')).toBe(element);
    expect(load).toHaveBeenCalledTimes(1);
    expect(setup).toHaveBeenCalledOnceWith(element, true);
    expect(triggers(element).length).toBe(1);
  });
});
