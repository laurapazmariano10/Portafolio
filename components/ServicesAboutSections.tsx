'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SignatureSVG from '@/components/SignatureSVG';
import { ContactAndFooter } from '@/components/ContactAndFooter';
import { Hand } from 'lucide-react';
import Link from 'next/link';
import {
  getProjectDetailHref,
  setProjectDetailReturnTarget,
} from '@/components/projects/projectNavigation';
import { projectTransitionLog } from '@/components/projects/projectAnimationConfig';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SERVICES = [
  {
    label: 'Diseño web',
    image: '/imgPequesWebp/1.webp',
    items: ['Diseño web adaptable', 'Landing pages optimizadas', 'Sitios rápidos, claros y fáciles de navegar', 'Mantenimiento y mejoras del sitio web'],
  },
  {
    label: 'UI / UX',
    image: '/imgPequesWebp/2.webp',
    items: ['Diseño de interfaces para web y apps', 'Estructura de pantallas y flujos', 'Prototipos claros para validar ideas', 'Microinteracciones y experiencia visual'],
  },
  {
    label: 'Branding',
    image: '/imgPequesWebp/3.webp',
    items: ['Dirección visual de marca', 'Paleta de color y estilo gráfico', 'Piezas visuales para redes y campañas', 'Aplicaciones digitales de identidad'],
  },
  {
    label: 'Creador de contenido',
    image: '/imgPequesWebp/4.webp',
    items: ['Contenido visual para redes', 'Piezas para lanzamientos y campañas', 'Edición y adaptación de formatos', 'Narrativa visual para comunicar mejor'],
  },
  {
    label: 'Software a medida',
    image: '/imgPequesWebp/5.webp',
    items: ['Aplicaciones web a medida', 'Paneles y sistemas internos', 'Automatización de procesos', 'Soluciones funcionales para tu operación'],
  },
];

const PROJECTS = [
  {
    slug: 'zygo-web',
    title: 'Zygo web',
    description: 'Página web moderna y a medida para una cadena de consultorios especializados en la mujer.',
    tag: 'Web a medida',
    image: '/imgProyectosWebp/zygoWebWebp/PortadaW.webp',
  },
  {
    slug: 'pms',
    title: 'PMS-Tg',
    description: 'Herramienta web de gestión clínica multirol y multisede para recepción, caja, reportes, finanzas y gerencia.',
    tag: 'SaaS clínico',
    image: '/imgProyectosWebp/PMS/portada.webp',
  },
  {
    slug: 'pisky',
    title: 'Pisky',
    description: 'Sistema de mensajería masiva por WhatsApp para una empresa de turismo.',
    tag: 'Automatización',
    image: '/imgProyectosWebp/piskyWebp/PortadaP.webp',
  },
  {
    slug: 'zygo-app',
    title: 'MediRecord',
    description: 'Sistema de gestión clínica con registro de pacientes, historiales médicos, control de citas y administración por roles.',
    tag: 'Sistema clínico',
    image: '/imgProyectosWebp/zygoAppWebp/PortadaZP.webp',
  },
];

const FAQS = [
  {
    question: '¿Qué servicios ofreces?',
    answer: 'Diseño y desarrollo páginas web, interfaces, branding, contenido digital y software a medida según lo que necesite tu proyecto.',
  },
  {
    question: '¿Cómo funciona el proceso de diseño?',
    answer: 'Primero entiendo tu objetivo, luego defino una dirección visual, diseño la experiencia y ajusto todo contigo hasta llegar a una solución clara.',
  },
  {
    question: '¿Cuánto tiempo suele durar un proyecto?',
    answer: 'Depende del alcance. Una web puede tomar algunas semanas, mientras que un sistema a medida requiere más planificación y desarrollo.',
  },
  {
    question: '¿Qué información necesito proporcionar antes de comenzar un proyecto?',
    answer: 'Solo necesito conocer tu idea, objetivos, referencias y el contenido disponible. Si aún no tienes todo listo, te acompaño en ese proceso.',
  },
  {
    question: '¿Ofreces revisiones?',
    answer: 'Sí. Cada proyecto incluye revisiones para ajustar diseño, textos y detalles importantes antes de la entrega final.',
  },
  {
    question: '¿Cómo puedo empezar?',
    answer: 'Puedes escribirme con una breve explicación de lo que necesitas. Reviso tu caso y te propongo el siguiente paso.',
  },
];

