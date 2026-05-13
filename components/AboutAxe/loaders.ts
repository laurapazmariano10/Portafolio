import {
  Group,
  Box3,
  Vector3,
  MeshStandardMaterial,
  TextureLoader,
  Texture,
  SRGBColorSpace,
  LinearSRGBColorSpace,
  RepeatWrapping,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const KATANA_PATH = '/models/Katana_ThreeJS.glb';
const TEX_BASE = '/TexturesWebp/';

// ─── TEXTURAS REALES (revisadas visualmente) ─────────────────────────────
// Katana Blade.png  = gris plateado (filo)
// wood.jpg          = tela NEGRA tejida (mal nombrada, sirve para vaina + cloth)
// handle-base.jpg   = cuero rojo oscuro (mango base)
// hilt-design.png   = madera clara amarilla (no es para hilts)
// roughness.jpg     = mapa de rugosidad
// handle-wrap.png   = referencia visual (no se usa como textura)
const TEX_FILES = {
  blade:       'Katana Blade.webp',
  blackCloth:  'wood.webp',           // tela negra
  redLeather:  'handle-base.webp',    // cuero rojo
  handleWrap:  'handle-wrap.webp',    // envoltura del mango
  roughness:   'roughness.webp',
} as const;

type TexKey = keyof typeof TEX_FILES;

// Color dorado sólido para todas las piezas metálicas decoradas
const GOLD_HEX = 0xC9A24A;
const SILVER_HEX = 0xCCCCCC;

// ─── MAPEO MATERIAL → CONFIG PBR ──────────────────────────────────────────
type MatConfig = {
  map?: TexKey;
  color?: number;
  metalness: number;
  roughness: number;
  roughnessMap?: TexKey;
};

const MATERIAL_CONFIG: Record<string, MatConfig> = {
  // KATANA
  'Katana Blade':        { map: 'blade',      color: 0xFFFFFF, metalness: 0.75, roughness: 0.15, roughnessMap: 'roughness' },
  'Katana Handle':       { map: 'redLeather',  color: 0xFFFFFF, metalness: 0.0,  roughness: 0.75 },
  'Katana Handle Cloth': { map: 'handleWrap',  color: 0xFFFFFF, metalness: 0.0,  roughness: 0.85 },
  'Katana Handle Hilt':  { color: GOLD_HEX, metalness: 0.95, roughness: 0.28, roughnessMap: 'roughness' },
  'Katana Handguard':    { color: GOLD_HEX, metalness: 0.95, roughness: 0.28, roughnessMap: 'roughness' },
  'Katana Hilt 2':       { color: GOLD_HEX, metalness: 0.95, roughness: 0.28, roughnessMap: 'roughness' },
  'Katana End Piece':    { color: GOLD_HEX, metalness: 0.95, roughness: 0.28, roughnessMap: 'roughness' },
  // VAINA: cuerpo NEGRO + detalles DORADOS
  'Katana Sheath':       { map: 'blackCloth',                    metalness: 0.0,  roughness: 0.75 },
  'Katana Sheath 1':     { color: GOLD_HEX, metalness: 0.95, roughness: 0.30, roughnessMap: 'roughness' },
  'Katana Sheath 2':     { color: GOLD_HEX, metalness: 0.95, roughness: 0.30, roughnessMap: 'roughness' },
};

/**
 * Loads textures in parallel and configures color space.
 * - Color maps → SRGBColorSpace
 * - Roughness map → LinearSRGBColorSpace (data, not color)
 */
async function loadTextures(): Promise<Record<TexKey, Texture>> {
  const loader = new TextureLoader();
  const entries = await Promise.all(
    (Object.keys(TEX_FILES) as TexKey[]).map(async (key) => {
      const tex = await loader.loadAsync(`${TEX_BASE}${TEX_FILES[key]}`);
      tex.flipY = false; // glTF convention
      tex.wrapS = RepeatWrapping;
      tex.wrapT = RepeatWrapping;
      tex.colorSpace = key === 'roughness' ? LinearSRGBColorSpace : SRGBColorSpace;
      return [key, tex] as const;
    })
  );
  return Object.fromEntries(entries) as Record<TexKey, Texture>;
}

/**
 * Builds a MeshStandardMaterial from MATERIAL_CONFIG by material name.
 * Falls back to original material if no config found.
 */
function buildMaterial(
  originalName: string,
  textures: Record<TexKey, Texture>,
): MeshStandardMaterial | null {
  const cfg = MATERIAL_CONFIG[originalName];
  if (!cfg) return null;

  const mat = new MeshStandardMaterial({
    map: cfg.map ? textures[cfg.map] : null,
    color: cfg.color ?? 0xffffff,
    metalness: cfg.metalness,
    roughness: cfg.roughness,
    roughnessMap: cfg.roughnessMap ? textures[cfg.roughnessMap] : undefined,
    envMapIntensity: 2.5,
  });
  mat.name = originalName;
  return mat;
}

function buildMaterialFromConfig(
  name: string,
  cfg: MatConfig,
  textures: Record<TexKey, Texture>,
): MeshStandardMaterial {
  const mat = new MeshStandardMaterial({
    map: cfg.map ? textures[cfg.map] : null,
    color: cfg.color ?? 0xffffff,
    metalness: cfg.metalness,
    roughness: cfg.roughness,
    roughnessMap: cfg.roughnessMap ? textures[cfg.roughnessMap] : undefined,
    envMapIntensity: 2.5,
  });
  mat.name = name;
  return mat;
}

function buildFallbackMaterials(
  kind: 'katana' | 'vaina',
  textures: Record<TexKey, Texture>,
): MeshStandardMaterial[] {
  const names = kind === 'katana'
    ? [
        'Katana Blade',
        'Katana Handle',
        'Katana Handle Cloth',
        'Katana Handle Hilt',
        'Katana Handguard',
        'Katana Hilt 2',
        'Katana End Piece',
      ]
    : [
        'Katana Sheath',
        'Katana Sheath 1',
        'Katana Sheath 2',
      ];

  return names.map((name) => buildMaterialFromConfig(name, MATERIAL_CONFIG[name], textures));
}

/**
 * Loads the katana .glb (Draco-compressed) and applies PBR materials
 * to both Katana and Vaina meshes based on material name mapping.
 *
 * Returns separate Groups for independent animation.
 * Note: Origin (0,0,0) is preserved at the handguard for both meshes,
 * which means applying the same transform to both = "katana sheathed".
 */
export async function loadKatanaModel(): Promise<{ katana: Group; vaina: Group }> {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  // Load model + textures in parallel
  const [gltf, textures] = await Promise.all([
    gltfLoader.loadAsync(KATANA_PATH),
    loadTextures(),
  ]);

  let katana: Group | null = null;
  let vaina: Group | null = null;

  gltf.scene.traverse((child: any) => {
    if (child.name === 'Katana') katana = child;
    if (child.name === 'Vaina') vaina = child;
  });

  if (!katana || !vaina) {
    throw new Error(
      `Katana model missing expected nodes. Found: Katana=${!!katana}, Vaina=${!!vaina}`
    );
  }

  // Assign materials intelligently: use bounding box volume to identify
  // the largest mesh (blade / sheath body) vs small accent pieces.
  const applyMaterials = (obj: Group, kind: 'katana' | 'vaina') => {
    // Collect meshes with their bounding box volume
    const meshes: { mesh: any; volume: number }[] = [];
    obj.traverse((child: any) => {
      if (!child.isMesh) return;
      // Try named material first
      if (child.material?.name && child.material.name !== '' && child.material.name !== 'Material') {
        const newMat = buildMaterial(child.material.name, textures);
        if (newMat) {
          child.material.dispose();
          child.material = newMat;
          return; // named material applied, skip sizing
        }
      }
      const box = new Box3().setFromObject(child);
      const size = new Vector3();
      box.getSize(size);
      meshes.push({ mesh: child, volume: size.x * size.y * size.z });
    });

    if (meshes.length === 0) return;

    // Sort by volume descending: largest first
    meshes.sort((a, b) => b.volume - a.volume);

    if (kind === 'katana') {
      // Katana: 7 primitives
      // Largest = Blade (silver), 2nd = Handle, 3rd = Handle Cloth, rest = gold accents
      const matOrder: MatConfig[] = [
        MATERIAL_CONFIG['Katana Blade'],         // largest → silver blade
        MATERIAL_CONFIG['Katana Handle'],         // 2nd → red leather handle
        MATERIAL_CONFIG['Katana Handle Cloth'],   // 3rd → black cloth wrap
        MATERIAL_CONFIG['Katana Handguard'],      // rest → gold accents
        MATERIAL_CONFIG['Katana Handle Hilt'],
        MATERIAL_CONFIG['Katana Hilt 2'],
        MATERIAL_CONFIG['Katana End Piece'],
      ];
      const nameOrder = [
        'Katana Blade', 'Katana Handle', 'Katana Handle Cloth',
        'Katana Handguard', 'Katana Handle Hilt', 'Katana Hilt 2', 'Katana End Piece',
      ];
      meshes.forEach(({ mesh }, idx) => {
        if (mesh.material && typeof mesh.material.dispose === 'function') mesh.material.dispose();
        const cfg = matOrder[idx % matOrder.length];
        mesh.material = buildMaterialFromConfig(nameOrder[idx % nameOrder.length], cfg, textures);
        console.log(`[loaders] katana mesh[${idx}] vol=${meshes[idx].volume.toFixed(4)} → ${nameOrder[idx % nameOrder.length]}`);
      });
    } else {
      // Vaina: 3 primitives
      // Largest = Sheath body (black), rest = gold accents
      const matOrder: MatConfig[] = [
        MATERIAL_CONFIG['Katana Sheath'],    // largest → black body
        MATERIAL_CONFIG['Katana Sheath 1'],  // gold accent
        MATERIAL_CONFIG['Katana Sheath 2'],  // gold accent
      ];
      const nameOrder = ['Katana Sheath', 'Katana Sheath 1', 'Katana Sheath 2'];
      meshes.forEach(({ mesh }, idx) => {
        if (mesh.material && typeof mesh.material.dispose === 'function') mesh.material.dispose();
        const cfg = matOrder[idx % matOrder.length];
        mesh.material = buildMaterialFromConfig(nameOrder[idx % nameOrder.length], cfg, textures);
        console.log(`[loaders] vaina mesh[${idx}] vol=${meshes[idx].volume.toFixed(4)} → ${nameOrder[idx % nameOrder.length]}`);
      });
    }
  };

  applyMaterials(katana, 'katana');
  applyMaterials(vaina, 'vaina');

  dracoLoader.dispose();

  return { katana, vaina };
}
