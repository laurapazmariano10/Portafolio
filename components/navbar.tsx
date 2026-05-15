'use client';

import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const [isWorkStatus, setIsWorkStatus] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dotPulse, setDotPulse] = useState(false);
  const lastScrollYRef = useRef(0);
  const lastIntentYRef = useRef(0);
  const desktopNavItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Acerca de', path: '/about' },
    { name: 'Proyectos', path: '/projects' },
    { name: 'Blog', path: '/blog' },
  ];
  const compactNavItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Acerca de', path: '/about' },
    { name: 'Proyectos', path: '/projects' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contacto', path: pathname === '/' ? '/#contact' : '/contacto' },
  ];

  useEffect(() => {
    const closeTimer = window.setTimeout(() => setIsMenuOpen(false), 0);
    return () => window.clearTimeout(closeTimer);
  }, [pathname]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    lastIntentYRef.current = window.scrollY;

    const evaluateInitial = () => {
      if (window.scrollY < 50) {
        setIsWorkStatus(false);
      }
    };
    const initialFrame = window.requestAnimationFrame(evaluateInitial);

    const updateNavbar = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollYRef.current;
      lastScrollYRef.current = currentY;

      if (currentY < 50) {
        setIsWorkStatus(false);
        return;
      }

      if (Math.abs(delta) < 10) return;

      const directionDown = currentY > lastIntentYRef.current;
      lastIntentYRef.current = currentY;

      setIsWorkStatus(directionDown);
    };

    window.addEventListener('scroll', updateNavbar, { passive: true });
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener('scroll', updateNavbar);
    };
  }, [pathname]);

  useEffect(() => {
    if (isWorkStatus) {
      const startTimer = window.setTimeout(() => setDotPulse(true), 0);
      const stopTimer = window.setTimeout(() => setDotPulse(false), 1000);
      return () => {
        window.clearTimeout(startTimer);
        window.clearTimeout(stopTimer);
      };
    }
  }, [isWorkStatus]);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed left-1/2 top-6 z-50 hidden h-[50px] max-w-[95vw] -translate-x-1/2 flex-row items-center justify-between rounded-full border border-black/5 bg-white/95 px-1.5 py-1.5 font-sans shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-md transition-[width] duration-500 ease-out lg:flex ${isWorkStatus ? 'w-[282px]' : 'w-[450px]'}`}
      >
        <div className="ml-1 h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#EAEAEA]">
          <Image
            src="/Persona.webp"
            alt="Avatar"
            width={36}
            height={36}
            className="object-cover w-full h-full"
            referrerPolicy="no-referrer"
          />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {isWorkStatus ? (
            <motion.div
              key="work-status"
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(6px)' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-1 items-center justify-center"
            >
              <Link href={pathname === '/' ? '/#contact' : '/contacto'} className="group flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#1d1d1b]/65 transition-colors duration-300 hover:text-[#6872F2]">
                Disponible para trabajar
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 group-hover:scale-[1.45] ${
                    dotPulse
                      ? 'bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.7),0_0_16px_4px_rgba(52,211,153,0.3)] scale-[1.3]'
                      : 'bg-emerald-400/70'
                  }`}
                />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="nav-links"
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(6px)' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-1 items-center justify-between"
            >
              <div className="flex flex-1 flex-row items-center justify-center gap-6">
                {desktopNavItems.map((item) => {
                  const isActive = pathname === item.path || (item.path === '/projects' && pathname.startsWith('/projects/'));
                  return (
                    <motion.div
                      key={item.name}
                      whileHover={{ y: -1 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={item.path}
                        className={`nav-3d-link font-sans text-[14px] whitespace-nowrap ${isActive ? 'font-normal text-[#000]' : 'font-light text-[#555]'}`}
                      >
                        <span className="nav-3d-link__inner">
                          <span className="nav-3d-link__front">{item.name}</span>
                          <span className="nav-3d-link__back">{item.name}</span>
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <Link
                href={pathname === '/' ? '/#contact' : '/contacto'}
                className="group relative mr-[2px] flex h-[36px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#222] px-5 text-[14px] font-medium text-[#FFF] transition-all duration-400 hover:shadow-[0_10px_26px_rgba(104,114,242,0.28)]"
              >
                <span className="absolute inset-0 bg-[#6872F2] rounded-full scale-0 group-hover:scale-100 transition-transform duration-400 ease-out origin-center" />
                <span className="relative z-10">Contacto</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-1/2 top-4 z-50 flex h-12 w-[min(92vw,340px)] -translate-x-1/2 flex-row items-center justify-between rounded-full border border-black/5 bg-white/95 px-1.5 py-1.5 font-sans shadow-[0_10px_34px_rgba(0,0,0,0.06)] backdrop-blur-md md:top-5 md:h-12 md:w-[380px] lg:hidden"
      >
        <div className="ml-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#EAEAEA] md:h-9 md:w-9">
          <Image
            src="/Persona.webp"
            alt="Avatar"
            width={32}
            height={32}
            className="object-cover w-full h-full"
            referrerPolicy="no-referrer"
          />
        </div>

        <Link href={pathname === '/' ? '/#contact' : '/contacto'} className="group flex flex-1 items-center justify-center gap-2 text-[9.5px] font-medium uppercase tracking-[0.18em] text-[#1d1d1b]/68 transition-colors duration-300 hover:text-[#6872F2] sm:text-[10px] md:text-[11px]">
          Disponible para trabajar
          <span className="navbar-led h-1.5 w-1.5 rounded-full bg-emerald-400 transition-all duration-300 group-hover:scale-[1.45]" />
        </Link>

        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="mr-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#222] text-white transition-colors duration-300 hover:bg-[#6872F2] md:h-9 md:w-9"
        >
          <span className="flex flex-col gap-[3px]">
            <span className={`block h-px w-3.5 bg-current transition-transform duration-300 ${isMenuOpen ? 'translate-y-1 rotate-45' : ''}`} />
            <span className={`block h-px w-3.5 bg-current transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`block h-px w-3.5 bg-current transition-transform duration-300 ${isMenuOpen ? '-translate-y-1 -rotate-45' : ''}`} />
          </span>
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, scale: 0.96, filter: 'blur(6px)' }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-[calc(100%+0.65rem)] w-[220px] overflow-hidden rounded-[24px] border border-black/5 bg-white/95 p-2 shadow-[0_22px_70px_rgba(0,0,0,0.10)] backdrop-blur-xl"
            >
              <div className="flex flex-col">
                {compactNavItems.map((item) => {
                  const isActive = pathname === item.path || (item.path === '/projects' && pathname.startsWith('/projects/')) || (item.path === '/about' && pathname === '/about') || (item.path === '/blog' && pathname.startsWith('/blog'));
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`rounded-[18px] px-4 py-3 font-[family-name:var(--font-antonio)] text-[1.35rem] font-normal uppercase leading-none tracking-[-0.01em] transition-colors duration-300 ${
                        isActive ? 'bg-[#6872F2] text-white' : 'text-[#303030] hover:bg-[#f3f3f4] hover:text-[#6872F2]'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
