import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  description: 'La página que buscas no existe o fue movida.',
};

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 text-center text-[#111]">
      <div className="max-w-md">
        <p className="font-[family-name:var(--font-antonio)] text-[clamp(5rem,12vw,9rem)] font-bold leading-none tracking-[-0.04em] text-[#6872F2]">
          404
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-antonio)] text-[clamp(1.75rem,4vw,2.5rem)] font-bold uppercase leading-tight tracking-tight text-[#303030]">
          Página no encontrada
        </h1>
        <p className="mt-4 text-base font-light leading-relaxed text-[#303030]/70">
          La página que buscas no existe, fue movida o nunca estuvo aquí.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#6872F2] px-8 text-sm font-bold uppercase tracking-tight text-white transition-all duration-300 hover:bg-[#5963e8]"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
