import {
  getShaderColorFromString,
  getShaderNoiseTexture,
  GrainGradientShapes,
  grainGradientFragmentShader,
  type GrainGradientUniforms,
  ShaderFitOptions,
  ShaderMount,
} from '@paper-design/shaders';

import { attachGrainGradientMotion } from './grain-gradient-motion';

export async function mountGrainGradient(
  surface: HTMLDivElement,
  interactionRoot: HTMLElement,
): Promise<() => void> {
  // Paper requires a fully loaded image before uploading its noise texture.
  const noise = getShaderNoiseTexture();
  await noise?.decode();
  if (!surface.isConnected) {
    return () => {};
  }

  // Paper's default corners preset, with green/cyan instead of purple/blue.
  // Keep the background genuinely black: no permanent glow or gray grain lift.
  const colors = ['#005c39', '#00d37f', '#00bfd1', '#007f86'].map(getShaderColorFromString);
  const uniforms = {
    u_colorBack: getShaderColorFromString('#000000'),
    u_colors: colors,
    u_colorsCount: colors.length,
    u_shape: GrainGradientShapes.corners,
    u_softness: 0.5,
    u_intensity: 0.5,
    u_noise: 0.25,
    u_noiseTexture: noise,
    u_fit: ShaderFitOptions.contain,
    u_scale: 1,
    u_rotation: 0,
    u_offsetX: 0,
    u_offsetY: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_worldWidth: 0,
    u_worldHeight: 0,
  } satisfies GrainGradientUniforms;

  let mount: ShaderMount;
  try {
    // One viewport-sized canvas, never a bitmap as tall as the entire homepage.
    mount = new ShaderMount(
      surface, grainGradientFragmentShader, uniforms,
      { alpha: false, powerPreference: 'low-power' },
      0, 0, 1, 1440 * 900,
    );
  } catch (error) {
    // The constructor may append a canvas before rejecting unsupported WebGL.
    const canvas = surface.querySelector('canvas');
    canvas?.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
    canvas?.remove();
    throw error;
  }

  const gl = mount.canvasElement.getContext('webgl2');
  if (!gl?.getParameter(gl.CURRENT_PROGRAM)) {
    mount.dispose();
    throw new Error('Grain gradient shader could not be compiled.');
  }

  const stopMotion = attachGrainGradientMotion(interactionRoot, mount);
  surface.classList.add('is-ready');
  let disposed = false;
  const dispose = () => {
    if (disposed) {
      return;
    }
    disposed = true;
    mount.canvasElement.removeEventListener('webglcontextlost', dispose);
    stopMotion();
    mount.dispose();
    surface.classList.remove('is-ready');
  };

  // Retain the CSS fallback if the GPU context is lost rather than showing black.
  mount.canvasElement.addEventListener('webglcontextlost', dispose);
  return dispose;
}
