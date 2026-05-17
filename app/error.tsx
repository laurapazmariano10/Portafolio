'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 text-center text-[#111]">
      <div className="max-w-md">
        <p className="font-[family-name:var(--font-antonio)] text-[clamp(4rem,10vw,7rem)] font-bold leading-none tracking-[-0.04em] text-[#6872F2]">
          Ups
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-antonio)] text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold uppercase leading-tight tracking-tight text-[#303030]">
          Algo salió mal
        </h1>
        <p className="mt-4 text-base font-light leading-relaxed text-[#303030]/70">
          Ocurrió un error inesperado. Puedes intentarlo de nuevo o volver al inicio.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#6872F2] px-8 text-sm font-bold uppercase tracking-tight text-white transition-all duration-300 hover:bg-[#5963e8]"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#303030]/15 px-8 text-sm font-bold uppercase tracking-tight text-[#303030] transition-all duration-300 hover:border-[#6872F2] hover:text-[#6872F2]"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
