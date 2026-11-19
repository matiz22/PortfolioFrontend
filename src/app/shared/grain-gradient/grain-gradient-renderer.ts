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
import { HERO_PALETTE, type GrainPalette } from './grain-gradient-palette';

function shaderColors(palette: GrainPalette): GrainGradientUniforms['u_colors'] {
  return palette.map(([r, g, b]) => [r / 255, g / 255, b / 255, 1]);
}

export interface GrainRenderer {
  setPalette(palette: GrainPalette): void;
  dispose(): void;
}

export async function mountGrainGradient(
  surface: HTMLDivElement,
  interactionRoot: HTMLElement,
  currentPalette: () => GrainPalette = () => HERO_PALETTE,
  signal?: AbortSignal,
): Promise<GrainRenderer | undefined> {
  // Paper requires a fully loaded image before uploading its noise texture.
  const noise = getShaderNoiseTexture();
  await noise?.decode();
  if (signal?.aborted || !surface.isConnected) {
    return;
  }

  // Keep the background genuinely black: no permanent glow or gray grain lift.
  const colors = shaderColors(currentPalette());
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
  return {
    dispose,
    setPalette: (palette) => {
      if (!disposed) {
        mount.setUniforms({ u_colors: shaderColors(palette) });
      }
    },
  };
}
