import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const MODEL_PATH = '/models/hachaPro2.glb';

/**
 * Loads the axe .glb and returns the root Group.
 * Draco decoder is served from /draco/.
 */
export async function loadAxeModel(): Promise<Group> {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  const gltf = await gltfLoader.loadAsync(MODEL_PATH);

  // Respect PBR materials as-is — no overrides
  const model = gltf.scene;

  // Aumentar la intensidad del HDRI en todos los materiales para que parezca más realista
  model.traverse((child: any) => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m: any) => {
          if ('envMapIntensity' in m) m.envMapIntensity = 2.5;
          m.needsUpdate = true;
        });
      } else {
        if ('envMapIntensity' in child.material) child.material.envMapIntensity = 2.5;
        child.material.needsUpdate = true;
      }
    }
  });

  // Dispose the draco loader once done
  dracoLoader.dispose();

  return model;
}
