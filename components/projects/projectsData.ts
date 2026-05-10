export type ProjectImage = {
  src: string;
  alt: string;
  variant?: 'wide' | 'tall';
};

export type Project = {
  slug: string;
  title: string;
  shortTitle: string;
  tags: string[];
  cover: string;
  depthMap: string;
  gradient: string;
  services: string[];
  description: string;
  images: ProjectImage[];
};

const ROOT = '/imgPR/imgProyectos';

export const PROJECTS: Project[] = [
  {
    slug: 'zygo-web',
    title: 'Zygo Web',
    shortTitle: 'Zygo Web',
    tags: ['Web', 'Diseño', 'Desarrollo', 'Salud'],
    cover: `${ROOT}/zygoWeb/PortadaW.webp`,
    depthMap: `${ROOT}/zygoWeb/depthmapW.png`,
    gradient: 'radial-gradient(circle at 18% 12%, rgba(255,255,255,0.52), transparent 28%), radial-gradient(circle at 82% 18%, rgba(255,70,148,0.42), transparent 30%), linear-gradient(135deg, #ff9dc7 0%, #ffd3e5 42%, #f26da8 100%)',
    services: ['Diseño web', 'Desarrollo web', 'UI / UX', 'Animación'],
    description: 'Zygo Web reúne una presencia digital clara, cálida y funcional para una marca orientada al cuidado femenino. La propuesta combina estructura editorial, navegación directa y una identidad visual suave que permite entender servicios, valores y confianza desde el primer contacto. El diseño prioriza ritmo, jerarquía y cercanía; el desarrollo traduce esa intención en una experiencia rápida, responsive y fácil de mantener. Cada bloque fue pensado para comunicar profesionalismo sin perder sensibilidad, equilibrando estética médica, lenguaje humano y una interfaz que guía a la usuaria sin fricción hacia la información importante.',
    images: [
      { src: `${ROOT}/zygoWeb/1W.png`, alt: 'Zygo Web pantalla 1' },
      { src: `${ROOT}/zygoWeb/1.1W.png`, alt: 'Zygo Web responsive 1', variant: 'tall' },
      { src: `${ROOT}/zygoWeb/2W.png`, alt: 'Zygo Web pantalla 2' },
      { src: `${ROOT}/zygoWeb/2.2W.png`, alt: 'Zygo Web responsive 2', variant: 'tall' },
      { src: `${ROOT}/zygoWeb/3W.png`, alt: 'Zygo Web pantalla 3' },
      { src: `${ROOT}/zygoWeb/4W.png`, alt: 'Zygo Web pantalla 4' },
      { src: `${ROOT}/zygoWeb/5W.png`, alt: 'Zygo Web pantalla 5' },
      { src: `${ROOT}/zygoWeb/6W.png`, alt: 'Zygo Web pantalla 6' },
    ],
  },
  {
    slug: 'pisky',
    title: 'Pisky',
    shortTitle: 'Pisky',
    tags: ['Web', 'Automatización', 'Diseño', 'Desarrollo'],
    cover: `${ROOT}/pisky/PortadaP.webp`,
    depthMap: `${ROOT}/pisky/depthmapP.png`,
    gradient: 'radial-gradient(circle at 20% 16%, rgba(255,255,255,0.58), transparent 30%), radial-gradient(circle at 78% 24%, rgba(71,151,226,0.42), transparent 32%), linear-gradient(135deg, #a6d1f7 0%, #dcefff 46%, #6eb4ed 100%)',
    services: ['Diseño web', 'Desarrollo web', 'Automatización', 'Conceptual'],
    description: 'Pisky presenta una experiencia digital pensada para comunicar tecnología, rapidez y confianza dentro de un servicio conectado al turismo y la mensajería. La interfaz organiza funciones complejas de forma ligera, con una narrativa visual que evita saturar al usuario y permite entender el valor del producto en pocos segundos. El proyecto combina diseño web, arquitectura de información y desarrollo de una presencia clara para explicar automatización, soporte y alcance operativo. La dirección visual busca sentirse moderna, accesible y eficiente, acompañando una solución que convierte procesos repetitivos en una experiencia más simple y controlada.',
    images: [1, 2, 3, 4, 5, 6].map((index) => ({ src: `${ROOT}/pisky/${index}P.png`, alt: `Pisky pantalla ${index}` })),
  },
  {
    slug: 'qualitiktok',
    title: 'Qualitiktok',
    shortTitle: 'Qualitiktok',
    tags: ['Software', 'Desktop', 'Diseño', 'Desarrollo'],
    cover: `${ROOT}/qualitiktok/PortadaQ.webp`,
    depthMap: `${ROOT}/qualitiktok/depthmapQ.png`,
    gradient: 'radial-gradient(circle at 16% 18%, rgba(94,111,255,0.34), transparent 30%), radial-gradient(circle at 82% 12%, rgba(255,255,255,0.12), transparent 28%), linear-gradient(135deg, #070e36 0%, #111b57 48%, #020516 100%)',
    services: ['Diseño UI', 'Desarrollo desktop', 'Optimización', 'Conceptual'],
    description: 'Qualitiktok es una herramienta enfocada en preparar videos con parámetros técnicos pensados para reducir pérdidas de calidad al publicar en TikTok. La experiencia se diseñó alrededor de una necesidad muy concreta: hacer que un proceso técnico se perciba directo, seguro y fácil de ejecutar. La interfaz prioriza controles claros, estados visibles y una lectura inmediata de configuración, evitando que el usuario tenga que interpretar conceptos de compresión o exportación complejos. El resultado es un software de escritorio con estética oscura, precisa y funcional, donde el diseño sostiene la utilidad sin distraer.',
    images: [1, 2, 3, 4, 5, 6, 7].map((index) => ({ src: `${ROOT}/qualitiktok/${index}Q.png`, alt: `Qualitiktok pantalla ${index}` })),
  },
  {
    slug: 'zygo-app',
    title: 'ZygoApp',
    shortTitle: 'ZygoApp',
    tags: ['App', 'Diseño', 'Desarrollo', 'Producto'],
    cover: `${ROOT}/zygoApp/PortadaZP.webp`,
    depthMap: `${ROOT}/zygoApp/depthmapZP.png`,
    gradient: 'radial-gradient(circle at 18% 18%, rgba(255,255,255,0.34), transparent 28%), radial-gradient(circle at 82% 18%, rgba(255,164,164,0.36), transparent 31%), linear-gradient(135deg, #fa3e3e 0%, #ff8585 45%, #b80f18 100%)',
    services: ['Diseño app', 'Desarrollo web', 'UI / UX', 'Conceptual'],
    description: 'ZygoApp extiende la identidad de Zygo hacia una experiencia de producto más directa, pensada para acompañar consultas, información y contacto desde una interfaz compacta y accesible. El proyecto trabaja una estética intensa, clara y memorable, con énfasis en jerarquías simples, navegación veloz y componentes que pueden crecer con nuevas funcionalidades. La propuesta busca unir diseño de aplicación, dirección visual y desarrollo front-end en una base flexible. Cada pantalla mantiene continuidad con la marca, pero adapta el lenguaje para sentirse más dinámica, útil y cercana dentro del uso cotidiano.',
    images: [1, 2, 3, 4, 5].map((index) => ({ src: `${ROOT}/zygoApp/${index}ZW.png`, alt: `ZygoApp pantalla ${index}` })),
  },
];

export function getProjectBySlug(slug: string) {
  return PROJECTS.find((project) => project.slug === slug);
}
