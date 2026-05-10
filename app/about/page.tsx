'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Hand } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { ContactAndFooter } from '@/components/ContactAndFooter';

const AboutAxe = dynamic(() => import('@/components/AboutAxe/AboutAxe'), {
  ssr: false,
});

const SERVICES = [
  {
    label: 'Diseño web',
    items: ['Diseño web adaptable', 'Landing pages optimizadas', 'Sitios rápidos, claros y fáciles de navegar', 'Mantenimiento y mejoras del sitio web'],
  },
  {
    label: 'UI / UX',
    items: ['Diseño de interfaces para web y apps', 'Estructura de pantallas y flujos', 'Prototipos claros para validar ideas', 'Microinteracciones y experiencia visual'],
  },
  {
    label: 'Branding',
    items: ['Dirección visual de marca', 'Paleta de color y estilo gráfico', 'Piezas visuales para redes y campañas', 'Aplicaciones digitales de identidad'],
  },
  {
    label: 'Creador de contenido',
    items: ['Contenido visual para redes', 'Piezas para lanzamientos y campañas', 'Edición y adaptación de formatos', 'Narrativa visual para comunicar mejor'],
  },
  {
    label: 'Software a medida',
    items: ['Aplicaciones web a medida', 'Paneles y sistemas internos', 'Automatización de procesos', 'Soluciones funcionales para tu operación'],
  },
];

const STACK_GROUPS = [
  {
    title: 'Frontend',
    items: [
      ['Next.js', 'nextdotjs', 'Framework para experiencias web rápidas y escalables.'],
      ['React', 'react', 'Interfaces dinámicas con componentes reutilizables.'],
      ['HTML', 'html5', 'Estructura clara para productos digitales sólidos.'],
      ['CSS', 'css3', 'Estilos precisos, responsivos y visualmente cuidados.'],
      ['JavaScript', 'javascript', 'Interacción, lógica y movimiento en la web.'],
      ['TypeScript', 'typescript', 'Código más robusto, predecible y mantenible.'],
      ['Astro', 'astro', 'Sitios veloces con contenido limpio y moderno.'],
      ['Tailwind CSS', 'tailwindcss', 'Sistemas visuales rápidos y consistentes.'],
      ['Vue', 'vuedotjs', 'Interfaces reactivas con una arquitectura ligera.'],
      ['Angular', 'angular', 'Aplicaciones grandes con estructura empresarial.'],
    ],
  },
  {
    title: 'Backend y datos',
    items: [
      ['Node.js', 'nodedotjs', 'Servicios y APIs con JavaScript del lado servidor.'],
      ['Python', 'python', 'Automatización, lógica de negocio y prototipos rápidos.'],
      ['PHP', 'php', 'Desarrollo web clásico y sistemas flexibles.'],
      ['SQL', 'postgresql', 'Modelado y consulta de datos con precisión.'],
      ['Supabase', 'supabase', 'Backend moderno con base de datos y autenticación.'],
      ['Bun', 'bun', 'Runtime rápido para tooling y desarrollo moderno.'],
      ['Kotlin', 'kotlin', 'Aplicaciones móviles y lógica robusta.'],
    ],
  },
  {
    title: '3D, diseño y contenido',
    items: [
      ['WebGL', 'webgl', 'Gráficos interactivos directamente en navegador.'],
      ['Three.js', 'threedotjs', 'Escenas 3D y experiencias visuales inmersivas.'],
      ['Spline', 'spline', 'Modelado 3D interactivo para web.'],
      ['Blender', 'blender', 'Visuales 3D, renders y composición creativa.'],
      ['Photoshop', 'adobephotoshop', 'Edición visual y retoque básico.'],
      ['CapCut', 'capcut', 'Edición rápida de video y contenido social.'],
      ['Framer', 'framer', 'Prototipos y sitios interactivos con buen ritmo.'],
      ['Webflow', 'webflow', 'Sitios visuales con control fino de diseño.'],
    ],
  },
  {
    title: 'Producto y operación',
    items: [
      ['Stripe', 'stripe', 'Pagos digitales y monetización de productos.'],
      ['Office 365', 'microsoft365', 'Documentación, colaboración y organización.'],
      ['IA', 'openai', 'Automatización, apoyo creativo y flujos inteligentes.'],
      ['Y más', 'sparkpost', 'Siempre explorando nuevas herramientas útiles.'],
    ],
  },
];

function SimpleIcon({ slug, name }: { slug: string; name: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://cdn.simpleicons.org/${slug}`}
      alt=""
      className="h-7 w-7 object-contain"
      loading="lazy"
      onError={(event) => {
        event.currentTarget.style.display = 'none';
      }}
      aria-hidden="true"
      title={name}
    />
  );
}

