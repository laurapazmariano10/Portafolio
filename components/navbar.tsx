'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const [isWorkStatus, setIsWorkStatus] = useState(false);
  const lastScrollYRef = useRef(0);
  const lastIntentYRef = useRef(0);
  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Acerca de', path: '/about' },
    { name: 'Proyectos', path: '/#projects' },
    { name: 'Blog', path: '/#blog' },
  ];

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

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-6 left-1/2 z-50 flex h-[50px] max-w-[95vw] -translate-x-1/2 flex-row items-center justify-between rounded-full border border-black/5 bg-white/95 px-1.5 py-1.5 font-sans shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-md transition-[width] duration-500 ease-out ${isWorkStatus ? 'w-[282px]' : 'w-[450px]'}`}
    >
      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-[#EAEAEA] ml-1">
        <Image 
          src="/Persona.jpeg" 
          alt="Avatar" 
          width={36} 
          height={36} 
          className="object-cover w-full h-full"
          referrerPolicy="no-referrer"
        />
      </div>

      {isWorkStatus ? (
        <Link href="/#contact" className="group flex flex-1 items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#1d1d1b]/65 transition-colors duration-300 hover:text-[#6872F2]">
          Disponible para trabajar
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 transition-transform duration-300 group-hover:scale-[1.45]" />
        </Link>
      ) : (
        <>
      
          <div className="hidden sm:flex flex-row items-center justify-center flex-1 gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={item.path}
                    className={`nav-3d-link font-sans text-[14px] ${isActive ? 'font-normal text-[#000]' : 'font-light text-[#555]'}`}
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

          <Link href="/#contact" className="rounded-full bg-[#222] text-[#FFF] text-[14px] font-medium h-[36px] px-5 mr-[2px] flex items-center justify-center transition-all duration-300 hover:bg-[#6872F2] hover:shadow-[0_10px_26px_rgba(104,114,242,0.28)] shrink-0">
            Contacto
          </Link>
        </>
      )}
    </motion.nav>
  );
}
