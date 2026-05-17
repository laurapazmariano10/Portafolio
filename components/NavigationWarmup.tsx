'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PROJECTS } from '@/components/projects/projectsData';

const MAIN_ROUTES = ['/about/', '/projects/', '/blog/', '/contacto/'];
const KATANA_ASSETS = [
  '/models/Katana_ThreeJS.glb',
  '/hdri/studio.hdr',
  '/TexturesWebp/Katana Blade.webp',
  '/TexturesWebp/wood.webp',
  '/TexturesWebp/handle-base.webp',
  '/TexturesWebp/handle-wrap.webp',
  '/TexturesWebp/roughness.webp',
];

function onIdle(callback: () => void) {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, { timeout: 4200 });
    return () => window.cancelIdleCallback(id);
  }

  const id = globalThis.setTimeout(callback, 1400);
  return () => globalThis.clearTimeout(id);
}

function warmAsset(url: string) {
  window.fetch(url, { cache: 'force-cache', priority: 'low' } as RequestInit & { priority?: 'low' }).catch(() => undefined);
}

function warmImage(src: string) {
  const image = new window.Image();
  image.decoding = 'async';
  image.src = src;
}

export function NavigationWarmup() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const cancelIdle = onIdle(() => {
      if (cancelled) return;

      MAIN_ROUTES.forEach((route) => router.prefetch(route));
      PROJECTS.forEach((project) => {
        router.prefetch(`/projects/${project.slug}/`);
        warmImage(project.cover);
        warmImage(project.depthMap);
        project.images.slice(0, 2).forEach((image) => warmImage(image.src));
      });

      warmImage('/Persona.webp');
      KATANA_ASSETS.forEach(warmAsset);

      import('@/components/AboutAxe/AboutAxe').catch(() => undefined);
      import('@/components/projects/ProjectDetailClient').catch(() => undefined);
      import('@/components/projects/ProjectDepthCard').catch(() => undefined);
    });

    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [router]);

  return null;
}