export default function AboutSection() {
  const [activeServiceIndex, setActiveServiceIndex] = useState(-1);
  const aboutWrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#FFFFFF] text-[#303030]">
      <Navbar />

      {/* 3D Axe overlay — fixed canvas, pointer-events:none */}
      <AboutAxe wrapperRef={aboutWrapperRef} />

      {/* Wrapper for ScrollTrigger to measure total scroll distance */}
      <div ref={aboutWrapperRef}>

      <section id="hero-section" className="relative flex h-[100dvh] min-h-[620px] w-full items-center justify-center" style={{ willChange: 'transform', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
        <div className="pointer-events-none absolute inset-0 z-0 flex select-none flex-row items-center justify-center">
          <motion.div
            initial={{ x: '10vw', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="flex h-full w-1/2 flex-col items-end justify-center pb-[3vh] pr-[130px] sm:pr-[160px] md:pb-[6vh] md:pr-[190px] lg:pr-[200px] xl:pr-[220px]"
          >
            <div className="flex flex-col items-end">
              <span className="font-[family-name:var(--font-antonio)] text-[18px] font-normal uppercase tracking-normal text-[#303030] md:text-[28px] lg:text-[32px]">
                MARIANO LAURA
              </span>
              <h1 className="font-[family-name:var(--font-antonio)] text-[12vw] font-bold uppercase leading-[1.1] tracking-[-0.03em] text-[#303030] sm:text-[80px] md:text-[100px] lg:text-[110px] xl:text-[120px]">
                DIGITAL
              </h1>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: '-10vw', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="flex h-full w-1/2 flex-col items-start justify-center pl-[130px] pt-[3vh] sm:pl-[160px] md:pl-[190px] md:pt-[6vh] lg:pl-[200px] xl:pl-[220px]"
          >
            <div className="flex flex-col items-start max-w-max">
              <h1 className="font-[family-name:var(--font-antonio)] text-[12vw] font-bold uppercase leading-[1.1] tracking-[-0.03em] text-[#303030] sm:text-[80px] md:text-[100px] lg:text-[110px] xl:text-[120px]">
                DESIGNER
              </h1>
              <div className="mt-2 flex w-full justify-end md:mt-4">
                 <p className="body-small max-w-[280px] text-right text-[#303030]/62">
                   Soy diseñador digital y desarrollador, Ing. en sistemas e informática.
                 </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 h-[336px] w-[240px] sm:h-[392px] sm:w-[280px] md:h-[448px] md:w-[320px] lg:h-[476px] lg:w-[340px]">
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 80, delay: 0.05 }}
            className="relative h-full w-full overflow-hidden rounded-[24px] border border-black/5 bg-[#E8E8E8] shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
          >
            <Image
              src="/Persona.jpeg"
              alt="Mariano Laura"
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 120, delay: 0.6 }}
            className="absolute -bottom-6 -left-6 z-20 flex h-[72px] w-[72px] cursor-default items-center justify-center rounded-full bg-[#6872F2] text-white shadow-[0_12px_30px_rgba(104,114,242,0.28)] transition-transform hover:scale-105 md:-bottom-10 md:-left-10 md:h-[104px] md:w-[104px]"
          >
            <Hand className="h-8 w-8 animate-wave-hand md:h-11 md:w-11" strokeWidth={2.2} />
          </motion.div>
        </div>
      </section>

      {/* Bio card removed — 3D axe fills this space */}

      <section className="mx-auto flex w-full max-w-[1200px] flex-col px-6 py-24 md:px-10 lg:py-28">
        
        {/* Acerca de mí */}
        <div id="about-me-section" className="grid grid-cols-1 items-start gap-14 md:grid-cols-[650px_1fr]">
          <div className="w-full max-w-[650px]">
            <h2 className="font-[family-name:var(--font-antonio)] text-[clamp(3rem,5vw,3.75rem)] font-bold uppercase leading-[1.3] tracking-normal text-[#303030]">
              Acerca de mí
            </h2>
            <p className="body-medium mt-6 text-[#303030]/80 text-lg md:text-xl leading-relaxed">
              Mi interés por la tecnología empezó desde muy temprano: desarrollé mi primera página web a los 12 años y, desde entonces, he estado construyendo soluciones digitales, desde sitios web hasta aplicaciones y sistemas. Soy una persona curiosa por naturaleza; no me atrae lo común, busco crear experiencias que destaquen con un equilibrio entre diseño, funcionalidad y detalle. Para mí, no se trata solo de que algo se vea bien, sino de que funcione, conecte y genere resultados reales; me enfoco en crear soluciones que aporten valor a las personas y a sus proyectos.
            </p>
          </div>
          <div className="hidden min-h-[420px] md:block sticky top-1/2" aria-hidden="true" />
        </div>

        {/* --- TRAMO DE SCROLL ARTIFICIAL PARA ANIMACIÓN 3D (WP_GAP_1) --- */}
        <div className="h-[100vh] w-full" aria-hidden="true" />

        {/* Lo que puedo hacer por ti */}
        <div id="services-section" className="grid grid-cols-1 items-start gap-14 md:grid-cols-[1fr_650px]">
          <div className="hidden min-h-[420px] md:block sticky top-1/2" aria-hidden="true" />
          <div className="w-full max-w-[650px] flex flex-col justify-center">
            <h2 className="font-[family-name:var(--font-antonio)] text-[clamp(3rem,5vw,3.75rem)] font-bold uppercase leading-[1.3] tracking-normal text-[#303030]">
              Lo que puedo hacer por ti
            </h2>
            <p className="body-medium mt-6 max-w-[470px] text-[#303030]/68">
              Servicios pensados para convertir ideas en experiencias digitales claras, funcionales y visualmente memorables.
            </p>
            <div className="mt-10">
              {SERVICES.map((service, index) => {
                const isOpen = activeServiceIndex === index;

                return (
                  <div key={service.label} className={`border-b transition-colors duration-300 ${isOpen ? 'border-[#6872F2]' : 'border-[#303030]/16'}`}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setActiveServiceIndex(isOpen ? -1 : index)}
                      className={`flex w-full items-center justify-between gap-6 py-5 text-left font-[family-name:var(--font-antonio)] text-[clamp(1.5rem,1.8vw,1.625rem)] font-normal uppercase leading-[1.3] transition-colors duration-300 ${isOpen ? 'text-[#6872F2]' : 'text-[#303030] hover:text-[#6872F2]'}`}
                    >
                      <span>
                        <span className="mr-3 text-[0.72em] text-current/60">{index + 1}.</span>
                        {service.label}
                      </span>
                      <span className="text-2xl leading-none">{isOpen ? '⌃' : '⌄'}</span>
                    </button>
                    <div className={`grid transition-all duration-500 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <ul className="space-y-4 pb-6">
                          {service.items.map((item) => (
                            <li key={item} className="body-medium flex items-center gap-3 text-[#303030]/70">
                              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-[#6872F2] text-[0.65rem] leading-none text-[#6872F2]">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* --- TRAMO DE SCROLL ARTIFICIAL PARA ANIMACIÓN 3D (WP_GAP_2) --- */}
      <div className="h-[100vh] w-full" aria-hidden="true" />

      <section id="stack-section" className="bg-white px-6 py-28 text-[#303030] md:px-10">
        <div className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-[650px_1fr]">
          <div className="w-full max-w-[650px]">
            <h2 className="font-[family-name:var(--font-antonio)] text-[clamp(3rem,5vw,3.75rem)] font-bold uppercase leading-[1.3] tracking-normal text-[#303030]">
              Mi stack tecnológico
            </h2>
            <p className="body-medium mt-6 text-[#303030]/70">
              Mi conjunto de tecnologías combina desarrollo, diseño, 3D, automatización y herramientas creativas para construir soluciones completas.
            </p>

            <div className="mt-14 w-full max-w-[560px] space-y-10">
              {STACK_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-5 font-[family-name:var(--font-antonio)] text-[1.625rem] font-normal uppercase leading-[1.3] text-[#303030]">
                    {group.title}
                  </h3>
                  <div className="space-y-4">
                    {group.items.map(([name, slug, description]) => (
                      <div key={name} className="grid min-h-[100px] w-full grid-cols-[56px_1fr] items-center gap-4 border-b border-[#303030]/14 pb-4">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#303030]/12 bg-[#303030]/5">
                          <SimpleIcon slug={slug} name={name} />
                        </div>
                        <div>
                          <h4 className="font-[family-name:var(--font-antonio)] text-[1.625rem] font-normal uppercase leading-[1.3] text-[#303030]">
                            {name}
                          </h4>
                          <p className="body-small mt-1 text-[#303030]/58">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden min-h-[680px] lg:block" aria-hidden="true" />
        </div>
      </section>

      <section className="bg-white px-6 py-28 text-[#303030] md:px-10">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="font-[family-name:var(--font-antonio)] text-[clamp(3rem,5vw,3.75rem)] font-bold uppercase leading-[1.3] tracking-normal text-[#303030] text-center">
            Crear con estrategia y Creatividad
          </h2>
          <p className="body-medium mt-6 text-[#303030]/70 text-center max-w-[800px] mx-auto">
            Mi proceso combina estrategia y creatividad para abordar desafíos, elaborar soluciones y ofrecer diseños que comuniquen eficazmente su mensaje.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Fila 1 */}
            <div className="rounded-[24px] bg-[#303030] p-10 text-white flex flex-col justify-between min-h-[380px]">
              <span className="font-[family-name:var(--font-antonio)] text-[3.5rem] font-bold leading-none">01.</span>
              <div>
                <h3 className="font-[family-name:var(--font-antonio)] text-[1.625rem] font-normal uppercase leading-[1.3] mb-4">Investigación y Estrategia</h3>
                <p className="body-small text-white/80">
                  En esta fase, profundizo en la comprensión de tu negocio, público objetivo y metas del proyecto. A través de la investigación y planificación estratégica, creo una hoja de ruta clara para guiar todo el proceso de diseño.
                </p>
              </div>
            </div>
            
            <div className="rounded-[24px] bg-[#ececec] overflow-hidden min-h-[380px] relative">
               <Image src="/Setup.png" alt="Setup" fill className="object-cover" />
            </div>

            <div className="rounded-[24px] bg-[#6872F2] p-10 text-white flex flex-col justify-between min-h-[380px]">
              <span className="font-[family-name:var(--font-antonio)] text-[3.5rem] font-bold leading-none">02.</span>
              <div>
                <h3 className="font-[family-name:var(--font-antonio)] text-[1.625rem] font-normal uppercase leading-[1.3] mb-4">Concepto e Ideación</h3>
                <p className="body-small text-white/80">
                  Aquí, aporto ideas y desarrollo conceptos creativos que se alineen con tu visión. Los bocetos iniciales y las ideas se refinan en wireframes tangibles, estableciendo la dirección del diseño y la funcionalidad.
                </p>
              </div>
            </div>

            {/* Fila 2 */}
            <div className="rounded-[24px] bg-[#ececec] overflow-hidden min-h-[380px] relative">
               <Image src="/Persona.jpeg" alt="Persona" fill className="object-cover" />
            </div>

            <div className="rounded-[24px] bg-[#f3f3f4] p-10 text-[#303030] flex flex-col justify-between min-h-[380px] md:col-span-2">
              <span className="font-[family-name:var(--font-antonio)] text-[3.5rem] font-bold leading-none">03.</span>
              <div className="max-w-[600px]">
                <h3 className="font-[family-name:var(--font-antonio)] text-[1.625rem] font-normal uppercase leading-[1.3] mb-4">Feedback y Refinamiento</h3>
                <p className="body-small text-[#303030]/80">
                  La colaboración es clave. Reviso el diseño contigo, recopilo comentarios y refino el trabajo para que se alinee con tus expectativas y metas. Esto asegura que el diseño refleje tu visión.
                </p>
              </div>
            </div>

            {/* Fila 3 */}
            <div className="rounded-[24px] bg-[#6872F2] p-10 text-white flex flex-col justify-between min-h-[380px]">
              <span className="font-[family-name:var(--font-antonio)] text-[3.5rem] font-bold leading-none">04.</span>
              <div>
                <h3 className="font-[family-name:var(--font-antonio)] text-[1.625rem] font-normal uppercase leading-[1.3] mb-4">Pruebas y Optimización</h3>
                <p className="body-small text-white/80">
                  Realizo pruebas exhaustivas para identificar y resolver problemas de rendimiento o usabilidad. Esta fase garantiza que el diseño funcione perfectamente en todos los dispositivos y cumpla con los estándares de experiencia del usuario.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] bg-[#303030] p-10 text-white flex flex-col justify-between min-h-[380px]">
              <span className="font-[family-name:var(--font-antonio)] text-[3.5rem] font-bold leading-none">05.</span>
              <div>
                <h3 className="font-[family-name:var(--font-antonio)] text-[1.625rem] font-normal uppercase leading-[1.3] mb-4">Lanzamiento y Entrega</h3>
                <p className="body-small text-white/80">
                  Una vez finalizado todo, el proyecto se lanza y se te entrega. También proporciono orientación o soporte para mantenimiento continuo para asegurar el éxito a largo plazo.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] bg-[#ececec] overflow-hidden min-h-[380px] relative">
               <Image src="/Setup.png" alt="Setup" fill className="object-cover" />
            </div>

          </div>
        </div>
      </section>

      </div>{/* end about-wrapper */}

      <ContactAndFooter />
    </main>
  );
}