const BLOG_POSTS = [
  {
    title: 'El futuro de la Inteligencia Artificial en el desarrollo de software',
    description: 'La era de escribir código de forma manual está llegando a su fin. Descubre cómo los agentes autónomos no solo están acelerando la producción, sino redefiniendo lo que significa ser ingeniero.',
    category: 'Tutoriales',
    date: '27 de abril de 2025',
    image: '/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/portada.webp',
  },
  {
    title: 'Computación Cuántica: ¿Estamos cerca de la supremacía?',
    description: 'Olvida todo lo que sabes sobre unos y ceros. La revolución cuántica no es solo una actualización de hardware, es un salto hacia una nueva dimensión de posibilidades físicas y matemáticas.',
    category: 'Perspectivas',
    date: '30 de abril de 2025',
    image: '/imgBlogsWebp/ComputacionCuantica/portada.webp',
  },
];

function SmartImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`grid place-items-center bg-[#ececec] text-center text-xs uppercase tracking-[0.24em] text-[#303030]/45 ${className ?? ''}`}>
        {alt}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}

export default function ServicesAboutSections() {
  const rootRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const cardTrackRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInnerRef = useRef<HTMLDivElement>(null);
  const projectsIntroRef = useRef<HTMLDivElement>(null);
  const projectCardRefs = useRef<HTMLElement[]>([]);
  const projectsButtonRef = useRef<HTMLAnchorElement>(null);
  const cursorPreviewRef = useRef<HTMLDivElement>(null);
  const cursorImageRef = useRef<HTMLImageElement>(null);
  const cursorFallbackRef = useRef<HTMLDivElement>(null);
  const [activeService, setActiveService] = useState<(typeof SERVICES)[number] | null>(null);
  const [activeServiceIndex, setActiveServiceIndex] = useState(-1);
  const [activeFaq, setActiveFaq] = useState(-1);

  const prepareHomeProjectNavigation = (project: (typeof PROJECTS)[number]) => {
    const href = getProjectDetailHref(project);
    setProjectDetailReturnTarget({
      source: 'home',
      href: '/#projects',
      scrollY: window.scrollY,
    });
    projectTransitionLog('home project click stores return target', {
      slug: project.slug,
      href,
      returnHref: '/#projects',
      scrollY: window.scrollY,
      projectsRect: projectsRef.current?.getBoundingClientRect(),
      clickedCardRect: projectCardRefs.current.find((card) => card.dataset.homeProjectSlug === project.slug)?.getBoundingClientRect(),
    });
  };

  useGSAP(
    () => {
      const services = servicesRef.current;
      const cardTrack = cardTrackRef.current;
      const card = cardRef.current;
      const cardInner = cardInnerRef.current;
      const projects = projectsRef.current;
      const projectsIntro = projectsIntroRef.current;
      const projectCards = projectCardRefs.current.filter(Boolean);
      const projectsButton = projectsButtonRef.current;
      const preview = cursorPreviewRef.current;
      if (!preview) return;

      gsap.set(preview, { autoAlpha: 0, scale: 0.92 });
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      projectTransitionLog('home projects gsap init', {
        isDesktop,
        slugs: PROJECTS.map((project) => project.slug),
        cards: projectCards.length,
        scrollY: window.scrollY,
        projectsRect: projects?.getBoundingClientRect(),
        firstCardRect: projectCards[0]?.getBoundingClientRect(),
      });
      if (!isDesktop) {
        gsap.set([projectsIntro, projectsButton, ...projectCards].filter(Boolean), { clearProps: 'all' });
        projectTransitionLog('home projects gsap mobile clear props', {
          cards: projectCards.length,
          scrollY: window.scrollY,
        });
        return;
      }

      if (!services || !cardTrack || !card || !cardInner) {
        projectTransitionLog('home projects gsap missing refs', {
          hasServices: Boolean(services),
          hasCardTrack: Boolean(cardTrack),
          hasCard: Boolean(card),
          hasCardInner: Boolean(cardInner),
        });
        return;
      }
      gsap.set(card, {
        x: '-20vw',
        y: '-18vh',
        rotate: -16,
        autoAlpha: 0,
        transformPerspective: 1000,
      });
      gsap.set(cardInner, { rotateY: 0, transformStyle: 'preserve-3d' });

      const intro = gsap.to(card, {
        x: 0,
        y: 0,
        rotate: 5,
        autoAlpha: 1,
        duration: 1.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: services,
          start: 'top 76%',
          toggleActions: 'play none none reverse',
        },
      });

      const flip = gsap.to(cardInner, {
        rotateY: 180,
        ease: 'none',
        scrollTrigger: {
          trigger: cardTrack,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.9,
        },
      });

      let projectsTimeline: gsap.core.Timeline | null = null;
      if (projects && projectsIntro && projectCards.length) {
        gsap.set(projectsIntro, { yPercent: 0, autoAlpha: 1 });
        gsap.set(projectCards, {
          yPercent: (index) => (index === 0 ? 28 : 118),
          scale: 1,
          rotate: (index) => (index === 0 ? 0 : index % 2 === 0 ? -1.2 : 1.2),
          transformOrigin: '50% 100%',
          zIndex: (index) => index + 1,
        });
        if (projectsButton) gsap.set(projectsButton, { autoAlpha: 0, y: 16 });

        projectsTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: projects,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.65,
            invalidateOnRefresh: true,
            onRefresh: (self) => {
              projectTransitionLog('home projects timeline refresh', {
                start: self.start,
                end: self.end,
                progress: self.progress,
                scrollY: window.scrollY,
                projectsRect: projects.getBoundingClientRect(),
                cardRects: projectCards.map((projectCard) => ({
                  slug: projectCard.dataset.homeProjectSlug,
                  rect: projectCard.getBoundingClientRect(),
                })),
              });
            },
          },
        });

        projectsTimeline
          .to(projectsIntro, {
            yPercent: -155,
            autoAlpha: 0,
            duration: 1.25,
            ease: 'none',
          })
          .to(projectCards[0], {
            yPercent: 0,
            rotate: 0,
            duration: 1.25,
            ease: 'none',
          }, '<')
          .to({}, { duration: 0.35 });

        projectCards.slice(1).forEach((projectCard, index) => {
          const previousCard = projectCards[index];
          projectsTimeline
            ?.to(
              previousCard,
              {
                scale: 0.92,
                yPercent: -3,
                duration: 1,
                ease: 'none',
              },
              `project-${index + 1}`
            )
            .to(
              projectCard,
              {
                yPercent: 0,
                rotate: 0,
                scale: 1,
                duration: 1,
                ease: 'none',
              },
              `project-${index + 1}`
            );
        });

        projectsTimeline.to(
          projectCards[projectCards.length - 1],
          {
            scale: 0.985,
            duration: 0.45,
            ease: 'none',
          }
        );

        if (projectsButton) {
          projectsTimeline.to(
            projectsButton,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.4,
              ease: 'power2.out',
            },
            '-=0.12'
          );
        }
      }

      return () => {
        if (intro.scrollTrigger) intro.scrollTrigger.kill();
        intro.kill();
        if (flip.scrollTrigger) flip.scrollTrigger.kill();
        flip.kill();
        if (projectsTimeline?.scrollTrigger) projectsTimeline.scrollTrigger.kill();
        projectsTimeline?.kill();
      };
    },
    { scope: rootRef }
  );

  const showPreview = (service: (typeof SERVICES)[number], event: React.MouseEvent<HTMLButtonElement>) => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches) return;
    setActiveService(service);
    const preview = cursorPreviewRef.current;
    const image = cursorImageRef.current;
    const fallback = cursorFallbackRef.current;
    if (!preview || !image || !fallback) return;

    image.src = service.image;
    image.alt = service.label;
    image.style.display = 'block';
    fallback.style.display = 'none';
    gsap.to(preview, { x: event.clientX + 22, y: event.clientY - 36, autoAlpha: 1, scale: 1, duration: 0.18, ease: 'power2.out' });
  };

  const movePreview = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches) return;
    const preview = cursorPreviewRef.current;
    if (!preview) return;
    gsap.to(preview, { x: event.clientX + 22, y: event.clientY - 36, duration: 0.18, ease: 'power2.out' });
  };

  const hidePreview = () => {
    const preview = cursorPreviewRef.current;
    if (!preview) return;
    gsap.to(preview, { autoAlpha: 0, scale: 0.92, duration: 0.16, ease: 'power2.out' });
  };

  useEffect(() => {
    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 520);
    return () => window.clearTimeout(refreshId);
  }, [activeServiceIndex, activeFaq]);

  useEffect(() => {
    const hidePreviewOnViewportChange = () => {
      const preview = cursorPreviewRef.current;
      if (!preview) return;
      gsap.killTweensOf(preview);
      gsap.set(preview, { autoAlpha: 0, scale: 0.92 });
      setActiveService(null);
    };

    window.addEventListener('scroll', hidePreviewOnViewportChange, { passive: true });
    window.addEventListener('resize', hidePreviewOnViewportChange);
    window.addEventListener('blur', hidePreviewOnViewportChange);

    return () => {
      window.removeEventListener('scroll', hidePreviewOnViewportChange);
      window.removeEventListener('resize', hidePreviewOnViewportChange);
      window.removeEventListener('blur', hidePreviewOnViewportChange);
    };
  }, []);

  return (
    <div ref={rootRef} id="services-about" className="relative z-40 bg-white font-[family-name:var(--font-antonio)] text-[#303030]" suppressHydrationWarning>
      <div className="pointer-events-none absolute -top-[120vh] left-0 right-0 h-[135vh] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.18)_22%,rgba(255,255,255,0.72)_58%,#fff_100%)]" />
      <div className="pointer-events-none absolute -top-[48vh] left-0 right-0 h-[62vh] bg-white/95 [clip-path:polygon(0_44%,100%_18%,100%_100%,0_100%)]" />

      <div className="relative bg-white px-6 pt-[16vh] md:px-14 lg:px-20">
        <div ref={cardTrackRef} className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-[650px_minmax(0,1fr)]">
          <div>
            <section ref={servicesRef} className="flex min-h-screen items-center py-20">
              <div className="w-full max-w-[650px]">
                <h2 className="text-[clamp(3rem,5vw,3.75rem)] font-bold uppercase leading-[1.3] tracking-normal text-[#303030]">
                  Lo que puedo hacer por ti
                </h2>
                <p className="body-medium mt-6 max-w-[470px] text-[#303030]/68">
                  Me gusta crear experiencias digitales y soluciones visuales que se sientan claras, útiles y con personalidad.
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
                          onMouseEnter={(event) => showPreview(service, event)}
                          onMouseMove={movePreview}
                          onMouseLeave={hidePreview}
                          className={`group flex w-full items-center justify-between gap-6 py-5 text-left text-[clamp(1.5rem,1.8vw,1.625rem)] font-normal uppercase leading-[1.3] tracking-normal transition-colors duration-300 ${isOpen ? 'text-[#6872F2]' : 'text-[#303030] hover:text-[#6872F2]'}`}
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
            </section>

            <section ref={aboutRef} className="flex min-h-screen items-center py-20">
              <div className="w-full max-w-[650px]">
                <h2 className="text-[clamp(3rem,5vw,3.75rem)] font-bold uppercase leading-[1.3] tracking-normal text-[#303030]">
                  Acerca de mí
                </h2>
                <p className="body-medium mt-6 max-w-[590px] text-[#303030]/70">
                  Ingeniero de sistemas y diseñador digital. Creo páginas web, aplicaciones y soluciones a medida, donde el diseño y la ingeniería se integran para ofrecer experiencias claras, funcionales y bien ejecutadas.
                </p>

                <div className="mt-11 grid max-w-[620px] grid-cols-3 gap-7">
                  {[
                    ['2', 'Años de experiencia'],
                    ['9+', 'Proyectos finalizados'],
                    ['9+', 'Clientes y colaboraciones'],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <div className="text-[clamp(3.25rem,4.8vw,4rem)] font-bold leading-none text-[#6872F2]">{value}</div>
                      <p className="body-small-bold mt-2 text-[#303030]/68">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-12 border-t border-[#303030]/12 pt-8">
                  <div className="grid max-w-[650px] gap-y-5 sm:grid-cols-[minmax(0,1fr)_max-content] sm:gap-x-20">
                    <div>
                      <p className="body-small-bold uppercase text-[#303030]/55">Email</p>
                      <a href="https://mail.google.com/mail/?view=cm&fs=1&to=laurapazmariano652@gmail.com" target="_blank" rel="noreferrer" className="body-medium-bold mt-2 block text-[#303030] transition-colors duration-300 hover:text-[#6872F2]">
                        laurapazmariano652@gmail.com
                      </a>
                    </div>
                    <div>
                      <p className="body-small-bold uppercase text-[#303030]/55">Contacto</p>
                      <p className="body-medium-bold mt-2 block text-[#303030]">+51 925 685 323</p>
                    </div>
                  </div>
                  <a
                    href="/about/"
                    className="mt-7 inline-flex h-12 items-center justify-center rounded-full border border-[#6872F2] px-9 text-lg font-bold uppercase tracking-normal text-[#6872F2] transition-all duration-300 hover:bg-[#6872F2] hover:text-white"
                  >
                    Saber más
                  </a>
                </div>
              </div>
            </section>
          </div>

          <div className="relative hidden xl:block">
            <div className="sticky top-0 flex h-screen items-center justify-center">
              <div ref={cardRef} className="relative h-[392px] w-[280px] md:h-[448px] md:w-[320px]" style={{ perspective: 1200 }}>
                <div ref={cardInnerRef} className="relative h-full w-full [transform-style:preserve-3d]">
                  <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-black/10 bg-[#ededed] shadow-[0_28px_80px_rgba(0,0,0,0.16)] [backface-visibility:hidden]">
                    <SmartImage src="/imgInicioWebp/setup.webp" alt="Setup" className="h-full w-full object-cover" />
                  </div>
                  <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-black/10 bg-[#ededed] shadow-[0_28px_80px_rgba(0,0,0,0.16)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <SmartImage src="/Persona.webp" alt="Persona" className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section ref={projectsRef} id="projects" className="relative -mx-6 bg-white py-24 md:-mx-14 md:py-28 lg:-mx-20 lg:h-[540vh] lg:py-0">
          <div className="mx-auto max-w-[1120px] px-6 md:px-14 lg:sticky lg:top-0 lg:h-screen lg:max-w-none lg:overflow-hidden lg:px-20 lg:py-[8vh]">
            <div ref={projectsIntroRef} className="relative z-20 mx-auto flex max-w-[1120px] flex-col gap-4 lg:absolute lg:left-20 lg:right-20 lg:top-[11vh]">
              <div>
                <h2 className="text-[clamp(3rem,5vw,3.75rem)] font-bold uppercase leading-[1.3] tracking-normal text-[#303030]">
                  Proyectos destacados
                </h2>
                <p className="body-medium mt-4 max-w-[560px] text-[#303030]/66">
                  Estos proyectos seleccionados reflejan mi pasión por combinar estrategia y creatividad: resolver problemas reales a través de un diseño bien pensado y una narrativa que conecta.
                </p>
              </div>
            </div>

            <div className="relative mt-10 grid gap-8 lg:absolute lg:inset-0 lg:mt-0 lg:grid lg:place-items-center lg:px-20 lg:pt-[10vh]">
              {PROJECTS.map((project, index) => (
                <div
                  key={project.slug}
                  ref={(node) => {
                    if (node) projectCardRefs.current[index] = node;
                  }}
                  data-home-project-slug={project.slug}
                  className="relative aspect-[1120/746.66] w-full overflow-hidden rounded-[28px] border border-[#303030]/10 bg-[#101014] lg:absolute lg:w-[min(1120px,calc(100vw-10rem))] lg:max-h-[72vh]"
                >
                  <Link
                    href={getProjectDetailHref(project)}
                    onClick={() => prepareHomeProjectNavigation(project)}
                    className="group absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-[#6872F2] focus-visible:ring-offset-4"
                    aria-label={`Ver detalle de ${project.title}`}
                  >
                    {project.image && <SmartImage src={project.image} alt={project.title} className="absolute inset-0 h-full w-full object-cover" />}
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,16,20,0.72)_0%,rgba(23,24,39,0.58)_45%,rgba(15,15,18,0.78)_100%)]" />
                    <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.1)_42%,transparent_62%)]" />
                    <div className="relative flex h-full flex-col items-center justify-center px-8 text-center text-white">
                      <span className="body-small-bold mb-5 rounded-full bg-[#6872F2] px-4 py-1.5 text-white shadow-[0_10px_30px_rgba(104,114,242,0.32)]">
                        {project.tag}
                      </span>
                      <h3 className="text-[clamp(2.5rem,4vw,3.75rem)] font-bold uppercase leading-[1.3] tracking-normal">
                        {project.title}
                      </h3>
                      <p className="body-small mt-5 max-w-[680px] text-white/78">
                        {project.description}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}

              <Link
                ref={projectsButtonRef}
                href="/projects/"
                className="relative z-20 mt-10 inline-flex h-12 items-center justify-center self-center rounded-full border border-[#6872F2] bg-white px-9 text-base font-bold uppercase tracking-normal text-[#6872F2] transition-all duration-300 hover:bg-[#6872F2] hover:text-white lg:absolute lg:bottom-[4vh] lg:mt-0"
              >
                Más proyectos
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1080px] gap-8 bg-white py-28 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start xl:grid-cols-[420px_600px] xl:justify-between">
          <div className="max-w-[440px] lg:min-h-[284px]">
            <h2 className="text-[clamp(3rem,5vw,3.75rem)] font-bold uppercase leading-[1.3] tracking-normal text-[#303030]">
              Preguntas frecuentes
            </h2>
            <p className="body-medium mt-6 max-w-[360px] text-[#303030]/62">
              Aquí encontrarás respuestas a las dudas más comunes antes de iniciar un proyecto. Si tienes otra pregunta, estaré encantado de ayudarte.
            </p>
          </div>

          <div className="w-full max-w-[600px] lg:min-h-[583px] lg:max-w-none xl:max-w-[600px]">
            {FAQS.map((faq, index) => {
              const isActive = activeFaq === index;

              return (
                <div key={faq.question} className={`border-b transition-colors duration-300 ${isActive ? 'border-[#6872F2]' : 'border-[#303030]/12'}`}>
                  <button
                    type="button"
                    aria-expanded={isActive}
                    onClick={() => setActiveFaq(isActive ? -1 : index)}
                    className={`flex w-full items-start justify-between gap-6 py-6 text-left text-[clamp(1.45rem,5vw,2rem)] font-normal uppercase leading-[1.3] tracking-normal transition-colors duration-300 lg:text-[clamp(1.65rem,2.2vw,2rem)] ${isActive ? 'text-[#6872F2]' : 'text-[#303030]'}`}
                  >
                    <span>{index + 1}. {faq.question}</span>
                    <span className="mt-1 text-2xl leading-none">{isActive ? '⌃' : '⌄'}</span>
                  </button>
                  <div className={`grid transition-all duration-500 ease-out ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="body-medium max-w-[560px] pb-7 text-[#303030]/68">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="blog" className="mx-auto max-w-[1120px] bg-white py-28">
          <div>
            <h2 className="max-w-[760px] text-[clamp(3rem,5vw,3.75rem)] font-bold uppercase leading-[1.3] tracking-normal text-[#303030]">
              Tecnología, IA y diseño digital
            </h2>
            <p className="body-medium mt-6 max-w-[540px] text-[#303030]/66">
              Lecturas sobre inteligencia artificial, cómputo espacial, arquitectura web y nuevas formas de construir productos digitales con criterio.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {BLOG_POSTS.map((post, index) => (
              <Link href={index === 0 ? '/blog/el-futuro-de-la-ia/' : '/blog/computacion-cuantica/'} key={post.title} className="group block outline-none">
                <article className="w-full max-w-[540px]">
                  <div className="h-[320px] overflow-hidden rounded-[22px] bg-[#ececec]">
                    <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
                      <SmartImage src={post.image} alt={post.title} className="h-full w-full object-cover" />
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-4">
                    <span className="body-small-bold rounded-full border border-[#6872F2]/55 px-4 py-1 text-[#6872F2]">
                      {post.category}
                    </span>
                    <span className="body-small text-[#303030]/48">{post.date}</span>
                  </div>
                  <h3 className="mt-4 font-[family-name:var(--font-antonio)] text-[clamp(1.7rem,2.5vw,2rem)] font-bold uppercase leading-[1.2] tracking-[0.02em] transition-colors duration-300">
                    {post.title}
                  </h3>
                  <p className="body-small mt-5 text-[#303030]/62">
                    {post.description}
                  </p>
                </article>
              </Link>
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <Link href="/blog/" className="inline-flex h-12 items-center justify-center rounded-full border border-[#6872F2] px-9 text-lg font-bold uppercase tracking-normal text-[#6872F2] transition-all duration-300 hover:bg-[#6872F2] hover:text-white">
              Explorar todos los blogs
            </Link>
          </div>
        </section>
      </div>

      <ContactAndFooter />

      <div ref={cursorPreviewRef} className="pointer-events-none fixed left-0 top-0 z-[80] hidden h-24 w-36 overflow-hidden rounded-2xl border border-white/60 bg-[#e8e8e8] opacity-0 shadow-[0_18px_42px_rgba(0,0,0,0.22)] lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={cursorImageRef}
          src={activeService?.image || undefined}
          alt={activeService?.label ?? ''}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
            if (cursorFallbackRef.current) cursorFallbackRef.current.style.display = 'grid';
          }}
        />
        <div ref={cursorFallbackRef} className="hidden h-full w-full place-items-center text-center text-[0.55rem] uppercase tracking-[0.18em] text-[#303030]/45">
          Imagen pendiente
        </div>
      </div>
    </div>
  );
}
