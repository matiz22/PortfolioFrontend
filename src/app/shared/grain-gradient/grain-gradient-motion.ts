import type { ShaderMount } from '@paper-design/shaders';

const AMBIENT_SPEED = 0.65;
const POINTER_TRAVEL = 0.22;

export function attachGrainGradientMotion(
  root: HTMLElement,
  shader: Pick<ShaderMount, 'setSpeed' | 'setUniforms'>,
): () => void {
  const view = root.ownerDocument.defaultView;
  if (!view) {
    return () => {};
  }

  const reducedMotion = view.matchMedia('(prefers-reduced-motion: reduce)');
  let frame: number | undefined;
  let lastTime = 0;
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;

  const cancelFrame = () => {
    if (frame !== undefined) {
      view.cancelAnimationFrame(frame);
      frame = undefined;
    }
  };

  const reset = () => {
    cancelFrame();
    x = y = targetX = targetY = 0;
    shader.setUniforms({ u_offsetX: 0, u_offsetY: 0 });
  };

  const follow = (time: number) => {
    frame = undefined;
    // Frame-rate-independent easing, with no jump after a suspended tab resumes.
    const blend = 1 - Math.exp(-Math.min(time - lastTime, 64) / 160);
    lastTime = time;
    x += (targetX - x) * blend;
    y += (targetY - y) * blend;
    const settled = Math.abs(targetX - x) + Math.abs(targetY - y) < 0.0001;
    if (settled) {
      x = targetX;
      y = targetY;
    }
    shader.setUniforms({ u_offsetX: x, u_offsetY: y });
    if (!settled) {
      frame = view.requestAnimationFrame(follow);
    }
  };

  const schedule = () => {
    if (frame === undefined) {
      lastTime = view.performance.now();
      frame = view.requestAnimationFrame(follow);
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || reducedMotion.matches || root.ownerDocument.hidden) {
      return;
    }
    // The shader is fixed to the viewport; full-page bounds would dilute movement.
    targetX = Math.max(-1, Math.min(1, event.clientX / view.innerWidth * 2 - 1)) * POINTER_TRAVEL;
    targetY = -Math.max(-1, Math.min(1, event.clientY / view.innerHeight * 2 - 1)) * POINTER_TRAVEL;
    schedule();
  };

  const onPointerLeave = () => {
    targetX = targetY = 0;
    if (!reducedMotion.matches && !root.ownerDocument.hidden) {
      schedule();
    }
  };

  const updateMotion = () => {
    reset();
    shader.setSpeed(reducedMotion.matches || root.ownerDocument.hidden ? 0 : AMBIENT_SPEED);
  };

  // Use the actual pointer event, not the primary-device hover query: hybrid
  // laptops and browser device emulation can report a coarse primary pointer.
  // Capture also keeps interactive children from swallowing the movement.
  root.addEventListener('pointermove', onPointerMove, { passive: true, capture: true });
  root.addEventListener('pointerleave', onPointerLeave);
  root.addEventListener('pointercancel', onPointerLeave);
  view.addEventListener('blur', onPointerLeave);
  root.ownerDocument.addEventListener('visibilitychange', updateMotion);
  reducedMotion.addEventListener('change', updateMotion);
  updateMotion();

  return () => {
    cancelFrame();
    shader.setSpeed(0);
    root.removeEventListener('pointermove', onPointerMove, true);
    root.removeEventListener('pointerleave', onPointerLeave);
    root.removeEventListener('pointercancel', onPointerLeave);
    view.removeEventListener('blur', onPointerLeave);
    root.ownerDocument.removeEventListener('visibilitychange', updateMotion);
    reducedMotion.removeEventListener('change', updateMotion);
  };
}
