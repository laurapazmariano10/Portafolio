'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SignatureSVG from '@/components/SignatureSVG';
import type { Project } from '@/components/projects/projectsData';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type ProjectDetailClientProps = {
  project: Project;
};

export default function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;

      const getScrollAmount = () => Math.max(0, track.scrollWidth - window.innerWidth + 120);

      const tween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${getScrollAmount()}`,
          scrub: 0.85,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.fromTo('[data-detail-intro]', {
        autoAlpha: 0,
        y: 36,
        filter: 'blur(10px)',
      }, {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1,
        ease: 'power3.out',
        stagger: 0.08,
      });

      gsap.utils.toArray<HTMLElement>('[data-project-frame]').forEach((frame) => {
        gsap.fromTo(frame, {
          autoAlpha: 0,
          scale: 0.92,
          rotate: -0.8,
          filter: 'blur(14px)',
        }, {
          autoAlpha: 1,
          scale: 1,
          rotate: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: frame,
            containerAnimation: tween,
            start: 'left 82%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: rootRef }
  );

  return (
    <main ref={rootRef} className="min-h-screen overflow-hidden text-white" style={{ background: project.gradient }}>
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18), transparent 34%)' }} />
      <div ref={trackRef} className="relative z-10 flex h-screen w-max items-center gap-[210px] px-[clamp(2rem,7vw,6rem)] py-10 will-change-transform">
        <section className="grid h-[calc(100vh-5rem)] w-[min(960px,88vw)] shrink-0 grid-cols-1 content-center gap-10 md:grid-cols-[minmax(0,1fr)_230px] md:gap-16">
          <div>
            <div data-detail-intro className="mb-[12vh] w-[220px] md:w-[300px]">
              <SignatureSVG color={project.slug === 'qualitiktok' ? '#FFFFFF' : '#111111'} className="h-auto w-full" />
            </div>
            <h1 data-detail-intro className={`font-[family-name:var(--font-antonio)] text-[clamp(5rem,12vw,10rem)] font-normal uppercase leading-[0.82] tracking-[-0.06em] ${project.slug === 'qualitiktok' ? 'text-white' : 'text-[#111]'}`}>
              {project.title}
            </h1>
            <p data-detail-intro className={`mt-8 max-w-[500px] font-[family-name:var(--font-sans)] text-[10.5px] font-semibold leading-[1.6] tracking-[-0.01em] ${project.slug === 'qualitiktok' ? 'text-white/82' : 'text-[#111]/78'}`}>
              {project.description}
            </p>
          </div>

          <aside data-detail-intro className={`self-center font-[family-name:var(--font-sans)] ${project.slug === 'qualitiktok' ? 'text-white' : 'text-[#111]'}`}>
            <p className="mb-5 text-[0.72rem] font-semibold uppercase tracking-[0.22em] opacity-62">Servicio:</p>
            <ul className="space-y-2 text-[0.98rem] font-semibold leading-[1.1]">
              {project.services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
            <Link href="/projects" className={`mt-14 inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-bold uppercase tracking-[-0.02em] shadow-[0_20px_60px_rgba(0,0,0,0.13)] transition-transform duration-300 hover:scale-105 ${project.slug === 'qualitiktok' ? 'bg-white text-[#070e36]' : 'bg-white/86 text-[#111]'}`}>
              Atrás
            </Link>
          </aside>
        </section>

        {project.images.map((image, index) => (
          <figure
            key={image.src}
            data-project-frame
            className={`relative shrink-0 overflow-hidden shadow-[0_35px_120px_rgba(0,0,0,0.22)] ${image.variant === 'tall' ? 'h-[92vh] w-[min(560px,82vw)] rounded-[30px]' : 'h-[min(728px,74vh)] w-[min(1264px,86vw)] rounded-[34px]'}`}
          >
            <Image src={image.src} alt={image.alt} fill sizes={image.variant === 'tall' ? '560px' : '1264px'} className="object-cover" priority={index === 0} />
          </figure>
        ))}
      </div>
    </main>
  );
}
