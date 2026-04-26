'use client';

import { Navbar } from '@/components/navbar';
import LiquidScene from '@/components/LiquidScene';
import SignatureSVG from '@/components/SignatureSVG';

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-[#FFFFFF] overflow-hidden flex items-center justify-center text-black">
      {/* CAPA DE DIBUJO E INTERACTIVA */}
      <LiquidScene />
      
      {/* FIRMA ANIMADA (Esquina Superior Izquierda) */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20 pointer-events-none select-none w-40 md:w-56 text-[#1D1D1B]">
        <SignatureSVG className="w-full h-auto opacity-85 mix-blend-multiply" />
      </div>

      {/* NOMBRE ELEGANTE (Esquina Superior Derecha) */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8 z-20 pointer-events-none select-none">
        <h1 className="text-5xl md:text-[5.5rem] font-bold uppercase leading-[0.8] tracking-[-0.03em] text-[#1D1D1B] text-right" style={{ fontFamily: 'var(--font-serif)' }}>
          Mariano<br />Laura
        </h1>
      </div>

      {/* NAVBAR (En caso de que la barra de navegación siga aquí) */}
      <Navbar />
    </main>
  );
}
