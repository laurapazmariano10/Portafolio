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
  invertDepth?: boolean;
  gradient: string;
  services: string[];
  description: string;
  images: ProjectImage[];
};

const ROOT = '/imgProyectosWebp';

export const PROJECTS: Project[] = [
  {
    slug: 'zygo-web',
    title: 'Zygo Web',
    shortTitle: 'Zygo Web',
    tags: ['Web', 'Diseño', 'Desarrollo', 'Salud'],
    cover: `${ROOT}/zygoWebWebp/PortadaW.webp`,
    depthMap: `${ROOT}/zygoWebWebp/depthmapW.webp`,
    gradient: 'radial-gradient(circle at 18% 12%, rgba(255,255,255,0.52), transparent 28%), radial-gradient(circle at 82% 18%, rgba(255,70,148,0.42), transparent 30%), linear-gradient(135deg, #ff9dc7 0%, #ffd3e5 42%, #f26da8 100%)',
    services: ['Diseño web', 'Desarrollo web', 'UI / UX', 'Animación'],
    description: 'Zygo Web reúne una presencia digital clara, cálida y funcional para una marca orientada al cuidado femenino. La propuesta combina estructura editorial, navegación directa y una identidad visual suave que permite entender servicios, valores y confianza desde el primer contacto. El diseño prioriza ritmo, jerarquía y cercanía; el desarrollo traduce esa intención en una experiencia rápida, responsive y fácil de mantener. Cada bloque fue pensado para comunicar profesionalismo sin perder sensibilidad, equilibrando estética médica, lenguaje humano y una interfaz que guía a la usuaria sin fricción hacia la información importante.',
    images: [
      { src: `${ROOT}/zygoWebWebp/1W.webp`, alt: 'Zygo Web pantalla 1' },
      { src: `${ROOT}/zygoWebWebp/1.1W.webp`, alt: 'Zygo Web responsive 1', variant: 'tall' },
      { src: `${ROOT}/zygoWebWebp/2W.webp`, alt: 'Zygo Web pantalla 2' },
      { src: `${ROOT}/zygoWebWebp/2.2W.webp`, alt: 'Zygo Web responsive 2', variant: 'tall' },
      { src: `${ROOT}/zygoWebWebp/3W.webp`, alt: 'Zygo Web pantalla 3' },
      { src: `${ROOT}/zygoWebWebp/4W.webp`, alt: 'Zygo Web pantalla 4' },
      { src: `${ROOT}/zygoWebWebp/5W.webp`, alt: 'Zygo Web pantalla 5' },
      { src: `${ROOT}/zygoWebWebp/6W.webp`, alt: 'Zygo Web pantalla 6', variant: 'tall' },
    ],
  },
  {
    slug: 'pms',
    title: 'PMS-Tg',
    shortTitle: 'PMS-Tg',
    tags: ['Web', 'Software personalizado', 'Gestión clínica', 'Multirol', 'Multisede', 'Dashboard', 'Finanzas'],
    cover: `${ROOT}/PMS/portada.webp`,
    depthMap: `${ROOT}/PMS/depthmap-portada.webp`,
    gradient: 'radial-gradient(circle at 18% 14%, rgba(255,255,255,0.78), transparent 30%), radial-gradient(circle at 82% 16%, rgba(210,214,220,0.54), transparent 32%), linear-gradient(135deg, #f8f9fb 0%, #e7eaee 46%, #cfd4da 100%)',
    services: ['Gestión clínica', 'Software personalizado', 'Dashboard financiero', 'Reportes ejecutivos'],
    description: 'PMS es una herramienta web de gestión clínica con acceso multirol y multisede, diseñada para centralizar recepción, pacientes, atenciones, pagos, adelantos, cierre de caja, catálogo de servicios, egresos y reportes ejecutivos. Permite operar el día a día desde recepción y, al mismo tiempo, dar a gerencia una visión clara de ingresos, utilidad, rendimiento por especialista, servicios más vendidos y flujo de caja. La experiencia prioriza lectura rápida, control operativo y una interfaz sobria que mantiene la información financiera y clínica ordenada sin saturar al usuario.',
    images: [1, 2, 3, 4, 5].map((index) => ({ src: `${ROOT}/PMS/${index}.webp`, alt: `PMS pantalla ${index}` })),
  },
  {
    slug: 'pisky',
    title: 'Pisky',
    shortTitle: 'Pisky',
    tags: ['Software de escritorio', 'Automatización', 'Mensajería masiva', 'Turismo'],
    cover: `${ROOT}/piskyWebp/PortadaP.webp`,
    depthMap: `${ROOT}/piskyWebp/depthmapP.webp`,
    invertDepth: true,
    gradient: 'radial-gradient(circle at 20% 16%, rgba(255,255,255,0.58), transparent 30%), radial-gradient(circle at 78% 24%, rgba(71,151,226,0.42), transparent 32%), linear-gradient(135deg, #a6d1f7 0%, #dcefff 46%, #6eb4ed 100%)',
    services: ['Software de escritorio', 'Automatización', 'Mensajería masiva', 'Turismo'],
    description: 'Este proyecto es un software de escritorio desarrollado para facilitar el envío masivo de mensajes por WhatsApp dentro del rubro turístico, especialmente para promociones, campañas y comunicación comercial. La propuesta se enfocó en hacer más simple una tarea repetitiva que normalmente consume tiempo y ordenarla dentro de una herramienta más directa y controlada. La experiencia se trabajó para que el usuario pudiera gestionar envíos de manera clara, rápida y sin fricción, manteniendo una interfaz funcional y fácil de entender. El resultado es una herramienta práctica orientada a automatizar comunicación comercial dentro de un contexto real de negocio.',
    images: [1, 2, 3, 4, 5, 6].map((index) => ({ src: `${ROOT}/piskyWebp/${index}.webp`, alt: `Pisky pantalla ${index}` })),
  },
  {
    slug: 'qualitiktok',
    title: 'Qualitiktok',
    shortTitle: 'Qualitiktok',
    tags: ['Diseño UI', 'Software de escritorio', 'Flujo de exportación', 'Optimización de video'],
    cover: `${ROOT}/qualitiktokWebp/portada.webp`,
    depthMap: `${ROOT}/qualitiktokWebp/depthmapQ.webp`,
    gradient: 'radial-gradient(circle at 16% 18%, rgba(94,111,255,0.34), transparent 30%), radial-gradient(circle at 82% 12%, rgba(255,255,255,0.12), transparent 28%), linear-gradient(135deg, #070e36 0%, #111b57 48%, #020516 100%)',
    services: ['Diseño UI', 'Software de escritorio', 'Flujo de exportación', 'Optimización de video'],
    description: 'Qualitiktok es una herramienta de escritorio pensada para preparar videos antes de publicarlos en TikTok, ajustando automáticamente los parámetros técnicos que suelen afectar la calidad al subirlos. El objetivo fue convertir un proceso normalmente confuso y lleno de detalles técnicos en algo mucho más claro, rápido y confiable para el usuario. Toda la interfaz se diseñó para que la configuración se entienda de inmediato, con controles simples, estados visibles y una lógica directa de uso. El resultado es un software preciso y funcional, donde el diseño acompaña la utilidad sin estorbarla.',
    images: [1, 2, 3, 4, 5, 6, 7].map((index) => ({ src: `${ROOT}/qualitiktokWebp/${index}Q.webp`, alt: `Qualitiktok pantalla ${index}` })),
  },
  {
    slug: 'zygo-app',
    title: 'ZygoApp',
    shortTitle: 'ZygoApp',
    tags: ['Sistema web', 'Gestión clínica', 'Calendario médico', 'Historial clínico'],
    cover: `${ROOT}/zygoAppWebp/PortadaZP.webp`,
    depthMap: `${ROOT}/zygoAppWebp/depthmapZP.webp`,
    invertDepth: true,
    gradient: 'radial-gradient(circle at 18% 18%, rgba(255,255,255,0.34), transparent 28%), radial-gradient(circle at 82% 18%, rgba(255,164,164,0.36), transparent 31%), linear-gradient(135deg, #fa3e3e 0%, #ff8585 45%, #b80f18 100%)',
    services: ['Sistema web', 'Gestión clínica', 'Calendario médico', 'Historial clínico'],
    description: 'ZygoApp es un sistema web creado para organizar tareas clave dentro del consultorio, como el registro de pacientes, la programación de citas, el calendario médico y el historial clínico. La idea fue reunir todo en una sola plataforma para que el trabajo diario se sienta más ordenado, rápido y fácil de manejar. La interfaz prioriza recorridos simples, lectura clara de la información y una estructura que pueda seguir creciendo con nuevas funciones sin perder coherencia. Es una herramienta pensada para el uso real del consultorio, no solo para verse bien, sino para resolver procesos cotidianos de forma práctica.',
    images: [1, 2, 3, 4, 5].map((index) => ({ src: `${ROOT}/zygoAppWebp/${index}ZW.webp`, alt: `ZygoApp pantalla ${index}` })),
  },
];

export function getProjectBySlug(slug: string) {
  return PROJECTS.find((project) => project.slug === slug);
}
