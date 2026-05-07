import {
  Scene,
  DirectionalLight,
  AmbientLight,
  EquirectangularReflectionMapping,
} from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

/**
 * Sets up HDRI environment map + lights.
 * Model materials and lighting were corrected in Blender, so we keep
 * the Three.js lighting clean and complementary.
 * Returns a cleanup function.
 */
export async function setupLights(scene: Scene): Promise<() => void> {
  // ── HDRI environment (reflections on metal blade) ──
  const rgbeLoader = new RGBELoader();
  const hdrTexture = await rgbeLoader.loadAsync('/hdri/studio.hdr');
  hdrTexture.mapping = EquirectangularReflectionMapping;
  scene.environment = hdrTexture;
  scene.environmentIntensity = 1.5; // Increased for better reflections

  // ── Key light (front-right, high angle) ──
  const keyLight = new DirectionalLight(0xffffff, 2.5); // Stronger key light
  keyLight.position.set(5, 8, 6);
  scene.add(keyLight);

  // ── Fill light (front-left, softer) ──
  const fillLight = new DirectionalLight(0xffffff, 1.0);
  fillLight.position.set(-4, 3, 5);
  scene.add(fillLight);

  // ── Rim / back light (silhouette separation) ──
  const rimLight = new DirectionalLight(0xccd0ff, 1.5);
  rimLight.position.set(-3, 2, -4);
  scene.add(rimLight);

  // ── Ambient ──
  const ambientLight = new AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  return () => {
    hdrTexture.dispose();
    scene.remove(keyLight, fillLight, rimLight, ambientLight);
    keyLight.dispose();
    fillLight.dispose();
    rimLight.dispose();
    ambientLight.dispose();
  };
}
