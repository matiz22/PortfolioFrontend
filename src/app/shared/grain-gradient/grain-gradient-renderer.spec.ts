import { mountGrainGradient } from './grain-gradient-renderer';

describe('grain gradient renderer fallback', () => {
  let root: HTMLElement;
  let surface: HTMLDivElement;

  beforeEach(() => {
    root = document.createElement('div');
    surface = document.createElement('div');
    root.appendChild(surface);
    document.body.appendChild(root);
  });

  afterEach(() => root.remove());

  it('removes the incomplete canvas when WebGL is unavailable', async () => {
    spyOn(HTMLCanvasElement.prototype, 'getContext').and.returnValue(null);

    await expectAsync(mountGrainGradient(surface, root)).toBeRejected();

    expect(surface.querySelector('canvas')).toBeNull();
    expect(surface.classList.contains('is-ready')).toBeFalse();
  });

  it('does not mount after navigation detaches the background', async () => {
    const context = spyOn(HTMLCanvasElement.prototype, 'getContext').and.returnValue(null);
    const mounting = mountGrainGradient(surface, root);
    root.remove();
    await expectAsync(mounting).toBeResolvedTo(undefined);

    expect(context).not.toHaveBeenCalled();
    expect(surface.querySelector('canvas')).toBeNull();
  });

  it('does not finish a cancelled mount if a cached background has already reattached', async () => {
    const context = spyOn(HTMLCanvasElement.prototype, 'getContext').and.returnValue(null);
    const request = new AbortController();
    const mounting = mountGrainGradient(surface, root, undefined, request.signal);
    root.remove();
    request.abort();
    document.body.appendChild(root);
    await expectAsync(mounting).toBeResolvedTo(undefined);

    expect(context).not.toHaveBeenCalled();
    expect(surface.querySelector('canvas')).toBeNull();
  });
});
